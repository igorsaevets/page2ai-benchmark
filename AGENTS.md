# AGENTS.md

Instructions for AI coding agents working in this repository. Humans: see [CONTRIBUTING.md](./CONTRIBUTING.md).

## What this is

Reproducible web-extraction benchmark. Stored corpus under `corpus/`, per-tool runners under `runners/`, scoring in `metrics.mjs`, orchestration in `run.mjs`. Numbers published from this repo are cited elsewhere; integrity beats convenience.

## Commands

- Install: `npm ci`
- Reproduce: see the README (scoring runs offline over the stored corpus)

## Constraints

- The default branch is `master`, not `main`.
- Scoring must stay offline and deterministic. No network in the scoring path.
- Never edit stored corpus pages or past result files; a new run writes new dated files.
- Every tool gets identical input from the stored corpus: same bytes, no per-tool retries or headers at scoring time.
- Corpus additions must satisfy the published rule in `CORPUS_SELECTION.md`.
- Do not change `metrics.mjs` semantics and restate old results in the same change; a metric change invalidates comparisons and needs a version note in the results.
