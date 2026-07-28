// Negotiation track (network). Not a quality measurement.
//
// One question only: given a URL, does a tool that fetches for itself end up with the publisher's
// own Markdown, or with HTML it has to convert? Recorded as what was asked for and what came back.
// v0.1.0 scored the answer to this question as if it were conversion quality. That is the mistake
// this file exists to keep separate.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fetchAndConvert } from "@page2ai/core";
import { ROOT, RESULTS, HERE, sha256 } from "./lib.mjs";

const PY = process.env.BENCH_PYTHON || "python";
const cfg = JSON.parse(await readFile(join(ROOT, "protocol-v2", "sites.json"), "utf8"));
await mkdir(RESULTS, { recursive: true });

const BROWSER_ACCEPT = cfg.accept;
const MD_ACCEPT = "text/markdown,text/plain;q=0.9,*/*;q=0.8";

async function probe(url, accept) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { accept, "user-agent": cfg.user_agent }
    });
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      status: res.status,
      final_url: res.url,
      content_type: res.headers.get("content-type"),
      vary: res.headers.get("vary"),
      cache_control: res.headers.get("cache-control"),
      bytes: buf.length,
      sha256: sha256(buf),
      is_markdown: /text\/markdown|text\/x-markdown/i.test(res.headers.get("content-type") || "")
    };
  } catch (err) {
    return { error: String(err && err.message ? err.message : err) };
  }
}

const out = { measured_at: new Date().toISOString(), sites: [] };

for (const site of cfg.sites) {
  const row = { slug: site.slug, url: site.url, publisher: {}, tools: {} };

  // What the publisher offers, independent of any tool.
  row.publisher.html_accept = await probe(site.url, BROWSER_ACCEPT);
  row.publisher.markdown_accept = await probe(site.url, MD_ACCEPT);
  row.publisher.md_suffix = await probe(site.url.replace(/\/$/, "") + ".md", BROWSER_ACCEPT);
  row.publisher.serves_markdown =
    Boolean(row.publisher.markdown_accept?.is_markdown) || Boolean(row.publisher.md_suffix?.is_markdown);

  // page2ai reports which channel it used, in its own return value.
  try {
    const r = await fetchAndConvert(site.url, { timeoutMs: 30000 });
    row.tools.page2ai = { ok: true, source: r.source, chars: r.charCount, title: r.title };
  } catch (err) {
    row.tools.page2ai = { ok: false, error: String(err && err.message ? err.message : err) };
  }

  for (const tool of ["trafilatura", "markitdown"]) {
    try {
      const raw = execFileSync(PY, [join(HERE, "py_fetch.py"), tool, site.url], {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        timeout: 60000
      });
      row.tools[tool] = JSON.parse(raw);
    } catch (err) {
      row.tools[tool] = {
        ok: false,
        error: String((err && err.stderr) || (err && err.message) || err).trim().split("\n").slice(-2).join(" | ")
      };
    }
  }

  out.sites.push(row);
  console.log(
    `[nego] ${site.slug.padEnd(18)} publisher_md=${row.publisher.serves_markdown ? "YES" : "no "} ` +
      `page2ai=${row.tools.page2ai?.source ?? "err"} ` +
      `trafilatura=${row.tools.trafilatura?.content_type ?? "err"} ` +
      `markitdown=${row.tools.markitdown?.ok ? "ok" : "err"}`
  );
}

await writeFile(join(RESULTS, "negotiation.json"), JSON.stringify(out, null, 2), "utf8");
console.log(`[nego] ${out.sites.filter((s) => s.publisher.serves_markdown).length}/${out.sites.length} sites serve publisher Markdown.`);
