---
title: Page2AI benchmark v0.1.0 — infrastructure demo + Page2AI headless baseline
author: Igor Saevets
about_url: https://igorsaevets.github.io/page2ai-docs/about/
run_date: 2026-07-24
---

# Page2AI benchmark v0.1.0 — analysis

**Framing.** This is an exploratory, reproducibility-first infrastructure release, not a statistically powered head-to-head comparison. `n=1` per cell. Numbers below characterize the Page2AI Node adapter (`@page2ai/core@0.1.0`) against five real documentation-framework URLs. External extractor slots (Jina Reader, Firecrawl) are wired but require the operator to supply their own API keys — the free Jina Reader tier stopped serving unauthenticated requests in 2025-2026, and Firecrawl has always required a key.

See [Comparison page on the docs site](https://igorsaevets.github.io/page2ai-docs/comparison/) for the qualitative feature matrix.

## What was measured

Five documentation frameworks × 1 tool (Page2AI headless via `@page2ai/core`) × 2 tasks (main content, code-block preservation). Raw Markdown outputs in `results/<site>/page2ai.md`, computed metrics in `results/<site>/metrics.json`. Rerun with `npm run bench && npm run metrics`.

## Results — Page2AI headless (Node adapter)

| Site | Chars | Code blocks | Lang-labeled | Headings | Links | Nav pollution | Verdict |
|---|---:|---:|---:|---:|---:|---:|---|
| Mintlify (docs.anthropic.com) | 21254 | 3 | 2 | 10 | 43 | 0 | **Good** — full page, clean, code lang preserved |
| Docusaurus (docusaurus.io) | 221 | 0 | 0 | 0 | 0 | 0 | **SPA limitation** — headless HTTP sees pre-hydration skeleton |
| Starlight (starlight.astro.build) | 6056 | 4 | 0 | 8 | 22 | 0 | **Good** — Astro SSR pre-renders content |
| Nextra (nextra.site) | 2024 | 0 | 0 | 0 | 0 | 0 | **SPA limitation** — needs JS hydration |
| Fumadocs (fumadocs.dev) | 0 | 0 | 0 | 0 | 0 | 0 | **URL 404** — Fumadocs docs structure changed, needs sites.json update |

## What this tells us

**Static SSR frameworks (Mintlify, Starlight): Page2AI's Node adapter produces publication-quality Markdown.** Content, structure, code blocks with language tags all survive. Frontmatter with OpenGraph/JSON-LD metadata is preserved.

**SPA-rendered frameworks (Docusaurus, Nextra, Fumadocs): the Node adapter is a lower bound.** `@page2ai/core@0.1.0` fetches raw HTML and parses it with `linkedom` — no JavaScript execution, no client-side hydration. For these frameworks, the Page2AI Chrome extension (which sees the fully hydrated live DOM after user navigation) produces very different, much richer output. That comparison requires the extension-runner path, which is deferred to `page2ai-benchmark` v0.2.

**SPA support is on the Page2AI roadmap.** `@page2ai/core` v0.3 will ship a Playwright/Puppeteer adapter that runs a headless browser before extraction. That will bring the Node surface up to parity with the Chrome extension on SPA sites.

## Reproducibility

Every number above is reproducible with:

```bash
git clone https://github.com/igorsaevets/page2ai-benchmark
cd page2ai-benchmark
npm install
npm run bench:page2ai
npm run metrics
```

Node >= 18 required. No API keys needed for the Page2AI runner.

For the Jina Reader runner (`npm run bench:jina`) and Firecrawl runner (`FIRECRAWL_API_KEY=... npm run bench:firecrawl`), bring your own key. Free-tier availability at Jina Reader changed in 2025-2026; the runner script is preserved for operators with paid access.

## Anti-claim disclaimer

This is not "Page2AI beats X on documentation extraction." It is a set of numbers about one path of one tool on five URLs. Statistical significance requires `n >= 30` per cell and controlled trials. This dataset is a starting point for community comparison, not a marketing claim.

Publishing this as `v0.1.0` unblocks:
- Reproducibility infrastructure for downstream comparison work
- Provisional patent Section F quantitative claims (baseline behavior of the `@page2ai/core` Node path)
- Public dataset that other extractors can be dropped into with a runner script

## Sites-under-test rationale

Documentation frameworks were picked because that's where Page2AI's design decisions (tab-widget dedup, code-block language preservation, frontmatter extraction) matter most. General web crawling, news scraping, e-commerce, and JavaScript-heavy SPAs are separate axes with their own tradeoffs.

Fumadocs URL will be updated to a live URL in v0.1.1.

## Author

Written and maintained by **[Igor Saevets](https://igorsaevets.github.io/page2ai-docs/about/)** — [LinkedIn](https://www.linkedin.com/in/igorsaevets/) · [GitHub](https://github.com/igorsaevets) · [ORCID 0009-0006-8636-1377](https://orcid.org/0009-0006-8636-1377).

## License

MIT. Fork, extend, add tools, add sites, publish your own version. Cite this dataset by SWHID or DOI once assigned.
