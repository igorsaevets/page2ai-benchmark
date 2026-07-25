// Is the benchmark's single "Good" result actually measuring conversion quality?
//
// docs.anthropic.com serves text/markdown under the Accept header @page2ai/core
// sends. If the tool's recorded output is essentially the server's own Markdown,
// then the "publication-quality Markdown" verdict in analysis.md is measuring
// Anthropic's Markdown passed through a parser that could not parse it, not
// Page2AI's HTML-to-Markdown conversion.
//
// Usage: node repro-passthrough.mjs

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const URL_UNDER_TEST = "https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking";
const MD_ACCEPT = "text/html,text/markdown,text/plain,application/xhtml+xml,*/*;q=0.5";

const server = await (await fetch(URL_UNDER_TEST, { headers: { accept: MD_ACCEPT } })).text();
const recorded = await readFile(join(__dirname, "results", "mintlify-anthropic", "page2ai.md"), "utf8");
const body = recorded.replace(/^---\n[\s\S]*?\n---\n/, "").trim();

const norm = (s) => s.replace(/\s+/g, " ").trim();
const a = norm(server);
const b = norm(body);

// Longest-common-substring style overlap is overkill; a shingle overlap is enough
// to answer "is one basically the other".
const shingles = (s, n = 40) => {
  const out = new Set();
  for (let i = 0; i + n <= s.length; i += n) out.add(s.slice(i, i + n));
  return out;
};
const sa = shingles(a);
const sb = shingles(b);
let hit = 0;
for (const s of sb) if (sa.has(s)) hit++;

console.log("server markdown bytes     :", server.length);
console.log("recorded page2ai body     :", body.length);
console.log("server starts with        :", JSON.stringify(server.slice(0, 70)));
console.log("recorded body starts with :", JSON.stringify(body.slice(0, 70)));
console.log("---");
console.log(`shingle overlap           : ${hit}/${sb.size} = ${((hit / sb.size) * 100).toFixed(1)}% of the recorded output appears verbatim in the server's own Markdown`);
