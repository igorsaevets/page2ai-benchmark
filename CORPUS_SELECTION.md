---
title: Corpus selection rule, v0.3
date: 2026-08-03
status: >
  Rule fixed before being applied. The commit that introduces this file contains the rule and no
  new corpus pages; the commits that apply it will add pool snapshots and pages and change nothing
  in the Rule section. Verify with `git log --follow -p CORPUS_SELECTION.md`, the same device
  PROTOCOL.md uses for its metric definitions. Before this first commit the draft was reviewed by
  a five-arm model panel (two Gemini arms, Codex, Kimi, Spark) briefed to attack it; the Review
  record at the bottom lists what that review changed, with the findings that were rejected and
  why.
author: Igor Saevets
---

# How pages get into this benchmark, starting with v0.3

## The flank this closes

Protocol v0.2, Amendment 4, records an external reviewer's objection that was accepted in full:

> corpus selection is acknowledged as the remaining unprotected flank, since the 14 URLs were
> chosen by the author. A published selection rule is open work for v0.3.

Everything else in v0.2 is defended: the metrics were fixed before the scoring code existed, every
page is committed so the scoring reruns offline, and the author's tool's losses are printed. But
nothing stopped the author from choosing fourteen pages his own tool happens to handle well. This
document narrows and exposes several sources of that freedom. It does not eliminate them; the
remaining ones are listed near the end, because a rule that claims to remove all author freedom is
lying.

## What was measured and rejected first

The obvious fully-mechanical rule is a GitHub topic search. It was tried on 2026-08-03 and it
fails, in both directions:

- `topic:documentation` sorted by stars returns, in its top 10: a command-line tutorial, a
  component workshop (Storybook), a diagramming tool (Mermaid), a note-taking app, cheatsheet
  collections. Docusaurus is there; almost nothing else in the top 10 is a documentation-site
  framework.
- `topic:documentation` AND `topic:static-site-generator` has clean results but **misses most of
  the population**: Docusaurus (65,792★), VitePress, Nextra, Sphinx, mdBook and docsify all fail
  the intersection. Topic tags are curated by repository owners and applied inconsistently —
  GitHub's own docs say admins add any topics they like. A rule built on that query would exclude
  five of the six frameworks already in the v0.2 corpus.

The review panel checked the alternatives live (2026-08-03): `jamstack.org/generators` is alive
but lists general web frameworks alongside docs tools; the Tranco list is alive and hardened but
ranks domains, not frameworks; HTTP Archive identifies technologies on deployed sites, not
framework projects; W3Techs maintains a live documentation-platforms category but monitors only
~12 platforms; the Stack Overflow survey barely covers docs tooling at all. No single source
enumerates "documentation-site frameworks". So the rule below takes the **union of several
recorded sources** and filters it through a published, line-by-line auditable log.

## The rule

### 1. Candidate pool

The pool is the union of four recorded sources plus the grandfather set:

- **Q1**: the top 50 repositories by stars from GitHub search `topic:documentation`;
- **Q2**: the top 50 repositories by stars from GitHub search `topic:static-site-generator`;
- **Q3**: every generator listed on `jamstack.org/generators` at snapshot time;
- **Q4**: every platform named in W3Techs' documentation-platforms category at snapshot time;
- **G**: the frameworks already present in the v0.2 corpus.

A union can only add candidates, which is the point: excluding a framework by choosing the source
that omits it stops working when the sources are OR-ed. All four snapshots are committed verbatim
to `corpus-selection/pool-<date>.json`.

