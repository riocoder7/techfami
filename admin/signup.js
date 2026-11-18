import { auth, db } from "../config/firebaseConfig.js";
import { deriveSecret } from "./util.js";
import { createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// never render this page inside another site (clickjacking)
if (window.top !== window.self) { document.documentElement.textContent = ""; throw new Error("framed"); }

const $ = s => document.querySelector(s);
const msg = $("#msg"), btn = $("#submit");
const show = (t, ok = false) => { msg.textContent = t; msg.hidden = !t; msg.classList.toggle("ok", ok); };

function toggle(inputSel, btnSel) {
  $(btnSel).addEventListener("click", e => {
    const f = $(inputSel), on = f.type === "password";
    f.type = on ? "text" : "password";
    e.currentTarget.textContent = on ? "Hide" : "Show";
    e.currentTarget.setAttribute("aria-pressed", String(on));
  });
}
toggle("#password", "#showPw"); toggle("#secret", "#showKey");

$("#signupForm").addEventListener("submit", async e => {
  e.preventDefault(); show("");
  const name = $("#name").value.trim(), email = $("#email").value.trim().toLowerCase();
  const password = $("#password").value, secret = $("#secret").value;
  if (!name) return show("Enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show("Enter a valid email.");
  if (password.length < 12) return show("The password needs at least 12 characters.");
  if (secret.length < 10) return show("The secret key needs at least 10 characters.");
  if (password === secret) return show("The password and the secret key must be different.");

  btn.disabled = true; btn.textContent = "Sending…";
  let created = false;
  try {
    // password + secret key are mixed here; Firebase only ever receives the combined value
    const combined = await deriveSecret(email, password, secret);
    const cred = await createUserWithEmailAndPassword(auth, email, combined);
    created = true;
    // the request is ALWAYS saved as inactive. The database rules refuse anything else,
    // and nobody can switch it on from the website: an administrator does that in the Firebase console.
    await setDoc(doc(db, "admin", cred.user.uid), { name, email, role: "admin", active: false, createdAt: serverTimestamp() });
    await signOut(auth);
    $("#signupForm").hidden = true;
    show("Request sent. An administrator must approve your account before you can sign in. You will not be able to open the dashboard until then.", true);
  } catch (err) {
    if (created) { try { await signOut(auth); } catch {} }
    const code = err && err.code;
    if (code === "auth/email-already-in-use") show("We could not send the request. Please contact the administrator.");
    else if (code === "auth/operation-not-allowed") show("We could not send the request. Please contact the administrator.");
    else if (err && err.message === "secure-context-required") show("This browser blocks secure features here. Open the site with https://.");
    else if (code === "permission-denied") show("We could not send the request. Please contact the administrator.");
    else show("Could not send the request. Please check your connection and try again.");
  } finally {
    $("#password").value = ""; $("#secret").value = "";
    btn.disabled = false; btn.textContent = "Send request";
  }
});
