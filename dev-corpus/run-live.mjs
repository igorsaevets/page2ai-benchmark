// Live dev-corpus runner. Exercises @page2ai/core's PRODUCTION path (fetchAndConvert:
// md-suffix probe -> content negotiation -> HTML parse) against the ai-docs.json pages.
//
// This measures the input the product actually receives - a lesson written in blood in
// RESULTS-v2.md: the offline benchmark feeds cached HTML into htmlToMarkdown() and so never
// exercises the .md-suffix and negotiation channels that rescue exactly the SPA pages the
// offline track scores 0 on.
//
// Outputs: dev-corpus/results/<slug>.md (gitignored - live pages drift) and
// dev-corpus/summary.json (committed - the per-run scoreboard with the core version).
//
// Usage: node dev-corpus/run-live.mjs [slug ...]

import fs from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAndConvert } from "@page2ai/core";

const HERE = dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(fs.readFileSync(join(HERE, "ai-docs.json"), "utf8"));
const only = process.argv.slice(2);
const outDir = join(HERE, "results");
fs.mkdirSync(outDir, { recursive: true });

const coreVersion = JSON.parse(
  fs.readFileSync(join(HERE, "..", "node_modules", "@page2ai", "core", "package.json"), "utf8"),
).version;

const rows = [];
for (const page of spec.pages) {
  if (only.length && !only.includes(page.slug)) continue;
  const started = Date.now();
  let row = { slug: page.slug, vendor: page.vendor, category: page.category, url: page.url };
  try {
    const r = await fetchAndConvert(page.url, { timeoutMs: 30000 });
    const md = r.markdown || "";
    fs.writeFileSync(join(outDir, `${page.slug}.md`), md, "utf8");
    const body = md.replace(/^---[\s\S]*?\n---\n/, "");
    const fenceOpeners = (md.match(/^\s{0,3}(?:`{3,}|~{3,})[^\n]*$/gm) || []);
    const fences = Math.floor(fenceOpeners.length / 2);
    const labelled = fenceOpeners.filter((o, i) => i % 2 === 0 && /^\s{0,3}(?:`{3,}|~{3,})\s*[A-Za-z0-9]/.test(o)).length;
    row = {
      ...row,
      ok: true,
      source: r.source,
      chars: md.length,
      body_chars: body.replace(/\s+/g, " ").trim().length,
      headings: (body.match(/^#{1,6}\s/gm) || []).length,
      fences,
      fences_labelled: labelled,
      links: (body.match(/\]\(/g) || []).length,
      title: r.title,
      ms: Date.now() - started,
    };
  } catch (e) {
    row = { ...row, ok: false, error: String(e && e.message ? e.message : e).slice(0, 160), ms: Date.now() - started };
  }
  rows.push(row);
  const s = row.ok
    ? `${row.source.padEnd(20)} ${String(row.body_chars).padStart(7)} ch  h=${String(row.headings).padStart(3)} fence=${row.fences}/${row.fences_labelled} ${row.ms}ms`
    : `ERROR ${row.error}`;
  console.log(`[dev] ${page.slug.padEnd(24)} ${s}`);
}

// `ok` means THE FETCH PATH RETURNED SOMETHING, not that extraction was adequate - a login
// wall and a redirect stub both come back ok with a handful of characters (reviewer-raised).
// `thin` is the honesty flag: body under 500 chars is a shell, whatever `ok` says.
for (const r of rows) if (r.ok) r.thin = r.body_chars < 500;
const summary = {
  run_at: new Date().toISOString(),
  core_version: coreVersion,
  pages: rows.length,
  fetched_ok: rows.filter((r) => r.ok).length,
  thin: rows.filter((r) => r.thin).length,
  by_source: Object.fromEntries(
    [...new Set(rows.filter((r) => r.ok).map((r) => r.source))].map((s) => [s, rows.filter((r) => r.source === s).length]),
  ),
  rows,
};
fs.writeFileSync(join(HERE, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(`\n[dev] ${summary.fetched_ok}/${summary.pages} fetched, ${summary.thin} thin | core ${coreVersion} | channels: ${JSON.stringify(summary.by_source)}`);
