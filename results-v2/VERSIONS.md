# Resolved tool versions for the committed scored run

Corpus captured 2026-07-28; the offline extract/score track was last re-executed
2026-10-18 (see the dated notes below).

The manifests declare ranges (`^`/`~`); this file records what the committed
`package-lock.json` / `requirements.txt` actually resolved for the run whose
numbers live in `scores.json`. `npm ci` (not `npm install`) reproduces exactly
these; recorded here so the published numbers can be attributed to exact
versions without opening the lockfile.

## Node tools (from package-lock.json)

| package | version |
|---|---|
| @page2ai/core | 0.1.13 |
| @mozilla/readability | 0.6.0 |
| defuddle | 0.19.5 |
| turndown | 7.2.4 |
| jsdom | 30.0.1 |
| linkedom | 0.18.13 |

Note: the initial v2 scoring ran on @page2ai/core 0.1.4; the committed extracts
and scores were re-run on 0.1.5 (see the "page2ai 0.1.5 re-run" commit).
On 2026-08-17, 0.1.6 was verified to produce byte-identical extracts on all 14
corpus pages, so these numbers hold for 0.1.6 as well.

On 2026-08-30 the offline track re-ran on @page2ai/core 0.1.8 (duplicate
title-H1 fix, page2ai-core#9), defuddle 0.19.3 and jsdom 30.0.1. defuddle and
the jsdom-fed arms reproduced the committed outputs byte-for-byte; page2ai's
11 affected pages each lost exactly the one duplicate heading line. Every
recall / leak / f-score column is unchanged to 4 decimals, so the published
tables hold; only `bytes_out` and the 4th decimal of `compression` moved, on
exactly those 11 pages.

On 2026-10-18 the offline track re-ran after a dependency update: @page2ai/core
0.1.8 to 0.1.13, defuddle 0.19.3 to 0.19.5, undici 8.9.0 to 8.12.2 (override
for security), source-map-js 1.2.1 to 1.2.2 (override for security). jsdom
stayed at 30.0.1 because jsdom 30.1.x introduced a 2048-char CSS selector
limit in @asamuzakjp/dom-selector 10.x that breaks defuddle's content
extraction on every page (falls back to whole-document output). defuddle 0.19.5
with jsdom 30.0.1 reproduces 0.19.3's outputs byte-for-byte on 12 of 14 pages
(1-byte whitespace diff on docusaurus and vitepress, no metric impact). page2ai
scores improved on 4 pages (mintlify-anthropic 0 to 0.2331; nextra, python-docs
and rust-book to 1.0) and the aggregate f_score rose from 0.8872 to 0.9327.
readability-turndown and turndown-raw reproduced byte-for-byte.

## Python tools (from protocol-v2/requirements.txt, pinned)

| package | version |
|---|---|
| trafilatura | 2.1.0 |
| markitdown | 0.1.6 |
