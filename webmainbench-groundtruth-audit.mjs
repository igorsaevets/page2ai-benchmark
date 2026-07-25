// A descriptive audit of the WebMainBench 545-sample reference set.
//
// Why. On 2026-06-23 Adrien Barbaresi (adbar, maintainer of trafilatura) opened
// issue #71 on opendatalab/WebMainBench, "Issues with ground truth data". Among
// other points he wrote that links and images are not evaluated, that maths is
// absent from the references, that some references are truncated excerpts, and
// that edit distance favours brevity. As of 2026-07-25 the issue has no replies.
//
// Those are checkable claims. This script checks the ones that can be settled from
// the published file alone, with no modelling and no opinion: it counts what the
// reference documents actually contain.
//
// Scope and honesty. This measures the REFERENCE text only. It does not measure
// whether the reference is a correct rendering of the page, because the published
// 545-sample file does not carry the per-sample `main_html` needed to make that
// comparison (see the emptiness counters below, which is itself a finding). Nothing
// here is a claim that WebMainBench is a bad benchmark. It is a large, genuinely
// hand-annotated corpus, released openly under Apache-2.0, which is more than most
// projects in this area do. These counts are offered as evidence for a discussion
// its own maintainers and users are already having.
//
// No dataset text is redistributed. Only aggregate counts are written out.
//
// Input:  WebMainBench_545.jsonl from huggingface.co/datasets/opendatalab/WebMainBench
// Usage:  node webmainbench-groundtruth-audit.mjs /path/to/WebMainBench_545.jsonl

import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = process.argv[2];
if (!INPUT) {
  console.error("usage: node webmainbench-groundtruth-audit.mjs <WebMainBench_545.jsonl>");
  process.exit(1);
}

