// Which real extraction tools silently receive the publisher's Markdown?
//
// Background. A tool that converts a URL to Markdown has to fetch the page first.
// The Accept header it sends on that fetch is usually an implementation detail
// nobody documents. On a growing set of sites it decides what the tool receives:
// HTML that must be converted, or the publisher's own finished Markdown.
//
// This script does not test the tools. It tests the HEADERS the tools send. Each
// profile below is a verbatim default Accept header taken from a tool's source,
// or a well-known library/browser default. Every site is fetched once per profile
// and we record what came back.
//
// Why this is not a leaderboard. Receiving the publisher's Markdown is usually the
// BEST thing a tool can do: on docs.anthropic.com it replaces 954,900 bytes of HTML
// with 20,535 bytes of clean Markdown. The problem is not the behaviour. The problem
// is that it is invisible, undocumented, and it silently removes the conversion step
// that a conversion benchmark believes it is measuring. Two tools compared on such a
// site can be ranked entirely by a header neither author thought about.
//
// Provenance of each header, so a reader can check:
//
//   markitdown        microsoft/markitdown, packages/markitdown/src/markitdown/
//                     _markitdown.py -> "Accept": "text/markdown, text/html;q=0.9,
//                     text/plain;q=0.8, */*;q=0.1".  READ FROM SOURCE 2026-07-25.
//   page2ai-core      igorsaevets/page2ai-core, src/node/index.ts.  OWN SOURCE.
//   trafilatura       adbar/trafilatura, trafilatura/downloads.py ->
//                     DEFAULT_HEADERS = urllib3.util.make_headers(accept_encoding=True)
//                     plus a User-Agent. No Accept key is set at all, so urllib3 sends
//                     none.  READ FROM SOURCE 2026-07-25.
//   requests-default  Python `requests` sends `*/*`. This is what any plain
//                     requests.get() scraper sends, including WebMainBench's
//                     jina_extractor.py.  LIBRARY DEFAULT.
//   curl-default      curl sends `*/*`.  Kept separate from requests-default because
//                     they are different tools that happen to agree.  LIBRARY DEFAULT.
//   node-fetch        Node 18+ global fetch (undici) with no headers set.
//                     LIBRARY DEFAULT, measured by this script itself.
//   chromium-browser  The Accept header Chromium sends for a top-level navigation.
//                     Any tool that fetches through Playwright or a headless browser
//                     inherits it unless it overrides.  BROWSER DEFAULT, not attributed
//                     to any specific tool here because tools may override it.
//
// Ethics note, deliberate. fumadocs.dev is EXCLUDED from this matrix. It serves
// `content-type: text/markdown` under Accept negotiation on a `public` cache-control
// response and does NOT declare `Vary: Accept` (see vary-check.mjs). Sending it a
// spread of Accept values risks an intermediary caching the Markdown representation
// and later serving it to a client that asked for HTML. Its behaviour is already
// documented by repro-accept.mjs, which needs two requests, not fourteen. It is
// counted in the totals in RETRACTION-2026-07-25.md and not re-measured here.
//
// One request per (site, profile). Sequential, spaced, read-only, public docs pages.
//
// Usage: node tool-accept-matrix.mjs

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

const NO_HEADER = Symbol("no accept header sent");

const PROFILES = [
  {
    id: "markitdown",
    label: "microsoft/markitdown",
    accept: "text/markdown, text/html;q=0.9, text/plain;q=0.8, */*;q=0.1",
    provenance: "read from source 2026-07-25",
  },
  {
    id: "page2ai-core",
    label: "@page2ai/core",
    accept: "text/html,text/markdown,text/plain,application/xhtml+xml,*/*;q=0.5",
    provenance: "own source",
  },
  {
    id: "trafilatura",
    label: "trafilatura",
    accept: NO_HEADER,
    provenance: "read from source 2026-07-25, sets no Accept key",
  },
  {
    id: "requests-default",
    label: "python-requests default",
    accept: "*/*",
    provenance: "library default",
  },
  {
    id: "curl-default",
    label: "curl default",
    accept: "*/*",
    provenance: "library default",
  },
  {
    id: "node-fetch",
    label: "node fetch (undici) default",
    accept: NO_HEADER,
    provenance: "library default",
  },
  {
    id: "chromium-browser",
    label: "Chromium navigation default",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    provenance: "browser default, not attributed to a specific tool",
  },
];

