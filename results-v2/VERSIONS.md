# Resolved tool versions for the committed scored run

Corpus captured 2026-07-28; the offline extract/score track was last re-executed
2026-08-30 (see the dated notes below).

The manifests declare ranges (`^`); this file records what the committed
`package-lock.json` / `requirements.txt` actually resolved for the run whose
numbers live in `scores.json`. `npm ci` (not `npm install`) reproduces exactly
these; recorded here so the published numbers can be attributed to exact
versions without opening the lockfile.

## Node tools (from package-lock.json)

| package | version |
|---|---|
| @page2ai/core | 0.1.8 |
| @mozilla/readability | 0.6.0 |
| defuddle | 0.19.3 |
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

## Python tools (from protocol-v2/requirements.txt, pinned)

| package | version |
|---|---|
| trafilatura | 2.1.0 |
| markitdown | 0.1.6 |
