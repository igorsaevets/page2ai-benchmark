# Resolved tool versions for the committed scored run

Corpus captured 2026-07-28; the offline extract/score track was last re-executed
2026-10-30 (#26; see the dated notes below).

The manifests declare ranges (`^`/`~`); this file records what the committed
`package-lock.json` / `requirements.txt` actually resolved for the run whose
numbers live in `scores.json`. `npm ci` (not `npm install`) reproduces exactly
these; recorded here so the published numbers can be attributed to exact
versions without opening the lockfile.

## Node tools (from package-lock.json)

| package | version |
|---|---|
| @page2ai/core | 0.3.2 |
| @mozilla/readability | 0.6.0 |
| defuddle | 0.19.5 |
| turndown | 7.2.4 |
| jsdom | 30.1.3 |
| @asamuzakjp/dom-selector | 10.0.4, patched (`patches/@asamuzakjp+dom-selector+10.0.4.patch`: selector cap 2048 to 65536) |
| linkedom | 0.18.14 |

These are the versions in `package-lock.json` at the commit that last wrote
`scores.json` (#26, 2026-10-30). Until 2026-11-21 this table still showed the
2026-10-18 run (core 0.2.2, jsdom 30.0.1, linkedom 0.18.13).

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

On 2026-10-18 the range was changed from ^0.1.7 to ^0.2.2 (core 0.1.13 to
0.2.2). Core 0.2.x includes BL-49 (content-from-page-only), P2A-019 (ordered
list numbering) and the panel review fix. All scoring metrics (f_score,
heading_recall, code_recall, boilerplate_leak) are unchanged on every page.
bytes_out decreased on all 14 pages: 10 pages by exactly 1 byte (the version
string "0.1.13" to "0.2.2" in frontmatter), 4 pages by 20-146 bytes (improved
boilerplate removal: tab labels, copy buttons, keyboard shortcuts). Non-page2ai
tools reproduced byte-for-byte (control arm clean).

On 2026-10-30 three changes re-scored the offline track: #23 moved
@page2ai/core to 0.3.2; #24 took jsdom 30.1.3 and raised the 2048-character
selector cap of @asamuzakjp/dom-selector 10.0.4 to 65536 with patch-package
(`patches/`), so defuddle extracts again instead of falling back to the whole
document; #26 unhides `[hidden]` before Readability so React 18 Suspense
content is extracted. #25 moved the Python extractors into their own `.venv`.
`scores.json` was last written by #26; the table above lists that run.

On 2026-11-21 a Dependabot round moved @page2ai/core 0.4.0 to 0.4.21, linkedom
0.18.14 to 0.18.15 and turndown 7.2.4 to 7.2.5 (jsdom stays 30.1.3, defuddle
0.19.6; core 0.4.0 (#28) and defuddle 0.19.6 (#27) had come in on 2026-11-02
without a re-run).
The offline extract track ran on the old lock (control) and on the new one: all
84 extractions are identical apart from page2ai's `captured_at` and
`extractor_version` frontmatter lines. The control arm also reproduces the
committed files: 70 byte-identical, and the 14 page2ai files differ only in
`extractor_version` (0.3.2 committed). So the committed outputs and scores hold
for core 0.3.2 through 0.4.21 and defuddle 0.19.5 and 0.19.6.
jsdom 31 is not taken yet: it replaces @asamuzakjp/dom-selector (and with it the
selector-cap patch from #24) with a new selector and computed-style engine, which
feeds the readability and defuddle arms and needs its own re-run.

## Python tools (from protocol-v2/requirements.txt, pinned)

| package | version |
|---|---|
| trafilatura | 2.1.0 |
| markitdown | 0.1.6 |
