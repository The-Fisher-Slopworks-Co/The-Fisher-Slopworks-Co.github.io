// SPDX-FileCopyrightText: 2026 The Fisher Slopworks Co
// SPDX-License-Identifier: AGPL-3.0-or-later
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------------------------------------------------- the sea (canvas) */
  const canvas = $("#sea");
  if (canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let W = 0, H = 0, dpr = 1, motes = [], pings = [], raf = 0, t = 0, last = 0;

    const TEAL = [70, 229, 196], BRASS = [230, 173, 99];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = clamp(Math.floor((W * H) / 11000), 40, 170);
      motes = [];
      for (let i = 0; i < target; i++) motes.push(spawn());
    }
    function spawn() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        px: 0, py: 0, len: 4 + Math.random() * 7,
        sp: 0.4 + Math.random() * 0.9,
        a: 0.12 + Math.random() * 0.5,
        brass: Math.random() < 0.16,
      };
    }
    // layered-sine "current" flow field — angle at a point in time
    function flow(x, y, tm) {
      return (
        Math.sin(x * 0.0016 + tm * 0.18) +
        Math.cos(y * 0.0019 - tm * 0.13) +
        Math.sin((x + y) * 0.0009 + tm * 0.07)
      ) * 1.1;
    }
    function ping() {
      if (pings.length > 2) return;
      pings.push({ x: W * (0.2 + Math.random() * 0.6), y: H * (0.1 + Math.random() * 0.5), r: 4, life: 1 });
    }
    let pingTimer = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 16.67, 2.2) || 1;
      last = now; t += 0.01 * dt;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      for (const m of motes) {
        m.px = m.x; m.py = m.y;
        const ang = flow(m.x, m.y, t);
        m.x += Math.cos(ang) * m.sp * dt;
        m.y += Math.sin(ang) * m.sp * dt * 0.7 + 0.05 * dt; // gentle sink
        if (m.x < -20) m.x = m.px = W + 20;
        if (m.x > W + 20) m.x = m.px = -20;
        if (m.y < -20) m.y = m.py = H + 20;
        if (m.y > H + 20) m.y = m.py = -20;
        const c = m.brass ? BRASS : TEAL;
        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${m.a * 0.55})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(m.px, m.py); ctx.lineTo(m.x, m.y); ctx.stroke();
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${m.a})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, 1.1, 0, 6.283); ctx.fill();
      }

      pingTimer += dt;
      if (pingTimer > 230) { pingTimer = 0; ping(); }
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        p.r += 0.9 * dt; p.life -= 0.0045 * dt;
        if (p.life <= 0) { pings.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(70,229,196,${p.life * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function staticFrame() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const m of motes) {
        ctx.fillStyle = `rgba(70,229,196,${m.a})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, 1.2, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    let ro;
    window.addEventListener("resize", () => {
      clearTimeout(ro); ro = setTimeout(() => { resize(); if (reduce) staticFrame(); }, 160);
    });
    resize();
    if (reduce) { staticFrame(); }
    else {
      const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
      const stop = () => { cancelAnimationFrame(raf); raf = 0; };
      document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
      start();
    }
    // fade the sea as the page descends
    const fade = () => {
      const o = clamp(1 - window.scrollY / (window.innerHeight * 1.3), 0.34, 1);
      canvas.style.opacity = o.toFixed(3);
    };
    fade();
    window.addEventListener("scroll", fade, { passive: true });
  }

  /* ---------------------------------------------------- custom cursor */
  const cursor = $("[data-cursor]");
  if (cursor && fine && !reduce) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy, on = false;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!on) { on = true; cursor.classList.add("is-active"); }
    });
    const hot = "a, button, .card, [data-magnetic], .chip";
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest(hot)) cursor.classList.add("is-hot");
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest(hot)) cursor.classList.remove("is-hot");
    });
    (function loop() {
      cx = lerp(cx, tx, 0.22); cy = lerp(cy, ty, 0.22);
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------------------------------------------- nav stuck */
  const nav = $("[data-nav]");
  const onScrollNav = () => nav && nav.classList.toggle("is-stuck", window.scrollY > 24);
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------------------------------------------------- depth gauge */
  const bead = $("[data-gauge-bead]");
  const read = $("[data-gauge-read]");
  const zone = $("[data-gauge-zone]");
  if (bead && read && zone) {
    const zones = [
      [0.0, "SURFACE"], [0.12, "SUNLIT"], [0.34, "TWILIGHT"],
      [0.62, "MIDNIGHT"], [0.85, "ABYSS"],
    ];
    let pending = false;
    const update = () => {
      pending = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const f = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      bead.style.top = (f * 100).toFixed(2) + "%";
      read.textContent = Math.round(f * 3990) + " m";
      let z = "SURFACE";
      for (const [thr, name] of zones) if (f >= thr) z = name;
      zone.textContent = z;
    };
    update();
    window.addEventListener("scroll", () => {
      if (!pending) { pending = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ---------------------------------------------------- reveal + stagger */
  const reveals = $$("[data-reveal]");
  const groups = new Map();
  reveals.forEach((el) => {
    const p = el.parentElement;
    if (!groups.has(p)) groups.set(p, 0);
    const i = groups.get(p); groups.set(p, i + 1);
    el.style.setProperty("--rd", Math.min(i, 8) * 70 + "ms");
  });
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------- count-up */
  const counts = $$(".count");
  const runCount = (el) => {
    const to = parseFloat(el.dataset.count) || 0;
    if (reduce || to === 0) { el.textContent = String(to); return; }
    const dur = 1400; const t0 = performance.now();
    const step = (now) => {
      const p = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counts.forEach((c) => cio.observe(c));
  } else counts.forEach(runCount);

  /* ---------------------------------------------------- catalog filter */
  const chips = $$("[data-filters] .chip");
  const cards = $$("[data-grid] .card");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => {
        const a = c === chip;
        c.classList.toggle("is-active", a);
        c.setAttribute("aria-pressed", a ? "true" : "false");
      });
      let vis = 0;
      cards.forEach((card) => {
        const match = f === "all" || card.dataset.cat === f;
        if (match) {
          card.classList.remove("is-hidden");
          if (!reduce) {
            card.style.setProperty("--rd", Math.min(vis, 10) * 45 + "ms");
            card.classList.remove("is-in");
            void card.offsetWidth; // reflow
            card.classList.add("is-in");
          }
          vis++;
        } else {
          card.classList.add("is-hidden");
        }
      });
    });
  });

  /* ---------------------------------------------------- card tilt + spotlight */
  if (fine && !reduce) {
    cards.forEach((card) => {
      const link = $(".card__link", card);
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        link.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        link.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        const rx = (0.5 - py) * 7, ry = (px - 0.5) * 8;
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        link.style.removeProperty("--mx");
        link.style.removeProperty("--my");
      });
    });
  }

  /* ---------------------------------------------------- magnetic buttons */
  if (fine && !reduce) {
    $$("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${(x * 0.22).toFixed(1)}px, ${(y * 0.32).toFixed(1)}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------------------------------------------------- ticker (seamless) */
  const tickerRow = $("[data-ticker-row]");
  if (tickerRow) tickerRow.append(...Array.from(tickerRow.children).map((n) => n.cloneNode(true)));

  /* ---------------------------------------------------- porthole rivets */
  const ring = $(".porthole__ring");
  const rivets = $(".porthole__rivets");
  if (ring && rivets) {
    rivets.style.background = "none";
    const N = 24;
    for (let i = 0; i < N; i++) {
      const d = document.createElement("i");
      const a = (i / N) * Math.PI * 2;
      d.style.cssText =
        "position:absolute;width:4px;height:4px;border-radius:50%;" +
        "background:radial-gradient(circle at 35% 35%,#dfe9ec,#5e7180);" +
        "box-shadow:0 1px 1px rgba(0,0,0,.6);" +
        `left:${(50 + 48 * Math.cos(a)).toFixed(2)}%;top:${(50 + 48 * Math.sin(a)).toFixed(2)}%;` +
        "transform:translate(-50%,-50%);";
      rivets.appendChild(d);
    }
  }

  /* ---------------------------------------------------- lazy d10 iframe */
  const iframe = $("[data-iframe]");
  const glass = iframe && iframe.closest(".porthole__glass");
  const loadBtn = $("[data-iframe-load]");
  let loaded = false;
  const loadIframe = () => {
    if (loaded || !iframe) return;
    loaded = true;
    iframe.addEventListener("load", () => {
      if (glass) glass.classList.add("is-loaded");
      // pull the now-hidden overlay button out of the focus + a11y tree
      if (loadBtn) loadBtn.setAttribute("inert", "");
    }, { once: true });
    iframe.src = iframe.dataset.src;
  };
  if (loadBtn) loadBtn.addEventListener("click", loadIframe);
  if (iframe && "IntersectionObserver" in window) {
    const fio = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { loadIframe(); fio.disconnect(); } });
    }, { threshold: 0.35 });
    fio.observe(iframe.closest(".porthole"));
  }

  /* ---------------------------------------------------- year (defensive) */
  // (static © 2026 in markup; nothing to do)
})();
