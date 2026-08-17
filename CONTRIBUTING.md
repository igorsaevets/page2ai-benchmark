# Contributing to page2ai-benchmark

This repository exists so the published numbers can be checked and challenged. The most valuable contributions are the ones that try to break the methodology.

## What is welcome

- Re-running the benchmark and reporting different results (open an issue with your environment and numbers).
- Methodology challenges: scoring bugs in `metrics.mjs`, unfair runner behavior in `runners/`, corpus-selection objections (the selection rule is published in `CORPUS_SELECTION.md`).
- Adding an extractor: a new runner under `runners/` that consumes the same stored corpus as every other tool. No tool gets network access, retries or headers that the others do not get at scoring time.
- New corpus candidates that satisfy the published selection rule.

## Ground rules

- Scoring runs offline over the stored corpus. A PR that makes scoring depend on the network will be declined.
- Never edit stored corpus pages or past result files; a new run produces new dated result files.
- A change to metric semantics and a re-statement of old results cannot land in the same PR; a metric change needs its own version note in the results.
- AI-assisted contributions are welcome and must be declared in the PR template.

## Dev setup

Node 20 or newer.

```bash
npm ci
```

See the README for how to reproduce the published run.

## Security

See [SECURITY.md](./SECURITY.md).
