# Perfect Jobs & Adventures website

A static site with no build step: HTML, CSS and vanilla JS. It's meant to be served from https://perfectjobsandadventures.github.io/ (GitHub Pages, repo root).

## Editing contact details
Open `assets/js/main.js` and edit the `SITE` object at the top (WhatsApp number, phone and email). The HTML already contains the same links, so the site still works without JavaScript. If you change a value, search `index.html` for the old one too.

## Placeholders to replace
- **Melissa's photo:** in the "Meet Melissa" section of `index.html`, look for `PLACEHOLDER`.
- **Facebook group link:** search for `TODO` in `index.html`.
- **Community photos:** the stock clips are there for mood. Swap them for real event photos when you have them.
- **Uluru photos:** don't add any until Parks Australia grants a commercial media permit (see `CREDITS.md`).

## Making a new live photo
`make-live-photo.sh INPUT START DURATION NAME [xfade|boomerang] OUTDIR` (Design Bot's script). Copy the `-720`/`-480` `.webm` and `.mp4` files into `assets/video/` and the posters into `assets/img/`. Then add a card using the same markup as the existing ones (`data-live`, `data-base="assets/video/NAME"`).
