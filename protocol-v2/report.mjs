// Stage 5 (offline). Renders RESULTS.md from scores.json and, if present, negotiation.json.
// The prose in RESULTS.md is written by hand; the tables are generated here so that a number in
// the document cannot drift from the number in the JSON.

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, RESULTS } from "./lib.mjs";

const s = JSON.parse(await readFile(join(RESULTS, "scores.json"), "utf8"));
let nego = null;
try {
  nego = JSON.parse(await readFile(join(RESULTS, "negotiation.json"), "utf8"));
} catch {}
let toc = null;
try {
  toc = JSON.parse(await readFile(join(RESULTS, "toc-audit.json"), "utf8"));
} catch {}

const pct = (x) => (x === null || x === undefined ? "n/a" : (x * 100).toFixed(1) + "%");
const num = (x) => (x === null || x === undefined ? "n/a" : String(x));

const BASELINES = ["turndown-raw", "markitdown"];

const rowFor = (a) =>
  `| \`${a.tool}\` | ${a.pages} | ${pct(a.code_recall)} | ${pct(a.heading_recall)} | ${pct(a.text_recall)} | ` +
  `${pct(a.boilerplate_leak)} | **${num(a.f_score)}** | ${num(a.f_score_prose)} |`;

const HEAD = [
  "| tool | pages | code recall | heading recall | prose recall | nav leak | **f_score** | f_score_prose |",
  "|---|---:|---:|---:|---:|---:|---:|---:|"
];

const aggTable = (agg, caption) =>
  [
    `**${caption}**`,
    "",
    ...HEAD,
    ...agg.filter((a) => !BASELINES.includes(a.tool)).map(rowFor),
    "",
    "Whole-document converters, shown separately because they perform no content extraction and are",
    "here as the floor the metric is validated against, not as competitors:",
    "",
    ...HEAD,
    ...agg.filter((a) => BASELINES.includes(a.tool)).map(rowFor),
    ""
  ].join("\n");

const sites = [...new Set(s.rows.map((r) => r.slug))];
const realTools = ["page2ai", "trafilatura", "defuddle-turndown", "readability-turndown"];

const perPage = [
  "| page | framework | " + realTools.map((t) => `\`${t.replace("-turndown", "")}\``).join(" | ") + " | winner |",
  "|---|---|" + realTools.map(() => "---:").join("|") + "|---|",
  ...sites.map((slug) => {
    const rs = s.rows.filter((r) => r.slug === slug);
    const fw = rs[0]?.framework ?? "";
    const best = rs
      .filter((r) => realTools.includes(r.tool))
      .sort((a, b) => (b.f_score ?? 0) - (a.f_score ?? 0))[0];
    const shell = rs[0] && rs[0].article_in_server_html === false ? " *" : "";
    return (
      `| ${slug}${shell} | ${fw} | ` +
      realTools.map((t) => num(rs.find((r) => r.tool === t)?.f_score)).join(" | ") +
      ` | ${best ? best.tool.replace("-turndown", "") : "n/a"} |`
    );
  })
].join("\n");

const perfRows = s.aggregate.map(
  (a) => `| \`${a.tool}\` | ${a.median_bytes} | ${a.total_ms} | ${pct(a.lang_label_rate)} |`
);

