// Content-negotiation survey: which documentation sites already serve Markdown?
//
// Found on 2026-07-25 while debugging a benchmark "failure". @page2ai/core sends
//   accept: text/html,text/markdown,text/plain,application/xhtml+xml,*/*;q=0.5
// and www.fumadocs.dev answered with `content-type: text/markdown` and a clean,
// already-converted Markdown document. The tool then handed that Markdown to an
// HTML parser, found no <article>, and emitted an empty body. It asked for
// Markdown, got Markdown, and threw it away.
//
// Two consequences for this benchmark, both larger than the bug:
//
//  1. VALIDITY. A tool whose Accept header triggers content negotiation is not
//     performing HTML-to-Markdown conversion on these sites at all. Any score it
//     earns there measures the publisher's Markdown, not the tool's. Comparing
//     such a tool against one that always requests HTML is not a like-for-like
//     comparison. A benchmark that does not control the Accept header is
//     measuring an artifact of header choice.
//
//  2. GROUND TRUTH. Where a publisher serves Markdown for the same URL, that
//     Markdown is authoritative, machine-readable reference output produced by
//     the people who wrote the page. That is free ground truth for scoring
//     HTML-to-Markdown converters, on live pages, without hand labelling, which
//     is normally the hardest and most expensive part of building this kind of
//     benchmark.
//
// This script measures how common the behaviour is. Two GETs per URL (one asking
// for HTML, one asking for Markdown), sequential, spaced. Read-only, public
// documentation pages.
//
// Usage: node content-negotiation-survey.mjs

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

const HTML_ACCEPT = "text/html,application/xhtml+xml";
const MD_ACCEPT = "text/html,text/markdown,text/plain,application/xhtml+xml,*/*;q=0.5";

// Documentation sites across the frameworks and vendors this benchmark cares
// about, plus the major AI-vendor docs that LLM pipelines actually fetch.
const TARGETS = [
  { slug: "fumadocs", framework: "Fumadocs", url: "https://www.fumadocs.dev/docs/manual-installation/next" },
  { slug: "anthropic", framework: "Mintlify", url: "https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking" },
  { slug: "docusaurus", framework: "Docusaurus", url: "https://docusaurus.io/docs" },
  { slug: "starlight", framework: "Starlight", url: "https://starlight.astro.build/getting-started/" },
  { slug: "nextra", framework: "Nextra", url: "https://nextra.site/docs" },
  { slug: "vitepress", framework: "VitePress", url: "https://vitepress.dev/guide/getting-started" },
  { slug: "mdn", framework: "Yari", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept" },
  { slug: "svelte", framework: "custom", url: "https://svelte.dev/docs/svelte/what-are-runes" },
  { slug: "astro", framework: "Starlight", url: "https://docs.astro.build/en/getting-started/" },
  { slug: "tailwind", framework: "custom", url: "https://tailwindcss.com/docs/installation/using-vite" },
  { slug: "stripe", framework: "custom", url: "https://docs.stripe.com/api" },
  { slug: "vercel", framework: "custom", url: "https://vercel.com/docs/functions" },
  { slug: "supabase", framework: "custom", url: "https://supabase.com/docs/guides/auth" },
  { slug: "hono", framework: "VitePress", url: "https://hono.dev/docs/getting-started/basic" },
  { slug: "biome", framework: "Starlight", url: "https://biomejs.dev/guides/getting-started/" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(url, accept) {
  try {
    const resp = await fetch(url, { headers: { accept }, redirect: "follow" });
    const body = await resp.text();
    return {
      status: resp.status,
      content_type: resp.headers.get("content-type"),
      bytes: body.length,
      looks_markdown: /^\s*(#|---|\[)/.test(body) && !/^\s*<!DOCTYPE/i.test(body),
      head: body.slice(0, 60).replace(/\s+/g, " "),
    };
  } catch (e) {
    return { status: null, error: e.message };
  }
}

// A publisher can expose Markdown through more than one channel. Besides Accept
// negotiation there is the `.md` URL-suffix convention popularised by Mintlify.
// A tool can obtain the publisher's Markdown through either, so a benchmark has
// to record which channel produced a given output.
async function probeMdSuffix(url) {
  const clean = url.replace(/[#?].*$/, "");
  if (clean.endsWith(".md") || clean.endsWith(".txt")) return { applicable: false };
  const candidate = clean.endsWith("/") ? `${clean}index.md` : `${clean}.md`;
  try {
    const resp = await fetch(candidate, { headers: { accept: HTML_ACCEPT }, redirect: "follow" });
    const body = await resp.text();
    const ct = resp.headers.get("content-type") || "";
    const isMarkdown = /markdown|text\/plain/i.test(ct) && !/^\s*<(!doctype|html)/i.test(body);
    return { applicable: true, candidate, status: resp.status, content_type: ct, bytes: body.length, serves_markdown: isMarkdown };
  } catch (e) {
    return { applicable: true, candidate, status: null, error: e.message, serves_markdown: false };
  }
}

const rows = [];
for (const t of TARGETS) {
  const asHtml = await probe(t.url, HTML_ACCEPT);
  await sleep(800);
  const asMd = await probe(t.url, MD_ACCEPT);
  await sleep(800);
  const mdSuffix = await probeMdSuffix(t.url);
  await sleep(800);

  const negotiates =
    !!asMd.content_type &&
    /markdown|text\/plain/i.test(asMd.content_type) &&
    !/markdown|text\/plain/i.test(asHtml.content_type || "");

  rows.push({
    ...t,
    as_html: asHtml,
    as_markdown: asMd,
    md_suffix: mdSuffix,
    serves_markdown_on_negotiation: negotiates,
    serves_markdown_on_suffix: !!mdSuffix.serves_markdown,
    publisher_markdown_available: negotiates || !!mdSuffix.serves_markdown,
  });
  console.log(
    `${t.slug.padEnd(12)} ${t.framework.padEnd(11)} ` +
      `html:${String(asHtml.bytes ?? 0).padEnd(8)} ` +
      `negotiation:${negotiates ? "YES" : "no "} ` +
      `.md-suffix:${mdSuffix.serves_markdown ? "YES" : "no "} ` +
      `${negotiates || mdSuffix.serves_markdown ? "<-- PUBLISHER MARKDOWN AVAILABLE" : ""}`,
  );
}

const yes = rows.filter((r) => r.publisher_markdown_available);
await mkdir(join(ROOT, "results"), { recursive: true });
await writeFile(
  join(ROOT, "results", "content-negotiation.json"),
  JSON.stringify(
    {
      run_date: new Date().toISOString(),
      html_accept: HTML_ACCEPT,
      markdown_accept: MD_ACCEPT,
      total: rows.length,
      serving_markdown_any_channel: yes.length,
      serving_markdown_via_negotiation: rows.filter((r) => r.serves_markdown_on_negotiation).length,
      serving_markdown_via_md_suffix: rows.filter((r) => r.serves_markdown_on_suffix).length,
      rows,
    },
    null,
    2,
  ),
  "utf8",
);

console.log(`\n${yes.length} of ${rows.length} sites expose publisher Markdown through at least one channel:`);
for (const r of yes) {
  const via = [
    r.serves_markdown_on_negotiation ? `Accept (${r.as_markdown.bytes}B)` : null,
    r.serves_markdown_on_suffix ? `.md suffix (${r.md_suffix.bytes}B)` : null,
  ]
    .filter(Boolean)
    .join(" + ");
  console.log(`  - ${r.slug} (${r.framework}): ${via}`);
}
console.log("\nWrote results/content-negotiation.json");