// Markdown constructs. Deliberately permissive: we want to avoid undercounting,
// because the interesting result is an ABSENCE and a lax detector makes an absence
// harder to claim, not easier.
// The negative lookbehind matters. An early version of this script counted 6 links,
// then inspection showed at least 4 of them were `![](<hash>)` image embeds. Images
// and hyperlinks are different claims and are counted separately here.
const MD_LINK = /(?<!!)\[[^\]\n]*\]\([^)\s]+/;
const MD_IMAGE = /!\[[^\]\n]*\]\([^)\s]*/;
const BARE_URL = /https?:\/\/\S+/;
const MD_TABLE_ROW = /^\s*\|.*\|\s*$/m;
const MATH_DELIM = /\$\$?[^$\n]+\$\$?|\\\(|\\\[|\\begin\{(equation|align|math)/;
const FENCE = /```[\s\S]*?```/g;
const HEADING = /^#{1,6}\s+\S/m;

// A fenced block that contains none of the characters that make text look like code,
// and does contain sentence punctuation, is more likely prose that was fenced by
// mistake than it is source code. Heuristic, reported as a heuristic.
function fenceLooksLikeProse(block) {
  const body = block.replace(/^```[^\n]*\n?/, "").replace(/```$/, "");
  if (body.trim().length < 40) return false;
  const codeish = /[{}<>;=]|\b(function|const|let|var|def|class|import|return|SELECT|public|void)\b|^\s*[$#>]\s/m;
  if (codeish.test(body)) return false;
  return /[.!?]\s/.test(body) || /^\s*-\s+\S/m.test(body);
}

const c = {
  total: 0,
  empty_main_html: 0,
  empty_convert_main_content: 0,
  empty_groundtruth: 0,
  with_link: 0,
  with_image: 0,
  with_bare_url: 0,
  with_table_row: 0,
  with_math: 0,
  with_heading: 0,
  with_fence: 0,
  with_prose_fence: 0,
  // meta-flagged subsets: the dataset labels which pages contain tables, equations, code.
  // These labels are ARRAYS of kinds, e.g. meta.table can be [], ["data"], ["layout"] or
  // ["data","layout"]. An early version of this script tested them as booleans and got
  // zero for every category. Recorded here because it changes every number below.
  meta_table: 0,
  meta_table_ref_has_table: 0,
  meta_layout_table: 0,
  meta_layout_table_ref_has_table: 0,
  meta_equation: 0,
  meta_equation_ref_has_math: 0,
  meta_code: 0,
  meta_code_ref_has_fence: 0,
};
const lengths = [];
const langs = new Map();

const rl = createInterface({ input: createReadStream(INPUT, { encoding: "utf8" }), crlfDelay: Infinity });

for await (const line of rl) {
  if (!line.trim()) continue;
  let r;
  try {
    r = JSON.parse(line);
  } catch {
    continue;
  }
  c.total++;

  const gt = r.groundtruth_content || "";
  if (!r.main_html) c.empty_main_html++;
  if (!r.convert_main_content) c.empty_convert_main_content++;
  if (!gt) c.empty_groundtruth++;
  lengths.push(gt.length);

  const lang = r.meta?.language || "unknown";
  langs.set(lang, (langs.get(lang) || 0) + 1);

  if (MD_LINK.test(gt)) c.with_link++;
  if (MD_IMAGE.test(gt)) c.with_image++;
  if (BARE_URL.test(gt)) c.with_bare_url++;
  if (MD_TABLE_ROW.test(gt)) c.with_table_row++;
  if (MATH_DELIM.test(gt)) c.with_math++;
  if (HEADING.test(gt)) c.with_heading++;

  const fences = gt.match(FENCE) || [];
  if (fences.length) c.with_fence++;
  if (fences.some(fenceLooksLikeProse)) c.with_prose_fence++;

  // The dataset's own labels give us a fair denominator. If a page is labelled as
  // containing a table, the reference for that page ought to contain a table.
  const m = r.meta || {};
  const kinds = (v) => (Array.isArray(v) ? v : v ? [String(v)] : []);
  const tableKinds = kinds(m.table);
  if (tableKinds.length) {
    c.meta_table++;
    if (MD_TABLE_ROW.test(gt)) c.meta_table_ref_has_table++;
  }
  // Barbaresi's point 3 is specifically about pages whose body sits inside a layout
  // table. The dataset labels those separately, so they get their own denominator.
  if (tableKinds.includes("layout")) {
    c.meta_layout_table++;
    if (MD_TABLE_ROW.test(gt)) c.meta_layout_table_ref_has_table++;
  }
  if (kinds(m.equation).length) {
    c.meta_equation++;
    if (MATH_DELIM.test(gt)) c.meta_equation_ref_has_math++;
  }
  if (kinds(m.code).length) {
    c.meta_code++;
    if (fences.length) c.meta_code_ref_has_fence++;
  }
}

lengths.sort((a, b) => a - b);
const pct = (n) => (c.total ? +((100 * n) / c.total).toFixed(1) : 0);
const q = (p) => lengths[Math.min(lengths.length - 1, Math.floor(p * lengths.length))] ?? 0;

const report = {
  run_date: new Date().toISOString(),
  input: INPUT.split(/[\\/]/).pop(),
  samples: c.total,
  field_availability: {
    note:
      "The repository README documents main_html and convert_main_content as 'available for all 7,809 samples'. In the published 545-sample file they are measured here.",
    main_html_empty: c.empty_main_html,
    convert_main_content_empty: c.empty_convert_main_content,
    groundtruth_content_empty: c.empty_groundtruth,
  },
  reference_length_chars: {
    min: lengths[0] ?? 0,
    p25: q(0.25),
    median: q(0.5),
    p75: q(0.75),
    max: lengths[lengths.length - 1] ?? 0,
  },
  constructs_present_in_reference: {
    markdown_link: { n: c.with_link, pct: pct(c.with_link) },
    markdown_image: { n: c.with_image, pct: pct(c.with_image) },
    bare_url_text: { n: c.with_bare_url, pct: pct(c.with_bare_url) },
    markdown_table_row: { n: c.with_table_row, pct: pct(c.with_table_row) },
    math_delimiter: { n: c.with_math, pct: pct(c.with_math) },
    heading: { n: c.with_heading, pct: pct(c.with_heading) },
    fenced_block: { n: c.with_fence, pct: pct(c.with_fence) },
    fenced_block_that_looks_like_prose: {
      n: c.with_prose_fence,
      pct: pct(c.with_prose_fence),
      note: "heuristic, see fenceLooksLikeProse() in the script",
    },
  },
  label_vs_reference: {
    note:
      "Denominator is the dataset's own meta label for that page. meta.table, meta.equation and meta.code are arrays of kinds, not booleans.",
    pages_labelled_table: c.meta_table,
    of_which_reference_contains_a_table: c.meta_table_ref_has_table,
    pages_labelled_layout_table: c.meta_layout_table,
    of_which_layout_reference_contains_a_table: c.meta_layout_table_ref_has_table,
    pages_labelled_equation: c.meta_equation,
    of_which_reference_contains_math: c.meta_equation_ref_has_math,
    pages_labelled_code: c.meta_code,
    of_which_reference_contains_a_fence: c.meta_code_ref_has_fence,
  },
  languages_top10: [...langs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
};

await mkdir(join(__dirname, "results"), { recursive: true });
await writeFile(join(__dirname, "results", "webmainbench-groundtruth-audit.json"), JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify(report, null, 2));
console.log("\nWrote results/webmainbench-groundtruth-audit.json");
