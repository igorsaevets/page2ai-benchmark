---
title: Retraction of page2ai-benchmark v0.1.0 results
date: 2026-07-25
author: Igor Saevets
status: v0.1.0 numbers withdrawn; v0.2 protocol in progress
---

# Retraction of the v0.1.0 results

The result table published in `analysis.md` for `page2ai-benchmark` v0.1.0 (run date
2026-07-24) is withdrawn. Four of its five rows were wrong, and the single positive result
was not measuring what the table said it measured.

This note records what was wrong, how it was found, and how to reproduce each correction.
Every number below was produced by scripts committed alongside this file.

## Correction to this note, same day

The first version of this note, published earlier on 2026-07-25 in commit `9fd0cf2`,
attributed the Mintlify result to Accept-header content negotiation. That was wrong, and the
misattribution is corrected in section 1 below.

The recorded output's own frontmatter says `extractor_source: "md-suffix"`. The library did
not stumble into the publisher's Markdown through the Accept header there. It fetched
`<url>.md` deliberately, through a documented option (`tryMdSuffixFirst`, default on), and
labelled the result honestly. **The library reported what it did; the benchmark ignored the
label and scored the result as conversion quality.** That makes the Mintlify row a fault in
this benchmark's methodology, not a bug in the library. The Fumadocs row is a genuine library
bug, and it is a different mechanism. Both are described below.

Checking the frontmatter of the stored output before writing the first version would have
caught this. Recorded here rather than edited away, for the same reason the rest of this note
exists.

## Summary

| Site | v0.1.0 reported | v0.1.0 verdict | Actual cause | Status |
|---|---:|---|---|---|
| Mintlify (docs.anthropic.com) | 21254 chars | "Good, publication-quality Markdown" | Library fetched `<url>.md` and said so; the benchmark scored it as conversion | **Invalid, withdrawn** |
| Docusaurus (docusaurus.io) | 221 chars | "SPA limitation" | Target URL is a 639-byte meta-refresh stub | **Misdiagnosed, corrected** |
| Nextra (nextra.site) | 2024 chars | "SPA limitation", 0 headings, 0 links | Extraction worked; the table's heading and link counts were wrong | **Misdiagnosed, corrected** |
| Fumadocs (fumadocs.dev) | 0 chars | "URL 404" | URL was dead, and the replacement exposed a content-negotiation bug | **Two separate faults** |
| Starlight (starlight.astro.build) | 6056 chars | "Good" | Genuine conversion, unaffected | Stands |

## 1. The Mintlify result was a publisher-Markdown fetch, not a conversion

`@page2ai/core@0.1.0` has an option `tryMdSuffixFirst`, default `true`. Before fetching HTML
it appends `.md` to the URL, a convention Mintlify and others support, and returns that
document if it arrives as Markdown. On this URL it does:

```
https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking.md
  -> 200, content-type: text/markdown, 20535 bytes
```

The library recorded exactly what it had done, in the frontmatter of its own output:

```yaml
source: "https://platform.claude.com/docs/en/build-with-claude/extended-thinking.md"
extractor_source: "md-suffix"
```

Comparing that stored output against the publisher's Markdown:

```
publisher Markdown                             : 20535 bytes
recorded results/mintlify-anthropic/page2ai.md : 20534 bytes (body, frontmatter stripped)
shingle overlap                                : 481/481 = 100.0%
```

No HTML-to-Markdown conversion took place, and the library never claimed otherwise. The fault
is this benchmark's: it read the character count and ignored `extractor_source`, then the
v0.1.0 analysis generalised the row into "Page2AI's Node adapter produces publication-quality
Markdown". It produced nothing on that page. It fetched. Reproduce with
`node repro-passthrough.mjs`.

Fetching the publisher's Markdown is the right behaviour for a extraction tool. It is simply
not conversion, and a benchmark that mixes the two measures neither.

## 2. Docusaurus was a redirect stub, not an SPA limitation

`https://docusaurus.io/docs/introduction` returns HTTP 200 with a 639-byte body:

```html
<meta http-equiv="refresh" content="0; url=/docs">
```

That is a client-side redirect, which a plain HTTP fetch does not follow. The real page at
`https://docusaurus.io/docs` is fully server-rendered. Repointing the entry:

```
before: 221 chars,   0 headings,  0 links, 0 code blocks
after : 14377 chars, 18 headings, 53 links, 2 code blocks
```

The "headless HTTP sees pre-hydration skeleton" diagnosis was wrong. No JavaScript execution
is required for this page.

## 3. The Nextra row was simply incorrect

`nextra.site/docs` is a short introduction page and 2024 characters is close to its real
length. The extracted output contains the title, the description, 7 headings and 10 links.
The v0.1.0 table recorded 0 headings and 0 links and called it an SPA limitation. Recomputing
the metrics from the stored output gives 7 headings and 10 links. The stored output was
never as empty as the table claimed.

## 4. Fumadocs had two independent faults

The v0.1.0 target `https://fumadocs.dev/docs/next-mdx-remote-client` was removed upstream. It
now 308-redirects to the `www` host and lands on a soft-404 page.

