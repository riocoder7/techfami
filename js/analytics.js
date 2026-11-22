/* Visitor analytics, loaded only after the visitor agrees (works for every country's privacy rules).
   1. Create a free Google Analytics 4 property  ->  copy the Measurement ID (looks like G-XXXXXXXXXX)
   2. Create a free Microsoft Clarity project     ->  copy the Project ID (about 10 letters and digits)
   3. Paste them below. Leave a value empty to switch that tool off. With both empty nothing loads and no banner shows. */
(function () {
  "use strict";
  var GTM_ID = "GTM-T9LFDSF4";   // Google Tag Manager container (put GA4 and Clarity tags inside it, or use the two IDs below)
  var GA_ID = "";        // e.g. "G-ABCDE12345"
  var CLARITY_ID = "zhs9b6flcm";   // Microsoft Clarity project

  if (!/^GTM-[A-Z0-9]{4,12}$/.test(GTM_ID)) GTM_ID = "";
  if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID)) GA_ID = "";
  if (!/^[a-z0-9]{6,16}$/.test(CLARITY_ID)) CLARITY_ID = "";
  if (!GTM_ID && !GA_ID && !CLARITY_ID) return;

  var KEY = "tf_consent";
  var get = function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  var set = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} };

  function load() {
    if (GTM_ID) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var m = document.createElement("script");
      m.async = true; m.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
      document.head.appendChild(m);
    }
    if (GA_ID) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", GA_ID, { anonymize_ip: true });
      var g = document.createElement("script");
      g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
      document.head.appendChild(g);
    }
    if (CLARITY_ID) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", CLARITY_ID);
    }
  }

  var saved = get();
  if (saved === "yes") { load(); return; }
  if (saved === "no") return;
  // respect browsers that send Do Not Track / Global Privacy Control
  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl) return;

  function banner() {
    var box = document.createElement("div");
    box.className = "cc"; box.setAttribute("role", "region"); box.setAttribute("aria-label", "Cookie and analytics choice");
    var p = document.createElement("p");
    p.textContent = "We use analytics to see which pages visitors read and where they leave, so we can improve the site. Nothing is sold. Allow it?";
    var yes = document.createElement("button"); yes.type = "button"; yes.className = "cc-yes"; yes.textContent = "Allow";
    var no = document.createElement("button"); no.type = "button"; no.className = "cc-no"; no.textContent = "No thanks";
    yes.addEventListener("click", function () { set("yes"); box.remove(); load(); });
    no.addEventListener("click", function () { set("no"); box.remove(); });
    box.append(p, yes, no);
    document.body.appendChild(box);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", banner); else banner();
})();
