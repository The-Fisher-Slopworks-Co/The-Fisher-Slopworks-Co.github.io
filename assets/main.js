// SPDX-FileCopyrightText: 2026 The Fisher Slopworks Co
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Two behaviours, both of which the page degrades gracefully without: the
// catalog filter and the deferred d10 embed. Everything else the page needs
// is CSS.
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------------------------------------------------- catalog filter */
  const chips = $$("[data-filters] .chip");
  const cards = $$("[data-grid] .card");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      cards.forEach((card) => {
        card.classList.toggle("is-hidden", f !== "all" && card.dataset.cat !== f);
      });
    });
  });

  /* ---------------------------------------------------- deferred d10 embed */
  const iframe = $("[data-iframe]");
  const glass = iframe && iframe.closest(".scope__glass");
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
  if (glass && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { loadIframe(); io.disconnect(); } });
    }, { threshold: 0.35 });
    io.observe(glass);
  }
})();
