# VoilàPDF

**Edit the text already written inside a PDF — in your browser, without uploading anything.**

[voilapdf.com](https://voilapdf.com) · [Version française](README.fr.md)

[![Licence: AGPL v3](https://img.shields.io/badge/licence-AGPL--3.0-1B4ACB)](LICENSE)
[![No build step](https://img.shields.io/badge/build-none-1F8A56)](#self-hosting)
[![No tracking](https://img.shields.io/badge/tracking-none-1F8A56)](https://voilapdf.com/en/privacy/)

![The editor open on a letter, a date being corrected](apercu-editeur.png)

Every online PDF service lets you *add* text for free. Correcting a line that is
already there — a wrong date, a misspelt name, a stale address — is the feature
they put behind a subscription, because it costs them server time.

It costs nothing here, because nothing runs on a server. The file is opened, read
and rewritten by the tab you have in front of you.

```
Your PDF  →  your browser  →  your PDF
                 ↑
          nothing leaves, nothing is stored
```

---

## What it does

Click a line of text, type over it, save. On a scanned document, character
recognition starts on its own and makes each recognised line editable in place.

Twenty-six tools in all:

| | |
|---|---|
| **Edit** | Edit text · add text · hide an area · OCR a scan |
| **Convert from PDF** | Word · Excel · PowerPoint · JPG · PNG · scanned PDF to text |
| **Convert to PDF** | Word · Excel · PowerPoint · JPG · PNG · merge |
| **Work on a PDF** | Compress · split · extract, delete or reorder pages · rotate · crop · number · watermark · sign · unlock · strip metadata |
| **Understand a PDF** | Summarise · translate (French ↔ English) |

## Why it is unusual

The site has **no server code at all**. It is a set of static files. It could not
receive your document even if it wanted to — and you can check: open a tool, cut
your connection, it keeps working.

No account, no cookie, no analytics, no `localStorage`, no remote fonts. The
privacy page [lists the three real exceptions](https://voilapdf.com/en/privacy/)
rather than claiming an absolute that would not hold.

## How the text editing works

This is the interesting part, and the reason most tools do not offer it.

`pdf.js` gives the exact baseline, width and font size of every text fragment on
a page. Fragments sharing a baseline are grouped into an editable line. When you
save, `pdf-lib` covers the old line with a rectangle filled with the **mean
colour sampled from the rendered background**, then redraws your new text on the
same baseline.

Two details that took measurement rather than guesswork:

- **Bold is detected by width, not by name.** The font name in PDF metadata lies
  often enough to be useless. Comparing the measured width of the line against
  the standard font metrics identifies the weight to within 0.2 %, against 3.4 %
  for the wrong weight.
- **Italic is not detected at all.** Measuring ink slope was tried and flagged
  three upright lines out of four. A wrong heuristic is worse than none, so it
  was removed — italic is a manual toggle.

## Honest limits

These are on every tool page too. They are the reason the tool is trustworthy.

- **The original text stays in the file.** Editing covers it; it is not
  redaction. Copy-paste or `pdftotext` recovers the old text. Do not use this to
  conceal sensitive data.
- **Original fonts are not reused.** Text is rewritten in one of the 14 standard
  PDF fonts (Helvetica, Times, Courier).
- **Compression and unlocking rasterise the pages** — text becomes an image.
- **Office conversion rebuilds the content, not the design**: no columns, no
  boxes, no images.
- **Translation does not preserve layout**, and a model that fits in a browser
  does not match a service running on graphics cards.
- **Characters**: all of Latin-1 plus typographic punctuation (œ € – — ' " …).
  Beyond that a character becomes `?` rather than failing the whole save.

## Self-hosting

There is no build step and no dependency to install. Serve the folder:

```bash
git clone https://github.com/dilmseo/editeur-pdf.git
cd editeur-pdf
node serveur.js          # http://127.0.0.1:8080
```

Any static host works — the live site is a plain file upload.

Opening `index.html` straight from the filesystem works too, **except OCR**: from
a `file://` origin Chrome refuses to build a Worker and to read the language
data. That is what `serveur.js` is for.

To regenerate the tool pages, the sitemap and the LLM summaries after editing the
catalogue in `outils-data.js`:

```bash
node build-pages.js
```

## Built with

| Library | Role | Licence |
|---|---|---|
| [pdf.js](https://github.com/mozilla/pdf.js) 3.11 | reading, rendering, text positions | Apache-2.0 |
| [pdf-lib](https://github.com/Hopding/pdf-lib) 1.17 | writing the PDF back | MIT |
| [tesseract.js](https://github.com/naptha/tesseract.js) 5.1 | OCR | Apache-2.0 |
| [transformers.js](https://github.com/xenova/transformers.js) 2.17 | summary, translation | Apache-2.0 |
| [fflate](https://github.com/101arrowz/fflate) | Office files are ZIPs of XML | MIT |

All of them are vendored in `vendor/`. Language **model weights** are not: they
are fetched from Hugging Face on first click and kept in the browser cache. The
model comes down; your document never goes up.

## Licence

[GNU AGPL v3](LICENSE).

Use it, modify it, redistribute it, commercially if you like. The one condition
is article 13: **if you run a modified version over a network, you must offer its
source to that version's users.** That is deliberate. The whole point of this
tool is that anyone can verify the document goes nowhere — and that verification
has to remain possible on derivatives.

Published by [Fix72](https://voilapdf.com/en/legal-notice/), Le Mans, France.