**The snapshot date is not the author's to choose.** All four sources are captured on **the first
UTC day after this rule's first public commit**, and no earlier or alternate snapshot may be
substituted. The capture runs in a **public GitHub Actions workflow committed with this rule**,
so the authoritative timestamp is the CI run's, not a local machine's. This forecloses running
the queries privately on many days and publishing the friendliest one. (What it cannot foreclose
is the author having looked at candidate sites before writing this rule at all; see "The freedom
this rule does NOT remove".)

### 2. Inclusion filter, with a published log

A candidate is IN if and only if all three hold:

- **F1 — it is a documentation-site framework or theme.** IN: projects whose stated primary
  purpose is generating or serving documentation websites (Docusaurus, MkDocs, Sphinx, mdBook,
  docsify, Docsy), and documentation themes for general-purpose generators (Starlight). OUT:
  wikis, WYSIWYG editors, API browsers, component workshops, cheatsheet collections, blog
  engines, general-purpose web frameworks (Next.js, Astro-the-framework as opposed to Starlight),
  example/template/content repositories, and hosted-only platforms with no public generator.
- **F2 — it dogfoods**: the project maintains a public documentation site of its own, and the
  test page comes from that site. This removes cross-site substitution — the author cannot pick
  some third-party site built with the framework. Which page of that site is tested is governed
  by the page walk (§3), not by this clause.
- **F3 — it is measurable server-side**: at least one page of that site passes the usable-ground-
  truth gate **as computed by `protocol-v2/groundtruth.mjs`** (at least 3 code blocks or at least
  5 headings *inside the content root*, not anywhere in the raw HTML — sidebar and chrome
  headings do not count).

**Every candidate from the pool appears in `corpus-selection/inclusion-log.md` with an IN or OUT
and a one-line reason, and the log is committed in the same commit as the pool snapshot** — no
window between seeing the pool and recording the decisions. F1 is still a judgment at the margin,
so the margin has a default: **a borderline candidate is IN.** Only a clear OUT under the written
taxonomy excludes. Over-inclusion costs the author pages he did not choose — including hostile
ones — while under-inclusion is the exploit; the default points the bias away from the author.
The log is what makes each line auditable, and §7 is what makes a wrong line correctable.

⚠️ **F3 exclusions are flagged, counted, and self-indicting.** A framework whose docs render
entirely client-side cannot be scored by this benchmark's offline server-HTML design — but
client-rendered pages are also **the author's tool's own worst case** (`page2ai` scores 0 on
`docs.anthropic.com` for exactly this reason). An F3 exclusion therefore removes a page the
author's tool would likely fail. So: every F3 exclusion is named in the log with its gate
numbers; the count of F3 exclusions is printed in the results; and those frameworks are the
designated seed corpus for a rendered-DOM track, which is open work. Excluding them silently
would be the exploit; excluding them loudly, with the bias direction stated, is the honest
version available to an offline benchmark.

### 3. The page rule: a committed script, not prose

For each surviving framework, the page under test is selected by
**`corpus-selection/page-walk.mjs`, a committed script that is the normative definition** — the
prose below describes it, and where prose and script disagree, the script governs.

**The landing page is defined, not chosen**: the URL the project's own GitHub README links as
docs/documentation; if the README links none, the final redirect target of the docs site root.
Locale: the English variant when one exists. Version: the site's default (`latest`/`stable`),
never a pinned old version. The resolved landing URL is committed in the walk log before the
walk runs; any ambiguity the script cannot resolve is settled by a logged, committed decision.

The walk: fetch the landing page with the `Accept` header and User-Agent recorded in
`protocol-v2/sites.json` plus `Accept-Language: en-US,en;q=0.9`, following HTTP redirects to
the final URL. Select the first `<nav>` (or `[role="navigation"]`) in the server HTML that
contains at least 5 same-origin documentation links, preferring a sidebar container over the page
header. Ignore breadcrumbs, in-page tables of contents, version and locale switchers, footer
prev/next links, external links, and `#` fragments; strip fragments and deduplicate URLs after
redirect resolution. Visit the remaining links in DOM order; the target is the **first** page
that passes the F3 gate as computed by `groundtruth.mjs`.

**Every fetch the walk performs is a logged discovery fetch**: URL, timestamp, HTTP status, final
URL after redirects, SHA-256 of the body, and the gate numbers, recorded in
`corpus-selection/page-walk.md` and committed before any corpus capture. The later corpus commit
may only add `corpus/<slug>/page.html` files **whose SHA-256 already appears in that log** — a
page that was never a logged discovery fetch cannot enter the corpus.

### 4. No cap: every survivor enters

All frameworks passing F1–F3 enter v0.3 — there is no top-N cut. The pool sources bound the
workload naturally. The rule also runs for the frameworks already present in v0.2: each gets a
rule-selected page in the rule-bound corpus, while its author-chosen v0.2 page stays in the
legacy corpus. (An earlier draft capped new entries at 10; the panel was unanimous that an
arbitrary cap both weakens statistical power and hands the author a stopping-point choice, so it
is gone.)

### 5. Permanence, and two populations reported separately

The v0.2 corpus — all 14 pages, author-chosen and labelled as such — remains committed in v0.3
and every later version. **No page ever leaves the corpus.** This clause prevents quietly
removing a page once admitted; it cannot prevent exclusion at the F1/F3 stage, which is why those
decisions are logged per candidate.

Because 14 author-chosen pages inside a blended average would keep the headline number partly
author-selected forever, **v0.3 reports two populations separately and never as a single blended
headline**:

1. **Rule-bound corpus** — pages selected by this document. This is the headline table.
2. **Legacy corpus** — the 14 author-chosen v0.2 pages, kept for continuity and regression.

A combined table may be printed beside them, labelled as combined, never as the headline. This
also bounds the dilution attack — steering an average by *adding* friendly pages: additions reach
the rule-bound table only through the pool, the filter and the walk, and they move the combined
table only, which is never the headline.

### 6. Order of operations, provable from git

1. This rule is committed (this commit — no pool, no pages).
2. On the first UTC day after 1: pool snapshots and the inclusion log, committed together.
3. The page walk runs; `page-walk.md` with every discovery fetch and hash is committed.
4. The fetch commit adds `corpus/<slug>/` bytes whose hashes match 3, changing nothing in 1–3.
5. v0.3 scores are computed only after 4, by scoring code committed before the run.

What this proves: **the published repository did not change the selected pages after the walk was
committed, and the metric definitions predate the scores.** What it cannot prove: that the author
never privately fetched or evaluated candidates before publication. No git discipline can prove a
negative about private activity; the devices that mitigate it are the mechanical snapshot date
(§1), the atomic pool-plus-log commit (§2), the hash-bound walk (§3), and §7.

### 7. Extension by pull request

Anyone can extend the corpus by a PR that (a) re-runs the pool sources at a newer recorded date,
(b) adds inclusion-log lines under the written F1 criteria, and (c) applies `page-walk.mjs`
unmodified. "Follows the rule" is decided mechanically where possible: **a replay workflow
(committed alongside the pool tooling) re-runs the walk and the gate on the PR's URLs; a PR that
replays clean is merged, or rejected within 14 days citing the specific clause it violates, in
the PR thread.** And because the harness is offline and committed, anyone who distrusts even
that can publish the same extension in a fork and their numbers are reproducible by third
parties. A reader who suspects the corpus flatters `page2ai`
does not have to argue; they can add frameworks under the same rule and publish what happens.

## The freedom this rule does NOT remove

1. **F1 is a judgment at the margin.** Mitigations: the closed IN/OUT taxonomy above, the
   atomic pool-plus-log commit, and §7. Not a proof.
2. **The choice of pool sources was the author's.** Mitigations: four sources OR-ed (each
   published with its snapshot), the rejected alternatives documented above with reasons, and §7
   re-running with different parameters.
