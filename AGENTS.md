# AGENTS.md — `@isudev/gutenberg`

> This is the single source of truth for anyone (human or AI agent) working on this
> project. Read it fully before making changes. Codex and other tools must follow this
> file — see `CODEX.md`, which only points back here.

## What this project is

`@isudev/gutenberg` is a **standalone** component library for the WordPress Gutenberg
editor: components, controls, fields, hooks and helpers for building blocks and editor
panels without rewriting the same logic each time.

It ships to **npm** and is consumed **per component** — every entry point (`breakpoints`,
`bindings`, `components`, `controls`, `fields`, `meta`, `taxonomy`, `hooks`, `appenders`) is
importable on its own via subpath `exports`, and each of the component categories also has a
wildcard subpath so a single component can be imported without its barrel. Keep imports
**convenient and minimal**; never require deep `dist/...` paths.

```tsx
import { SelectField } from '@isudev/gutenberg/fields';
import { MetaSelectControl } from '@isudev/gutenberg/meta';
// or one component at a time, no barrel:
import { useBreakpoint } from '@isudev/gutenberg/hooks/useBreakpoint';
```

## Core principles (non-negotiable)

1. **Standalone — zero host-project coupling.** No imports from any host project,
   agency package, or project-wide config file. Icons, option lists and configuration
   are **injected via props**, never read from a global registry. See decision 0001.
2. **`optionsSource !== valueBinding`.** Where a field reads its options is a separate
   concern from where it reads/writes its value. This is the central design idea.
3. **Two modes.** *Easy mode* (`MetaSelectControl`, `TaxonomySelectControl` — pass one
   key) and *advanced/composition mode* (`SelectField`, `RadioField` — compose
   `optionsSource` + `valueBinding`). Simple things stay simple; edge cases don't
   require hacking components.
4. **One engine.** All fields go through `useFieldBinding` → `useOptionsSource` +
   `useValueBinding`. No per-combination components, no bespoke HOCs.
5. **Stable public API.** Public surface is controlled by `exports` in `package.json`.
   Anything under `_internal/` is private and never exported.
6. **Only `@wordpress/*` at runtime** (peer deps). Nothing else.
7. **One component, one folder.** Every public component, control, field, easy-mode wrapper
   and hook lives in its own directory — `src/hooks/useBreakpoint/`, not
   `src/hooks/useBreakpoint.ts`. The folder is what gives it room for its README,
   screenshots, tests and `types.ts`. Public types belong in `<Folder>/types.ts`; the
   category barrel re-exports the value **and** its type.
8. **Every component ships a `README.md` in its own folder**, documenting *all* of its
   features — every prop, variant and behaviour — with runnable usage examples. Everything
   an agent or a reader ever sees is **generated from these files**: `catalog.json`, the
   `AGENTS.md` shipped in the tarball, and every page on the docs site. An undocumented
   feature is invisible, and a stale README ships as wrong documentation everywhere at once.
   Code, tests and README are one unit of work and land in the same commit. See
   `.agents/instructions/adding-a-component.md` and
   `.agents/instructions/changing-a-component.md`.
9. **The main package README is the public module catalog.** Every new public component,
   control, field, easy-mode wrapper or hook must add an entry to
   `packages/gutenberg/README.md` in the same change. The entry must contain a short
   description, the narrowest supported import, and a relative link to that module's
   colocated README. This is the one catalog written by hand — it is for human readers
   arriving from npm, and `tests/readme-props-drift.test.ts` fails when it falls behind.
   Everything else is generated from the colocated READMEs.
10. **Versions follow the published history; never bump one during feature work.** A release
    is a deliberate, separate step (`npm version` + a tag), not something a feature commit
    does on the way past. A module README's `since:` is the version the module *first
    shipped in*: for anything added after `0.1.0` that is the next unreleased minor, and it
    stays put once released. Do not retroactively renumber a `since:` that has shipped.

## Language & style

- **Never commit absolute local paths.** No `/Users/...`, no home directories, no machine
  or site names. This is a public npm package; local paths expose the maintainer's
  filesystem and are useless to everyone else. Use `$PWD`, `$HOME`, a `<placeholder>`, or
  an environment variable documented in `.agents/instructions/local-development.md`.
  Machine-specific values belong in the shell or `.env.local` (gitignored), not the repo.
