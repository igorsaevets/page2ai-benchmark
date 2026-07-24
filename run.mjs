// Runs all runners in sequence, then metrics
// Usage: node run.mjs

import { execSync } from "node:child_process";

console.log("=== Jina Reader ===");
execSync("node runners/jina.mjs", { stdio: "inherit" });

console.log("\n=== Firecrawl ===");
try {
  execSync("node runners/firecrawl.mjs", { stdio: "inherit" });
} catch (e) {
  console.error("Firecrawl runner failed (missing FIRECRAWL_API_KEY?), skipping");
}

console.log("\n=== Page2AI (Puppeteer + extension) ===");
try {
  execSync("node runners/page2ai.mjs", { stdio: "inherit" });
} catch (e) {
  console.error("Page2AI runner failed, check extension build path");
}

console.log("\n=== Metrics ===");
execSync("node metrics.mjs", { stdio: "inherit" });

console.log("\nDone. See results/ for extracted Markdown and metrics.json per site.");
console.log("Fill in analysis.md with human review.");
