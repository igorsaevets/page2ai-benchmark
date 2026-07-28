// Stage 2 (offline). Derives per-page ground truth from the page's own DOM.
// Not from any tool's output and not from the publisher's Markdown.
// Definitions are fixed in protocol-v2/PROTOCOL.md; this file implements them and nothing more.

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { CORPUS, squeeze, stripWs } from "./lib.mjs";

const CHROME_SELECTOR =
  "nav, header, footer, aside, [role=navigation], [role=banner], [role=contentinfo], [role=complementary]";
const DROP_SELECTOR = "script, style, noscript, template, svg";

const MIN_CODE_CHARS = 24;
const MIN_HEADING_CHARS = 3;
const BOILERPLATE_MIN = 12;
const BOILERPLATE_MAX = 100;
const BOILERPLATE_CAP = 80;
const USABLE_MIN_CODE = 3;
const USABLE_MIN_HEADINGS = 5;

const index = JSON.parse(await readFile(join(CORPUS, "index.json"), "utf8"));
const summary = [];

for (const site of index.sites) {
  if (!site.ok) {
    summary.push({ slug: site.slug, usable: false, reason: `fetch failed: ${site.reason}` });
    console.log(`[gt] skip ${site.slug}: fetch failed`);
    continue;
  }

  const html = await readFile(join(CORPUS, site.slug, "page.html"), "utf8");
  const dom = new JSDOM(html, { url: site.final_url || undefined });
  const doc = dom.window.document;

  for (const el of doc.querySelectorAll(DROP_SELECTOR)) el.remove();

  // Content root FIRST, then chrome, because <header> and <footer> inside an article are
  // section furniture, not page chrome. Amendment 1 in PROTOCOL.md: chrome is only what sits
  // OUTSIDE the content root. Removing every <header> first deleted the article's own headings
  // on svelte.dev and would have scored every tool 0 on heading recall there.
  const contentRoot =
    doc.querySelector("main") ||
    doc.querySelector("article") ||
    doc.querySelector("[role=main]") ||
    doc.body;

  // Amendment 2: boilerplate is defined structurally as "text outside the content root", not by
  // semantic tag. Sidebars and headers are routinely plain <div>s, so the tag-based rule produced
  // fewer than three strings on six of fourteen pages and made cleanliness untestable there.
  // The semantic selector is kept only as a fallback for pages whose content root is <body>.
  // Strings are collected from LEAF elements, not by splitting textContent on newlines:
  // textContent carries no line breaks between elements, so a whole sidebar arrives as one
  // 4000-character line, is rejected by the length filter, and every page reports zero
  // boilerplate. That is what the first two attempts did.
  const collectLeaves = (root, sink) => {
    for (const el of root.querySelectorAll("*")) {
      if (el.children.length !== 0) continue;
      const t = el.textContent || "";
      if (t.trim()) sink.push(t);
    }
  };

  const chromeText = [];
  if (contentRoot !== doc.body) {
    const marker = "data-p2b-content-root";
    contentRoot.setAttribute(marker, "1");
    const clone = doc.body.cloneNode(true);
    const cloneRoot = clone.querySelector(`[${marker}]`);
    if (cloneRoot) cloneRoot.remove();
    contentRoot.removeAttribute(marker);
    collectLeaves(clone, chromeText);
  } else {
    for (const el of doc.querySelectorAll(CHROME_SELECTOR)) collectLeaves(el, chromeText);
  }

  const contentSqueezed = squeeze(contentRoot.textContent || "");

  const codeSeen = new Set();
  const code_blocks = [];
  for (const pre of contentRoot.querySelectorAll("pre")) {
    const stripped = stripWs(pre.textContent || "");
    if (stripped.length < MIN_CODE_CHARS) continue;
    if (codeSeen.has(stripped)) continue;
    codeSeen.add(stripped);
    code_blocks.push({ probe: stripped.slice(0, 40), length: stripped.length });
  }

  const headSeen = new Set();
  const headings = [];
  for (const h of contentRoot.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
    const sq = squeeze(h.textContent || "");
    if (sq.length < MIN_HEADING_CHARS) continue;
    if (headSeen.has(sq)) continue;
    headSeen.add(sq);
    headings.push(sq);
  }

  const boilerSeen = new Set();
  let boilerplateCandidates = [];
  for (const block of chromeText) {
    for (const line of block.split(/\r?\n/)) {
      const sq = squeeze(line);
      if (sq.length < BOILERPLATE_MIN || sq.length > BOILERPLATE_MAX) continue;
      if (boilerSeen.has(sq)) continue;
      boilerSeen.add(sq);
      if (contentSqueezed.includes(sq)) continue; // occurs in the article too: not nav leakage
      boilerplateCandidates.push(sq);
    }
  }
  boilerplateCandidates.sort((a, b) => b.length - a.length);
  const boilerplate = boilerplateCandidates.slice(0, BOILERPLATE_CAP);
  const boilerplate_dropped_by_cap = Math.max(0, boilerplateCandidates.length - boilerplate.length);

  // Amendment 4, 2026-07-28, prompted by an external reviewer AFTER the first scores existed.
  // The reviewer's objection: content_recall counted code and headings only, so a tool could drop
  // 90% of the article's prose and still score 1.0. Correct, and not arguable. Body prose is
  // therefore measured too. The pre-existing f_score is NOT redefined; a second, clearly labelled
  // figure is reported beside it. See PROTOCOL.md Amendment 4.
  const proseSeen = new Set();
  const paragraphs = [];
  for (const el of contentRoot.querySelectorAll("p, li, blockquote, dd, td")) {
    if (el.querySelector("p, li, blockquote, pre")) continue; // keep leaf-ish blocks only
    const sq = squeeze(el.textContent || "");
    if (sq.length < 40) continue;
    if (proseSeen.has(sq)) continue;
    proseSeen.add(sq);
    paragraphs.push(sq.slice(0, 120));
  }

  let tables = 0;
  for (const t of contentRoot.querySelectorAll("table")) {
    if (t.querySelectorAll("tr").length >= 2) tables += 1;
  }

  const usable = code_blocks.length >= USABLE_MIN_CODE || headings.length >= USABLE_MIN_HEADINGS;

  // Amendment 3. The pre-registered usability test asks whether there is enough ground truth to
  // score. It does not ask whether that ground truth is the ARTICLE. On docs.anthropic.com the
  // content root holds 899 characters against 792259 in the body, and its six "headings" are the
  // site footer: Solutions, Partners, Learn, Company. Every tool there was being scored on how
  // well it reproduced a footer. Measured, not asserted: content_ratio below.
  const contentChars = squeeze(contentRoot.textContent || "").length;
  const bodyChars = squeeze(doc.body.textContent || "").length;
  const content_ratio = bodyChars ? contentChars / bodyChars : 0;
  const article_in_server_html = contentChars >= 1000 && content_ratio >= 0.05;

  const gt = {
    slug: site.slug,
    framework: site.framework,
    final_url: site.final_url,
    html_bytes: site.bytes,
    content_root: contentRoot.tagName ? contentRoot.tagName.toLowerCase() : "body",
    thresholds: {
      MIN_CODE_CHARS,
      MIN_HEADING_CHARS,
      BOILERPLATE_MIN,
      BOILERPLATE_MAX,
      BOILERPLATE_CAP,
      USABLE_MIN_CODE,
      USABLE_MIN_HEADINGS
    },
    usable,
    unusable_reason: usable
      ? null
      : `only ${code_blocks.length} code blocks and ${headings.length} headings`,
    content_chars: contentChars,
    body_chars: bodyChars,
    content_ratio: Number(content_ratio.toFixed(4)),
    article_in_server_html,
    server_html_note: article_in_server_html
      ? null
      : `content root holds ${contentChars} of ${bodyChars} characters (${(content_ratio * 100).toFixed(2)}%): the article is not in the server HTML`,
    counts: {
      code_blocks: code_blocks.length,
      headings: headings.length,
      paragraphs: paragraphs.length,
      boilerplate: boilerplate.length,
      boilerplate_dropped_by_cap,
      tables
    },
    code_blocks,
    headings,
    paragraphs,
    boilerplate,
    tables
  };

  await writeFile(join(CORPUS, site.slug, "groundtruth.json"), JSON.stringify(gt, null, 2), "utf8");
  summary.push({
    slug: site.slug,
    usable,
    code: code_blocks.length,
    headings: headings.length,
    boilerplate: boilerplate.length,
    dropped_by_cap: boilerplate_dropped_by_cap
  });
  console.log(
    `[gt] ${usable ? "ok  " : "THIN"} ${site.slug.padEnd(18)} code=${String(code_blocks.length).padStart(3)} ` +
      `head=${String(headings.length).padStart(3)} prose=${String(paragraphs.length).padStart(3)} boiler=${String(boilerplate.length).padStart(3)} ` +
      `(cap dropped ${boilerplate_dropped_by_cap})`
  );
}

await writeFile(join(CORPUS, "groundtruth-summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(`[gt] ${summary.filter((s) => s.usable).length}/${summary.length} pages usable.`);
