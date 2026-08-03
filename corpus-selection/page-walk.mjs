// CORPUS_SELECTION.md section 3: THE NORMATIVE PAGE WALK. Where the prose in that document and
// this script disagree, THIS SCRIPT GOVERNS. It is committed before any walk runs; every fetch
// it performs is logged with URL, timestamp, HTTP status, final URL, SHA-256 of the body and the
// gate numbers, and the later corpus commit may only add page.html files whose SHA-256 already
// appears in that log.
//
// Input:  corpus-selection/landing-urls.json - the resolved landing URL per surviving framework,
//         committed BEFORE this script runs (the landing-page definition and any logged
//         ambiguity decisions live there).
// Output: corpus-selection/page-walk.md (human log, appended per framework)
//         corpus-selection/page-walk.json (machine log, one record per fetch)
//
// Usage:  node corpus-selection/page-walk.mjs [framework-slug ...]
//
// The F3 gate below MUST stay numerically identical to protocol-v2/groundtruth.mjs
// (MIN_CODE_CHARS 24, MIN_HEADING_CHARS 3, USABLE_MIN_CODE 3, USABLE_MIN_HEADINGS 5, dedup,
// content root = main | article | [role=main] | body). Those thresholds predate the selection
// rule and are reused unchanged so they cannot be tuned here.

import fs from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const HERE = dirname(fileURLToPath(import.meta.url));
const sitesCfg = JSON.parse(fs.readFileSync(join(HERE, "..", "protocol-v2", "sites.json"), "utf8"));
const HEADERS = {
  Accept: sitesCfg.accept,
  "User-Agent": sitesCfg.user_agent,
  "Accept-Language": "en-US,en;q=0.9",
};

const MIN_CODE_CHARS = 24;
const MIN_HEADING_CHARS = 3;
const USABLE_MIN_CODE = 3;
const USABLE_MIN_HEADINGS = 5;

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const stripWs = (s) => String(s).replace(/\s+/g, "");
const squeeze = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fetchLog = [];
async function loggedFetch(url, purpose) {
  const started = new Date().toISOString();
  let status = 0;
  let finalUrl = url;
  let body = "";
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
    status = res.status;
    finalUrl = res.url;
    body = await res.text();
  } catch (e) {
    fetchLog.push({ url, purpose, ts: started, status: 0, final_url: null, sha256: null, error: String(e.message || e) });
    return null;
  }
  const rec = { url, purpose, ts: started, status, final_url: finalUrl, sha256: sha256(body), bytes: body.length };
  fetchLog.push(rec);
  return { ...rec, body };
}

function gate(html, url) {
  const doc = new JSDOM(html, { url }).window.document;
  for (const el of doc.querySelectorAll("script, style, noscript, template, svg")) el.remove();
  const root =
    doc.querySelector("main") || doc.querySelector("article") || doc.querySelector("[role=main]") || doc.body;
  const codeSeen = new Set();
  for (const pre of root.querySelectorAll("pre")) {
    const s = stripWs(pre.textContent || "");
    if (s.length >= MIN_CODE_CHARS) codeSeen.add(s);
  }
  const headSeen = new Set();
  for (const h of root.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
    const s = squeeze(h.textContent || "");
    if (s.length >= MIN_HEADING_CHARS) headSeen.add(s);
  }
  return {
    code_blocks: codeSeen.size,
    headings: headSeen.size,
    passes: codeSeen.size >= USABLE_MIN_CODE || headSeen.size >= USABLE_MIN_HEADINGS,
    content_root: root.tagName ? root.tagName.toLowerCase() : "body",
  };
}

// The navigation container: first <nav> or [role=navigation] in DOM order holding at least 5
// qualifying same-origin documentation links - preferring a container that is NOT inside the
// page header (<header> or [role=banner]) over one that is, and skipping breadcrumb navs.
function collectNavLinks(doc, origin, landingHref) {
  const navs = [...doc.querySelectorAll("nav, [role=navigation]")].filter(
    (n) => !/breadcrumb/i.test(n.getAttribute("aria-label") || ""),
  );
  const qualify = (nav) => {
    const seen = new Set();
    const links = [];
    for (const a of nav.querySelectorAll("a[href]")) {
      const rel = (a.getAttribute("rel") || "").toLowerCase();
      if (rel.includes("prev") || rel.includes("next") || rel.includes("external")) continue;
      const raw = a.getAttribute("href") || "";
      if (raw.startsWith("#")) continue; // in-page TOC entry
      let u;
      try {
        u = new URL(raw, landingHref);
      } catch {
        continue;
      }
      if (u.origin !== origin) continue; // external
      u.hash = ""; // strip fragments
      // Trailing-slash normalisation: /docs and /docs/ are the same page to every server in
      // this corpus, and comparing them raw made the walk revisit its own landing page.
      const href = u.href.replace(/\/$/, "");
      if (href === landingHref.replace(/\/$/, "")) continue;
      if (seen.has(href)) continue;
      seen.add(href);
      links.push(u.href);
    }
    return links;
  };
  const candidates = navs
    .map((nav) => ({
      nav,
      inHeader: !!(nav.closest && (nav.closest("header") || nav.closest("[role=banner]"))),
      links: qualify(nav),
    }))
    .filter((c) => c.links.length >= 5);
  if (!candidates.length) return [];
  // "Preferring a sidebar container over the page header": among non-header candidates the
  // LARGEST qualifying nav is the sidebar - a related-links nav qualifies with 5-6 links, a
  // docs sidebar with dozens. Ties resolve in DOM order (sort is stable).
  const nonHeader = candidates.filter((c) => !c.inHeader);
  const pool = nonHeader.length ? nonHeader : candidates;
  pool.sort((a, b) => b.links.length - a.links.length);
  return pool[0].links;
}

