// Shared helpers for protocol v0.2. Normalisation lives here so that ground truth and
// scoring cannot drift apart: both import the same two functions.

import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..");
export const CORPUS = join(ROOT, "corpus");
export const RESULTS = join(ROOT, "results-v2");

/** Lowercase, collapse every run of non-alphanumerics to one space. For prose and headings. */
export const squeeze = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

/** Strip ALL whitespace. For code, which every converter re-indents. */
export const stripWs = (s) => String(s).replace(/\s+/g, "");

/**
 * Amendment 7: remove markdown link/image TARGETS, keep the display text. `[text](url)` -> text.
 * Bare URLs and <autolinks> are NOT touched - they are visible text. Applied before squeeze() in
 * the prose/heading/boilerplate matchers; never in code matching.
 *
 * The hiding-channel safeguard (named in the amendment): a target that does not LOOK like a
 * URL, path or fragment is kept as text rather than stripped. Without this, a tool could park
 * leaked chrome strings inside `[x](leaked sidebar text)` and the leak matcher would never see
 * them. A real URL slug still strips (the vacuous-match fix); free text in target position
 * stays matchable.
 */
const urlishTarget = (t) => {
  const s = String(t).trim();
  if (s === "") return true;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/|\.{1,2}\/|#|\?)/i.test(s)) return true;   // scheme, absolute or relative path, fragment, query
  return /^[^\s()]+$/.test(s) && /[./]/.test(s);                           // bare host-ish token like example.com or docs/page
};
export const stripLinkTargets = (md) =>
  String(md)
    .replace(/!\[([^\]]*)\]\(([^)]*)\)/g, (m, text, target) => (urlishTarget(target) ? text : `${text} ${target}`))
    .replace(/\[([^\]]*)\]\(([^)]*)\)/g, (m, text, target) => (urlishTarget(target) ? text : `${text} ${target}`));

export const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/**
 * Byte ranges of fenced code regions in a Markdown string, as whitespace-stripped
 * concatenations, so that "is this code inside a fence" can be asked with stripWs matching.
 */
export function fencedRegions(md) {
  const out = [];
  const lines = md.split(/\r?\n/);
  let open = null;
  let buf = [];
  for (const line of lines) {
    const m = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (m && open === null) {
      open = m[1][0].repeat(3);
      buf = [];
      continue;
    }
    if (m && open !== null) {
      out.push(stripWs(buf.join("\n")));
      open = null;
      buf = [];
      continue;
    }
    if (open !== null) buf.push(line);
  }
  if (open !== null && buf.length) out.push(stripWs(buf.join("\n")));
  return out;
}

/** Language tags on fence openers: returns [total fences, fences with a language]. */
export function fenceLangStats(md) {
  const openers = md.match(/^\s{0,3}(?:`{3,}|~{3,})([^\n]*)$/gm) || [];
  // openers alternate open/close; treat any opener carrying a word as a labelled open
  let total = 0;
  let labelled = 0;
  let open = false;
  for (const o of openers) {
    const info = o.replace(/^\s{0,3}(?:`{3,}|~{3,})/, "").trim();
    if (!open) {
      total += 1;
      if (/^[A-Za-z0-9][\w+#.-]*/.test(info)) labelled += 1;
      open = true;
    } else {
      open = false;
    }
  }
  return { fences: total, fences_labelled: labelled };
}

export const round = (n, d = 4) =>
  Number.isFinite(n) ? Number(n.toFixed(d)) : null;

export function harmonic(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (a + b === 0) return 0;
  return (2 * a * b) / (a + b);
}
