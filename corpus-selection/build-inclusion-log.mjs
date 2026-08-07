// CORPUS_SELECTION.md section 2, executable form.
//
// The rule says every candidate in the pool must appear in inclusion-log.md with an IN or OUT
// and a one-line reason, committed in the same commit as the pool. It also says F1 is a judgment
// at the margin and that the margin defaults to IN. Prose cannot be audited line by line across
// ~480 candidates, so the judgment is written as code and committed with the log it produces:
// the taxonomy below IS the F1 taxonomy, and every verdict prints the token that triggered it.
// Where this script and the prose disagree, the prose in CORPUS_SELECTION.md section 2 governs
// and this file is the bug - the same direction of authority PROTOCOL.md uses for metrics.
//
// Input is the CI capture only. Nothing here fetches anything: Q3's names, descriptions and star
// counts are re-parsed out of the SAME captured bytes whose sha256 the pool file records, which
// is why the hash check below is fatal rather than advisory. Enriching from a fresh fetch would
// silently move the snapshot date the rule spent a whole section pinning down.
//
// Usage: node corpus-selection/build-inclusion-log.mjs <capture-dir>

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const captureDir = process.argv[2];
if (!captureDir) {
  console.error("usage: node build-inclusion-log.mjs <capture-dir>");
  process.exit(1);
}

const poolFile = fs.readdirSync(captureDir).find((f) => /^pool-\d{4}-\d{2}-\d{2}\.json$/.test(f));
if (!poolFile) throw new Error(`no pool-<date>.json in ${captureDir}`);
const pool = JSON.parse(fs.readFileSync(path.join(captureDir, poolFile), "utf8"));

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

// ---------------------------------------------------------------------------
// Integrity: the enrichment below only reads bytes the capture already hashed.
// ---------------------------------------------------------------------------
const rawFiles = {
  q1: "q1-github.json",
  q2: "q2-github.json",
  q3: "q3-jamstack.html",
  q4: "q4-w3techs.html",
};
for (const [q, fname] of Object.entries(rawFiles)) {
  const buf = fs.readFileSync(path.join(captureDir, "raw", fname));
  const got = sha256(buf);
  const want = pool.sources[q].raw_sha256;
  if (got !== want) {
    throw new Error(`raw/${fname} sha256 ${got} != pool record ${want} - refusing to classify`);
  }
}

// ---------------------------------------------------------------------------
// F1 taxonomy. Each rule carries the category name from CORPUS_SELECTION.md section 2.
// A rule fires only on a whole-word match, and the matched word is printed as the evidence,
// so a reader can disagree with one line without re-deriving the whole log.
// ---------------------------------------------------------------------------

// Stated primary purpose IS documentation. Checked first: a docs tool that also happens to
// mention "blog" must not be thrown out by the OUT list.
const IN_DOCS = [
  /\bdocumentation\b/i,
  /\bdocs?\s+(site|website|sites|generator|theme|platform|portal|tool)\b/i,
  /\bapi\s+(reference|documentation)\b/i,
  /\bknowledge\s?base\b/i,
  /\btechnical\s+writing\b/i,
  /\bhandbook\b/i,
  /\bmanuals?\b/i,
  /\bdocsy\b|\bmkdocs\b|\bdocusaurus\b|\bsphinx\b|\bmdbook\b|\bdocsify\b|\bstarlight\b|\bvitepress\b|\bnextra\b|\bretype\b|\bmintlify\b|\breadthedocs\b|\bgitbook\b|\bantora\b|\basciidoctor\b|\bdocfx\b|\bslate\b/i,
];