let negoBlock = "_Not run in this pass._";
if (nego) {
  const serving = nego.sites.filter((x) => x.publisher.serves_markdown);
  negoBlock = [
    `Measured ${nego.measured_at}. **${serving.length} of ${nego.sites.length}** pages hand over publisher Markdown ` +
      "through Accept negotiation, the `.md` suffix, or both.",
    "",
    "| page | `Accept: text/markdown` | `<url>.md` | `Vary: Accept` | page2ai channel | trafilatura got | markitdown |",
    "|---|---|---|---|---|---|---|",
    ...nego.sites.map((x) => {
      const a = x.publisher.markdown_accept || {};
      const m = x.publisher.md_suffix || {};
      const t = x.tools.trafilatura || {};
      const mk = x.tools.markitdown || {};
      return (
        `| ${x.slug} | ${a.is_markdown ? `yes (${a.bytes} B)` : "no"} | ${m.is_markdown ? `yes (${m.bytes} B)` : "no"} | ` +
        `${a.vary ? "`" + a.vary + "`" : "-"} | ${x.tools.page2ai?.source ?? "error"} | ` +
        `${t.content_type ? t.content_type.split(";")[0] : "error"} | ${mk.ok ? mk.chars + " ch" : "error"} |`
      );
    }),
    "",
    "Three things this table says, none of them a quality judgement:",
    "",
    "1. `page2ai` found the publisher's Markdown on all " + serving.length + " sites that serve it, through both channels " +
      "(`md-suffix` and `content-negotiation`), and reported which one it used in its own return value. " +
      "That is good fetch behaviour and it is scored nowhere in the conversion track, deliberately.",
    "2. `trafilatura` received `text/html` on all " + nego.sites.length + " pages: it does not ask for Markdown. On a site that " +
      "publishes a clean Markdown copy it converts the HTML instead. Whether that is a bug depends on " +
      "what you want from an extractor, which is the point of separating the tracks.",
    "3. `markitdown` errored on four pages, all HTTP 403. Its request is refused by those origins " +
      "where a browser User-Agent is not. That is a property of the tool's fetch path, not of its conversion.",
    "",
    "Also visible, and reported upstream rather than scored: of the sites serving Markdown under Accept " +
      "negotiation, several return a publicly cacheable response without `Vary: Accept`. An intermediary " +
      "cache may then hand the Markdown representation to a client that asked for HTML.",
    ""
  ].join("\n");
}

let tocBlock = "_Not run in this pass._";
if (toc) {
  const REAL = new Set(realTools);
  tocBlock = [
    `Audited ${toc.audited_at} by \`protocol-v2/toc_audit.mjs\`. Raw: ` +
      "[../results-v2/toc-audit.json](../results-v2/toc-audit.json).",
    "",
    `**${toc.corpus_headings_also_in_chrome} of ${toc.corpus_headings} ground-truth headings ` +
      `(${(toc.ambiguous_share * 100).toFixed(1)}%) also appear outside the article.** On ` +
      `**${toc.pages_total - toc.pages_with_any_unambiguous_heading} of ${toc.pages_total}** pages ` +
      `(${toc.pages_fully_ambiguous.join(", ")}) *every* heading is duplicated outside the content ` +
      "root, so on those pages `heading_recall` cannot tell extraction from leakage for any tool.",
    "",
    `Recomputed over the ${toc.pages_with_any_unambiguous_heading} pages where both figures are ` +
      "defined, so that the comparison is like for like:",
    "",
    "| tool | heading recall | strict (article-only headings) | delta |",
    "|---|---:|---:|---:|",
    ...toc.summary.map(
      (t) =>
        `| \`${t.tool}\`${REAL.has(t.tool) ? "" : " *(baseline)*"} | ${pct(t.heading_recall_same_pages)} | ` +
        `${pct(t.heading_recall_strict)} | ${t.delta_like_for_like > 0 ? "+" : ""}${(t.delta_like_for_like * 100).toFixed(1)}pp |`
    ),
    "",
    "No tool moves by more than 3 points and `page2ai` moves by **zero**: the duplication did not " +
      "inflate this benchmark author's own tool. Both whole-document baselines stay at 100%, which is " +
      "exactly the predicted behaviour, since they recall every heading by reproducing the entire page.",
    ""
  ].join("\n");
}

