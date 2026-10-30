// Stage 0 (offline, idempotent). Creates `.venv/` at the repo root and installs the
// pinned Python extractors from `protocol-v2/requirements.txt` (trafilatura, markitdown).
//
// Why a dedicated venv and not system/user site-packages:
//   The benchmark host runs other tools out of its system Python. markitdown pulls in a
//   handful of transitive deps (bs4, pdfminer.six, python-pptx, …) at pinned versions; a
//   `pip install --user` can override newer copies those other tools expect, which has
//   actually broken production tooling on the author's workstation before. A venv keeps
//   the bench's Python environment reproducible and isolated: `rm -rf .venv && npm run
//   v2:py-setup` is the whole reset story.
//
// Caller contract:
//   - Exit 0 on success, non-zero on failure (stdout prints a one-line summary).
//   - Idempotent: safe to re-run; skips `python -m venv` when `.venv/` already resolves
//     to a working interpreter, and `pip install -r requirements.txt` is a no-op when
//     the pinned versions are already present.
//   - BENCH_PYTHON overrides the bootstrap interpreter (useful on CI runners that pin
//     their own Python with actions/setup-python).

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { ROOT } from "./lib.mjs";

const VENV = join(ROOT, ".venv");
const VENV_PY = process.platform === "win32"
  ? join(VENV, "Scripts", "python.exe")
  : join(VENV, "bin", "python");
const REQ = join(ROOT, "protocol-v2", "requirements.txt");
const BOOTSTRAP_PY = process.env.BENCH_PYTHON || (process.platform === "win32" ? "python" : "python3");

function run(cmd, args, label) {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: false });
  if (res.status !== 0) {
    console.error(`[py-setup] ${label} failed (exit ${res.status})`);
    process.exit(res.status || 1);
  }
}

function captureStdout(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: "utf8", shell: false });
  if (res.status !== 0) return null;
  return res.stdout.trim();
}

if (!existsSync(VENV_PY)) {
  console.log(`[py-setup] creating ${VENV} with ${BOOTSTRAP_PY}`);
  run(BOOTSTRAP_PY, ["-m", "venv", VENV], "python -m venv");
}

const ver = captureStdout(VENV_PY, ["--version"]);
if (!ver) {
  console.error(`[py-setup] ${VENV_PY} is not a working interpreter; delete .venv/ and re-run.`);
  process.exit(1);
}
console.log(`[py-setup] using ${VENV_PY} (${ver})`);

run(VENV_PY, ["-m", "pip", "install", "--quiet", "--disable-pip-version-check", "-r", REQ], "pip install -r requirements.txt");

const trafiVer = captureStdout(VENV_PY, ["-c", "import trafilatura; print(trafilatura.__version__)"]);
const mdVer = captureStdout(VENV_PY, ["-c", "import markitdown; print(markitdown.__version__)"]);
if (!trafiVer || !mdVer) {
  console.error("[py-setup] verification failed: one of the Python tools would not import after install.");
  process.exit(1);
}
console.log(`[py-setup] OK — trafilatura ${trafiVer}, markitdown ${mdVer}`);