- **English only** — all code, comments, JSDoc, docs, commit messages, and identifiers.
- Components: `PascalCase`. Hooks: `useCamelCase`. Options source types: `terms`,
  `posts`, `users`, `postTypes`, `manual`, `custom`. Value bindings: `meta`, `taxonomy`,
  `custom`.

## Where things live

```
.agents/
  status.md              # Current progress + next steps (READ THIS FIRST to resume)
  architecture-plan.md   # Full architecture & implementation plan
  decisions/             # ADRs — one file per architectural decision
  instructions/          # Task/workflow instructions for agents
  skills/                # Reusable skills / procedures
  specs/                 # Approved designs — YYYY-MM-DD-<topic>-design.md
  plans/                 # Implementation plans — YYYY-MM-DD-<feature>.md
packages/gutenberg/      # The library (see the code map below)
examples/test-blocks/    # WordPress plugin with example blocks consuming the library
docs/                    # Starlight site, projected from the colocated READMEs. See docs/README.md.
context7.json            # Makes the library indexable by Context7, so agents get it with no setup.
```

Note the two files named `AGENTS.md`. **This one** is the contributor guide for people and
agents working *on* the library. `packages/gutenberg/AGENTS.md` is generated, ships in the
tarball, and is the guide for agents *consuming* the library. See decision 0011.

### Code map — `packages/gutenberg/`

```
src/
  index.ts               # root barrel; prefer the subpath entry points
  breakpoints/           # kernel: cascade resolution, presence rule, validation. No UI, no stores.
  bindings/              # the one engine: useFieldBinding → useOptionsSource + useValueBinding
    options/             #   terms, posts, users, postTypes, manual
    values/              #   meta, taxonomy, custom
  components/<Name>/     # pure UI, props-only. Breakpoints, icons, media preview/focal point.
  controls/<Name>/       # Editor UI: responsive, link and modular media editing surfaces.
  fields/<Name>/         # advanced mode: compose optionsSource + valueBinding. SelectField, RadioField.
  meta/<Name>/           # easy mode over a field, meta binding pre-filled
  taxonomy/<Name>/       # easy mode over a field, taxonomy binding pre-filled
  hooks/<useName>/       # one folder per hook; hooks/README.md is the index
  appenders/             # inserter/appender UI (empty, stage 8)
  types/                 # shared public types: fields, options, bindings
  utils/                 # tiny shared helpers
  _internal/             # private. Never exported. Only place allowed to import __experimental*.
scripts/
  catalog.ts             # the one reader of the colocated READMEs; generates the two files below
  agents-preamble.md     # hand-written prose that heads the generated AGENTS.md
bin/
  isudev-gutenberg.mjs   # `npx @isudev/gutenberg init` for consumer projects
AGENTS.md                # GENERATED, gitignored — consumer-facing agent guide; packed by prepack
catalog.json             # GENERATED, gitignored — machine-readable module surface; packed by prepack
tests/                   # cross-cutting tests + helpers (the README props and catalog drift guards)
tsup.config.ts           # entries discovered from the filesystem — no entry list to maintain
tsconfig.typecheck.json  # what `npm run typecheck` uses; covers src, tests AND scripts
```

Every directory under `components/`, `controls/`, `fields/`, `meta/`, `taxonomy/` and
`hooks/` holds one component: its implementation, `types.ts`, `index.ts`, its colocated
test, and its `README.md`.

**All project knowledge — skills, instructions, decisions, specs, plans — lives under
`.agents/`.** When you make an architectural decision, record it in `.agents/decisions/`.
When you define a repeatable procedure, add it to `.agents/skills/`.

Specs and plans live in `.agents/specs/` and `.agents/plans/` — **not** under `docs/`.
They are shared working context for everyone on the project, and keeping them beside the
decisions and instructions means one place to look. This overrides any tool default that
writes them to `docs/`. `docs/` is reserved for generated, user-facing documentation.

Start here for common work:

- `.agents/instructions/adding-a-component.md` — new component, control, field or hook.
- `.agents/instructions/changing-a-component.md` — modifying an existing one.
- `.agents/instructions/local-development.md` — linking the library into a local WP site.

