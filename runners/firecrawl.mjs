// Firecrawl v2 runner
// Requires FIRECRAWL_API_KEY env var (get at https://firecrawl.dev)
// Free tier: 500 credits/month, this benchmark uses ~5 credits
// Usage: FIRECRAWL_API_KEY=fc-... node runners/firecrawl.mjs

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const API_KEY = process.env.FIRECRAWL_API_KEY;
if (!API_KEY) {
  console.error("FIRECRAWL_API_KEY env var required. Get one at https://firecrawl.dev");
  process.exit(1);
}

const sites = JSON.parse(await readFile(join(ROOT, "sites.json"), "utf8")).sites;

for (const site of sites) {
  const outDir = join(ROOT, "results", site.slug);
  await mkdir(outDir, { recursive: true });

  console.log(`[firecrawl] ${site.slug} -> ${site.url}`);

  const started = Date.now();
  const r = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: site.url,
      formats: ["markdown"],
      onlyMainContent: true
    })
  });

  const j = await r.json();
  const elapsed = Date.now() - started;

  if (!r.ok || !j.data?.markdown) {
    console.error(`[firecrawl] ${site.slug}: HTTP ${r.status}`, j);
    await writeFile(
      join(outDir, "firecrawl.err.json"),
      JSON.stringify({ status: r.status, response: j }, null, 2),
      "utf8"
    );
    continue;
  }

  const md = j.data.markdown;

  await writeFile(join(outDir, "firecrawl.md"), md, "utf8");
  await writeFile(
    join(outDir, "firecrawl.meta.json"),
    JSON.stringify({
      tool: "firecrawl",
      site: site.slug,
      url: site.url,
      status: r.status,
      elapsed_ms: elapsed,
      chars: md.length,
      run_date: new Date().toISOString(),
      firecrawl_metadata: j.data.metadata
    }, null, 2),
    "utf8"
  );
  console.log(`[firecrawl] ${site.slug}: ${md.length} chars, ${elapsed}ms`);
}

console.log("[firecrawl] done");