After repointing to a live page, extraction still returned an empty body. The cause is the
same content negotiation as in section 1, isolated to a single header:

```
accept: text/html                        -> 386089 bytes, content-type: text/html
accept: text/html,text/markdown,...      ->   9429 bytes, content-type: text/markdown
```

`@page2ai/core` requested Markdown, received Markdown, passed it to an HTML parser, found no
`<article>` element, and emitted an empty document. Reproduce with `node repro-accept.mjs`.

This is a bug in `@page2ai/core` and is tracked separately. The library must either request
HTML when it intends to convert, or detect `content-type: text/markdown` and return the body
unchanged rather than parsing it as HTML.

## Why this invalidates more than these five rows

There are two independent channels by which a tool can obtain the publisher's own Markdown
instead of converting anything, and the two do not overlap cleanly. Probing 15 widely used
documentation sites for both:

| Site | `Accept: text/markdown` | `<url>.md` suffix |
|---|---|---|
| Fumadocs | **yes** (9429 B) | no |
| docs.anthropic.com (Mintlify) | **yes** (20535 B) | **yes** (20535 B) |
| Vercel | **yes** (7461 B) | **yes** (7461 B) |
| Supabase | **yes** (6226 B) | **yes** (6226 B) |
| VitePress | no | **yes** (6235 B) |
| Stripe | no | **yes** (1562 B) |
| Docusaurus, Starlight, Nextra, MDN, Svelte, Astro, Tailwind, Biome | no | no |

**6 of 15 sites expose publisher Markdown through at least one channel.** Four do it through
Accept negotiation, five through the `.md` suffix, three through both, and two through only
one of the two. Reproduce with `node content-negotiation-survey.mjs`; raw output in
`results/content-negotiation.json`.

One caveat recorded rather than smoothed over: `hono.dev` returned `text/markdown` under
Accept negotiation on the first run of this survey and `text/html` on two later runs, with
`Vary: accept` present. That looks like a shared-cache race rather than a stable property, so
it is excluded from the counts above. It is also a live illustration of the caching hazard
described at the end of this note.

The consequence for any comparison of extraction tools is that these channels are confounds.
A tool that tries `.md` first, or that sends a Markdown Accept header, may receive the
publisher's finished Markdown and appear to convert perfectly. A tool that only requests HTML
must actually convert. Comparing their outputs on such a site ranks fetch strategy, not
conversion quality, and the difference can be the whole result. No benchmark this project is
aware of records which channel produced a given output. Until a comparison states, per
result, what was requested and what came back, its numbers on these sites cannot be
interpreted.

Note that this is not an argument against fetching publisher Markdown. It is usually the best
thing a tool can do: on docs.anthropic.com it replaces 954900 bytes of HTML with 20535 bytes
of clean Markdown. It is an argument for scoring it as a different thing.

## What v0.2 changes

1. Every request logs the Accept header sent, the `content-type` received, and the `Vary`
   response header. These go into the results, not just the console.
2. URLs are split into two tracks and scored separately. A **negotiation track** for sites
   that serve Markdown, where the question is whether a tool discovers and uses the better
   representation. A **conversion track** for sites that only serve HTML, where structural
   fidelity is measured.
3. The publisher's Markdown is not treated as neutral ground truth for scoring conversion.
   It is generated from the same source as the HTML, it can omit content the HTML contains,
   and it can include material written for agents that is not part of the article. Where it
   is used at all it is labelled as a weak reference, with the retrieval URL, timestamp and
   content hash recorded.
4. Tool set restricted to locally runnable tools that need no API key, so that a third party
   can reproduce every number without credentials.

## A related finding worth reporting upstream

Of the five sites that vary their response body on the Accept header, four declare
`Vary: Accept` so that shared caches key on it. One does not:

| Site | content-type | declares `Vary: Accept` | cache-control |
|---|---|---|---|
| docs.anthropic.com | text/markdown | yes | private, no-store |
| Vercel | text/markdown | yes | public, max-age=3600 |
| Supabase | text/markdown | yes | public, max-age=86400 |
| Hono | text/markdown | yes | public, max-age=0, must-revalidate |
| **fumadocs.dev** | **text/markdown** | **no** | **public, max-age=0, must-revalidate** |

Without `Vary: Accept` on a publicly cacheable response, an intermediary cache may store the
Markdown representation and later serve it to a client that asked for HTML. Reproduce with
`node vary-check.mjs`. This has been noted for an upstream report and is not a criticism of
the framework's negotiation feature, which is useful and which more sites should implement.

## Reproduction

```bash
git clone https://github.com/igorsaevets/page2ai-benchmark
cd page2ai-benchmark
npm install
node repro-accept.mjs                  # isolates the Accept header effect
node repro-passthrough.mjs             # shows the 100% overlap on docs.anthropic.com
node content-negotiation-survey.mjs    # 15 sites, 2 requests each
node vary-check.mjs                    # Vary: Accept declaration check
```

Node 18 or newer. No API keys required.

## Note on the v0.1.0 record

The v0.1.0 tag, its Zenodo deposition and its DOI remain in place and are not being deleted
or rewritten. The record of what was published stands; this note is the correction to it.
