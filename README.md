<!--
SPDX-FileCopyrightText: 2026 The Fisher Slopworks Co
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# slopworks.org

The public landing page for [The Fisher Slopworks Co](https://github.com/The-Fisher-Slopworks-Co),
a small free-software foundry. One static page, served to
**[slopworks.org](https://slopworks.org)** via GitHub Pages.

## Develop

```bash
just serve      # preview on http://localhost:8000
just og         # redraw assets/og.png after editing assets/og.svg
just lint       # the REUSE check CI runs on every push
```

`just og` needs `rsvg-convert` and ImageMagick, `just lint` needs `reuse`.

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE). This repository is
[REUSE](https://reuse.software/)-compliant.
