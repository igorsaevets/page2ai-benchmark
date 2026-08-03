// CORPUS_SELECTION.md section 1: capture the four candidate-pool sources. Runs inside the public
// GitHub Actions workflow (.github/workflows/corpus-pool.yml) so the authoritative timestamp is
// the CI run's. This script only CAPTURES - it does not decide inclusion (section 2) and it does
// not commit: the pool snapshot and the inclusion log must land in ONE commit, so the commit is
// made by the author together with the written F1/F2/F3 decisions, referencing the CI run id.
//
// Output (into corpus-selection/capture-out/):
//   pool-<UTC date>.json       - normalized candidates from all four sources + G, with SHA-256 of
//                                every raw body it was parsed from
//   raw/q3-jamstack.html       - verbatim body of jamstack.org/generators
//   raw/q4-w3techs.html        - verbatim body of the W3Techs documentation-platforms page
//   raw/q1-github.json, raw/q2-github.json - verbatim GitHub search API responses
//
// No cap, no filtering here: the union can only add candidates.

import fs from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "capture-out");
const RAW = join(OUT, "raw");
fs.mkdirSync(RAW, { recursive: true });

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const UA = "page2ai-benchmark corpus-pool capture (github.com/igorsaevets/page2ai-benchmark)";

const ghHeaders = { "User-Agent": UA, Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) ghHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function ghSearch(topic, file) {
  const url = `https://api.github.com/search/repositories?q=topic:${topic}&sort=stars&order=desc&per_page=50`;
  const res = await fetch(url, { headers: ghHeaders });
  if (!res.ok) throw new Error(`GitHub search ${topic}: HTTP ${res.status}`);
  const text = await res.text();
  fs.writeFileSync(join(RAW, file), text, "utf8");
  const data = JSON.parse(text);
  return {
    raw_sha256: sha256(text),
    total_count: data.total_count,
    candidates: data.items.map((r) => ({
      name: r.full_name,
      stars: r.stargazers_count,
      description: (r.description || "").slice(0, 200),
      homepage: r.homepage || null,
      topics: r.topics || [],
    })),
  };
}

async function fetchRaw(url, file) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9" },
    redirect: "follow",
  });
  const text = await res.text();
  fs.writeFileSync(join(RAW, file), text, "utf8");
  return { status: res.status, final_url: res.url, raw_sha256: sha256(text), text };
}

// Q3: every generator listed on jamstack.org/generators. Each generator links to
// /generators/<slug>/; the slug IS the identity. Smoke-tested 2026-08-03 against the live page:
// a fancier regex that also demanded the card's inner HTML matched nothing, so this one asks
// only for the hrefs and lets the committed raw bytes settle any naming dispute.
function parseJamstack(html) {
  const seen = new Set();
  const re = /href="\/generators\/([a-z0-9-]+)\/"/gi;
  let m;
  while ((m = re.exec(html))) seen.add(m[1]);
  return [...seen].map((slug) => ({ slug }));
}

