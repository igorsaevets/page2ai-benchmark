// Does a site that varies its response on the Accept header actually declare that
// in `Vary`? If it does not, a shared cache (CDN, corporate proxy) may store the
// Markdown representation and later serve it to a browser that asked for HTML.
//
// This matters twice over. It is a correctness question for the sites, so it is
// worth reporting upstream. It is also an ethics gate for this benchmark: a
// harvester that requests `Accept: text/markdown` at volume against a site with
// no `Vary: Accept` can pollute a shared cache for that site's ordinary readers.
// Until this is checked, the crawl should stay small and slow.
//
// Usage: node vary-check.mjs

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MD_ACCEPT = "text/html,text/markdown,text/plain,application/xhtml+xml,*/*;q=0.5";

const NEGOTIATING = [
  { slug: "fumadocs", url: "https://www.fumadocs.dev/docs/manual-installation/next" },
  { slug: "anthropic", url: "https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking" },
  { slug: "vercel", url: "https://vercel.com/docs/functions" },
  { slug: "supabase", url: "https://supabase.com/docs/guides/auth" },
  { slug: "hono", url: "https://hono.dev/docs/getting-started/basic" },
];

const rows = [];
for (const t of NEGOTIATING) {
  const resp = await fetch(t.url, { headers: { accept: MD_ACCEPT }, redirect: "follow" });
  await resp.text();
  const vary = resp.headers.get("vary") || "";
  const declaresAccept = /(^|,)\s*accept\s*(,|$)/i.test(vary);
  const row = {
    ...t,
    content_type: resp.headers.get("content-type"),
    vary,
    declares_vary_accept: declaresAccept,
    cache_control: resp.headers.get("cache-control"),
    cdn: resp.headers.get("server") || resp.headers.get("x-vercel-id") ? "yes" : "unknown",
  };
  rows.push(row);
  console.log(
    `${t.slug.padEnd(11)} ct=${(row.content_type || "-").padEnd(15)} ` +
      `Vary:Accept=${declaresAccept ? "YES" : "NO "} cache-control=${row.cache_control || "-"}`,
  );
  console.log(`             vary: ${vary || "(none)"}`);
  await new Promise((r) => setTimeout(r, 900));
}

const missing = rows.filter((r) => !r.declares_vary_accept);
await mkdir(join(__dirname, "results"), { recursive: true });
await writeFile(
  join(__dirname, "results", "vary-check.json"),
  JSON.stringify({ run_date: new Date().toISOString(), rows, missing_vary_accept: missing.map((m) => m.slug) }, null, 2),
  "utf8",
);

console.log(
  `\n${missing.length} of ${rows.length} sites vary the body on Accept without declaring "Vary: Accept": ` +
    missing.map((m) => m.slug).join(", "),
);
