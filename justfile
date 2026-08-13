# SPDX-FileCopyrightText: 2026 The Fisher Slopworks Co
#
# SPDX-License-Identifier: AGPL-3.0-or-later

_default:
    @just --list --unsorted

# serve the site on http://localhost:PORT
serve port="8000":
    python3 -m http.server {{port}}

# redraw assets/og.png from assets/og.svg
og:
    rsvg-convert -w 1200 -h 630 -b '#071522' assets/og.svg \
      | magick - -strip -define png:color-type=2 assets/og.png

# the licence check CI runs on every push
lint:
    reuse lint