// Q4: W3Techs documentation platforms. The category lives at
// /technologies/subdetails/documentation - a SUBcategory of Content Management, not a top-level
// category, which is why a first draft of this function probed /overview/documentation, got a
// 404, cross-checked the top-level index, and wrongly concluded the category did not exist.
// Two review arms rubber-stamped that absence; a third (Codex) found the real page and it lists
// ~12 platforms (GitBook, Docusaurus, Mintlify, MkDocs, Sphinx, Antora, DocFX...), exactly as
// the selection rule's prose said. Kept as a comment because "my probe 404'd" is not evidence
// of absence, and this file nearly shipped that mistake into the pool.
// Details links on the page are ABSOLUTE URLs of the form
// https://w3techs.com/technologies/details/cm-<slug>.
async function captureQ4() {
  const url = "https://w3techs.com/technologies/subdetails/documentation";
  const page = await fetchRaw(url, "q4-w3techs.html");
  const seen = new Map();
  const re = /href=["']https?:\/\/w3techs\.com\/technologies\/details\/([a-z0-9_-]+)["'][^>]*>([^<]{0,60})/gi;
  let m;
  while ((m = re.exec(page.text))) {
    if (!seen.has(m[1])) seen.set(m[1], m[2].trim() || m[1]);
  }
  if (page.status === 200 && seen.size) {
    return {
      url,
      status: page.status,
      raw_sha256: page.raw_sha256,
      candidates: [...seen.entries()].map(([id, label]) => ({ id, label })),
    };
  }
  // Fallback: if the page moves or empties, record the absence WITH evidence bytes rather than
  // failing silently - and the FATAL guard below still refuses a pool where this branch fired
  // without an explicit absent flag being justified by a non-200 status.
  return {
    url,
    status: page.status,
    absent: page.status !== 200,
    evidence: { attempt_sha256: page.raw_sha256 },
    candidates: [],
  };
}

const utcDate = new Date().toISOString().slice(0, 10);
console.log(`[pool] capture starting, UTC date ${utcDate}`);

const q1 = await ghSearch("documentation", "q1-github.json");
console.log(`[pool] Q1 topic:documentation           top ${q1.candidates.length} of ${q1.total_count}`);
const q2 = await ghSearch("static-site-generator", "q2-github.json");
console.log(`[pool] Q2 topic:static-site-generator   top ${q2.candidates.length} of ${q2.total_count}`);

const j = await fetchRaw("https://jamstack.org/generators/", "q3-jamstack.html");
const q3 = { status: j.status, final_url: j.final_url, raw_sha256: j.raw_sha256, candidates: parseJamstack(j.text) };
console.log(`[pool] Q3 jamstack.org/generators       HTTP ${q3.status}, ${q3.candidates.length} generators parsed`);
// 372 parsed at smoke time; a sudden collapse means the markup changed under the regex, and a
// "complete" pool that silently lost most of a source is worse than a loud warning.
if (q3.candidates.length > 0 && q3.candidates.length < 100) {
  console.warn(`[pool] WARNING: Q3 parsed only ${q3.candidates.length} generators (was ~372) - markup may have changed; the raw bytes are committed for re-parsing.`);
}

const q4 = await captureQ4();
console.log(`[pool] Q4 w3techs documentation         HTTP ${q4.status}${q4.absent ? " - category ABSENT, evidence recorded" : `, ${q4.candidates.length} platforms parsed`}`);

// G: the frameworks already present in the v0.2 corpus (grandfather set).
const index = JSON.parse(fs.readFileSync(join(HERE, "..", "corpus", "index.json"), "utf8"));
const g = [...new Set(index.sites.map((s) => s.framework))];
console.log(`[pool] G  v0.2 grandfather set          ${g.length} frameworks`);

const pool = {
  captured_at: new Date().toISOString(),
  utc_date: utcDate,
  ci: {
    run_id: process.env.GITHUB_RUN_ID || null,
    run_attempt: process.env.GITHUB_RUN_ATTEMPT || null,
    repository: process.env.GITHUB_REPOSITORY || null,
    sha: process.env.GITHUB_SHA || null,
  },
  rule: "CORPUS_SELECTION.md section 1 (commit 1adb4c4); capture bound to the first UTC day after that commit",
  sources: { q1, q2, q3, q4, g },
};

// A source that parses to zero candidates is a broken instrument, not an empty source - fail
// loudly rather than committing a pool that silently lost a whole source.
const broken = [];
if (!q1.candidates.length) broken.push("Q1");
if (!q2.candidates.length) broken.push("Q2");
if (!q3.candidates.length) broken.push("Q3 (jamstack parse)");
// Q4 empty is legitimate ONLY as a recorded absence with evidence; empty without evidence is
// an instrument failure like the others.
if (!q4.candidates.length && !q4.absent) broken.push("Q4 (w3techs parse)");
if (broken.length) {
  console.error(`[pool] FATAL: zero candidates from ${broken.join(", ")} - parser or source broke; refusing to write a partial pool.`);
  process.exit(1);
}

const poolPath = join(OUT, `pool-${utcDate}.json`);
fs.writeFileSync(poolPath, JSON.stringify(pool, null, 2), "utf8");
console.log(`[pool] wrote ${poolPath} (sha256 ${sha256(fs.readFileSync(poolPath))})`);
