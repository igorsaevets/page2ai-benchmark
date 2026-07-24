// Jina Reader runner
// r.jina.ai is a free service, no auth needed for casual use
// Usage: node runners/jina.mjs

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const sites = JSON.parse(await readFile(join(ROOT, "sites.json"), "utf8")).sites;

for (const site of sites) {
  const outDir = join(ROOT, "results", site.slug);
  await mkdir(outDir, { recursive: true });

  const readerUrl = `https://r.jina.ai/${site.url}`;
  console.log(`[jina] ${site.slug} -> ${readerUrl}`);

  const started = Date.now();
  const r = await fetch(readerUrl, {
    headers: {
      "Accept": "text/plain",
      "X-Return-Format": "markdown"
    }
  });

  if (!r.ok) {
    console.error(`[jina] ${site.slug}: HTTP ${r.status}`);
    continue;
  }

  const md = await r.text();
  const elapsed = Date.now() - started;

  await writeFile(join(outDir, "jina.md"), md, "utf8");
  await writeFile(
    join(outDir, "jina.meta.json"),
    JSON.stringify({
      tool: "jina",
      site: site.slug,
      url: site.url,
      status: r.status,
      elapsed_ms: elapsed,
      chars: md.length,
      run_date: new Date().toISOString()
    }, null, 2),
    "utf8"
  );
  console.log(`[jina] ${site.slug}: ${md.length} chars, ${elapsed}ms`);
}

console.log("[jina] done");
