// Diagnostic (offline). Answers ONE question, raised by an external reviewer on 2026-07-28:
//
//   "TOC leakage can fake heading recall. On docs platforms with default TOCs and sidebars the
//    heading text is duplicated outside the article. If your scorer only checks whether heading
//    text appears anywhere, the wrong extraction can still score as right."
//
// The mechanism is real: score.mjs asks `mdSqueezed.includes(h)` with no position constraint.
// Whether it is MATERIAL is an empirical question about this corpus, and this file answers it
// without changing any metric. It writes results-v2/toc-audit.json and prints a table.
//
// Method: re-derive the content root and the chrome text exactly as groundtruth.mjs does, then
// split each page's ground-truth headings into
//   article_only    - the heading text does NOT occur anywhere outside the content root
//   also_in_chrome  - it does, so recalling it proves nothing about extraction
// and recompute heading recall over article_only alone. If a tool's number survives that
// restriction, the hole did not inflate it. If it collapses, the reported figure was inflated
// and must be republished.

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { CORPUS, RESULTS, squeeze, round } from "./lib.mjs";

const DROP_SELECTOR = "script, style, noscript, template, svg";
const MIN_HEADING_CHARS = 3;

const index = JSON.parse(await readFile(join(CORPUS, "index.json"), "utf8"));
const manifest = JSON.parse(await readFile(join(RESULTS, "extract-manifest.json"), "utf8"));
const tools = [...new Set(manifest.map((m) => m.tool))];

const pages = [];

for (const site of index.sites) {
  if (!site.ok) continue;
  let gt;
  try {
    gt = JSON.parse(await readFile(join(CORPUS, site.slug, "groundtruth.json"), "utf8"));
  } catch {
    continue;
  }
  if (!gt.usable) continue;

  const html = await readFile(join(CORPUS, site.slug, "page.html"), "utf8");
  const dom = new JSDOM(html, { url: site.final_url || undefined });
  const doc = dom.window.document;
  for (const el of doc.querySelectorAll(DROP_SELECTOR)) el.remove();

  const contentRoot =
    doc.querySelector("main") ||
    doc.querySelector("article") ||
    doc.querySelector("[role=main]") ||
    doc.body;

  // Chrome text as one squeezed blob. Same clone-and-remove trick as groundtruth.mjs, so that
  // "outside the content root" means the same thing in both files.
  let chromeBlob = "";
  if (contentRoot !== doc.body) {
    const marker = "data-p2b-toc-audit";
    contentRoot.setAttribute(marker, "1");
    const clone = doc.body.cloneNode(true);
    const cloneRoot = clone.querySelector(`[${marker}]`);
    if (cloneRoot) cloneRoot.remove();
    contentRoot.removeAttribute(marker);
    chromeBlob = squeeze(clone.textContent || "");
  }

  // Ground-truth headings, re-derived identically to groundtruth.mjs.
  const seen = new Set();
  const headings = [];
  for (const h of contentRoot.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
    const sq = squeeze(h.textContent || "");
    if (sq.length < MIN_HEADING_CHARS) continue;
    if (seen.has(sq)) continue;
    seen.add(sq);
    headings.push(sq);
  }

  const articleOnly = [];
  const alsoInChrome = [];
  for (const h of headings) (chromeBlob.includes(h) ? alsoInChrome : articleOnly).push(h);

  const perTool = {};
  for (const tool of tools) {
    const md = await readFile(join(RESULTS, site.slug, `${tool}.md`), "utf8");
    const sq = squeeze(md);
    const hitAll = headings.filter((h) => sq.includes(h)).length;
    const hitStrict = articleOnly.filter((h) => sq.includes(h)).length;
    perTool[tool] = {
      heading_recall: headings.length ? round(hitAll / headings.length) : null,
      heading_recall_strict: articleOnly.length ? round(hitStrict / articleOnly.length) : null,
      n_hit_ambiguous: alsoInChrome.filter((h) => sq.includes(h)).length
    };
  }

  pages.push({
    slug: site.slug,
    framework: gt.framework,
    article_in_server_html: gt.article_in_server_html !== false,
    n_headings: headings.length,
    n_article_only: articleOnly.length,
    n_also_in_chrome: alsoInChrome.length,
    ambiguous_share: headings.length ? round(alsoInChrome.length / headings.length) : null,
    examples_ambiguous: alsoInChrome.slice(0, 3),
    tools: perTool
  });
}