// Same corpus as content-negotiation-survey.mjs, minus fumadocs (see ethics note).
const TARGETS = [
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

const looksLikeHtml = (s) => /^\s*<(!doctype|html)\b/i.test(s);

async function probe(url, accept) {
  const headers = accept === NO_HEADER ? {} : { accept };
  try {
    const resp = await fetch(url, { headers, redirect: "follow" });
    const body = await resp.text();
    const ct = resp.headers.get("content-type") || "";
    return {
      status: resp.status,
      content_type: ct,
      vary: resp.headers.get("vary"),
      bytes: body.length,
      // The decisive test. A markdown content-type whose body is not HTML means
      // the server handed over a finished document and no conversion is needed.
      served_markdown: /markdown/i.test(ct) && !looksLikeHtml(body),
      head: body.slice(0, 70).replace(/\s+/g, " "),
    };
  } catch (e) {
    return { status: null, error: e.message, served_markdown: false };
  }
}

const results = [];
for (const t of TARGETS) {
  const row = { ...t, by_profile: {} };
  for (const p of PROFILES) {
    row.by_profile[p.id] = await probe(t.url, p.accept);
    await sleep(700);
  }
  const hits = PROFILES.filter((p) => row.by_profile[p.id].served_markdown).map((p) => p.id);
  row.profiles_receiving_markdown = hits;
  results.push(row);
  console.log(
    `${t.slug.padEnd(11)} ${hits.length ? "MARKDOWN to: " + hits.join(", ") : "html to every profile"}`,
  );
}

// Per-profile totals: how many sites hand this header profile finished Markdown.
const perProfile = PROFILES.map((p) => {
  const sites = results.filter((r) => r.by_profile[p.id].served_markdown).map((r) => r.slug);
  return {
    id: p.id,
    label: p.label,
    accept: p.accept === NO_HEADER ? null : p.accept,
    provenance: p.provenance,
    sites_serving_markdown: sites.length,
    sites: sites,
  };
});

// The effect size that matters: on a site that negotiates, how much smaller is the
// Markdown than the HTML the other tools have to parse? A tool receiving the small
// document is doing a different job from a tool receiving the large one.
const effect = results
  .filter((r) => r.profiles_receiving_markdown.length > 0)
  .map((r) => {
    const mdProfile = r.profiles_receiving_markdown[0];
    const htmlProfile = PROFILES.find((p) => !r.by_profile[p.id].served_markdown && r.by_profile[p.id].bytes);
    return {
      slug: r.slug,
      markdown_bytes: r.by_profile[mdProfile].bytes,
      html_bytes: htmlProfile ? r.by_profile[htmlProfile.id].bytes : null,
      ratio:
        htmlProfile && r.by_profile[mdProfile].bytes
          ? +(r.by_profile[htmlProfile.id].bytes / r.by_profile[mdProfile].bytes).toFixed(1)
          : null,
      vary_declared: r.by_profile[mdProfile].vary,
    };
  });

await mkdir(join(ROOT, "results"), { recursive: true });
await writeFile(
  join(ROOT, "results", "tool-accept-matrix.json"),
  JSON.stringify(
    {
      run_date: new Date().toISOString(),
      note:
        "Header profiles, not tool runs. fumadocs.dev deliberately excluded, see the ethics note at the top of tool-accept-matrix.mjs.",
      sites: TARGETS.length,
      profiles: perProfile,
      effect_size: effect,
      rows: results,
    },
    null,
    2,
  ),
  "utf8",
);

console.log("\nPer header profile, sites that returned finished Markdown:");
for (const p of perProfile) {
  console.log(
    `  ${p.label.padEnd(30)} ${String(p.sites_serving_markdown).padStart(2)} / ${TARGETS.length}` +
      (p.sites.length ? `  (${p.sites.join(", ")})` : ""),
  );
}
console.log("\nEffect size where negotiation happened (HTML bytes / Markdown bytes):");
for (const e of effect) {
  console.log(
    `  ${e.slug.padEnd(11)} md=${String(e.markdown_bytes).padEnd(7)} html=${String(e.html_bytes).padEnd(8)} ratio=${e.ratio}x  vary=${e.vary_declared ?? "NOT DECLARED"}`,
  );
}
console.log("\nWrote results/tool-accept-matrix.json");
