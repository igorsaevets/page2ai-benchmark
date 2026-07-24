// Page2AI headless runner via @page2ai/core (v0.1.0)
// Uses fetchAndConvert directly. No browser, no extension, no popup UI.
// This measures the "Node adapter" surface (SPA rendering ships in v0.3).
// The Chrome extension surface handles tab widgets, dynamic hydration, and
// session-authenticated pages that are outside this Node path's scope.
// See analysis.md for the comparison caveats.
//
// Usage: node runners/page2ai.mjs

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAndConvert } from "@page2ai/core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const sites = JSON.parse(await readFile(join(ROOT, "sites.json"), "utf8")).sites;

for (const site of sites) {
  const outDir = join(ROOT, "results", site.slug);
  await mkdir(outDir, { recursive: true });

  console.log(`[page2ai] ${site.slug} -> ${site.url}`);
  const started = Date.now();

  try {
    const result = await fetchAndConvert(site.url, {
      includeFrontmatter: true,
      includeImages: true,
      timeoutMs: 30000,
    });
    const elapsed = Date.now() - started;
    const md = result.markdown ?? "";

    await writeFile(join(outDir, "page2ai.md"), md, "utf8");
    await writeFile(
      join(outDir, "page2ai.meta.json"),
      JSON.stringify(
        {
          tool: "page2ai",
          site: site.slug,
          url: site.url,
          adapter: "@page2ai/core headless (Node)",
          note: "The Chrome extension surface (tab-widget dedup, DOM interaction) is not exercised by this runner. See analysis.md.",
          elapsed_ms: elapsed,
          chars: md.length,
          title: result.title,
          baseUrl: result.baseUrl,
          run_date: new Date().toISOString(),
        },
        null,
        2,
      ),
      "utf8",
    );
    console.log(`[page2ai] ${site.slug}: ${md.length} chars, ${elapsed}ms`);
  } catch (e) {
    const elapsed = Date.now() - started;
    console.error(`[page2ai] ${site.slug}: ${e.message}`);
    await writeFile(
      join(outDir, "page2ai.err.json"),
      JSON.stringify(
        {
          tool: "page2ai",
          site: site.slug,
          url: site.url,
          error: e.message,
          elapsed_ms: elapsed,
          run_date: new Date().toISOString(),
        },
        null,
        2,
      ),
      "utf8",
    );
  }
}

console.log("[page2ai] done");
