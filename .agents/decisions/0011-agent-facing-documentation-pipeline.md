# 0011 — Agent-facing documentation pipeline

- Status: accepted
- Date: 2026-08-02

## Context

Decision 0005 put a README beside every module and made those files the single source of
truth for its documentation. Nothing consumed them yet: the package README carried a
hand-maintained catalog, there was no docs site, and a consumer's coding agent had no way to
find any of it.

Shipping the READMEs inside the tarball — which `files` already did — is not sufficient on
its own. Cursor, Copilot, Windsurf and most IDE agents exclude `node_modules` from their
index and their search, so documentation that only exists there is invisible in practice. The
mechanisms that do reach an agent in a consumer project are, in descending order of
reliability: a pointer in the consumer's own `AGENTS.md` (read natively by Codex, Cursor,
Copilot, VS Code, Windsurf, Zed, Junie, Aider and others); a Context7 index entry, which
works with zero setup in the consumer repo but only for consumers who have Context7
installed; and `llms.txt` on a docs site, which agents fetch when pointed at it but never
discover on their own.

## Decision

One generator, four consumers, no second source of truth.

`packages/gutenberg/scripts/catalog.ts` reads the colocated READMEs — frontmatter, the
`## Summary` paragraph and the `## Props` table — and is the only thing that parses them. It
runs on plain `node`: Node 22 strips the type annotations, so the generator needs no build
step and no dependency. It emits two artifacts (see the 2026-08-03
amendment below for how they reach their consumers):

- `catalog.json` — the machine-readable module surface, also exported as
  `@isudev/gutenberg/catalog.json` and served from the docs site.
- `AGENTS.md` — the consumer-facing agent guide, hand-written prose from
  `scripts/agents-preamble.md` plus the generated catalog. It is an index, not a copy: each
  entry points at the module's own README rather than inlining its props, so an agent spends
  a small, fixed number of tokens to find the right module and then reads one file.

Those artifacts feed:

1. **The npm tarball.** `AGENTS.md` and `catalog.json` join `src/**/README.md` in `files`.
2. **`npx @isudev/gutenberg init`** (`bin/isudev-gutenberg.mjs`). Copies the guide to
   `.agents/vendor/isudev-gutenberg.md` in the consumer's repo and adds a pointer to their
   `AGENTS.md`, plus `.cursor/rules/` and `.github/copilot-instructions.md` when those
   already exist. Everything it writes lives between markers, so re-running is safe and the
   consumer's own content is never touched. `init --check` is the CI gate against a vendored
   copy going stale after an upgrade. Plain JavaScript, because it runs on the consumer's
   Node, which may predate type stripping.
3. **`context7.json`** at the repository root, so agents with Context7 get the library
   without anyone touching the consumer repo.
4. **`docs/`** — a Starlight site whose reference pages are projected from the same READMEs
   by `scripts/sync-content.mjs`, publishing `llms.txt`, `llms-full.txt` and `llms-small.txt`
   via `starlight-llms-txt`.

The vendored copy in `init` is deliberate rather than a pointer into `node_modules`: it is
greppable, versioned with the consumer's code, and immune to the `node_modules` exclusions
that make the pointer approach unreliable. `--check` is what keeps it honest.

Starlight requires Astro 7, which requires Node 22, so the repository baseline moves from
Node 20 to Node 22 (`.nvmrc`, root `engines`). Nothing in the library itself needed the bump.

## Consequences

- Superseded by the 2026-08-03 amendment: the generated files are no longer committed, so
  they no longer appear in diffs and cannot drift.
- A README that omits `## Summary` or the frontmatter `name` now fails the generator rather
  than producing a silently incomplete catalog. `.agents/instructions/adding-a-component.md`
  carries that requirement.
- The docs workspace pulls Astro and its dependency tree into the monorepo — by far the
  largest dependency addition the project has made. It is confined to `docs/`, and neither
  the library's runtime nor its build touches it.
- One workaround is load-bearing: `docs/` declares `cookie@^2` as a devDependency because npm
  hoists the CommonJS `cookie@0.7.2` from `@wordpress/scripts` to the repository root, where
  Astro's emitted prerender chunk resolves it and fails. Documented in `docs/README.md`.
- `llms.txt` embeds absolute URLs, so the docs site needs `DOCS_SITE` set in any published
  build; the local default is `http://localhost:4321` and the deploy workflow refuses to run
  without the real origin. The reference pages link to each other absolutely, which commits
  the site to the root of its origin — deployed to Cloudflare Workers static assets, chosen
  over Pages because Cloudflare has recommended Workers for new static projects since it
  reached parity in March 2026, and over Vercel because Vercel's free Hobby plan is
  non-commercial only.
- The package README's hand-maintained catalog is now redundant with `AGENTS.md`. It stays
  for human readers and keeps its own drift test, but it is the one place where the same
  facts are still written twice.

## Amendment 2026-08-03 — generate on demand, do not commit

`catalog.json` and `packages/gutenberg/AGENTS.md` were committed so they would be readable on
GitHub and inside the tarball without a build. The cost was a required second command: edit a
README, then remember `npm run catalog`, or `catalog:check` fails CI and blocks the deploy.
That is the wrong trade for a working loop that should be "edit a README, push, done".

Both files are now **gitignored and generated where they are consumed**:

- `prepack` runs the generator, so `npm pack` and `npm publish` always carry current copies —
  this is what makes the tarball correct, and it means a release must go through npm's own
  packing rather than a hand-assembled directory.
- `docs:build` runs it before projecting the site, so a deploy always reflects the commit.
- `npm run build` still runs it, which is why `verify:package` exercises the whole path.

`catalog:check` and the generator's `--check` mode are gone; there is no longer anything that
could be stale. `tests/catalog.test.ts` keeps the part that still matters — that the generator
sees every module and parses the prop tables — and drops the file comparisons.

What was given up: the two files can no longer be read on GitHub, and Context7 indexes the 28
colocated READMEs and the package README instead of the generated index. That is a modest loss;
the READMEs were always the better content, and the generated index exists for agents holding
an installed copy, which `init` and the tarball both provide.

The alternative considered and rejected was having CI regenerate and commit back to `main`. It
keeps the committed copies, but two workflows then race over the same generated files, the
bot's push re-triggers the deploy, and the whole arrangement breaks the moment branch
protection lands on `main`.