3. **Private scouting before this rule was written cannot be disproved.** The author had already
   seen the v0.2 results when designing this rule. The mechanical snapshot date and the committed
   walk bound what he can do with that knowledge, not what he knew.
4. **The F3 gate excludes client-rendered docs — the author's tool's known failure class.**
   Handled by naming and counting every such exclusion (§2) rather than pretending the bias is
   absent; removed only when a rendered-DOM track exists.
5. **The gate thresholds (3 code blocks / 5 headings) predate this rule** and are reused
   unchanged from v0.2 so they cannot be tuned here.
6. **Scale and sampling.** WebMainBench reports 7,809 human-annotated pages (90% drawn randomly
   from Common Crawl); WCXB reports 2,008 pages across 1,613 domains from Common Crawl, ChatNoir
   and curation, with a 511-page held-out test set. Those corpora sample the web; this rule ranks
   by popularity — GitHub stars measure repository popularity, not deployment share. This corpus
   is orders of magnitude smaller, popularity-weighted, and has no held-out set. Its defence is
   different: committed bytes, offline reproduction, provable commit order, and per-page
   publication of the author's losses. Deployment-weighted enumerators (Tranco, CrUX/HTTP
   Archive, W3Techs' documentation-platforms category) and a third-party-applied held-out set
   are open work for v0.4, and each would be a stronger independence device than anything here.

