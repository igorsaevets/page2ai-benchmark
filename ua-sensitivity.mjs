// User-Agent sensitivity probe.
//
// Why this exists: on 2026-07-25 the benchmark reported three sites as "SPA
// limitation - headless HTTP sees pre-hydration skeleton". Investigating the
// worst case (Fumadocs) showed that diagnosis was wrong. The same URL returns
// 386 KB of fully server-rendered HTML to a browser User-Agent and 9 KB of
// empty shell to the honest bot User-Agent that @page2ai/core sends. No
// JavaScript execution is involved either way.
//
// That matters for every comparison in this repo. A cloud extraction API
// (Jina Reader, Firecrawl) presents a browser-like User-Agent from a large
// egress pool. A local library presents an honest self-identifying bot string.
// If a site serves different HTML to those two clients, then a head-to-head
// "extraction quality" number is partly measuring who gets past the gate, not
// who converts HTML better. This script measures how large that effect is so
// the benchmark can control for it instead of silently inheriting it.
//
// Politeness: one GET per (site, agent) pair, sequential, 1s apart. Read-only,
// public documentation pages only.
//
// Usage: node ua-sensitivity.mjs

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

const AGENTS = [
  {
    slug: "page2ai-core",
    kind: "self-identifying bot",
    ua: "page2ai-core/0.1 (+https://github.com/igorsaevets/page2ai-core)",
  },
  {
    slug: "chrome-desktop",
    kind: "browser",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  },
  { slug: "curl", kind: "cli tool", ua: "curl/8.7.1" },
  { slug: "python-requests", kind: "library", ua: "python-requests/2.32.3" },
  { slug: "node-undici", kind: "runtime default", ua: null },
  {
    slug: "googlebot",
    kind: "search crawler",
    ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
];

const ACCEPT = "text/html,text/markdown,text/plain,application/xhtml+xml,*/*;q=0.5";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function measure(html) {
  const { document } = parseHTML(html);
  const root =
    document.querySelector("main article") ||
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.querySelector('[role="main"]') ||
    document.body;
  return {
    bytes: html.length,
    title: (document.querySelector("title")?.textContent || "").trim() || null,
    pre: document.querySelectorAll("pre").length,
    code: document.querySelectorAll("code").length,
    headings: document.querySelectorAll("h1,h2,h3,h4,h5,h6").length,
    links: document.querySelectorAll("a[href]").length,
    tables: document.querySelectorAll("table").length,
    content_root: root ? root.tagName.toLowerCase() : null,
    content_text_chars: root ? (root.textContent || "").trim().length : 0,
  };
}

const sites = JSON.parse(await readFile(join(ROOT, "sites.json"), "utf8")).sites;
const rows = [];

for (const site of sites) {
  for (const agent of AGENTS) {
    const headers = { accept: ACCEPT };
    if (agent.ua) headers["user-agent"] = agent.ua;
    let rec = { site: site.slug, framework: site.framework, url: site.url, agent: agent.slug, agent_kind: agent.kind };
    try {
      const resp = await fetch(site.url, { headers, redirect: "follow" });
      const html = await resp.text();
      rec = { ...rec, status: resp.status, final_url: resp.url, ...measure(html) };
    } catch (e) {
      rec = { ...rec, status: null, error: e.message };
    }
    rows.push(rec);
    console.log(
      `${site.slug.padEnd(26)} ${agent.slug.padEnd(16)} ${String(rec.status ?? "ERR").padEnd(4)} ` +
        `bytes=${String(rec.bytes ?? 0).padEnd(8)} text=${String(rec.content_text_chars ?? 0).padEnd(7)} ` +
        `pre=${String(rec.pre ?? 0).padEnd(3)} h=${String(rec.headings ?? 0).padEnd(4)} ` +
        `title=${rec.title ? "yes" : "NO"}`,
    );
    await sleep(1000);
  }
}

// Per-site sensitivity ratio: best agent text vs the self-identifying bot agent.
const summary = [];
for (const site of sites) {
  const mine = rows.filter((r) => r.site === site.slug);
  const bot = mine.find((r) => r.agent === "page2ai-core");
  const best = mine.reduce((a, b) => ((b.content_text_chars ?? 0) > (a.content_text_chars ?? 0) ? b : a), mine[0]);
  const botText = bot?.content_text_chars ?? 0;
  const bestText = best?.content_text_chars ?? 0;
  summary.push({
    site: site.slug,
    framework: site.framework,
    bot_agent_text_chars: botText,
    best_agent: best?.agent,
    best_agent_text_chars: bestText,
    ratio: botText > 0 ? Number((bestText / botText).toFixed(2)) : null,
    gated: bestText > 0 && botText / bestText < 0.5,
  });
}

await mkdir(join(ROOT, "results"), { recursive: true });
await writeFile(
  join(ROOT, "results", "ua-sensitivity.json"),
  JSON.stringify({ run_date: new Date().toISOString(), agents: AGENTS, rows, summary }, null, 2),
  "utf8",
);

console.log("\n=== SUMMARY: content served to the self-identifying bot vs the best agent ===");
for (const s of summary) {
  console.log(
    `${s.site.padEnd(26)} bot=${String(s.bot_agent_text_chars).padEnd(7)} ` +
      `best=${String(s.best_agent_text_chars).padEnd(7)} (${s.best_agent}) ratio=${s.ratio}x ` +
      `${s.gated ? "  <-- CONTENT GATED BY USER-AGENT" : ""}`,
  );
}
console.log("\nWrote results/ua-sensitivity.json");
