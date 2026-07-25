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

`@page2ai/core` sends `accept: text/html,text/markdown,text/plain,application/xhtml+xml,*/*;q=0.5`.
Several documentation platforms honour that header and return their own Markdown instead of
HTML. When they do, no conversion happens and the recorded output is the publisher's text.

Measured on 2026-07-25 across 15 widely used documentation sites, two requests each:

| Behaviour | Sites | Count |
|---|---|---:|
| Returns `text/markdown` when asked | Fumadocs, docs.anthropic.com (Mintlify), Vercel, Supabase, Hono | **5 / 15** |
| Ignores the Accept header, always HTML | Docusaurus, Starlight, Nextra, VitePress, MDN, Svelte, Astro, Tailwind, Stripe, Biome | 10 / 15 |

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

| Site | Chars returned | What actually happened |
|---|---:|---|
| Mintlify (docs.anthropic.com) | 20534 | Server returned its own Markdown. Recorded output is a 100% verbatim copy (481/481 shingles). v0.1.0 scored this as "publication-quality Markdown" produced by the tool |
| Fumadocs (www.fumadocs.dev) | 0 | Server returned its own Markdown; the library passed it to an HTML parser, found no `<article>`, and emitted an empty body |

The Fumadocs row is a bug in `@page2ai/core`, not a property of the site. A tool that asks for
Markdown and receives Markdown should return it, not parse it as HTML. Reproduce with
`node repro-accept.mjs`.

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
   HTML; and it can include material addressed to agents that is not part of the article.
   Where it is used at all, label it a weak reference and record retrieval URL, timestamp and
   content hash rather than redistributing the text.
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
```

Node 18 or newer. No API keys required for any of the above.

## Author

Written and maintained by **[Igor Saevets](https://igorsaevets.github.io/page2ai-docs/about/)** — [LinkedIn](https://www.linkedin.com/in/igorsaevets/) · [GitHub](https://github.com/igorsaevets) · [ORCID 0009-0006-8636-1377](https://orcid.org/0009-0006-8636-1377).

Page2AI is written by the same author as this benchmark. That conflict of interest is the
reason the raw outputs, the harness and the reproduction scripts are all public, and the
reason the withdrawal above is published rather than quietly edited.

## License

MIT. Fork, extend, add tools, add sites, publish your own version.