const mean = (xs) => {
  const v = xs.filter((x) => Number.isFinite(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

// Four pages have EVERY heading duplicated outside the content root, so heading_recall_strict is
// undefined there and those pages drop out of the strict mean. Comparing a 14-page loose mean with
// a 10-page strict mean would be a population swap - the exact error this benchmark exists to avoid.
// The delta is therefore computed over the pages where BOTH are defined, and the 14-page figure is
// reported separately and labelled as such.
const strictPages = pages.filter((p) => p.n_article_only > 0);

const summary = tools
  .map((tool) => {
    const looseAll = mean(pages.map((p) => p.tools[tool].heading_recall));
    const looseSame = mean(strictPages.map((p) => p.tools[tool].heading_recall));
    const strict = mean(strictPages.map((p) => p.tools[tool].heading_recall_strict));
    return {
      tool,
      heading_recall_all_pages: round(looseAll),
      heading_recall_same_pages: round(looseSame),
      heading_recall_strict: round(strict),
      delta_like_for_like: round((strict ?? 0) - (looseSame ?? 0))
    };
  })
  .sort((a, b) => (b.heading_recall_strict ?? 0) - (a.heading_recall_strict ?? 0));

const totalHeadings = pages.reduce((a, p) => a + p.n_headings, 0);
const totalAmbiguous = pages.reduce((a, p) => a + p.n_also_in_chrome, 0);

await writeFile(
  join(RESULTS, "toc-audit.json"),
  JSON.stringify(
    {
      audited_at: new Date().toISOString(),
      question:
        "Does duplicated TOC/sidebar heading text let a tool score heading recall without extracting the article?",
      corpus_headings: totalHeadings,
      corpus_headings_also_in_chrome: totalAmbiguous,
      ambiguous_share: round(totalAmbiguous / totalHeadings),
      pages_total: pages.length,
      pages_with_any_unambiguous_heading: strictPages.length,
      pages_fully_ambiguous: pages.filter((p) => p.n_article_only === 0).map((p) => p.slug),
      summary,
      pages
    },
    null,
    2
  ),
  "utf8"
);

console.log(
  `\nheadings in corpus: ${totalHeadings}   also present outside the content root: ${totalAmbiguous} ` +
    `(${((totalAmbiguous / totalHeadings) * 100).toFixed(1)}%)\n`
);
console.log(
  `pages: ${pages.length} total, ${strictPages.length} with at least one unambiguous heading. ` +
    `Fully ambiguous: ${pages.filter((p) => p.n_article_only === 0).map((p) => p.slug).join(", ") || "none"}`
);
console.log("\nLIKE FOR LIKE, over the " + strictPages.length + " pages where both are defined:\n");
console.log("tool                    loose  strict   delta   (14-page loose)");
for (const s of summary) {
  console.log(
    `${s.tool.padEnd(22)} ${String(s.heading_recall_same_pages).padStart(6)} ${String(s.heading_recall_strict).padStart(7)} ` +
      `${String(s.delta_like_for_like).padStart(7)}   ${String(s.heading_recall_all_pages).padStart(6)}`
  );
}
console.log("\nper page:");
console.log("page                 framework        head  ambig  share  examples");
for (const p of pages) {
  console.log(
    `${p.slug.padEnd(20)} ${String(p.framework).padEnd(15)} ${String(p.n_headings).padStart(4)} ` +
      `${String(p.n_also_in_chrome).padStart(6)} ${String(p.ambiguous_share).padStart(6)}  ${p.examples_ambiguous.slice(0, 2).join(" | ").slice(0, 60)}`
  );
}
