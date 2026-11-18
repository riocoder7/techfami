// Pure helpers (no Firebase, no DOM) so they can be tested on their own.

/** One CSV cell. Quotes are escaped, and cells that could run as a spreadsheet formula are neutralised. */
export function csvCell(v) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;        // CSV / formula injection guard
  return '"' + s.replace(/"/g, '""') + '"';
}

/** Digits (and a leading +) only, otherwise "" so no link is made. */
export function safePhone(v) {
  const s = String(v || "").replace(/[^\d+]/g, "");
  const digits = s.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 ? (s.startsWith("+") ? "+" : "") + digits : "";
}
export function safeEmail(v) {
  const s = String(v || "").trim();
  return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(s) && s.length <= 160 ? s : "";
}

/** Turn a stored document of any of the three forms into one common shape. */
export function normalise(kind, id, d) {
  const code = d.countryCode ? String(d.countryCode) : "";
  const base = { kind, id, created: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate() : null, status: ["new", "contacted", "done"].includes(d.status) ? d.status : "new" };
  if (kind === "contactMessages") return { ...base, name: d.name, email: d.email, phone: d.phone, whatsapp: "", subject: d.service, company: d.companyname, location: d.location, message: d.message };
  if (kind === "inquiryForm") return { ...base, name: d.fullName, email: d.email, phone: d.phone, whatsapp: "", subject: d.services, company: "", location: "", message: d.message };
  return { ...base, name: "", email: d.email, phone: (code + " " + (d.phone || "")).trim(), whatsapp: d.whatsapp ? (code + " " + d.whatsapp).trim() : "", subject: "Call-back request", company: "", location: "", message: "" };
}

export function toCsv(rows, labels) {
  const head = ["Type", "Date", "Name", "Email", "Phone", "WhatsApp", "Subject", "Company", "Location", "Message", "Status"];
  const lines = [head.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push([labels[r.kind] || r.kind, r.created ? r.created.toISOString() : "", r.name, r.email, r.phone, r.whatsapp, r.subject, r.company, r.location, r.message, r.status].map(csvCell).join(","));
  }
  return lines.join("\r\n");
}

/**
 * Combine email + password + secret key into the single value Firebase checks as the password.
 * The secret key is never stored anywhere and never sent as such: only this derived value is.
 * PBKDF2 (310,000 rounds) makes every guess slow, and the key is part of the salt.
 * The same inputs always give the same output, so it is recomputed at every sign-in.
 */
export async function deriveSecret(email, password, secretKey) {
  const subtle = globalThis.crypto && globalThis.crypto.subtle;
  if (!subtle) throw new Error("secure-context-required");
  const enc = new TextEncoder();
  const material = await subtle.importKey("raw", enc.encode(String(password)), "PBKDF2", false, ["deriveBits"]);
  const salt = enc.encode("techfami-admin-v1|" + String(email).trim().toLowerCase() + "|" + String(secretKey));
  const bits = await subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 310000 }, material, 256);
  let bin = ""; for (const b of new Uint8Array(bits)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");   // 43 URL-safe characters
}
