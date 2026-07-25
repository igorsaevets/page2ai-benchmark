// Isolate which request header changes what the server returns.
// Usage: node repro-accept.mjs
const URL_UNDER_TEST = "https://www.fumadocs.dev/docs/manual-installation/next";

const CASES = [
  { name: "no headers at all", headers: {} },
  { name: "accept: */*", headers: { accept: "*/*" } },
  { name: "accept: text/html", headers: { accept: "text/html" } },
  {
    name: "core's exact accept",
    headers: { accept: "text/html,text/markdown,text/plain,application/xhtml+xml,*/*;q=0.5" },
  },
  { name: "accept: text/markdown", headers: { accept: "text/markdown" } },
  { name: "accept: text/plain", headers: { accept: "text/plain" } },
];

for (const c of CASES) {
  const resp = await fetch(URL_UNDER_TEST, { headers: c.headers, redirect: "follow" });
  const body = await resp.text();
  const ct = resp.headers.get("content-type");
  const vary = resp.headers.get("vary");
  console.log(
    `${c.name.padEnd(24)} status=${resp.status} bytes=${String(body.length).padEnd(7)} ` +
      `content-type=${(ct || "-").padEnd(34)} vary=${vary || "-"}`,
  );
  console.log(`    first 90 chars: ${JSON.stringify(body.slice(0, 90))}`);
  await new Promise((r) => setTimeout(r, 700));
}
