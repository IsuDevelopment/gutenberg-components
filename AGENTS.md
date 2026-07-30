# AGENTS.md — `@isudev/gutenberg`

> This is the single source of truth for anyone (human or AI agent) working on this
> project. Read it fully before making changes. Codex and other tools must follow this
> file — see `CODEX.md`, which only points back here.

## What this project is

`@isudev/gutenberg` is a **standalone** component library for the WordPress Gutenberg
editor: components, controls, fields, hooks and helpers for building blocks and editor
panels without rewriting the same logic each time.

It ships to **npm** and is consumed **per component** — every entry point (`breakpoints`,
`components`, `controls`, `fields`, `meta`, `taxonomy`, `hooks`, `appenders`) is importable
on its own via subpath `exports`. Keep imports **convenient and minimal**; never require deep
`dist/...` paths.

```tsx
import { SelectField } from '@isudev/gutenberg/fields';
import { MetaSelectControl } from '@isudev/gutenberg/meta';
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
7. **Every component ships a `README.md` in its own folder**, documenting *all* of its
   features — every prop, variant and behaviour — with runnable usage examples. The docs
   site and the MCP tool descriptions are **generated from these files**, so an
   undocumented feature is invisible and a stale README ships as wrong documentation and a
   wrong tool description. Code, tests and README are one unit of work and land in the same
   commit. See `.agents/instructions/adding-a-component.md` and
   `.agents/instructions/changing-a-component.md`.

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
packages/gutenberg/src/  # Library source (see plan for the full tree)
examples/                # Example blocks consuming the library
```

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

- Bundler: `tsup` (esbuild), ESM only, emits `.d.ts`. Build **entries are discovered from
  the filesystem** — every `index.ts` under `src/` becomes one, so `dist/` mirrors `src/`
  and adding a component folder needs no config change. `_internal/` is skipped.
- Subpath `exports` in `package.json` are **hand-maintained**, with wildcards for
  `./components/*`, `./controls/*` and `./fields/*`. A new top-level source directory needs
  its key added by hand.
- JSX runtime: automatic, `jsxImportSource: "react"`. `@wordpress/*`, `react`, `react-dom`
  and `react/jsx-runtime` are external (decision 0002).
- Tests: Jest + `@swc/jest` + `@testing-library/react` + jsdom.
- `npm run verify:package` (`build && publint --strict && attw --profile esm-only`) is the
  packaging gate and must stay clean.

## Working agreement for agents

- Read `.agents/architecture-plan.md` before writing any code.
- Follow the staged checklist in the plan; keep changes minimal and reviewable.
- Adding or changing a component? Follow the matching file in `.agents/instructions/` —
  including its README requirement.
- Do not introduce dependencies beyond `@wordpress/*` (peer) without recording a
  decision in `.agents/decisions/`.
