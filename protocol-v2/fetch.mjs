// Stage 1 (network). Fetches every site once with a browser Accept header and stores the bytes
// verbatim, plus the full response metadata. Everything downstream runs offline against this.
//
// Rerunning this rewrites the corpus with today's pages, which changes the numbers. That is the
// intended way to produce a new dated run; it is not a repair step.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CORPUS, ROOT, sha256 } from "./lib.mjs";

const cfg = JSON.parse(await readFile(join(ROOT, "protocol-v2", "sites.json"), "utf8"));
const runStartedAt = new Date().toISOString();

await mkdir(CORPUS, { recursive: true });

const index = [];

for (const site of cfg.sites) {
  const dir = join(CORPUS, site.slug);
  await mkdir(dir, { recursive: true });
  const started = Date.now();
  const record = {
    slug: site.slug,
    framework: site.framework,
    requested_url: site.url,
    accept: cfg.accept,
    user_agent: cfg.user_agent,
    fetched_at: new Date().toISOString()
  };

  try {
    const res = await fetch(site.url, {
      redirect: "follow",
      headers: { accept: cfg.accept, "user-agent": cfg.user_agent, "accept-language": "en-US,en;q=0.9" }
    });
    const buf = Buffer.from(await res.arrayBuffer());
    record.status = res.status;
    record.final_url = res.url;
    record.headers = Object.fromEntries(res.headers.entries());
    record.content_type = res.headers.get("content-type");
    record.vary = res.headers.get("vary");
    record.bytes = buf.length;
    record.sha256 = sha256(buf);
    record.elapsed_ms = Date.now() - started;
    record.ok = res.ok && /text\/html/i.test(record.content_type || "");
    if (!record.ok) record.reason = `status ${res.status}, content-type ${record.content_type}`;
    await writeFile(join(dir, "page.html"), buf);
  } catch (err) {
    record.ok = false;
    record.error = String(err && err.message ? err.message : err);
    record.elapsed_ms = Date.now() - started;
  }

  await writeFile(join(dir, "fetch.json"), JSON.stringify(record, null, 2), "utf8");
  index.push({
    slug: record.slug,
    framework: record.framework,
    ok: record.ok,
    status: record.status ?? null,
    bytes: record.bytes ?? 0,
    content_type: record.content_type ?? null,
    final_url: record.final_url ?? null,
    reason: record.reason ?? record.error ?? null
  });
  console.log(
    `[fetch] ${record.ok ? "ok  " : "FAIL"} ${site.slug.padEnd(18)} ` +
      `${String(record.status ?? "-").padStart(3)} ${String(record.bytes ?? 0).padStart(8)} B  ` +
      `${record.reason ?? record.error ?? ""}`
  );
}

await writeFile(
  join(CORPUS, "index.json"),
  JSON.stringify({ run_started_at: runStartedAt, accept: cfg.accept, user_agent: cfg.user_agent, sites: index }, null, 2),
  "utf8"
);

const okCount = index.filter((s) => s.ok).length;
console.log(`[fetch] ${okCount}/${index.length} pages usable. corpus/index.json written.`);