// Clear OUT categories, verbatim from the rule's OUT list. Order matters only for the reason
// string; a candidate that matches several is reported under the first.
const OUT_RULES = [
  { cat: "wiki", re: /\bwikis?\b/i },
  { cat: "WYSIWYG editor", re: /\bwysiwyg\b|\brich[- ]text editor\b|\bmarkdown editor\b/i },
  { cat: "API browser", re: /\bapi (client|browser|explorer|testing|gateway|mock)\b|\bhttp client\b/i },
  { cat: "component workshop", re: /\bcomponent (workshop|explorer|library|playground)\b|\bstorybook\b|\bdesign system\b/i },
  { cat: "cheatsheet collection", re: /\bcheat ?sheets?\b|\bawesome list\b|\bcurated list\b|\bcollection of\b/i },
  { cat: "blog engine", re: /\bblog(ging)? (engine|platform|system|generator)\b|\bpersonal blog\b/i },
  { cat: "example/template/content repository", re: /\b(starter|boilerplate|template|example|demo|scaffold|theme for [a-z]+ blogs?)\b/i },
  { cat: "hosted-only platform with no public generator", re: /\bsaas\b|\bhosted platform\b|\bcloud service\b/i },
  { cat: "learning resource, not a generator", re: /\b(tutorial|course|roadmap|interview questions|book about|guide to)\b/i },
  { cat: "not a site generator", re: /\b(cli tool for|package manager|linter|formatter|test runner|database|orm|compiler for)\b/i },
];

// A general-purpose generator is OUT under "general-purpose web frameworks", but only when
// nothing in its own words claims documentation. This is the single highest-volume decision in
// the log, so it is stated separately rather than buried in the OUT list.
const GENERAL_PURPOSE = /\b(static site generator|site generator|web framework|framework for building (websites|web apps|apps)|build (websites|web apps)|静的)\b/i;

function f1(candidate) {
  // F1 reads the STATED PURPOSE: the project's own name and its own one-line description.
  //
  // GitHub topic tags are deliberately NOT in this haystack. CORPUS_SELECTION.md rejects a
  // topic-based rule in its own words - "topic tags are curated by repository owners and applied
  // inconsistently" - and a first version of this script contradicted that by letting a `documentation`
  // topic satisfy "stated purpose is documentation". It admitted Hugo, whose description is "The
  // world's fastest framework for building websites", on the strength of a tag its maintainers
  // chose. Using as evidence the signal the rule discards is a defect regardless of which way it
  // pushes a given row, so topics are out. The consequence is disclosed in the log: this change
  // moves rows from IN to OUT, i.e. it REMOVES pages, which is the direction that needs saying.
  const hay = [candidate.name, candidate.description].filter(Boolean).join(" . ");

  // Q4 is W3Techs' documentation-platforms category. Membership in that category IS a third
  // party's statement that the thing is a documentation platform, so it satisfies F1 on its own -
  // the capture carries no per-platform description to match against.
  if ((candidate.sources || []).includes("Q4")) {
    return {
      verdict: "IN",
      reason: "in W3Techs' documentation-platforms category (source-implied F1)",
      evidence: candidate.w3techsId || "Q4",
    };
  }

  for (const re of IN_DOCS) {
    const m = hay.match(re);
    if (m) return { verdict: "IN", reason: `stated purpose is documentation`, evidence: m[0] };
  }
  for (const rule of OUT_RULES) {
    const m = hay.match(rule.re);
    if (m) return { verdict: "OUT", reason: `F1: ${rule.cat}`, evidence: m[0] };
  }
  const g = hay.match(GENERAL_PURPOSE);
  if (g) {
    return {
      verdict: "OUT",
      reason: "F1: general-purpose web framework or site generator, documentation not its stated purpose",
      evidence: g[0],
    };
  }
  // F1 is a POSITIVE test - "it IS a documentation-site framework or theme" - and the margin
  // default only settles candidates that are near the line. A candidate that is not a site
  // generator or theme AT ALL is not near the line; it is off the axis, and admitting it would
  // put the docs page of a diagramming tool or a command-line tutorial into a corpus about
  // documentation frameworks.
  //
  // Which source found a candidate is what settles this, and the rule's own text is the warrant:
  //
  //   * Q2 (`topic:static-site-generator`) and Q3 (jamstack.org/generators) assert generator-ness
  //     by construction - a row exists there because the source says it generates sites. For those
  //     the only open question is whether the purpose is documentation, so the margin applies and
  //     defaults to IN.
  //   * Q4 is a third party's documentation-platform category; handled above.
  //   * Q1 (`topic:documentation`) asserts NOTHING about generating anything, and the rule already
  //     measured exactly this failure: "topic:documentation sorted by stars returns, in its top 10:
  //     a command-line tutorial, a component workshop (Storybook), a diagramming tool (Mermaid), a
  //     note-taking app, cheatsheet collections." Treating a Q1-only row as borderline would admit
  //     the very items the rule names as the reason a topic search was rejected.
  //
  // So a Q1-only candidate must claim documentation-site generation in its OWN description. It
  // cannot, or it would have matched IN_DOCS above. This is an exclusion, so it is counted and
  // named in the log rather than folded into the OUT total.
  const sources = new Set(candidate.sources || []);
  const assertsGenerator = sources.has("Q2") || sources.has("Q3");
  if (!assertsGenerator) {
    return {
      verdict: "OUT",
      reason:
        "F1: found only by the `topic:documentation` search, which the rule documents as not implying a generator, and its own description does not claim documentation-site generation",
      evidence: "Q1-only",
    };
  }

  if (!candidate.description) {
    // Listed by a generator source, but the capture carries no stated purpose, so the taxonomy
    // cannot fire either way. That is the definition of the margin, and the margin defaults to IN.
    return { verdict: "IN", reason: "borderline: no description in the captured source", evidence: "" };
  }
  return { verdict: "IN", reason: "borderline: taxonomy matched neither list", evidence: "" };
}