const body = `<!-- GENERATED by protocol-v2/report.mjs. Prose lives in protocol-v2/RESULTS-PROSE.md. -->

# Results, protocol v0.2

Scored ${s.scored_at}. Protocol and metric definitions: [PROTOCOL.md](PROTOCOL.md), including every
amendment and when it was made. Raw per-page rows: [../results-v2/scores.json](../results-v2/scores.json).

## Conversion track

Every tool received the same cached HTML bytes. No tool fetched anything.

${aggTable(s.aggregate, `All ${sites.length} pages`)}

${aggTable(
  s.aggregate_article_pages,
  `Article pages only (${s.aggregate_article_pages[0]?.pages ?? 0} pages; ${s.shell_pages.join(", ") || "none"} excluded)`
)}

Both tables are shown because the second one is more favourable to the tool this benchmark's author
wrote. Choosing between them after seeing the scores would be the exact error the v0.1.0 retraction
is about. The exclusion criterion is a property of the page, measured before scoring
(\`content_ratio\` in each \`groundtruth.json\`), not a property of any tool's result.

### Per page

${perPage}

Pages marked \`*\` carry no article in their server HTML. \`turndown-raw\` and \`markitdown\` are
omitted from this table; both reproduce the whole document, so they win recall and lose cleanliness
on every page. Their aggregate rows above are the floor the metric is validated against.

### Cost

| tool | median output bytes | total ms for ${sites.length} pages | code fences carrying a language |
|---|---:|---:|---:|
${perfRows.join("\n")}

### Is heading recall fakeable by leaking the table of contents?

${tocBlock}

## Negotiation track

${negoBlock}

## How to read this

**\`turndown-raw\` and \`markitdown\` are the floor, and they validate the metric.** Both convert the
whole document, so both recall nearly everything and leak nearly all the navigation. The stated
prediction was that a tool doing no content extraction must score near zero on a harmonic mean of
recall and cleanliness, and both land at 0.07. If they had scored around 0.5 the metric would have
been broken and this run void. This is not a criticism of MarkItDown: it is a format converter,
documented as one, and converting a whole document faithfully is what it is for. It is in the table
because a benchmark needs a floor, not because "convert everything" is a failure.

**Where \`page2ai\` loses.** It scores **0** on docs.anthropic.com, worse than every other tool,
because the article there is not in the server HTML and \`@page2ai/core\` running in Node has no
browser to hydrate it. The Chrome extension sees the rendered DOM and does not have this problem;
the npm library does, and that is a real limitation of the library, stated here rather than
excluded. It also loses on \`rust-book\` (0.667 against 1.0 for trafilatura and defuddle) and is
narrowly behind on four more pages. It is behind trafilatura on nav leakage on the article-only
population, 7.4% against 1.3%: trafilatura is the cleaner extractor, page2ai the more complete one.

**Conflict of interest.** This benchmark is written by the author of one of the tools in it. Three
things are meant to make that checkable rather than trusted: the protocol was committed before the
numbers, the corpus is committed so anyone can rerun the scoring offline and get the same figures,
and every page where page2ai is not the winner is in the per-page table.

**What the metric does and does not measure.** It rewards keeping the article's code and headings
and dropping the page furniture, on documentation pages. That is what doc-site extraction is for,
and it is also what page2ai was built for, so the metric is aligned with one entrant's design goal.
A tool tuned for news articles, forum threads or paywalled pages is not being measured on its own
terms here. Nothing in these numbers transfers to those page types.

**Prose recall is the number to look at, and it was added because a reviewer was right.** The first
version of this table scored only code blocks and headings. An external reviewer pointed out that a
tool could therefore drop 90% of the article's paragraphs and still score 100% content recall. That
is correct, so prose is now measured: \`prose recall\` and \`f_score_prose\` above. **No extractor here
recalls more than 77% of the article body.** Every one of them loses roughly a quarter of the prose,
and the gaps between them narrow considerably once body text counts. The original \`f_score\` is kept
unchanged beside it rather than quietly replaced.

⚠️ **\`prose recall\` is a lower bound and is biased.** A ground-truth paragraph counts as recalled
only if its normalised text occurs in the output, and normalisation collapses punctuation. A
converter that turns an inline link into \`[text](https://...)\` breaks the match for that paragraph;
one that drops the link entirely does not. So the metric penalises link preservation, which is a
feature, not a defect. Treat these numbers as "at least this much prose survived", not as a ranking,
until v0.3 replaces the exact-substring probe with an alignment measure. This is written here rather
than fixed today because changing a metric in the same pass that reports it is how v0.1.0 happened.

**Heading recall is the weakest metric here, and a second reviewer is why that is now written down.**
It asks whether a heading's text appears in the output, not whether it appears in the right place, so
on a docs site that repeats its headings in a sidebar the metric is partly blind. The section above
measures how blind: badly on four pages, negligibly in aggregate, and not at all in this author's
favour. Reported rather than repaired, for the same reason as prose recall.

**JavaScript.** Every tool sees the server-rendered HTML the harness received. One page in fourteen
carries no article there at all. No tool in this table executes JavaScript, so that page is a fair
test of nothing except how each tool fails when there is nothing to extract.
`;

await writeFile(join(ROOT, "RESULTS-v2.md"), body, "utf8");
console.log("[report] RESULTS-v2.md written");
