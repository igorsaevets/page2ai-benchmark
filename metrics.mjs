// Auto-metrics scorer
// Reads results/<site>/*.md and produces metrics.json per site
// Usage: node metrics.mjs

import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const RESULTS = join(ROOT, "results");

const NAV_PATTERNS = [
  /^(Home|Docs|Documentation|API|Blog|Community|Support|About|Contact)$/im,
  /^(Next|Previous|Prev)\s*(page|chapter|article)?$/im,
  /^(Search|Search docs|Search the docs)$/im,
  /^(Edit this page|Edit on GitHub|Improve this doc)$/im,
  /^(Sign in|Log in|Sign up|Register|Get started|Login|Logout)$/im,
  /^Skip to (main content|navigation|content)$/im,
  /^(Menu|Toggle menu|Toggle navigation|Toggle sidebar)$/im
];

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function score(md) {
  const chars = md.length;
  const codeBlocks = countMatches(md, /^```/gm) / 2; // pairs
  const langLabeled = countMatches(md, /^```[a-zA-Z0-9]+$/gm);
  const tables = countMatches(md, /^\|.+\|$/gm) > 0 ? 1 : 0;
  const hasFrontmatter = /^---\n[\s\S]+?\n---\n/.test(md) ? 1 : 0;
  const headings = countMatches(md, /^#{1,6}\s/gm);
  const links = countMatches(md, /\[.+?\]\(.+?\)/g);
  const navLines = NAV_PATTERNS.reduce((sum, p) => sum + countMatches(md, p), 0);
  const langLabeledFraction = codeBlocks > 0 ? langLabeled / codeBlocks : 0;

  return {
    chars,
    code_blocks: codeBlocks,
    lang_labeled: langLabeled,
    lang_labeled_fraction: Number(langLabeledFraction.toFixed(3)),
    tables_present: tables,
    frontmatter_present: hasFrontmatter,
    headings,
    links,
    nav_pollution_lines: navLines
  };
}

const sites = await readdir(RESULTS);
for (const site of sites) {
  const siteDir = join(RESULTS, site);
  const files = (await readdir(siteDir)).filter(f => f.endsWith(".md"));
  const perTool = {};
  for (const file of files) {
    const tool = file.replace(/\.md$/, "");
    const md = await readFile(join(siteDir, file), "utf8");
    perTool[tool] = score(md);
  }
  await writeFile(
    join(siteDir, "metrics.json"),
    JSON.stringify({ site, tools: perTool, run_date: new Date().toISOString() }, null, 2),
    "utf8"
  );
  console.log(`[metrics] ${site}: ${Object.keys(perTool).join(", ")}`);
}

console.log("[metrics] done");