// ---------------------------------------------------------------------------
// Candidates, with provenance. A project found by several sources is one candidate carrying
// several source tags - the union is over projects, not over rows.
// ---------------------------------------------------------------------------
const byKey = new Map();
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/\.(js|py|rs|go|sh)$/i, "")
    .replace(/[^a-z0-9]+/g, "");

function add(key, source, fields) {
  const k = norm(key);
  if (!k) return;
  const prev = byKey.get(k);
  if (prev) {
    prev.sources.push(source);
    for (const [f, v] of Object.entries(fields)) if (v && !prev[f]) prev[f] = v;
    return;
  }
  byKey.set(k, { key: k, sources: [source], ...fields });
}

for (const c of pool.sources.q1.candidates) {
  add(c.name.split("/").pop(), "Q1", {
    name: c.name,
    description: c.description,
    topics: c.topics,
    stars: c.stars,
  });
}
for (const c of pool.sources.q2.candidates) {
  add(c.name.split("/").pop(), "Q2", {
    name: c.name,
    description: c.description,
    topics: c.topics,
    stars: c.stars,
  });
}

// Q3 enrichment out of the hashed bytes.
const q3html = fs.readFileSync(path.join(captureDir, "raw", rawFiles.q3), "utf8");
const cards = q3html.split(/(?=<div id="" class="generator-card)/).slice(1);
const q3meta = new Map();
for (const card of cards) {
  const slug = (card.match(/href="\/generators\/([a-z0-9-]+)\/"/i) || [])[1];
  if (!slug) continue;
  const nameAttr = (card.match(/data-sort-name="([^"]*)"/) || [])[1];
  const stars = Number((card.match(/data-sort-githubstars-numeric-descending="(\d+)"/) || [])[1] || 0);
  const text = card.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // "<Name> <n> stars <n> forks <n> issues <DESCRIPTION> Language: ..."
  const desc = (text.match(/issues\s+(.*?)\s+Language:/) || [])[1] || "";
  q3meta.set(slug, { name: nameAttr || slug, description: desc, stars });
}
for (const c of pool.sources.q3.candidates) {
  const m = q3meta.get(c.slug) || {};
  add(m.name || c.slug, "Q3", {
    name: m.name || c.slug,
    description: m.description || "",
    stars: m.stars || 0,
    jamstackSlug: c.slug,
  });
}

for (const c of pool.sources.q4.candidates) {
  add(c.label, "Q4", { name: c.label, description: "", w3techsId: c.id });
}
for (const name of pool.sources.g) {
  add(name, "G", { name });
}

// ---------------------------------------------------------------------------
// Verdicts. G is not re-adjudicated: section 4 says the rule also runs for frameworks already
// in v0.2, and dropping one here would remove a page, which section 5 forbids outright.
// ---------------------------------------------------------------------------
const rows = [...byKey.values()].map((c) => {
  const sources = [...new Set(c.sources)].sort();
  if (sources.includes("G")) {
    return { ...c, sources, verdict: "IN", reason: "grandfathered: present in the v0.2 corpus (section 4)", evidence: "" };
  }
  return { ...c, sources, ...f1(c) };
});

rows.sort((a, b) => (b.stars || 0) - (a.stars || 0) || a.key.localeCompare(b.key));

const IN = rows.filter((r) => r.verdict === "IN");
const OUT = rows.filter((r) => r.verdict === "OUT");
const borderline = IN.filter((r) => r.reason.startsWith("borderline"));

const esc = (s) => String(s || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const line = (r) =>
  `| ${esc(r.name)} | ${r.sources.join("+")} | ${r.stars || ""} | **${r.verdict}** | ${esc(r.reason)} | ${r.evidence ? "`" + esc(r.evidence) + "`" : ""} |`;

const md = `# Inclusion log, v0.3 rule-bound corpus

Generated by \`corpus-selection/build-inclusion-log.mjs\` from the CI capture in
\`corpus-selection/pool-${pool.utc_date}.json\`. Committed in the same commit as that pool, per
CORPUS_SELECTION.md section 2.

- **Capture**: ${pool.captured_at}, GitHub Actions run
  [${pool.ci.run_id}](https://github.com/${pool.ci.repository}/actions/runs/${pool.ci.run_id}),
  attempt ${pool.ci.run_attempt}, commit \`${pool.ci.sha}\`.
- **Raw source hashes verified** against the pool record before classification; a mismatch is
  fatal in the script, so this log cannot have been built from re-fetched bytes.
- **Candidates**: ${rows.length} distinct projects from ${pool.sources.q1.candidates.length} (Q1)
  + ${pool.sources.q2.candidates.length} (Q2) + ${pool.sources.q3.candidates.length} (Q3)
  + ${pool.sources.q4.candidates.length} (Q4) + ${pool.sources.g.length} (G) rows, de-duplicated
  by normalised name.
- **F1 result**: ${IN.length} IN, ${OUT.length} OUT, of which ${borderline.length} IN are
  borderline admissions under the section 2 default.

## The date this capture actually happened, and why it is not 2026-08-04

The rule binds the capture to the first UTC day after the rule commit, which was 2026-08-04. The
capture workflow was committed on 2026-08-03 and **never ran**: the file contained a YAML syntax
error, so GitHub listed the workflow as active, accepted the cron, and silently scheduled
nothing. The only trace was startup-failure run
[30807775090](https://github.com/${pool.ci.repository}/actions/runs/30807775090).

The workflow's public run list therefore shows **zero successful runs before the fix**, which is
the evidence that no pool was captured and discarded: there was nothing to cherry-pick from. The
capture above is the first successful run of this workflow, full stop.

An external reviewer pointed out that this argument closes only half the hole, and he was right.
It answers "was a friendlier pool discarded" and says nothing about the two things the author
regained when the cron died: **control over when to repair, and four days of drift in live
sources**. So, bluntly:

- **The 2026-08-04 pool is lost and is not reproducible.** GitHub stars, the jamstack listing and
  the W3Techs category all moved between 2026-08-04 and 2026-08-07. This capture is a different
  candidate universe, not the scheduled one recovered late, and no wording makes it the same one.
- This edition is bound to the first successful run of fix commit \`6637b79\`, dated 2026-08-07.
- **That commit differs from the pre-failure commit \`a15acb3\` by exactly one non-comment line**,
  and that line is a step which writes a hash into the job summary - it cannot change what is
  captured. Anyone can check the claim rather than take it:

      git diff a15acb3 6637b79 --name-only          # one file: the workflow
      git diff a15acb3 6637b79 -- .github/workflows/corpus-pool.yml | grep -E '^[+-]' | grep -vE '^[+-][[:space:]]*#'

  which prints the plain scalar going out and the block scalar coming in, and nothing else.

What remains unmitigated is the drift, and it is listed here rather than argued away. The defence
is section 7: anyone may re-run the pool at a newer date and publish what changes.

## The classifier was revised twice after its output was first seen

This matters more than the verdicts, because "adjust the filter until the survivors look right" is
the exploit this whole document exists to bound. Both revisions are in the git history of
\`build-inclusion-log.mjs\` and both are stated here with their measured effect:

1. **GitHub topic tags removed from the F1 haystack.** The first version let a \`documentation\`
   topic satisfy "stated purpose is documentation". CORPUS_SELECTION.md rejects topic-based
   selection in its own words, so using topics as evidence contradicted the rule. Effect: **17
   rows flipped, 15 from IN to OUT** (Hugo, Storybook, Zola, two wikis, three cheatsheet
   collections, ...) **and 2 from OUT to IN**. Net direction: fewer pages.
2. **F1 restored as a positive test for candidates found only by \`topic:documentation\`.** The
   first version was deny-only, so anything no OUT rule matched was admitted - which admitted a
   command-line tutorial, a diagramming tool and a Python quiz repository, i.e. exactly the items
   the rule names when it explains why a topic search was rejected. Q2 and Q3 assert
   generator-ness by construction and keep the margin default; Q1-only candidates must claim
   documentation-site generation in their own description. Effect: **16 further rows to OUT**.

Neither revision was made to move a specific project, and no revision was made after this line
was written. A reader who thinks either was outcome-driven can check: the taxonomy is data, the
verdicts are regenerated from the committed capture by one command, and section 7 lets anyone
re-run it with different rules and publish what happens.

## A tension this log does not resolve

The F1 IN set is large and most of it is the margin default firing on small general-purpose site
generators from Q3 whose descriptions say things like "a blog compiler" or "static sites for
storytellers". A literal reading of section 2 admits them (borderline goes IN); the corpus's
subject - documentation frameworks - argues they do not belong. This log takes the literal
reading, because the alternative is the author narrowing the filter by hand until the survivors
suit him, which is the thing the rule forbids. **F2 and F3 are expected to remove most of them
mechanically**: a project with no documentation site of its own fails F2, and a README-only or
client-rendered site fails F3. If they do not, that is a finding about the rule and belongs in a
section 7 pull request, not in a quiet edit to this classifier.

## F1 verdicts

F1 asks one question: is the candidate a documentation-site framework or theme? The taxonomy is
in \`build-inclusion-log.mjs\` and each row prints the token that fired. Borderline goes IN, so
an OUT row is a claim the script can be held to, while an IN row may simply be the default.

**F2 (dogfooding) and F3 (usable ground truth) are NOT evaluated here.** They require fetching
each survivor's documentation site, which is the page walk of section 3, and section 6 puts that
in the next commit so the walk's discovery fetches are hash-logged before any corpus bytes exist.
A row marked IN below is IN *at F1*, not admitted to the corpus.

| project | sources | stars | F1 | reason | matched |
|---|---|---:|---|---|---|
${rows.map(line).join("\n")}

## Borderline admissions, listed separately

Section 2 makes the margin default to IN because over-inclusion costs the author pages he did not
choose. These ${borderline.length} rows are that default firing. They are listed here so a reader
can attack the ones that look wrong without reading the whole table.

${borderline.length ? borderline.map((r) => `- **${esc(r.name)}** (${r.sources.join("+")}) - ${esc(r.reason)}`).join("\n") : "_none_"}
`;

const outDir = path.join(process.cwd(), "corpus-selection");
fs.writeFileSync(path.join(outDir, "inclusion-log.md"), md, "utf8");
fs.writeFileSync(
  path.join(outDir, "inclusion-log.json"),
  JSON.stringify({ generated_from: poolFile, ci: pool.ci, rows }, null, 2),
  "utf8"
);

console.log(`[log] ${rows.length} candidates -> ${IN.length} IN / ${OUT.length} OUT (${borderline.length} borderline-IN)`);
console.log(`[log] wrote corpus-selection/inclusion-log.md and .json`);
