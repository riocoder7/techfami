import { auth, db } from "../config/firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  collection, query, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { normalise, toCsv, safePhone, safeEmail } from "./util.js";

// never render inside another site (clickjacking)
if (window.top !== window.self) { document.documentElement.textContent = ""; throw new Error("framed"); }

const SOURCES = {
  contactMessages: "Contact form",
  inquiryForm: "Service enquiries",
  CallBackReq: "Call-back requests"
};
const STATUS_LABEL = { new: "New", contacted: "Contacted", done: "Done" };
const IDLE_MS = 30 * 60 * 1000;            // sign out after 30 minutes without activity
const SESSION_MS = 2 * 60 * 60 * 1000;     // hard limit: 2 hours after sign-in, then sign in again (the database rules enforce the same limit)
let sessionEnd = 0, clockTimer = null;

const $ = s => document.querySelector(s);
const data = { contactMessages: [], inquiryForm: [], CallBackReq: [] };
let active = "contactMessages", unsubs = [], idleTimer = null, firstLoad = new Set();

/* -------- DOM helper: text only, never HTML (prevents script injection from submitted data) -------- */
function el(tag, props = {}, kids = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "text") n.textContent = v;
    else if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const c of [].concat(kids)) if (c) n.append(c);
  return n;
}
const fmt = d => d ? d.toLocaleString([], { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "–";
const setStatus = (t, err = false) => { const s = $("#status"); s.textContent = t; s.classList.toggle("err", err); };

/* -------- sign-in gate -------- */
onAuthStateChanged(auth, async user => {
  if (!user) { location.replace("./login.html"); return; }
  // the moment of the real sign-in comes from Firebase's signed token, not from anything the page stores
  let authMs = Date.now();
  try { authMs = Date.parse((await user.getIdTokenResult()).authTime) || authMs; } catch {}
  sessionEnd = authMs + SESSION_MS;
  if (Date.now() >= sessionEnd) { leave("expired"); return; }
  $("#whoEmail").textContent = user.email || "";
  startClock();
  startSession();
});

/* clear everything on the page, then sign out and go to the login page */
function wipe() {
  unsubs.forEach(u => u()); unsubs = [];
  clearInterval(clockTimer); clearTimeout(idleTimer);
  for (const k of Object.keys(data)) data[k] = [];
  $("#rows").textContent = ""; $("#dlgBody").textContent = ""; $("#dlgActions").textContent = "";
  try { $("#dlg").close(); } catch {}
  $("#app").hidden = true;
}
function leave(reason) {
  wipe();
  signOut(auth).finally(() => location.replace("./login.html" + (reason ? "?reason=" + reason : "")));
}

/* session countdown in the header */
function startClock() {
  const tick = () => {
    const left = sessionEnd - Date.now();
    if (left <= 0) { leave("expired"); return; }
    const m = Math.ceil(left / 60000), h = Math.floor(m / 60);
    const box = $("#sessionLeft");
    box.textContent = "Session ends in " + (h ? h + "h " : "") + (m % 60) + "m";
    box.classList.toggle("warn", left < 10 * 60000);
  };
  clearInterval(clockTimer); tick(); clockTimer = setInterval(tick, 30000);
}
$("#signOut").addEventListener("click", () => leave());

/* -------- idle sign-out -------- */
function resetIdle() { clearTimeout(idleTimer); idleTimer = setTimeout(() => leave("idle"), IDLE_MS); }
["click", "keydown", "mousemove", "touchstart", "scroll"].forEach(e => addEventListener(e, resetIdle, { passive: true }));

/* -------- live data -------- */
function startSession() {
  resetIdle();
  buildTabs();
  unsubs.forEach(u => u()); unsubs = []; firstLoad = new Set();
  for (const kind of Object.keys(SOURCES)) {
    const q = query(collection(db, kind), orderBy("createdAt", "desc"), limit(500));
    unsubs.push(onSnapshot(q, snap => {
      data[kind] = snap.docs.map(d => normalise(kind, d.id, d.data()));
      // reveal the dashboard only after the server has allowed the first read
      $("#gate").hidden = true; $("#app").hidden = false;
      firstLoad.add(kind);
      render();
    }, err => {
      if (err && err.code === "permission-denied") {
        // the server refuses once the 2 hours are over, or when this account is not an admin
        if (Date.now() >= sessionEnd - 10000) { leave("expired"); return; }
        $("#app").hidden = true; $("#gate").hidden = false; $("#gate").textContent = "This account is not allowed to view this data. Signing out…";
        setTimeout(() => leave("denied"), 1200);
      } else {
        setStatus("Could not load " + SOURCES[kind] + ". Check your connection.", true);
      }
    }));
  }
}

/* -------- UI -------- */
function buildTabs() {
  const box = $("#tabs"); box.textContent = "";
  for (const kind of Object.keys(SOURCES)) {
    box.append(el("button", {
      class: "tab", role: "tab", type: "button", "data-kind": kind, "aria-selected": String(kind === active),
      onclick: () => { active = kind; render(); }
    }, [el("span", { text: SOURCES[kind] }), el("small", { text: "0" })]));
  }
}

function visibleRows() {
  const term = $("#search").value.trim().toLowerCase();
  const st = $("#statusFilter").value;
  return data[active].filter(r =>
    (st === "all" || r.status === st) &&
    (!term || [r.name, r.email, r.phone, r.whatsapp, r.subject, r.company, r.location, r.message].some(v => String(v || "").toLowerCase().includes(term)))
  );
}

function render() {
  const all = Object.values(data).flat();
  const today = new Date().toDateString();
  $("#kTotal").textContent = all.length;
  $("#kNew").textContent = all.filter(r => r.status === "new").length;
  $("#kToday").textContent = all.filter(r => r.created && r.created.toDateString() === today).length;
  $("#kDone").textContent = all.filter(r => r.status === "done").length;
  document.querySelectorAll(".tab").forEach(t => {
    t.setAttribute("aria-selected", String(t.dataset.kind === active));
    t.querySelector("small").textContent = data[t.dataset.kind].length;
  });

  const rows = visibleRows(), body = $("#rows");
  body.textContent = "";
  for (const r of rows) {
    const tr = el("tr", { tabindex: "0", onclick: () => openDetail(r), onkeydown: e => { if (e.key === "Enter") openDetail(r); } }, [
      el("td", { text: fmt(r.created) }),
      el("td", {}, [el("strong", { text: r.name || "(no name)" }), r.company ? el("span", { class: "snip", text: r.company }) : null]),
      el("td", {}, [el("span", { text: r.phone || "" }), el("span", { class: "snip", text: r.email || "" })]),
      el("td", {}, [el("strong", { text: r.subject || "" }), el("span", { class: "snip", text: r.message || "" })]),
      el("td", {}, [el("span", { class: "badge s-" + r.status, text: STATUS_LABEL[r.status] })])
    ]);
    body.append(tr);
  }
  $("#empty").hidden = rows.length > 0;
  setStatus(rows.length + " of " + data[active].length + " shown · updates live");
}
$("#search").addEventListener("input", render);
$("#statusFilter").addEventListener("change", render);

/* -------- detail dialog -------- */
function openDetail(r) {
  const dlg = $("#dlg");
  $("#dlgTitle").textContent = (SOURCES[r.kind] || "Submission") + " · " + fmt(r.created);
  const dl = $("#dlgBody"); dl.textContent = "";
  const rows = [["Name", r.name], ["Email", r.email], ["Phone", r.phone], ["WhatsApp", r.whatsapp], ["Company", r.company], ["Location", r.location], ["About", r.subject], ["Message", r.message]];
  for (const [k, v] of rows) if (v) { dl.append(el("dt", { text: k }), el("dd", { text: v })); }

  const act = $("#dlgActions"); act.textContent = "";
  const tel = safePhone(r.phone), wa = safePhone(r.whatsapp || r.phone), mail = safeEmail(r.email);
  if (tel) act.append(el("a", { href: "tel:" + tel, text: "Call" }));
  if (wa) act.append(el("a", { href: "https://wa.me/" + wa.replace("+", ""), target: "_blank", rel: "noopener noreferrer", text: "WhatsApp" }));
  if (mail) act.append(el("a", { href: "mailto:" + mail, text: "Email" }));
  const sel = el("select", { "aria-label": "Status" }, Object.entries(STATUS_LABEL).map(([v, t]) => el("option", { value: v, text: t })));
  sel.value = r.status;
  sel.addEventListener("change", async () => {
    try { await updateDoc(doc(db, r.kind, r.id), { status: sel.value, handledAt: serverTimestamp() }); setStatus("Status saved."); }
    catch { setStatus("Could not save the status.", true); sel.value = r.status; }
  });
  act.append(el("span", { class: "sp" }), sel,
    el("button", { class: "ghost danger", type: "button", text: "Delete", onclick: async () => {
      if (!confirm("Delete this submission permanently? This cannot be undone.")) return;
      try { await deleteDoc(doc(db, r.kind, r.id)); dlg.close(); setStatus("Deleted."); }
      catch { setStatus("Could not delete.", true); }
    } }),
    el("button", { class: "ghost", type: "button", text: "Close", onclick: () => dlg.close() }));
  dlg.showModal();
}

/* -------- export -------- */
$("#exportCsv").addEventListener("click", () => {
  const csv = toCsv(visibleRows(), SOURCES);
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = el("a", { href: url, download: "techfami-" + active + "-" + new Date().toISOString().slice(0, 10) + ".csv" });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
