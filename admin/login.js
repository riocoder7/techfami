import { auth, db } from "../config/firebaseConfig.js";
import { deriveSecret } from "./util.js";
import {
  signInWithEmailAndPassword, setPersistence, browserSessionPersistence, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// never render this page inside another site (clickjacking)
if (window.top !== window.self) { document.documentElement.textContent = ""; throw new Error("framed"); }

const $ = s => document.querySelector(s);
const form = $("#loginForm"), msg = $("#msg"), btn = $("#submit");
const params = new URLSearchParams(location.search);
if (params.get("reason") === "idle") show("You were signed out after 30 minutes without activity. Please sign in again.", false);
if (params.get("reason") === "expired") show("Your 2-hour session ended. Please sign in again.", false);
if (params.get("reason") === "denied") show("That account is not allowed to use the admin area.", true);

// already signed in -> go straight to the dashboard
let busy = false;   // true while the sign-in + approval check runs, so the shortcut below cannot jump ahead of it
onAuthStateChanged(auth, u => { if (u && !busy && !params.get("reason")) location.replace("./index.html"); });

function toggle(inputSel, btnSel) {
  $(btnSel).addEventListener("click", e => {
    const f = $(inputSel), on = f.type === "password";
    f.type = on ? "text" : "password";
    e.currentTarget.textContent = on ? "Hide" : "Show";
    e.currentTarget.setAttribute("aria-pressed", String(on));
  });
}
toggle("#password", "#showPw");
toggle("#secret", "#showKey");

// small client-side brake on top of Firebase's own rate limiting
const KEY = "adm_fail";
const state = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || { n: 0, until: 0 }; } catch { return { n: 0, until: 0 }; } };
const save = s => { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch {} };

function show(text, isError = true) { msg.textContent = text; msg.hidden = false; msg.classList.toggle("ok", !isError); }

form.addEventListener("submit", async e => {
  e.preventDefault();
  msg.hidden = true;
  const s = state();
  if (Date.now() < s.until) { show("Too many attempts. Please wait " + Math.ceil((s.until - Date.now()) / 1000) + " seconds and try again."); return; }
  const email = $("#email").value.trim(), password = $("#password").value, secret = $("#secret").value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || !secret) { show("Enter your email, password and secret key."); return; }

  busy = true;
  btn.disabled = true; btn.textContent = "Signing in…";
  try {
    // the secret key is mixed into the password here; the server only ever sees the combined value
    const combined = await deriveSecret(email, password, secret);
    await setPersistence(auth, browserSessionPersistence);          // session ends with the tab
    const cred = await signInWithEmailAndPassword(auth, email, combined);
    // correct credentials are not enough: the account must have been approved (active === true)
    // find out exactly why an account is not let in (safe to say: the password and key were already correct)
    const uid = cred.user.uid;
    let problem = "";
    try {
      const snap = await getDoc(doc(db, "admin", uid));
      if (!snap.exists()) problem = "missing";
      else {
        const d = snap.data();
        if (d.active === true && d.role === "admin") problem = "";
        else if (typeof d.active === "string") problem = "text";
        else if (d.role !== "admin") problem = "role";
        else problem = "inactive";
      }
    } catch (e) {
      problem = e && e.code === "permission-denied" ? "rules" : "network";
    }
    if (problem) {
      await signOut(auth);
      save({ n: 0, until: 0 });
      // one neutral message for every reason: nothing about accounts, rules or the database is revealed
      const why = "Sign-in is not available for this account. Please contact the administrator.";
      show(why, true);
      $("#password").value = ""; $("#secret").value = "";
      return;
    }
    save({ n: 0, until: 0 });
    location.replace("./index.html");
  } catch (err) {
    const n = s.n + 1;
    save({ n, until: n >= 5 ? Date.now() + Math.min(300, 30 * (n - 4)) * 1000 : 0 });
    // one generic message, so nobody can learn which emails exist
    const limited = err && err.code === "auth/too-many-requests";
    const insecure = err && err.message === "secure-context-required";
    show(insecure ? "This browser blocks secure sign-in on this address. Open the site with https://." : limited ? "Too many attempts. Please try again later." : "Incorrect email, password or secret key.");
    $("#password").value = ""; $("#secret").value = "";
  } finally {
    busy = false;
    btn.disabled = false; btn.textContent = "Sign in";
  }
});
