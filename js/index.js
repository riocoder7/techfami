/* Techfami landing page: navigation, motion, pricing currency */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasGsap = typeof gsap !== "undefined";

  /* footer year */
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* ── mobile menu: drops down from the top ── */
  const menu = $("#mobile-menu"), backdrop = $("#backdrop"), toggle = $("#menu-toggle");
  const setMenu = open => {
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menu.inert = !open;
    toggle?.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    if (open) { backdrop.classList.remove("hidden"); requestAnimationFrame(() => backdrop.classList.add("show")); }
    else { backdrop.classList.remove("show"); setTimeout(() => !menu.classList.contains("open") && backdrop.classList.add("hidden"), 400); }
  };
  menu.inert = true;
  toggle?.addEventListener("click", () => setMenu(true));
  $("#menu-close")?.addEventListener("click", () => setMenu(false));
  backdrop?.addEventListener("click", () => setMenu(false));
  $$(".mobilLink").forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
  matchMedia("(min-width: 961px)").addEventListener("change", e => { if (e.matches) setMenu(false); });

  /* ── header turns light after the dark hero scrolls away ── */
  const header = $("#header"), hero = $(".hero");
  const setHeader = () => {
    const limit = hero ? hero.offsetHeight - 90 : 40;
    header.classList.toggle("scrolled", scrollY > limit);
  };
  addEventListener("scroll", setHeader, { passive: true }); setHeader();

  /* ── run once when an element enters the viewport ── */
  const onView = (els, cb, margin = "-12% 0px") => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { io.unobserve(en.target); cb(en.target); } });
    }, { rootMargin: margin, threshold: 0.12 });
    els.forEach(el => io.observe(el));
  };

  if (hasGsap && !reduce) {
    /* hero: headline lines (or words on inner pages) reveal, then the rest, once, under 2.5s */
    const h1 = $("[data-split]");
    let targets = $$("[data-line]");
    if (h1) {
      const split = (node) => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(t => {
              if (!t) return;
              if (/^\s+$/.test(t)) { frag.append(" "); return; }
              const s = document.createElement("span"); s.className = "w"; s.textContent = t; frag.append(s);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) { split(n); }
        });
      };
      split(h1);
      targets = $$(".w", h1);
    }
    gsap.set(targets, { opacity: 0, y: 40, filter: "blur(12px)" });
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(targets, { opacity: 1, y: 0, filter: "blur(0px)", duration: .8, stagger: h1 ? .09 : .16 })
      .to("[data-hero]", { opacity: 1, y: 0, duration: .7, stagger: .12 }, "-=.35");
    gsap.set("[data-hero]", { y: 24 });

    /* flipping word in the headline */
    const flip = $("#flip");
    if (flip) {
      const fws = $$(".fw", flip);
      flip.classList.add("flip-js");
      let cur = 0;
      const em = () => parseFloat(getComputedStyle(flip).fontSize);
      const widthOf = i => fws[i].getBoundingClientRect().width + em() * 0.6;
      gsap.set(fws, { opacity: 0 });
      gsap.set(fws[0], { opacity: 1 });
      const fit = () => { flip.style.width = widthOf(cur) + "px"; };
      fit();
      document.fonts?.ready.then(fit);
      addEventListener("resize", fit);
      let busy = false;
      const next = () => {
        if (document.hidden || busy) return;
        busy = true;
        const from = fws[cur];
        cur = (cur + 1) % fws.length;
        const to = fws[cur];
        gsap.killTweensOf([...fws, flip]);
        gsap.set(fws.filter(f => f !== from), { opacity: 0 });
        gsap.timeline({ onComplete: () => { gsap.set(fws.filter(f => f !== to), { opacity: 0, yPercent: 0 }); busy = false; } })
          .to(from, { yPercent: -70, opacity: 0, duration: .35, ease: "power2.in" })
          .set(to, { yPercent: 70, opacity: 0 })
          .to(flip, { width: widthOf(cur), duration: .4, ease: "power2.inOut" })
          .to(to, { yPercent: 0, opacity: 1, duration: .45, ease: "power3.out" }, "<.1");
      };
      setTimeout(() => setInterval(next, 3000), 2800);
    }

    /* word rotator */
    const track = $("#rotator");
    if (track) {
      const rows = track.children.length - 1;
      const rowH = () => track.children[0].getBoundingClientRect().height;
      let i = 0;
      const tick = () => {
        i++;
        gsap.to(track, { y: -i * rowH(), duration: .7, ease: "back.inOut(1.2)", onComplete: () => {
          if (i >= rows) { i = 0; gsap.set(track, { y: 0 }); }
        }});
      };
      setTimeout(() => setInterval(tick, 2200), 2600);
    }

    /* generic scroll reveal, staggered per parent */
    const groups = new Map();
    $$("[data-r]").forEach(el => { const p = el.parentElement; (groups.get(p) || groups.set(p, []).get(p)).push(el); });
    groups.forEach(list => {
      onView(list, (el) => {
        const idx = list.indexOf(el);
        gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: "expo.out", delay: Math.min(idx, 5) * .08 });
      });
    });


    /* services bento: start illustrations when a tile scrolls into view */
    onView($$(".stile"), el => el.classList.add("is-in"), "-8% 0px");

    /* bento build: tiles fly in from different directions */
    const tiles = $$("#bento .tile");
    if (tiles.length) {
      const from = [{ x: -60, rotate: -4 }, { y: 60, rotate: 3 }, { x: 60, rotate: 4 }, { y: 60, rotate: -3 }, { x: -60, rotate: 3 }, { y: 70, rotate: -2 }];
      const small = matchMedia("(max-width: 960px)").matches;
      tiles.forEach((t, i) => gsap.set(t, small ? { opacity: 0, y: 40 } : { opacity: 0, scale: .88, ...from[i % from.length] }));
      onView([$("#bento")], () => {
        gsap.to(tiles, { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: .9, ease: "back.out(1.4)", stagger: .14 });
      }, "-8% 0px");
    }

    /* pricing: digits roll up to each price, feature lists cascade in */
    const plans = $(".plans");
    if (plans) {
      $$(".price [data-val]").forEach(el => {
        const val = el.dataset.val, sym = el.dataset.sym, loc = el.dataset.loc || "en-US", suf = el.dataset.suf || "";
        const text = Number(val).toLocaleString(loc);
        el.setAttribute("aria-label", sym + text + suf);
        el.innerHTML = '<span class="sym" aria-hidden="true">' + sym + '</span>' +
          [...text].map(ch => /\d/.test(ch)
            ? '<span class="od" aria-hidden="true" data-d="' + ch + '"><span class="od-col">' + [0,1,2,3,4,5,6,7,8,9].map(n => '<span>' + n + '</span>').join('') + '</span></span>'
            : '<span class="sep" aria-hidden="true">' + ch + '</span>').join('') +
          (suf ? '<small aria-hidden="true">' + suf + '</small>' : "");
        /* size each digit box to its final digit so the price has no gaps */
        const cs = getComputedStyle(el.parentElement);
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
        const ls = parseFloat(cs.letterSpacing) || 0;
        $$(".od", el).forEach(od => { od.style.width = (ctx.measureText(od.dataset.d).width + ls) + "px"; });
      });
      onView([plans], () => {
        $$(".plan").forEach((plan, pi) => {
          $$(".od-col", plan).forEach((col, i) => gsap.to(col, {
            yPercent: -Number(col.parentElement.dataset.d) * 10,
            duration: 1.5 + i * .08, delay: .25 + pi * .15, ease: "power3.inOut"
          }));
          gsap.to($$("li", plan), { opacity: 1, x: 0, duration: .5, ease: "power2.out", stagger: .045, delay: .5 + pi * .15 });
        });
      }, "-20% 0px");
    }

    /* review deck: shuffle every 3s, pause on hover */
    const deck = $("#deck");
    if (deck) {
      const cards = $$(".rcard", deck);
      let order = [...cards], paused = false;
      const place = (animate) => order.forEach((c, i) => {
        const vars = { y: i * 24, scale: 1 - i * .05, opacity: i > 2 ? 0 : 1 - i * .22, zIndex: 10 - i, rotate: 0, x: 0 };
        animate ? gsap.to(c, { ...vars, duration: .7, ease: "back.out(1.3)" }) : gsap.set(c, vars);
      });
      place(false);
      const shuffle = () => {
        if (paused || document.hidden) return;
        const top = order.shift();
        gsap.to(top, { x: -140, rotate: -14, opacity: 0, duration: .45, ease: "power2.in", onComplete: () => {
          order.push(top); gsap.set(top, { x: 0, rotate: 0 }); place(true);
        }});
        place.call(null, true);
      };
      deck.addEventListener("mouseenter", () => paused = true);
      deck.addEventListener("mouseleave", () => paused = false);
      deck.addEventListener("focusin", () => paused = true);
      deck.addEventListener("focusout", () => paused = false);
      onView([deck], () => setInterval(shuffle, 3200));
    }
  } else {
    /* reduced motion or no GSAP: show everything, stack reviews as a simple list */
    $$("[data-r],[data-hero],.plan li").forEach(el => { el.style.opacity = 1; el.style.transform = "none"; });
    $$(".stile").forEach(t => t.classList.add("is-in"));
    const deck = $("#deck");
    if (deck) { deck.style.height = "auto"; $$(".rcard", deck).forEach(c => { c.style.position = "relative"; c.style.height = "auto"; c.style.marginBottom = "1rem"; }); }
  }


  /* ── hero: idea box + idea → reality slider ── */
  const stage = $("#reveal");
  if (stage) {
    const range = $("input[type=range]", stage);
    const setX = v => { stage.style.setProperty("--x", v); range.value = v; };
    if (hasGsap && !reduce) {
      setX(100);
      const o = { v: 100 };
      const tw = gsap.to(o, { v: 46, duration: 2.6, delay: 1.4, ease: "power3.inOut", onUpdate: () => setX(o.v) });
      ["pointerdown", "keydown", "touchstart"].forEach(ev => range.addEventListener(ev, () => tw.kill(), { passive: true }));
    } else { setX(50); }
    range.addEventListener("input", () => stage.style.setProperty("--x", range.value));
    ["pointerdown", "keydown", "input"].forEach(ev => range.addEventListener(ev, () => stage.classList.add("touched"), { passive: true, once: true }));
  }

  const ideaForm = $("#ideaForm"), idea = $("#idea");
  if (ideaForm && idea) {
    const ph = ["a booking app for my salon", "a website for my business", "an AI chatbot for customer support", "a SaaS product for my industry"];
    let pi = 0;
    setInterval(() => {
      if (document.activeElement !== idea && !idea.value) { pi = (pi + 1) % ph.length; idea.placeholder = ph[pi]; }
    }, 3200);
    idea.addEventListener("input", () => { idea.removeAttribute("aria-invalid"); const er = $("#ideaErr"); if (er) er.hidden = true; });
    $$("[data-fill]", ideaForm).forEach(b => b.addEventListener("click", () => { idea.value = b.dataset.fill; idea.focus(); }));
    ideaForm.addEventListener("submit", e => {
      e.preventDefault();
      const v = idea.value.trim();
      if (!v) {
        idea.setAttribute("aria-invalid", "true"); $("#ideaErr").hidden = false;
        idea.focus(); idea.classList.add("shake"); setTimeout(() => idea.classList.remove("shake"), 500); return;
      }
      const msg = $("#f-msg"); if (msg) msg.value = "I want to build " + v + ".";
      $("#contact")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(() => $("#f-name")?.focus({ preventScroll: true }), reduce ? 0 : 800);
    });
  }


  /* ── pricing: Pro plan tabs switch by themselves, one at a time ── */
  const proTabs = $("#proTabs");
  if (proTabs) {
    const btns = $$("[role=tab]", proTabs), panels = btns.map(b => $("#" + b.getAttribute("aria-controls")));
    const prog = proTabs.nextElementSibling.firstElementChild;
    let cur = 0, timer = null, stopped = reduce;
    const restartBar = () => { prog.style.animation = "none"; void prog.offsetWidth; prog.style.animation = ""; };
    const show = i => {
      cur = i; proTabs.dataset.i = i;
      btns.forEach((b, k) => { b.setAttribute("aria-selected", String(k === i)); b.tabIndex = k === i ? 0 : -1; panels[k].classList.toggle("on", k === i); });
      restartBar();
    };
    const play = () => { clearInterval(timer); if (stopped) return; proTabs.classList.add("playing"); restartBar(); timer = setInterval(() => show((cur + 1) % btns.length), 4500); };
    const pause = () => { clearInterval(timer); proTabs.classList.remove("playing"); };
    btns.forEach((b, k) => {
      b.addEventListener("click", () => { stopped = true; pause(); show(k); prog.style.animation = "none"; });
      b.addEventListener("keydown", e => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const n = (k + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length; stopped = true; pause(); show(n); prog.style.animation = "none"; btns[n].focus(); }
      });
    });
    const card = proTabs.closest(".plan");
    card.addEventListener("mouseenter", pause);
    card.addEventListener("mouseleave", () => { if (!stopped && started) play(); });
    let started = false;
    onView([card], () => setTimeout(() => { started = true; play(); }, 1200), "-25% 0px");
  }



  /* ── section titles: letters rise in one by one on scroll (same motion as the footer "Techfami") ── */
  if (!reduce) {
    $$("h2.display").forEach(h => {
      const label = h.textContent.replace(/\s+/g, " ").trim();
      let n = 0;
      const walk = node => {
        [...node.childNodes].forEach(c => {
          if (c.nodeType === 3) {
            const frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(part => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.append(" "); return; }
              const w = document.createElement("span"); w.className = "wd"; w.setAttribute("aria-hidden", "true");
              [...part].forEach(ch => { const l = document.createElement("span"); l.className = "lt"; l.textContent = ch; w.append(l); n++; });
              frag.append(w);
            });
            c.replaceWith(frag);
          } else if (c.nodeType === 1) { walk(c); }
        });
      };
      walk(h);
      h.setAttribute("aria-label", label);        // screen readers still read the whole title
      h.classList.add("t-split");
      const step = Math.min(30, 800 / Math.max(n, 1));   // whole title finishes in under a second
      $$(".lt", h).forEach((l, i) => l.style.setProperty("--d", Math.round(i * step) + "ms"));
      onView([h], el => el.classList.add("in"), "-6% 0px -6% 0px");
    });
  }

  /* ── footer wordmark: letters rise in, then react to the cursor ── */
  const wm = $(".wordmark");
  if (wm) {
    const word = wm.textContent;
    wm.textContent = "";
    [...word].forEach((ch, i) => { const s = document.createElement("span"); s.className = "wm-l"; s.style.setProperty("--i", i); s.textContent = ch; wm.append(s); });
    if (reduce) wm.classList.add("in"); else onView([wm], el => el.classList.add("in"), "0px 0px -5% 0px");
  }


  /* ── process: a winding road that fills in as you scroll ── */
  const road = $("#road");
  if (road) {
    const svg = $(".road-svg", road), bed = $(".road-bed", road), prog = $(".road-prog", road), dash = $(".road-dash", road), car = $(".road-car", road);
    const stops = $$(".stop", road), pins = stops.map(s => $(".pin", s));
    let L = 1, lens = [], cur = reduce ? 1 : 0, target = cur;
    const build = () => {
      const R = road.getBoundingClientRect();
      svg.setAttribute("viewBox", "0 0 " + R.width + " " + R.height);
      const pts = pins.map(p => { const r = p.getBoundingClientRect(); return [r.left + r.width / 2 - R.left, r.top + r.height / 2 - R.top]; });
      let d = "M" + pts[0][0] + " " + Math.max(0, pts[0][1] - 70) + " L" + pts[0][0] + " " + pts[0][1];
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], k = (y1 - y0) * 0.55;
        d += " C" + x0 + " " + (y0 + k) + " " + x1 + " " + (y1 - k) + " " + x1 + " " + y1;
      }
      const last = pts[pts.length - 1];
      d += " L" + last[0] + " " + Math.min(R.height, last[1] + 70);
      [bed, prog, dash].forEach(p => p.setAttribute("d", d));
      L = prog.getTotalLength();
      prog.style.strokeDasharray = L;
      lens = pts.map(pt => { let best = 0, bd = Infinity; for (let l = 0; l <= L; l += 3) { const q = prog.getPointAtLength(l); const dd = Math.hypot(q.x - pt[0], q.y - pt[1]); if (dd < bd) { bd = dd; best = l; } } return best; });
      apply();
    };
    const apply = () => {
      const len = cur * L;
      prog.style.strokeDashoffset = L - len;
      const q = prog.getPointAtLength(Math.max(0.01, len));
      car.setAttribute("cx", q.x); car.setAttribute("cy", q.y);
      car.style.opacity = cur <= 0.001 ? 0 : 1;
      stops.forEach((s, i) => s.classList.toggle("on", len >= lens[i] - 8));
    };
    const measure = () => {
      const r = road.getBoundingClientRect();
      target = Math.min(1, Math.max(0, (innerHeight * 0.68 - r.top) / (r.height * 0.88)));
      kick();
    };
    let raf = 0;
    const tick = () => {
      if (Math.abs(target - cur) > 0.0004) { cur += (target - cur) * 0.14; apply(); raf = requestAnimationFrame(tick); }
      else { cur = target; apply(); raf = 0; }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    build();
    if (reduce) { cur = target = 1; apply(); }
    else { addEventListener("scroll", measure, { passive: true }); measure(); }
    let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (!reduce) measure(); }, 120); });
    if (document.fonts?.ready) document.fonts.ready.then(() => { build(); if (!reduce) measure(); });
  }


  /* ── services: each card slides over the last; the one underneath shrinks and dims ── */
  const sbento = $("#sbento");
  if (sbento && !reduce) {
    const tiles = $$(".stile", sbento);
    let ticking = false, near = true;
    const upd = () => {
      ticking = false;
      const on = innerHeight >= 561;
      const rects = tiles.map(t => t.getBoundingClientRect()); /* read first, write after */
      tiles.forEach((t, i) => {
        if (!on || !rects[i + 1]) { t.style.transform = ""; t.style.setProperty("--dim", "0"); return; }
        const p = Math.min(1, Math.max(0, (rects[i].bottom - rects[i + 1].top) / rects[i].height));
        t.style.transform = "scale(" + (1 - 0.055 * p).toFixed(3) + ")";
        t.style.setProperty("--dim", (0.22 * p).toFixed(3));
      });
    };
    const req = () => { if (near && !ticking) { ticking = true; requestAnimationFrame(upd); } };
    new IntersectionObserver(([e]) => { near = e.isIntersecting; if (near) req(); }, { rootMargin: "200px 0px" }).observe(sbento);
    addEventListener("scroll", req, { passive: true });
    addEventListener("resize", req);
    upd();
  }


  /* ── FAQ as a chat: tap a question, a typed reply appears ── */
  const faqList = $("#faqList");
  if (faqList) {
    const items = $$("details.qa", faqList).map(d => ({ q: $("summary", d).textContent.trim(), a: $("p", d).innerHTML }));
    const right = faqList.parentElement, section = faqList.closest("section");
    const chat = document.createElement("div");
    chat.className = "chat";
    chat.innerHTML = '<div class="chat-head"><img src="./images/logo.png" alt="" width="38" height="38" /><div><b>Techfami</b><span>Usually replies within one working day</span></div></div>' +
      '<div class="chat-body" aria-live="polite"></div><div class="chat-picks" role="group" aria-label="Pick a question"></div>';
    right.prepend(chat);
    section.classList.add("faq-chat-on");
    const body = $(".chat-body", chat), picks = $(".chat-picks", chat);
    const toggle = document.createElement("button");
    toggle.type = "button"; toggle.className = "faq-toggle"; toggle.textContent = "Prefer a simple list? Show all answers";
    toggle.addEventListener("click", () => { const on = section.classList.toggle("show-list"); toggle.textContent = on ? "Hide the list" : "Prefer a simple list? Show all answers"; });
    chat.after(toggle);

    const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
    const add = (cls, html) => { const m = document.createElement("div"); m.className = "msg " + cls; m.innerHTML = html; body.append(m); body.scrollTop = body.scrollHeight; return m; };
    const asked = new Set(); let chain = Promise.resolve();
    const reply = async i => {
      add("me", items[i].q);
      await wait(350);
      const t = add("bot typing", "<i></i><i></i><i></i>");
      await wait(900);
      t.remove();
      const m = add("bot", items[i].a); m.dataset.i = i;
      if (asked.size === items.length && !body.dataset.done) {
        body.dataset.done = "1";
        await wait(600);
        add("bot", 'That is everything we get asked most. Anything else? <a href="https://wa.me/919930870979?text=Hello%20Techfami%2C%20I%20have%20a%20question." target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>.');
      }
    };
    const ask = i => {
      if (asked.has(i)) { const prev = $$(".msg.bot", body).find(m => m.dataset.i == i); prev?.scrollIntoView({ block: "nearest" }); return; }
      asked.add(i);
      const btn = picks.children[i]; btn.classList.add("asked"); btn.setAttribute("aria-pressed", "true");
      chain = chain.then(() => reply(i));   // clicks made while a reply is typing queue up in order
    };
    items.forEach((it, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "pick"; b.textContent = it.q; b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => ask(i));
      picks.append(b);
    });
    add("bot", "Hi! Tap any question below and we will answer it here.");
    onView([chat], () => setTimeout(() => ask(0), reduce ? 0 : 700), "-25% 0px");
  }

  /* ── show INR for India, USD elsewhere (device timezone: no third-party request, works in every browser incl. Brave/Safari/Firefox) ── */
  const pricing = () => {
    let tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (_) {}
    const showINR = !tz || /^Asia\/(Kolkata|Calcutta)$/.test(tz);   // unknown -> keep INR default
    $$(".inr").forEach(el => el.classList.toggle("hidden", !showINR));
    $$(".usd").forEach(el => el.classList.toggle("hidden", showINR));
  };
  if ($(".inr")) pricing();
})();
