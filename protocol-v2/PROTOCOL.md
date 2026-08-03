---
title: page2ai-benchmark v0.2 protocol
date: 2026-07-28
status: live. Metric definitions were fixed before the scoring code was written. Every later change is in Amendments.
author: Igor Saevets
---

# Protocol v0.2

The v0.1.0 results were withdrawn ([RETRACTION-2026-07-25.md](../RETRACTION-2026-07-25.md)).
Four of five rows were wrong and the one positive row was scoring a file the publisher had
written, not a conversion any tool performed. This document is the replacement protocol.

**The word "pre-registered" has been dropped from this document.** An external reviewer argued on
2026-07-28 that in software benchmarking the term is understood to require a protocol frozen on an
immutable third-party registry before any experiment runs, and that amending ground-truth extraction
after looking at output counts forfeits the term whatever the amendments were. That is a fair reading
and arguing with it would be cheaper than earning the word, so the word is gone and the narrower,
checkable claim stays:

**The metric definitions below were fixed before `score.mjs` was written, and no tool's score had
been computed when they were fixed.** The
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

Only tools that can convert **bytes already on disk**, offline. That is the inclusion rule, and it
follows from the corpus design rather than from any judgement about hosted products: the conversion
track is defined by every tool receiving the identical cached response, so a tool that can only be
handed a URL cannot be in it at all. It would be scored on someone else's fetch, which is the error
v0.1.0 was retracted for.

> **Corrected 2026-07-28**, after a reviewer pointed out that the earlier wording, "needs no API key
> or account", lumped together two different cases. Firecrawl's hosted API does require a key
> (`https://docs.firecrawl.dev/api-reference/v2-introduction`); Jina Reader can be called at
> `r.jina.ai` without one, a key only raising the rate limit (`https://jina.ai/reader/`). The
> objection is correct and the old rule was sloppy. The rule above is the one that was actually
> doing the work, and it excludes both for the same real reason: neither converts local bytes.

| id | package | version pinned in | exact invocation |
|---|---|---|---|
| `page2ai` | `@page2ai/core` | `package.json` | `htmlToMarkdown(html, { baseUrl: url })` |
| `trafilatura` | `trafilatura` (PyPI) | `protocol-v2/requirements.txt` | `extract(html, url=url, output_format="markdown", include_tables=True, include_links=True, include_formatting=True, include_images=True)` |
| `markitdown` | `markitdown` (PyPI) | `protocol-v2/requirements.txt` | `MarkItDown(enable_plugins=False).convert_stream(BytesIO(html), stream_info=StreamInfo(extension=".html", mimetype="text/html", charset="utf-8", url=url))` |
| `readability-turndown` | `@mozilla/readability` + `turndown` | `package.json` | `new Readability(jsdomDoc).parse()`, then Turndown on `article.content` |
| `defuddle-turndown` | `defuddle` + `turndown` | `package.json` | `Defuddle` on a jsdom document, then Turndown on the returned HTML |
| `turndown-raw` | `turndown` | `package.json` | Turndown on the whole `<body>`, no content extraction |

Turndown is constructed identically everywhere it is used:
`new TurndownService({ codeBlockStyle: "fenced", headingStyle: "atx", fence: "```" })`.

**Every tool runs at its defaults apart from the arguments shown, and none is tuned.** That cuts
against the tools that expose tuning: trafilatura documents `favor_recall` / `favor_precision`
tradeoffs and Readability exposes density thresholds, and a maintainer who tuned for this corpus
would very likely beat these numbers. Read the table as "defaults out of the box", not "the best
this tool can do". The wrapper choices above are part of what is being measured, which is why they
are printed in full rather than described as "defaults".

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
- `f_score_prose` — the same formula with prose folded into the recall term. Reported beside
  `f_score`, which is left unchanged. Amendment 4.

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

**Amendment 4, 2026-07-28, AFTER the first scores existed, prompted by an external reviewer.** The
reviewer's objection, accepted in full: `content_recall` counted code blocks and headings only, so a
tool could discard 90% of an article's paragraphs and still score 100%. Body prose is now measured
(`text_recall`), and `f_score_prose` folds it into the recall term. **`f_score` itself is unchanged**
and both are reported, because silently redefining the headline number after seeing the results is
the failure mode this whole document exists to avoid.

The result matters: no extractor in the table recalls more than 77% of article prose, and the gaps
between them narrow. The reviewer was right that the omission mattered.