## Reference material (read-only, do NOT depend on it)

Third-party libraries vendored under `.agents/examples/` (gitignored) are studied for
prior art only — how they solve packaging, exports, testing and docs. Never import from
them and never copy their code; reimplement, then record what we adopted and why in
`.agents/decisions/`.

Current prior art:

- `.agents/examples/block-components` — `@10up/block-components`. Notable for wildcard
  subpath `exports` with filesystem-discovered build entries, colocated per-component
  `readme.md`, and mirroring `DependencyExtractionWebpackPlugin`'s bundled-package list.

## Build & tooling

- **Node 22** (`.nvmrc`, root `engines`). The library does not need it; Astro 7, and
  therefore the docs site, does. The generator relies on it too — `node scripts/catalog.ts`
  works because Node 22 strips the type annotations, so the generator has no build step and
  no dependency of its own.
- **`npm run catalog`** writes `packages/gutenberg/AGENTS.md` and `catalog.json` from the
  colocated READMEs. Neither is committed: `prepack` regenerates them for the tarball and
  `docs:build` for the site, so a README edit needs no second command and nothing can go
  stale. Never hand-edit them — the prose heading `AGENTS.md` lives in
  `scripts/agents-preamble.md`. Decision 0011 has the full picture.
- Bundler: `tsup` (esbuild), ESM only. Build **entries are discovered from
  the filesystem** — every `index.ts` under `src/` becomes one, so `dist/` mirrors `src/`
  and adding a component folder needs no config change. `_internal/` is skipped.
- **Declarations come from `tsc -p tsconfig.build.json`**, not tsup — tsup builds one program
  per entry and ran out of heap once every component folder became an entry (decision 0006).
- **Relative imports must carry an explicit `.js` extension**: `'./types.js'`,
  `'../../breakpoints/index.js'`. Without it the emitted `.d.ts` files do not resolve under
  Node's ESM rules. TypeScript, Jest and the WordPress webpack build all accept it, so only
  `verify:package` catches a violation — which is why that gate matters.
- Subpath `exports` in `package.json` are **hand-maintained**, with wildcards for
  `./components/*`, `./controls/*`, `./fields/*`, `./meta/*`, `./taxonomy/*` and `./hooks/*`.
  A new top-level source directory needs its key added by hand.
- JSX runtime: automatic, `jsxImportSource: "react"`. `@wordpress/*`, `react`, `react-dom`
  and `react/jsx-runtime` are external (decision 0002).
- Tests: Jest + `@swc/jest` + `@testing-library/react` + jsdom.
- **Releases** are tag-driven and the procedure is `RELEASING.md` — follow it rather than
  improvising. In short: work lands on `stage`, `main` is fast-forwarded from it, and a
  `v<version>` tag on `main` makes `.github/workflows/release.yml` verify the tag against the
  declared version, run the full gate and publish over OIDC. Never publish by hand unless the
  workflow is broken.
- `npm run verify:package` (`build && publint --strict && attw --profile esm-only &&
  smoke:package`) is the packaging gate and must stay clean. `scripts/smoke-package.ts`
  covers what `attw` cannot: it packs, extracts the tarball into a temporary `node_modules`
  and resolves all 35 public subpaths from it, because `attw` reports the six wildcard
  `exports` keys as `(wildcard)` and skips the 22 per-module subpaths entirely.

## Working agreement for agents

- Read `.agents/architecture-plan.md` before writing any code.
- Follow the staged checklist in the plan; keep changes minimal and reviewable.
- Adding or changing a component? Follow the matching file in `.agents/instructions/` —
  including its README requirement.
- Keep the public module catalog in `packages/gutenberg/README.md` synchronized: every
  public module needs a short description, its narrowest import and a link to its own
  README.
- Nothing to run after a README edit: the catalog is generated wherever it is consumed.
  `npm run catalog` exists if you want to read the output locally.
- Do not introduce dependencies beyond `@wordpress/*` (peer) without recording a
  decision in `.agents/decisions/`.

## WordPress-Specific Hooks

- Post-related hooks should work with the global post context
- Term-related hooks should handle taxonomies correctly
- Block-related hooks should follow WordPress Block Editor patterns
- Consider editor-specific vs. frontend usage when appropriate
