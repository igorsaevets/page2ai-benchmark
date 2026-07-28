// Stage 3 (offline). Runs every tool on the SAME cached HTML bytes.
// No tool fetches anything. Fetch strategy therefore cannot influence this track.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { htmlToMarkdown } from "@page2ai/core";
import { CORPUS, RESULTS, HERE } from "./lib.mjs";

const PY = process.env.BENCH_PYTHON || "python";

function turndown() {
  return new TurndownService({ codeBlockStyle: "fenced", headingStyle: "atx", fence: "```" });
}

const nodeTools = {
  "page2ai": (html, url) => htmlToMarkdown(html, { baseUrl: url }).markdown,

  "readability-turndown": (html, url) => {
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    if (!article || !article.content) throw new Error("Readability returned null");
    return turndown().turndown(article.content);
  },

  "defuddle-turndown": async (html, url) => {
    const mod = await import("defuddle/node");
    const dom = new JSDOM(html, { url });
    const result = await mod.Defuddle(dom, url, { markdown: false });
    if (!result || !result.content) throw new Error("Defuddle returned no content");
    return turndown().turndown(result.content);
  },

  "turndown-raw": (html, url) => {
    const dom = new JSDOM(html, { url });
    const body = dom.window.document.body;
    for (const el of body.querySelectorAll("script, style, noscript, svg")) el.remove();
    return turndown().turndown(body.innerHTML);
  }
};

const pyTools = ["trafilatura", "markitdown"];

const index = JSON.parse(await readFile(join(CORPUS, "index.json"), "utf8"));
await mkdir(RESULTS, { recursive: true });

const manifest = [];

for (const site of index.sites) {
  if (!site.ok) continue;
  const dir = join(RESULTS, site.slug);
  await mkdir(dir, { recursive: true });
  const htmlPath = join(CORPUS, site.slug, "page.html");
  const html = await readFile(htmlPath, "utf8");
  const url = site.final_url || site.slug;

  for (const [tool, fn] of Object.entries(nodeTools)) {
    const t0 = Date.now();
    let md = "";
    let error = null;
    try {
      md = await fn(html, url);
      if (typeof md !== "string") throw new Error(`tool returned ${typeof md}`);
    } catch (err) {
      error = String(err && err.message ? err.message : err);
      md = "";
    }
    const ms = Date.now() - t0;
    await writeFile(join(dir, `${tool}.md`), md, "utf8");
    manifest.push({ slug: site.slug, tool, bytes: Buffer.byteLength(md), ms, error });
    console.log(
      `[extract] ${site.slug.padEnd(18)} ${tool.padEnd(20)} ${String(Buffer.byteLength(md)).padStart(7)} B ` +
        `${String(ms).padStart(5)} ms ${error ? "ERROR: " + error : ""}`
    );
  }

  for (const tool of pyTools) {
    const t0 = Date.now();
    let md = "";
    let error = null;
    try {
      md = execFileSync(PY, [join(HERE, "py_tools.py"), tool, htmlPath, url], {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024
      });
    } catch (err) {
      error = String((err && err.stderr) || (err && err.message) || err).trim().split("\n").slice(-3).join(" | ");
      md = "";
    }
    const ms = Date.now() - t0;
    await writeFile(join(dir, `${tool}.md`), md, "utf8");
    manifest.push({ slug: site.slug, tool, bytes: Buffer.byteLength(md), ms, error });
    console.log(
      `[extract] ${site.slug.padEnd(18)} ${tool.padEnd(20)} ${String(Buffer.byteLength(md)).padStart(7)} B ` +
        `${String(ms).padStart(5)} ms ${error ? "ERROR: " + error : ""}`
    );
  }
}

await writeFile(join(RESULTS, "extract-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
const failures = manifest.filter((m) => m.error);
console.log(`[extract] ${manifest.length} extractions, ${failures.length} errors.`);
