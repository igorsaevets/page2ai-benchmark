# Page2AI web-to-markdown benchmark

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21539768.svg)](https://doi.org/10.5281/zenodo.21539768)

> **The v0.1.0 results are withdrawn. See [RETRACTION-2026-07-25.md](RETRACTION-2026-07-25.md).**
>
> Four of the five v0.1.0 rows were wrong. The one positive result was measuring the
> publisher's own Markdown rather than any conversion: `docs.anthropic.com` serves
> `content-type: text/markdown` in response to the Accept header this project sends, and the
> recorded output was a 100% verbatim copy of it. Two "SPA limitation" verdicts were
> misdiagnoses of a redirect stub and of a wrong metrics row.
>
> The general point is larger than this repo. **5 of 15 major documentation sites return
> Markdown when a client asks for it** (`node content-negotiation-survey.mjs`). Any
> comparison of extraction tools that does not record the Accept header sent and the
> content type received cannot be interpreted on those sites, because it is partly measuring
> header choice rather than conversion quality. No benchmark known to this project currently
> controls for it.

Open comparison of web-to-Markdown extractors on documentation frameworks. Focus on
documentation-site extraction quality, not general web crawling.

## Scope

Five documentation-site frameworks × three tools × two tasks = 30 data points. Small enough to reproduce in one afternoon. Large enough to make a defensible statement about extraction quality on the doc-site subset of the web.

## Sites under test

| Framework | Target URL | Why |
|-----------|-----------|-----|
| Mintlify | https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking | Uses `<Note>`, `<CodeGroup>`, multi-language tab structure |
| Docusaurus | https://docusaurus.io/docs | Admonitions, live code blocks, sidebars. Corrected 2026-07-25: `/docs/introduction` is a meta-refresh stub |
| Starlight (Astro) | https://starlight.astro.build/getting-started/ | Card components, Shiki-highlighted code, sidebar nav |
| Nextra | https://nextra.site/docs | Callouts, code tabs, tables |
| Fumadocs | https://www.fumadocs.dev/docs/manual-installation/next | Newer framework. Corrected 2026-07-25: previous URL removed upstream. Serves Markdown under content negotiation |

## Tools under test

| Tool | Type | Cost | Setup |
|------|------|------|-------|
| Page2AI v1.2.0 | Chrome extension | Free, local | Load unpacked or install from CWS |
| Firecrawl | Cloud API | Free tier 500 credits | `POST /v2/scrape` with API key |
| Jina Reader | Cloud API | Free (fair use) | `GET https://r.jina.ai/{url}` |

## Tasks per site

1. **Extract main content**: full article body as clean Markdown, no nav / footer / ads
2. **Extract code blocks**: all code blocks preserved with language labels, in original document order

Reason: these two tasks isolate the most common failure modes. Tables, callouts, and frontmatter are secondary.

## Metrics

Each output is scored on:

- **Length**: character count of extracted Markdown (rough proxy for completeness)
- **Code block count**: number of ` ``` ` fences in output (should match source)
- **Language labels**: fraction of code blocks with explicit language (Python vs Ts vs cURL matters for RAG)
- **Table preservation**: count of Markdown tables
- **Frontmatter presence**: does output include YAML frontmatter with page metadata
- **Nav pollution**: count of lines matching common nav patterns (`Home`, `Next`, `Previous`, `Search`, `Edit this page`)

Human review adds:

- **Structural fidelity**: does the extracted Markdown read as a coherent article
- **JSX component handling**: how were `<Note>`, `<CodeGroup>`, `<Callout>`, `<Tabs>` rendered

## Deliverable

`results/<site-slug>/` contains one Markdown file per tool, plus `metrics.json` with auto-scores. `analysis.md` at repo root contains conclusions.

Framing: **tradeoff matrix**, not "we win overall". Page2AI is expected to lead on JSX/MDX-heavy sites and lag on plain HTML pages that Firecrawl or Jina handle equally well. Local vs cloud, cost vs speed, telemetry vs privacy are separate axes.

## Reproducibility

- All source URLs listed above
- All tool invocation scripts in `runners/`
- All raw outputs saved verbatim in `results/`
- Run date recorded for each result (extraction may change over time as tools update)
- One-command reproduction: `npm run bench`

## What this benchmark does NOT claim

- Not a general web-scraping benchmark
- Not a headless-browser performance test
- Not a JavaScript-execution completeness measure
- Not an evaluation of vendor billing or API rate limits at scale
- Not a legal opinion on any tool's compliance

Documentation sites are a small, well-defined subset of the web where extraction quality matters most for RAG and AI assistants. Other subsets (news, e-commerce, JavaScript-heavy SPAs, authenticated content) have their own tradeoffs.

## License

MIT. Fork, extend, add tools, add sites, publish your own version.

## Related work

- [Firecrawl](https://github.com/mendableai/firecrawl) — cloud crawler for RAG (154k stars)
- [Microsoft markitdown](https://github.com/microsoft/markitdown) — anything to Markdown (168k stars)
- [Crawl4AI](https://github.com/unclecode/crawl4ai) — Python crawler framework (74k stars)
- [Jina Reader](https://jina.ai/reader) — cloud URL to Markdown API
- [Page2AI](https://github.com/igorsaevets/page2ai-extension) — Chrome extension for doc-site extraction

## Citation

If you use this benchmark in a paper, blog post, or product comparison, please cite the SWHID or a Zenodo DOI once one is issued.

## About the author

Written and maintained by **Igor Saevets** — AI expert and founder of Page2AI. Full bio and social links: [igorsaevets.github.io/page2ai-docs/about/](https://igorsaevets.github.io/page2ai-docs/about/).

- LinkedIn: [linkedin.com/in/igorsaevets](https://www.linkedin.com/in/igorsaevets/)
- GitHub: [github.com/igorsaevets](https://github.com/igorsaevets)
- ORCID: [0009-0006-8636-1377](https://orcid.org/0009-0006-8636-1377)
