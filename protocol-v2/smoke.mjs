// Stage 3.5 (offline). Peer-median smoke check over results-v2/extract-manifest.json.
// Catches silent degradations: a tool whose output on a page falls far below its peers
// (defuddle crash swallowed by its retries; markitdown ModuleNotFoundError that still
// writes bytes=0; a renderer that misses only one page). Prints a loud summary and
// EXITS 1 so the pipeline halts before `score.mjs` writes a misleading leaderboard.
//
// Thresholds are peer-relative on purpose: tool-vs-tool on the SAME page, not against
// a historic baseline, so a renaissance in one tool does not false-positive a peer.
//   - "crash" = manifest row has `error` set (the extract wrapper threw synchronously).
//   - "silent-empty" = bytes === 0 and no error (the row looks like a success but holds nothing).
//   - "silent-degradation" = bytes < max(100, 0.20 * peer_median) on a page where
//                            at least 3 tools produced non-empty output.
// Only `silent-degradation` is hard-fail by default: it is the one that would mislead
// a human reading the leaderboard. `crash` + `silent-empty` are logged but allowed
// through — they show up as 0 in the report, visible on inspection, and some tools
// legitimately fail on some pages (e.g. markitdown's Python module missing in dev
// envs is tracked separately as P-2, not this harness's job to block).
//
// Env knobs:
//   BENCH_SMOKE_RATIO    peer-median multiplier (default 0.20)
//   BENCH_SMOKE_MIN      absolute floor in bytes (default 100)
//   BENCH_SMOKE_SOFT=1   print findings but do NOT exit 1 (opt-in: ad-hoc re-runs)
//   BENCH_SMOKE_STRICT=1 ALSO hard-fail on crash and silent-empty (CI gate)

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { RESULTS } from "./lib.mjs";

const RATIO = Number(process.env.BENCH_SMOKE_RATIO) || 0.20;
const MIN_BYTES = Number(process.env.BENCH_SMOKE_MIN) || 100;
const SOFT = process.env.BENCH_SMOKE_SOFT === "1";
const STRICT = process.env.BENCH_SMOKE_STRICT === "1";

const manifest = JSON.parse(await readFile(join(RESULTS, "extract-manifest.json"), "utf8"));

function median(nums) {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

const bySlug = new Map();
for (const row of manifest) {
  if (!bySlug.has(row.slug)) bySlug.set(row.slug, []);
  bySlug.get(row.slug).push(row);
}

const crashes = [];
const silentEmpty = [];
const silentDegradation = [];

for (const [slug, rows] of bySlug) {
  const okBytes = rows.filter((r) => !r.error && r.bytes > 0).map((r) => r.bytes);
  const med = median(okBytes);
  const threshold = Math.max(MIN_BYTES, Math.round(med * RATIO));
  for (const row of rows) {
    if (row.error) {
      crashes.push({ slug, tool: row.tool, err: row.error });
      continue;
    }
    if (row.bytes === 0) {
      silentEmpty.push({ slug, tool: row.tool });
      continue;
    }
    if (okBytes.length >= 3 && row.bytes < threshold) {
      silentDegradation.push({ slug, tool: row.tool, bytes: row.bytes, median: med, threshold });
    }
  }
}

const total = crashes.length + silentEmpty.length + silentDegradation.length;
console.log(`[smoke] ratio=${RATIO}, floor=${MIN_BYTES} B, rows=${manifest.length}, pages=${bySlug.size}`);

if (crashes.length) {
  console.log("[smoke] crashes (manifest.error set — the extract wrapper threw):");
  for (const r of crashes) console.log(`  ${r.slug.padEnd(22)} ${r.tool.padEnd(22)} ${r.err.slice(0, 120)}`);
}
if (silentEmpty.length) {
  console.log("[smoke] silent-empty (bytes=0, no thrown error — tool wrote nothing):");
  for (const r of silentEmpty) console.log(`  ${r.slug.padEnd(22)} ${r.tool.padEnd(22)} 0 B`);
}
if (silentDegradation.length) {
  console.log(`[smoke] silent-degradation (bytes < ${Math.round(RATIO * 100)}% of peer-median):`);
  for (const r of silentDegradation) {
    console.log(
      `  ${r.slug.padEnd(22)} ${r.tool.padEnd(22)} ${String(r.bytes).padStart(7)} B ` +
        `vs median ${String(r.median).padStart(7)} B (threshold ${r.threshold} B)`
    );
  }
}

if (total === 0) {
  console.log("[smoke] OK — no silent degradations detected.");
  process.exit(0);
}

const hardFailCount = silentDegradation.length + (STRICT ? crashes.length + silentEmpty.length : 0);
if (SOFT || hardFailCount === 0) {
  console.log(`[smoke] ${total} finding(s). ${SOFT ? "SOFT mode" : "non-blocking findings only"}: not failing.`);
  process.exit(0);
}

console.log(`[smoke] ${hardFailCount} blocking finding(s). FAILING the pipeline (BENCH_SMOKE_SOFT=1 to override).`);
process.exit(1);
