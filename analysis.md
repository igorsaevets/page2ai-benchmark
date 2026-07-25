---
title: Page2AI benchmark — analysis (v0.1.0 results withdrawn, corrected 2026-07-25)
author: Igor Saevets
about_url: https://igorsaevets.github.io/page2ai-docs/about/
run_date: 2026-07-25
supersedes: v0.1.0 analysis dated 2026-07-24
---

# Analysis

**The v0.1.0 result table published on 2026-07-24 is withdrawn.** The reasons, the evidence
and the reproduction steps are in [RETRACTION-2026-07-25.md](RETRACTION-2026-07-25.md). This
file now holds the corrected measurements and the protocol change they forced.

## The confound that invalidated v0.1.0

A tool can obtain a page's Markdown without converting anything, through two independent
channels. `@page2ai/core` uses both: it tries `<url>.md` first (`tryMdSuffixFirst`, default
on), and its HTML fetch sends
`accept: text/html,text/markdown,text/plain,application/xhtml+xml,*/*;q=0.5`. Where a
publisher honours either, the recorded output is the publisher's text, not a conversion.

Measured on 2026-07-25 across 15 widely used documentation sites:

| Channel | Sites | Count |
|---|---|---:|
| `Accept: text/markdown` negotiation | Fumadocs, docs.anthropic.com, Vercel, Supabase | 4 / 15 |
| `<url>.md` suffix | docs.anthropic.com, Vercel, Supabase, VitePress, Stripe | 5 / 15 |
| **Either channel** | the six above | **6 / 15** |
| Neither, HTML only | Docusaurus, Starlight, Nextra, MDN, Svelte, Astro, Tailwind, Biome | 8 / 15 |

`hono.dev` returned Markdown on one run and HTML on two others under the same request, with
`Vary: accept` set. Treated as an unstable cache result and excluded from the counts.

Raw data: `results/content-negotiation.json`. Reproduce: `node content-negotiation-survey.mjs`.

This splits the sites under test into two populations that must not be scored together.

## Corrected measurements, Page2AI headless Node adapter

`@page2ai/core@0.1.0`, no browser, no JavaScript execution. Character counts are of the
Markdown body; metrics are recomputed from the stored outputs by `metrics.mjs`.

### Conversion track — sites that only serve HTML

These numbers do measure HTML-to-Markdown conversion.

| Site | Chars | Code blocks | Lang-labeled | Headings | Links | Nav pollution | Note |
|---|---:|---:|---:|---:|---:|---:|---|
| Docusaurus (docusaurus.io/docs) | 14377 | 2 | 0 | 18 | 53 | 0 | Corrected URL. v0.1.0 pointed at a meta-refresh stub and reported 221 chars |
| Starlight (starlight.astro.build) | 6056 | 9 | 9 | 9 | 36 | 0 | Unchanged from v0.1.0 and unaffected by the confound |
| Nextra (nextra.site/docs) | 2024 | 0 | 0 | 7 | 10 | 0 | Extraction was always fine. The v0.1.0 row's "0 headings, 0 links" was wrong |

Code-block language labelling is the clearest differentiator so far: Starlight output carries
a language label on 9 of 9 fences, Docusaurus on 0 of 2. That is a real, reproducible
difference in how the two sites mark up code, and it is exactly the kind of structural
property a conversion benchmark should be measuring.

### Negotiation track — sites that serve Markdown on request

These numbers do **not** measure conversion. They measure what the publisher chose to send.

| Site | Chars returned | Channel | What actually happened |
|---|---:|---|---|
| Mintlify (docs.anthropic.com) | 20534 | `.md` suffix | The library fetched `<url>.md` via its `tryMdSuffixFirst` option and recorded `extractor_source: "md-suffix"` in the output's own frontmatter. The output is a 100% verbatim copy of the publisher's Markdown (481/481 shingles). v0.1.0 read the character count, ignored the label, and generalised it into "publication-quality Markdown" produced by the tool |
| Fumadocs (www.fumadocs.dev) | 0 | Accept header | `.md` returned HTML so the suffix path correctly declined. The HTML path then sent a Markdown-accepting header, received `text/markdown`, passed it to an HTML parser, found no `<article>`, and emitted an empty body |

The two rows have different owners. The Mintlify row is this benchmark's fault: the library
reported exactly what it had done and the scoring ignored it. The Fumadocs row is a bug in
`@page2ai/core`: a tool that receives `content-type: text/markdown` should return that body
rather than parse it as HTML. Reproduce with `node repro-accept.mjs`.

## Which real tools are affected, measured 2026-07-25

The confound above is not specific to this project. It follows from the `Accept` header a
tool sends, which is usually an undocumented implementation detail. Each row below is a
verbatim default header, taken from the tool's own source where the tool sets one, fetched
once per site against 14 documentation sites.

| Header profile | Source of the header | Sites returning finished Markdown |
|---|---|---:|
| `microsoft/markitdown` | `packages/markitdown/src/markitdown/_markitdown.py`, added deliberately in PR #1554 to support Cloudflare's Markdown-for-agents work | **4 / 14** |
| `@page2ai/core` | `src/node/index.ts` | **4 / 14** |
| `trafilatura` | `trafilatura/downloads.py` sets no `Accept` key at all | 0 / 14 |
| python-requests default `*/*` | library default | 0 / 14 |
| curl default `*/*` | library default | 0 / 14 |
| node `fetch` / undici default | library default | 0 / 14 |
| Chromium navigation default | browser default | 0 / 14 |

