---
title: page2ai-benchmark v0.2 protocol
date: 2026-07-28
status: pre-registered. Metric definitions fixed before the scoring code was written or run.
author: Igor Saevets
---

# Protocol v0.2

The v0.1.0 results were withdrawn ([RETRACTION-2026-07-25.md](../RETRACTION-2026-07-25.md)).
Four of five rows were wrong and the one positive row was scoring a file the publisher had
written, not a conversion any tool performed. This document is the replacement protocol.

The claim it makes, stated narrowly enough to be checked: **the metric definitions below were fixed
before `score.mjs` was written, and no tool's score had been computed when they were fixed.** The
commit that introduces this file carries the protocol, the harness and the corpus but no scores; the
commit that adds the scores changes nothing in the Metrics section. Verify with
`git log --follow -p protocol-v2/PROTOCOL.md`. Everything that *was* changed after the first draft
is in Amendments at the bottom, including two corrections found by running ground-truth extraction,
which produces counts and no scores.

That is a weaker guarantee than a timestamped third-party registry, and it is stated as the weaker
thing it is. What it rules out is choosing the metric that happens to favour the author's own tool.
What it does not rule out is having chosen the corpus that way, which is why every page is committed
and every per-page result is published.

## The problem v0.2 is built to avoid

A tool can obtain a page's Markdown two ways: by converting the HTML, or by asking the publisher
for a Markdown representation the publisher already has (`Accept: text/markdown`, or the `<url>.md`
suffix convention). Six of fifteen documentation sites surveyed on 2026-07-25 hand over publisher
Markdown through at least one of those channels.

Scoring both in one column measures neither. So v0.2 splits them:

- **Conversion track.** Every tool receives *the same cached HTML bytes*, fetched once by the
  harness with a browser `Accept` header. No tool makes its own request. Fetch strategy cannot
  influence the result, because no tool is fetching. This is the track that carries quality scores.
- **Negotiation track.** A separate, unscored measurement: given only a URL, what does each
  URL-fetching tool actually request, and what does it get back? Recorded as a table of
  (Accept sent, content-type received, bytes, `Vary`), not as a quality number.

## Conversion track

### Corpus

`protocol-v2/sites.json` lists the target URLs. Each is fetched once, with

```
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
User-Agent: <recorded in corpus/<slug>/fetch.json>
```

and stored verbatim under `corpus/<slug>/page.html`, together with `fetch.json` holding the final
URL after redirects, HTTP status, all response headers, byte count and the SHA-256 of the body.

The corpus is committed. Every number below is therefore reproducible **with no network access at
all**: `node protocol-v2/extract.mjs && node protocol-v2/score.mjs` runs entirely offline against
the committed bytes. A page that changes upstream tomorrow does not change this benchmark's
numbers, and anyone can check what we scored rather than taking our word for what the page said.

### Tools

Only tools that run locally and need no API key or account. This is a hard constraint, not a
preference: a number a third party cannot reproduce without a credential is not evidence.

| id | package | version pinned in | invocation |
|---|---|---|---|
| `page2ai` | `@page2ai/core` | `package.json` | `htmlToMarkdown(html, {baseUrl})`, shipping defaults |
| `trafilatura` | `trafilatura` (PyPI) | `protocol-v2/requirements.txt` | `extract(html, output_format='markdown', include_tables=True, include_links=True, include_formatting=True)` |
| `markitdown` | `markitdown` (PyPI) | `protocol-v2/requirements.txt` | `MarkItDown().convert_stream(BytesIO(html))` |
| `readability-turndown` | `@mozilla/readability` + `turndown` | `package.json` | Readability on a jsdom document, then Turndown on the article HTML |
| `defuddle-turndown` | `defuddle` + `turndown` | `package.json` | Defuddle on a jsdom document, then Turndown |
| `turndown-raw` | `turndown` | `package.json` | Turndown on the whole `<body>`, no content extraction |

`turndown-raw` is the floor. It performs no boilerplate removal, so it should score near-perfect
recall and near-worst cleanliness. If it does not, the metrics are broken and the run is void.
That is the point of including it.

`page2ai` is written by the author of this benchmark. It is run with shipping defaults, from the
published npm package, on the same bytes as everything else, and it is scored by the same script.
Where it loses, the table says so.

### Ground truth

Derived from the page's own DOM, per page, by `protocol-v2/groundtruth.mjs`. Not from any tool's
output, and not from the publisher's Markdown.

1. Parse `page.html` with jsdom.
2. Remove `script, style, noscript, template, svg`.
3. Choose the content root: the first of `main`, `article`, `[role=main]`, `body`. Then treat as
   **chrome** every `nav, header, footer, aside, [role=navigation], [role=banner],
   [role=contentinfo], [role=complementary]` that sits **outside** that root. See Amendment 1.
4. **Code blocks**: `textContent` of every `<pre>` inside content. Whitespace stripped entirely.
   Kept if the result is at least 24 characters. Deduplicated.
5. **Headings**: `textContent` of every `<h1>`–`<h6>` inside content, squeezed (lowercased,
   non-alphanumerics collapsed to single spaces). Kept if at least 3 characters. Deduplicated.
6. **Boilerplate strings**: the text of each *leaf* element outside the content root, squeezed,
   kept if between 12 and 100 characters, deduplicated, and **discarded if the same string also
   occurs in content** (a phrase that appears in the article is not evidence of nav leakage).
   Capped at 80 strings per page, taking the longest first; the cap and the number discarded by it
   are recorded in `groundtruth.json` for every page, never silently. See Amendment 2.
7. **Tables**: count of `<table>` inside content having at least two rows. Informational only.

### Metrics

