# Resolved tool versions for the scored run of 2026-07-28

The manifests declare ranges (`^`); this file records what the committed
`package-lock.json` / `requirements.txt` actually resolved for the run whose
numbers live in `scores.json`. `npm ci` (not `npm install`) reproduces exactly
these; recorded here so the published numbers can be attributed to exact
versions without opening the lockfile.

## Node tools (from package-lock.json)

| package | version |
|---|---|
| @page2ai/core | 0.1.5 |
| @mozilla/readability | 0.6.0 |
| defuddle | 0.19.2 |
| turndown | 7.2.4 |
| jsdom | 30.0.0 |
| linkedom | 0.18.13 |

Note: the initial v2 scoring ran on @page2ai/core 0.1.4; the committed extracts
and scores were re-run on 0.1.5 (see the "page2ai 0.1.5 re-run" commit).
On 2026-08-17, 0.1.6 was verified to produce byte-identical extracts on all 14
corpus pages, so these numbers hold for 0.1.6 as well.

## Python tools (from protocol-v2/requirements.txt, pinned)

| package | version |
|---|---|
| trafilatura | 2.1.0 |
| markitdown | 0.1.6 |
