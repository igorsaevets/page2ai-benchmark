# Security Policy

## Reporting a vulnerability

Please do not open a public issue for security reports.

Preferred: GitHub private reporting for this repository:
https://github.com/igorsaevets/page2ai-benchmark/security/advisories/new

Alternative: email **igorsaevets@gmail.com** with subject `[page2ai-benchmark Security] <short description>`. Expect a response within 3 business days.

## Scope

This is a research and benchmark repository. Reports of interest:

- A corpus page or fixture that can execute code when the benchmark processes it
- Ways to tamper with stored results that would make the published numbers unverifiable
- Dependency vulnerabilities that affect reproducing the published results

There is no service, no user data, and no secret material in this repository. Runner scripts that call external APIs (Firecrawl, Jina) read keys from the environment at capture time only; scoring runs offline.