## Where the author's tool loses today

This section restates the v0.2 losses in the corpus document itself, so that the selection rule
and the misses travel together rather than the misses living only in a results file.

- **`docs.anthropic.com` (Mintlify): `page2ai` scores 0 — the worst result of any tool on any
  page.** The article is not in the server HTML, and `@page2ai/core` in Node has no browser to
  hydrate it. trafilatura (0.254) and defuddle (0.233) at least return fragments.
- **`rust-book` (mdBook): 0.667 against 1.0** for both trafilatura and defuddle.
- Behind the per-page winner on four more: `nextra` and `gitbook-sentry` (trafilatura),
  `python-docs` (defuddle), `hono` (readability).
- On the article-only population `page2ai` leaks more navigation than trafilatura: **7.4% against
  1.3%**. trafilatura is the cleaner extractor; page2ai the more complete one.
- **No extractor in the table — page2ai included — recalls more than 77% of article prose.**

The standing commitment carries over from v0.2 unchanged: v0.3 results are published whatever they
say, per page, including every page where `page2ai` is not the winner.

## Review record

The draft of this document was sent to five independent model arms (Gemini 3.1 Pro, Gemini 3.6
Flash, Codex, Spark, Kimi K3) on 2026-08-03 with instructions to construct exploits against it.
Four returned verified reviews; **Kimi K3 timed out at 2,400s and contributed nothing**, which is
recorded here rather than papered over. Spark's review cited no URLs it opened, so its live-check
claims were used only where a second arm independently confirmed them. Accepted and applied:

- **Snapshot-date peeking** (both Gemini arms + Codex): fixed by the mechanical first-UTC-day
  anchor in §1.
- **F3 structurally excludes the author's tool's failure class** (Codex, strongest finding of the
  round): defused by naming/counting exclusions and designating them the rendered-DOM seed (§2).
- **The page walk was not deterministic** (all arms): replaced by a normative committed script
  with precedence and exclusion rules (§3).
- **Discovery fetches contradicted "committed before any page is fetched"** (Codex): resolved by
  the hash-bound discovery log (§3, §6).
- **Blended headline keeps 58% of the score author-chosen forever** (both Gemini arms + Codex):
  two populations, separate tables (§5).
- **The cap of 10 was arbitrary** (all arms): removed (§4).
- **Overstatement audit** (all arms): "removes most of that freedom", "removes the author's
  choice of site entirely", "the entire defence", and the PR-acceptance promise were all rewritten
  to claim exactly what the mechanisms deliver.
- **"Documentation landing page" was itself undefined** (Spark, a gap no other arm named): the
  landing-page definition and the logged-ambiguity clause in §3 close it.
- **The pool capture should run in public CI** so the timestamp is third-party (Spark): §1.
- **A borderline F1 candidate defaults to IN** (Spark): over-inclusion points the bias away from
  the author; §2.
- **PR acceptance needed a mechanical criterion** (Spark): the replay workflow and the 14-day
  clause-citing rejection rule in §7.

Rejected, with reasons:

- *Gemini Pro:* replace F1 with "repository contains a docs-framework config file
  (docusaurus.config.js, mkdocs.yml...)". Rejected: that tests whether a repo **uses** a docs
  framework, not whether it **is** one, and the config-filename list would itself be an
  author-curated list — the defect it claims to fix.
- *Gemini Pro:* anchor the pool snapshot to a past date (the v0.2 release date). Rejected as
  unexecutable: GitHub search cannot be run "as of" a past date, so a backdated anchor would be
  unverifiable. The forward anchor (Codex's version) is adopted instead.