The four sites that respond with Markdown are docs.anthropic.com, Vercel, Supabase and Hono.
The size difference on those four is not marginal:

| Site | Markdown bytes | HTML bytes | ratio |
|---|---:|---:|---:|
| docs.anthropic.com | 20,535 | 954,824 | 46.5x |
| vercel.com/docs | 7,461 | 979,016 | 131.2x |
| supabase.com/docs | 6,226 | 184,572 | 29.6x |
| hono.dev/docs | 5,137 | 96,479 | 18.8x |

Two of seven profiles receive a document between 19 and 131 times smaller and skip conversion
entirely. Receiving the publisher's Markdown is the better outcome for a user; the point is
that a comparison run across these sites without recording the header is ranking fetch
configuration. Reproduce with `node tool-accept-matrix.mjs`; raw data in
`results/tool-accept-matrix.json`.

`fumadocs.dev` is excluded from that matrix on purpose. It negotiates Markdown on a publicly
cacheable response without declaring `Vary: Accept`, so spreading seven `Accept` values across
it risks an intermediary caching the Markdown for a client that asked for HTML. Its behaviour
is already established by `repro-accept.mjs`, which needs two requests rather than seven.

## What is not claimed

This is one tool on five URLs, `n=1` per cell. Nothing here supports a ranking, and nothing
here is a statement that any tool is better than any other. No competing tool has been run.
The Firecrawl and Jina runner scripts exist but have not produced results, so every
comparative statement in earlier versions of this file was unsupported and has been removed.

## Protocol for v0.2

1. **Log the negotiation.** Record the Accept header sent, the `content-type` received and
   the `Vary` header, per request, into the results files.
2. **Score the two tracks separately.** On the negotiation track the question is whether a
   tool discovers and uses the better representation, and what that saves in tokens. On the
   conversion track the question is structural fidelity.
3. **Do not treat publisher Markdown as neutral ground truth for conversion.** It is
   generated from the same source as the HTML rather than independently; it can omit content
   the HTML contains, as with Fumadocs at 9429 bytes of Markdown against 386089 bytes of
   HTML; it can include material addressed to agents that is not part of the article; and it
   is frequently not authored at all. Vercel documents converting CMS rich text to Markdown
   on request, and Cloudflare converts origin HTML at the edge, so in those cases it is
   another converter's output and scoring against it would measure agreement rather than
   correctness. Where it is used at all, label it a weak reference, attach a provenance class
   (pinned source repository / publisher-generated / runtime rich-text conversion / CDN edge
   conversion), and record retrieval URL, timestamp and content hash rather than
   redistributing the text.
7. **Do not merge unlike tools into one ranking.** trafilatura and readability select main
   content, turndown serialises a DOM, markitdown and docling convert whole documents. A
   single flat leaderboard over those is not meaningful.
8. **Scope claims honestly.** The 6-of-15 figure is a documentation-site sample and is not a
   web-scale rate. Cloudflare's scan of a filtered top-200,000-domain set found Markdown
   negotiation on 3.9% (2026-04-17).
4. **Only locally runnable, no-API-key tools**, so that every number can be reproduced by a
   stranger without credentials. Candidates: trafilatura, readability with turndown,
   markitdown, docling, markdownify, alongside Page2AI.
5. **Structural metrics on an AST, not on a string.** Heading hierarchy, list nesting depth,
   code-fence language labels, table preservation, link recall, and tokens per unit of
   preserved content.
6. **Crawl politely.** One request per URL per configuration, spaced, read-only, public
   documentation pages only. Note that one of the five negotiating sites does not declare
   `Vary: Accept` on a publicly cacheable response, so volume requests with a Markdown Accept
   header carry a shared-cache risk. See `vary-check.mjs`.

## Reproduction

```bash
git clone https://github.com/igorsaevets/page2ai-benchmark
cd page2ai-benchmark
npm install
node runners/page2ai.mjs && node metrics.mjs   # the corrected table above
node content-negotiation-survey.mjs            # the 5-of-15 finding
node repro-accept.mjs                          # isolates the confound to one header
node repro-passthrough.mjs                     # the 100% overlap on docs.anthropic.com
node vary-check.mjs                            # cache-correctness check
node tool-accept-matrix.mjs                    # which real tools' headers receive Markdown
```

One further script in this repository measures a different project rather than this one.
`webmainbench-groundtruth-audit.mjs` counts what the reference documents in the published
`WebMainBench_545.jsonl` actually contain. It was written to check, from the file alone,
which of the points raised in `opendatalab/WebMainBench` issue #71 can be settled by counting.
It confirms two of them, does not support a third, and surfaces a field-availability problem.
It writes only aggregate counts and redistributes none of the dataset text. Run it with a
local copy of the file:

```bash
node webmainbench-groundtruth-audit.mjs /path/to/WebMainBench_545.jsonl
```

Node 18 or newer. No API keys required for any of the above.

## Author

Written and maintained by **[Igor Saevets](https://igorsaevets.github.io/page2ai-docs/about/)** — [LinkedIn](https://www.linkedin.com/in/igorsaevets/) · [GitHub](https://github.com/igorsaevets) · [ORCID 0009-0006-8636-1377](https://orcid.org/0009-0006-8636-1377).

Page2AI is written by the same author as this benchmark. That conflict of interest is the
reason the raw outputs, the harness and the reproduction scripts are all public, and the
reason the withdrawal above is published rather than quietly edited.

## License

MIT. Fork, extend, add tools, add sites, publish your own version.