⚠️ Two limitations of `text_recall`, recorded rather than smoothed over. It is an exact substring
test after normalisation, so a converter that renders an inline link as `[text](url)` fails the match
for that paragraph while one that drops the link passes: **the metric penalises link preservation.**
And it therefore reports a lower bound, not a ranking. v0.3 should replace the substring probe with
an alignment measure. It is not being fixed in the same pass that first reports it, because
"adjust the metric, then publish the number it produces" is exactly how v0.1.0 went wrong.

The same reviewer's other two accepted points: `markitdown` and `turndown-raw` are now shown in a
separate table headed as whole-document converters rather than ranked beside extractors, and corpus
selection is acknowledged as the remaining unprotected flank, since the 14 URLs were chosen by the
author. A published selection rule is open work for v0.3.

**Amendment 5, 2026-07-28, AFTER the scores existed. A second external reviewer, independently of
the first, named a defect in `heading_recall`. It is real, it was measured, and no score moved.**

The objection: docs platforms render the page's headings a second time in a sidebar or table of
contents, outside the article. `score.mjs` asks only `output.includes(heading)`, with no constraint
on *where* the string landed. So a tool that leaks the TOC and never extracts the article correctly
can still be credited with recalling its headings.

The mechanism is real and the code does exactly that. Note also the asymmetry that made it easy to
miss: ground-truth boilerplate already **discards** any chrome string that also occurs in the article
(step 6 above), so duplicated TOC text is correctly not charged as leakage, while still being
credited as recall. The hole is one-sided in the tools' favour.

Whether it was *material* is an empirical question, so it was measured rather than argued, by
`protocol-v2/toc_audit.mjs`, which writes `results-v2/toc-audit.json`. Every ground-truth heading is
split by whether the same normalised string also occurs anywhere outside the content root, and
heading recall is recomputed over the unambiguous ones alone.

- **52 of 170 headings in this corpus (30.6%) also appear outside the article.** The exposure is
  large.
- On **4 of 14 pages** — `starlight`, `fumadocs`, `biome`, `python-docs` — *every* heading is
  duplicated outside the content root. On those pages `heading_recall` cannot distinguish extraction
  from leakage **at all**, for any tool. That is a property of those page layouts and it is now
  stated rather than left implicit.
- Like for like over the 10 pages where both figures are defined: `page2ai` **0.900 → 0.900, delta
  exactly zero**; `trafilatura` 0.715 → 0.698; `defuddle` 0.677 → **0.702, which goes up**;
  `readability` 0.582 → 0.587. Both whole-document baselines stay at 1.000, which is precisely the
  behaviour the reviewer predicted — they recall every heading by dumping the whole document — and
  is also why they remain the floor on `f_score` regardless.

So the general objection is confirmed and the specific suspicion is refuted by measurement: the hole
exists, and it inflated this benchmark author's own tool by **0.000**. It flattered two competitors
slightly instead.

⚠️ One methodological note on the above, because the first version of this audit got it wrong. The
four fully-ambiguous pages have *no* unambiguous headings, so they drop out of the strict mean.
Comparing a 14-page loose average against a 10-page strict average showed trafilatura losing 0.088,
five-sixths of which was the change of population, not the effect being measured. The figures quoted
here are computed over the pages where both are defined. Both are in the JSON, labelled.

`f_score` is again unchanged. `heading_recall_strict` is published beside `heading_recall` rather
than replacing it, for the same reason as Amendment 4.

