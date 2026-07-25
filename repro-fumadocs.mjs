// Minimal reproduction for the Fumadocs extraction failure found by the benchmark
// on 2026-07-25. Run: node repro-fumadocs.mjs
//
// Symptom: @page2ai/core@0.1.0 returns frontmatter only (264 chars, 0 headings,
// 0 code blocks) for a page whose server-rendered HTML contains an <article>
// with 11 <pre> blocks. No JavaScript execution is required to see that content.

import { parseHTML } from "linkedom";
import { fetchAndConvert } from "@page2ai/core";

const URL_UNDER_TEST = "https://www.fumadocs.dev/docs/manual-installation/next";

// Fetch exactly the way @page2ai/core's fetch-protected.js does, so we compare
// like for like rather than blaming the parser for a different response body.
const CORE_HEADERS = {
  "user-agent": "page2ai-core/0.1 (+https://github.com/igorsaevets/page2ai-core)",
  accept: "text/html,text/markdown,text/plain,application/xhtml+xml,*/*;q=0.5",
};
const plain = await (await fetch(URL_UNDER_TEST)).text();
const html = await (await fetch(URL_UNDER_TEST, { headers: CORE_HEADERS })).text();
console.log("default-UA html len  :", plain.length, "<pre>=", (plain.match(/<pre/g) || []).length);
console.log("core-UA html len     :", html.length, "<pre>=", (html.match(/<pre/g) || []).length);
console.log("bodies identical     :", plain === html);
const { document } = parseHTML(html);
console.log("<title> in core html :", JSON.stringify(document.querySelector("title")?.textContent ?? null));

const article = document.querySelector("article");
const mainArticle = document.querySelector("main article");

console.log("raw html length      :", html.length);
console.log("<pre> in raw html    :", (html.match(/<pre/g) || []).length);
console.log("main article found   :", !!mainArticle);
console.log("article found        :", !!article);

if (article) {
  console.log("article id           :", article.getAttribute("id"));
  console.log("article.children     :", article.children.length);
  console.log("article <pre> count  :", article.querySelectorAll("pre").length);
  console.log("article <h1..h3>     :", article.querySelectorAll("h1,h2,h3").length);
  console.log("article textContent  :", (article.textContent || "").trim().length, "chars");
}

// Which elements carry the tab-widget markers the dedup pass keys on
console.log("[role=tablist]       :", document.querySelectorAll('[role="tablist"]').length);
console.log("[role=tabpanel]      :", document.querySelectorAll('[role="tabpanel"]').length);
console.log("[data-state=*]       :", document.querySelectorAll('[data-state="active"],[data-state="inactive"]').length);

const result = await fetchAndConvert(URL_UNDER_TEST, {
  includeFrontmatter: true,
  includeImages: true,
  timeoutMs: 30000,
});
const md = result.markdown ?? "";
const body = md.replace(/^---\n[\s\S]*?\n---\n/, "");
console.log("---");
console.log("page2ai markdown     :", md.length, "chars");
console.log("page2ai body only    :", body.trim().length, "chars");
console.log("page2ai title        :", JSON.stringify(result.title));