All computed by `protocol-v2/score.mjs` from the stored outputs. Definitions fixed here.

- `code_recall` — a ground-truth code block counts as recalled if the first 40 characters of its
  whitespace-stripped text occur in the whitespace-stripped output. Whitespace is stripped on both
  sides because every converter re-indents. Value is recalled / total.
- `code_fenced` — of the recalled code blocks, the fraction whose first 40 characters occur inside
  a fenced region (between a ``` opening and its close) in the output. A tool that recovers code as
  running prose scores recall but not fencing.
- `lang_label_rate` — fraction of fenced blocks in the output carrying a language tag.
- `heading_recall` — squeezed ground-truth heading occurs in the squeezed output. Recalled / total.
- `boilerplate_leak` — fraction of ground-truth boilerplate strings occurring in the squeezed
  output. Lower is better.
- `content_recall` — `(code_recall * n_code + heading_recall * n_headings) / (n_code + n_headings)`.
  Weighted by count so that a page with 30 code blocks and 4 headings is dominated by its code.
- `cleanliness` — `1 - boilerplate_leak`.
- **`f_score`** — harmonic mean of `content_recall` and `cleanliness`. The single headline number.
  Harmonic, not arithmetic, so that a tool cannot win by maximising one and abandoning the other:
  `turndown-raw` will have recall near 1 and cleanliness near 0, and must not score 0.5.

Also recorded, not scored: output bytes, `bytes_out / bytes_html`, wall-clock milliseconds, table
count in output, and any error text.

### Aggregation

Per tool, the mean of each per-page metric across pages where **that page produced a usable
ground truth** (at least 3 code blocks or at least 5 headings). Pages failing that test are listed
and excluded, with the reason, in `RESULTS.md`. A tool that errors on a page scores 0 for that page
and the error is printed; it is not quietly dropped, because failing to run is a property of the
tool.

## Negotiation track

For each URL and each tool that fetches by itself (`page2ai` via `fetchAndConvert`, `trafilatura`
via `fetch_url`, `markitdown` via `convert(url)`), record what the tool actually asked for and
what came back. Measured with a local HTTP proxy is out of scope for v0.2; instead each tool's
documented request is issued directly and the response metadata is recorded, plus, for `page2ai`,
the `source` field the library itself reports (`html-parse` / `md-suffix` / `content-negotiation`
/ `llms-txt`).

No quality score is attached. The output is a table answering one question: does the tool find the
better representation when one exists? Discovering it is good behaviour. It is simply not
conversion, and the retraction exists because v0.1.0 confused the two.

## What v0.2 does not claim

- Not a web-scale statement. The corpus is documentation pages, chosen for framework diversity.
- Not a JavaScript-rendering benchmark. Every tool sees the server-rendered HTML the harness
  received. Client-side-rendered content is absent for all tools equally, and pages whose content
  requires JavaScript are visible in the results as universally low recall.
- Not a ranking of hosted services. Cloud tools are excluded by the no-credential rule, so this
  benchmark says nothing about Firecrawl, Jina Reader, or any other API product. Their absence is
  a scope decision, not a verdict.
- `f_score` is a construct defined in this file, not a standard. It is useful for comparing tools
  within this run under one fixed definition. It is not comparable to any other benchmark's score.

## Amendments

Changes made to this document after it was first written. Listed rather than edited away, so that
"pre-registered" can be checked rather than believed.

**Amendment 1, 2026-07-28, before any score was computed.** The first draft removed every
`<header>` and `<footer>` in the document before choosing the content root. Running ground-truth
extraction (which produces no scores) showed `svelte.dev` yielding 0 headings from a page that
plainly has 11: that site wraps each section's heading in a `<header>`, as do others. Every tool
would have been scored 0 on heading recall there, identically, and the page would have been dropped
as thin. Corrected so that chrome is only what lies outside the content root. No scoring code
existed at the time of the change and no `f_score` had been computed for any tool.

**Amendment 2, 2026-07-28, before any score was computed.** Boilerplate was originally defined as
the text lines of semantic chrome tags. Two runs of ground-truth extraction showed the definition
was unusable, for two separate reasons found in sequence:

- *Tag dependence.* Sidebars and page headers on most of these sites are plain `<div>`s, so six of
  fourteen pages yielded fewer than three boilerplate strings and `cleanliness` could not
  discriminate between tools there. Redefined structurally: boilerplate is text outside the content
  root, whatever tag carries it.
- *`textContent` carries no line breaks.* Splitting an element's text on `\n` returns the whole
  sidebar as a single 4000-character string, which the 12–100 character filter then rejects.
  Result: still zero. Redefined again to collect the text of each *leaf* element.

After both corrections, twelve of fourteen pages yield at least nine boilerplate strings.
`tailwindcss.com` yields none, because its navigation sits inside `<main>`, and `svelte.dev`
yields one. Both are reported in the results with that number attached, rather than dropped: on
those two pages `cleanliness` is 1 for every tool and carries no information, which is a property
of the page and is stated as one.

Both amendments were made while looking at counts of headings, code blocks and nav strings. Neither
was made while looking at a tool's score, because `score.mjs` had not been run. The `f_score`
definition has not been touched since it was first written.

## Reproduction

```bash
git clone https://github.com/igorsaevets/page2ai-benchmark
cd page2ai-benchmark
npm install
python -m pip install -r protocol-v2/requirements.txt

# offline, against the committed corpus:
node protocol-v2/groundtruth.mjs
node protocol-v2/extract.mjs
node protocol-v2/score.mjs
node protocol-v2/report.mjs

# optional, requires network, rewrites the corpus with today's pages:
node protocol-v2/fetch.mjs
node protocol-v2/negotiation.mjs
```