**Amendment 6, 2026-07-28, no number changed.** A conflict of interest came into existence after
publication and is now disclosed in `RESULTS-v2.md`: the author became a contributor to trafilatura,
which places second here. One pull request merged (`adbar/trafilatura` #892, a CI configuration
change), two open (#891, #893). None touches extraction, none was informed by these results, and this
benchmark has not been mentioned in that repository. Recorded here because a conflict that appears
later is exactly the kind that goes undeclared, and because the scoring is reproducible offline by
anyone: the disclosure is about the prose, not the figures.

**Amendment 7, 2026-08-03, pre-registered before any v0.3 score exists.** This delivers the fix
that Amendment 4's warning called for: the substring matchers for prose, headings and boilerplate
now operate on a copy of the output in which markdown **link and image targets** are stripped —
`[text](url)` becomes `text` — before `squeeze()`. Two measured defects of matching on raw
markdown motivate it, and they point in opposite directions, which is why the fix is a
normalisation and not a tuning:

- *False misses.* A link inside a sentence injects its URL into the squeezed stream, so the
  ground-truth string `check the best docusaurus sites for inspiration` cannot match
  `check the [best Docusaurus sites](https://docusaurus.io/showcase) for inspiration` — the URL
  characters sit in the middle of it. Measured on the committed v0.2 outputs, micro-averaged over
  all 471 ground-truth paragraphs: text recall rises for **every** tool when targets are
  stripped — page2ai 0.696→0.992, readability-turndown 0.667→0.966, defuddle-turndown
  0.652→0.881, trafilatura 0.660→0.777. The published "no extractor recalls more than 77% of
  article prose" was a property of the probe, not of the tools, and is corrected in RESULTS-v2.md.
- *False hits.* A URL slug squeezes into words: `.../guides/project-structure/` contains
  `project structure`, which matched a sidebar string on starlight and counted as boilerplate
  leakage in output that never rendered that text. Leak drops for every tool under the stripped
  matcher (page2ai 0.032→0.016, readability 0.027→0.011, defuddle 0.146→0.132, trafilatura
  0.111→0.100, same micro-average).

What is deliberately NOT stripped: bare URLs in running text and `<autolink>` forms (they are
visible text a reader sees), and the YAML frontmatter block (only the author's tool emits
frontmatter, so excluding it from matching would only ever help the author's tool — the title
suffix leaks it caused were fixed in the tool instead). Code matching via `stripWs` is unchanged.

**The hiding channel this creates, named and closed.** Stripping targets opens an adversarial
move: a tool could park leaked chrome text inside a link target — `[x](leaked sidebar text)` —
where the leak matcher would never look. The reviewer panel raised it and the safeguard is in
`lib.mjs`: a target is stripped only when it is URL-shaped (scheme, path, fragment, query, or a
host-like token); free text in target position is KEPT in the matched stream. A real URL slug
still strips, which is the vacuous-match fix; hidden prose does not.

Three more panel objections, answered rather than absorbed silently:

- *"This is still retroactive metric selection — you chose the normalisation after seeing the
  realized deltas."* Correct, and unavoidable: an artifact is only ever discovered by seeing
  it. The mitigations are the symmetric four-tool table above (every tool rises), the fact that
  the RAW matcher's columns continue to be published beside the stripped ones in every future
  version — the raw column is the standing sentinel a reader can always fall back to — and the
  ordering: this amendment is committed before any v0.3 score exists.
- *"The stripping needs a normative spec — nested brackets, image titles, escapes."* The
  normative definition is the `stripLinkTargets` function in `protocol-v2/lib.mjs`, committed
  with this amendment — the same code-is-the-spec device the corpus rule uses for its page walk.
  Where this prose and that function disagree, the function governs.
- *"Recall saturates near 1.0 under the stripped matcher, making the benchmark less
  discriminative."* Also true, and it is the honest reading: on THIS corpus, prose recall no
  longer separates the leading tools; leakage, code fencing, structure and the shell-page
  behavior do. A metric that separated tools by their link syntax was not discriminating —
  it was misattributing.

v0.2 figures as published are UNCHANGED; `scores.json` carries the stripped-matcher values beside
them under a `_lt` suffix. From v0.3 on, the stripped matcher is the primary one. Disclosure: the
author's tool also shipped extraction fixes the same day this amendment was written; the amendment
stands on the symmetric four-tool table above, and the tool's changes are reported separately in
RESULTS-v2.md. The "replace exact-substring probes with an alignment measure" item stays open —
this removes the measured artifact, not the exact-substring design.

## Reproduction

```bash
git clone https://github.com/igorsaevets/page2ai-benchmark
cd page2ai-benchmark
npm install
python -m pip install -r protocol-v2/requirements.txt

# offline, against the committed corpus. Equivalent to `npm run v2`:
node protocol-v2/groundtruth.mjs
node protocol-v2/extract.mjs
node protocol-v2/score.mjs
node protocol-v2/toc_audit.mjs
node protocol-v2/report.mjs

# optional, requires network, rewrites the corpus with today's pages:
node protocol-v2/fetch.mjs
node protocol-v2/negotiation.mjs
```

Every metric in `scores.json` is deterministic and a rerun reproduces the published numbers exactly.
The output *files* are not byte-identical, because `@page2ai/core` writes a `captured_at` timestamp
into its front matter and the harness records per-tool wall-clock milliseconds in
`extract-manifest.json`. So `git diff` after a rerun shows one changed line per `page2ai.md` plus the
timings, and nothing else. If it shows more than that, something has actually changed.