const input = JSON.parse(fs.readFileSync(join(HERE, "landing-urls.json"), "utf8"));
const only = process.argv.slice(2);
const results = [];

for (const fw of input.frameworks) {
  if (only.length && !only.includes(fw.slug)) continue;
  console.log(`[walk] ${fw.slug}: landing ${fw.landing_url}`);
  const landing = await loggedFetch(fw.landing_url, `${fw.slug}: landing`);
  if (!landing || landing.status >= 400) {
    results.push({ slug: fw.slug, ok: false, reason: `landing fetch failed (${landing ? landing.status : "network"})` });
    continue;
  }
  const landingGate = gate(landing.body, landing.final_url);
  // The landing page itself is eligible first: it is position zero of the DOM-order visit.
  if (landingGate.passes) {
    results.push({ slug: fw.slug, ok: true, target: landing.final_url, target_sha256: landing.sha256, gate: landingGate, visited: 1 });
    console.log(`[walk] ${fw.slug}: landing itself passes (code=${landingGate.code_blocks}, head=${landingGate.headings})`);
    continue;
  }
  const doc = new JSDOM(landing.body, { url: landing.final_url }).window.document;
  const origin = new URL(landing.final_url).origin;
  const links = collectNavLinks(doc, origin, landing.final_url);
  if (!links.length) {
    results.push({ slug: fw.slug, ok: false, reason: "no navigation container with >=5 same-origin links", gate: landingGate });
    continue;
  }
  let found = null;
  let visited = 1;
  for (const href of links) {
    await sleep(300);
    const page = await loggedFetch(href, `${fw.slug}: walk`);
    visited += 1;
    if (!page || page.status >= 400) continue;
    const g = gate(page.body, page.final_url);
    fetchLog[fetchLog.length - 1].gate = g;
    console.log(`[walk] ${fw.slug}:   ${href} -> code=${g.code_blocks} head=${g.headings} ${g.passes ? "PASS" : ""}`);
    if (g.passes) {
      found = { href: page.final_url, sha256: page.sha256, gate: g };
      break;
    }
  }
  if (found) results.push({ slug: fw.slug, ok: true, target: found.href, target_sha256: found.sha256, gate: found.gate, visited });
  else results.push({ slug: fw.slug, ok: false, reason: `no page passed the gate after ${visited} fetches` });
}

// Persist the machine log (full fetch list) and append the human log.
const jsonPath = join(HERE, "page-walk.json");
const prev = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf8")) : { runs: [] };
prev.runs.push({ ran_at: new Date().toISOString(), results, fetches: fetchLog });
fs.writeFileSync(jsonPath, JSON.stringify(prev, null, 2), "utf8");

const mdPath = join(HERE, "page-walk.md");
const lines = [fs.existsSync(mdPath) ? "" : "# Page-walk discovery log\n\nEvery fetch the normative walk performed. The corpus commit may only add `page.html` files whose SHA-256 appears here.\n"];
lines.push(`\n## Run ${new Date().toISOString()}\n`);
for (const r of results) {
  lines.push(r.ok
    ? `- **${r.slug}** -> \`${r.target}\` (sha256 \`${r.target_sha256}\`, code=${r.gate.code_blocks}, headings=${r.gate.headings}, fetches=${r.visited})`
    : `- **${r.slug}** -> FAILED: ${r.reason}`);
}
lines.push(`\n### Fetches\n`);
for (const f of fetchLog) {
  lines.push(`- ${f.ts} \`${f.url}\` -> ${f.status} ${f.final_url ? `\`${f.final_url}\`` : ""} ${f.sha256 ? `sha256 \`${f.sha256}\`` : ""}${f.gate ? ` gate code=${f.gate.code_blocks} head=${f.gate.headings}` : ""}${f.error ? ` ERROR ${f.error}` : ""}`);
}
fs.appendFileSync(mdPath, lines.join("\n") + "\n", "utf8");
console.log(`[walk] ${results.filter((r) => r.ok).length}/${results.length} frameworks resolved; ${fetchLog.length} fetches logged.`);
