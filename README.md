<!--
SPDX-FileCopyrightText: 2026 The Fisher Slopworks Co
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# slopworks.org

The public landing page for [The Fisher Slopworks Co](https://github.com/The-Fisher-Slopworks-Co)
— a small free-software foundry. Served from this repository to
**[slopworks.org](https://slopworks.org)** via GitHub Pages.

A single static page: an animated maritime / chart-room theme, a catalog of the
org's open-source tools, a live embed of the [`d10`](https://github.com/The-Fisher-Slopworks-Co/d10)
web toy, and the org's free-software standard. No framework, no build step, no
trackers — vanilla HTML, CSS, and JavaScript.

## Layout

| Path | What it is |
|------|------------|
| `index.html` | The whole page (semantic, works without JavaScript). |
| `assets/styles.css` | All styles, animations, and responsive rules. |
| `assets/main.js` | Progressive enhancement: the canvas current, depth gauge, scroll reveals, catalog filter, card tilt, and the lazy `d10` embed. |
| `assets/favicon.svg` | The maker's mark (a fish). |
| `assets/og.png` | Social share card (1200×630). |
| `CNAME` | Custom domain (`slopworks.org`). |

## Develop

It's static — open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy

Every push to `main` is published by GitHub Pages through
`.github/workflows/deploy.yml` (the official Pages actions). The custom domain is
set by `CNAME`; point the apex `slopworks.org` at GitHub Pages in DNS.

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE). This repository is
[REUSE](https://reuse.software/)-compliant — yes, the website follows the same
standard as everything in the catalog.
