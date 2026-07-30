# 0005 — Per-component folders, colocated READMEs as the documentation source

- Status: accepted
- Date: 2026-07-30

## Context

The library is consumed per component, and the plan is to generate two things from this
repo: a public documentation site, and MCP tool descriptions that let an AI agent use the
library correctly. Both need a per-component description that is complete, current, and
machine-locatable.

Two habits stood in the way.

First, layout was inconsistent. `components/`, `controls/` and `fields/` used one folder per
component, but `meta/`, `taxonomy/` and `hooks/` held loose files —
`src/hooks/usePrevious.ts`, `src/meta/MetaSelectControl.tsx`. A loose file has nowhere to
put a README, a screenshot, or a `types.ts`, so documentation for those entry points either
did not exist or was pooled into one folder-level file. `src/hooks/README.md` documented two
of six hooks and was the only documentation any of them had.

Second, nothing made documentation part of finishing a component. `SelectField` and
`RadioField` shipped with no README at all. Under a generated-docs model this is not a
tidiness problem: an undocumented prop is invisible to consumers, and a stale README becomes
a wrong tool description that an agent will act on.

## Decision

**One component, one folder.** Every public component, control, field, easy-mode wrapper and
hook gets its own directory holding its implementation, `types.ts`, `index.ts`, its colocated
test and its `README.md`. This applies to a five-line hook exactly as it applies to a
composite control. Kernel modules with no UI and no store access (`breakpoints/`,
`bindings/`, `types/`, `utils/`) stay flat — they are libraries, not components.

**The colocated `README.md` is the documentation source of record**, not a courtesy file. It
documents every prop (including props inherited through `extends`), every variant, every
behaviour, and carries runnable examples. Code, tests and README are one unit of work and
land in the same commit. `src/hooks/README.md` is demoted to a folder index.

Public types live in `<Folder>/types.ts` so tooling has one place to look, and category
barrels re-export the value **and** its type.

Mechanically this is enforced three ways: `tsup` discovers entries from the filesystem, so a
folder is all it takes to become an entry point; wildcard `exports` cover `./components/*`,
`./controls/*`, `./fields/*`, `./meta/*`, `./taxonomy/*` and `./hooks/*`, so no packaging
change is needed per component; and `tests/readme-props-drift.test.ts` compares each README's
props table against its TypeScript interface in both directions.

## Consequences

- Every component is importable on its own (`@isudev/gutenberg/hooks/useBreakpoint`) without
  touching `package.json`. `./bindings` gained an `exports` key at the same time.
- The docs generator and the MCP description generator can rely on a fixed shape:
  `<category>/<Name>/README.md` with YAML front matter and a `## Props` table, plus
  `## Returns` for hooks.
- More files. A one-line hook now costs a folder, an `index.ts`, and a README. Accepted: the
  cost is per component and paid once, and it is what makes the docs pipeline possible at all.
- The drift guard only covers what a TypeScript interface can express. Changed defaults, new
  variants and obsolete examples still need human attention — see
  `instructions/changing-a-component.md`.
- Deep imports that reached past a barrel into a file path (`src/hooks/usePrevious`) still
  resolve, because the folder's `index.ts` sits where the file used to be.
- Two follow-ups landed with the restructure: `useDebouncedValue` and `usePrevious` moved
  from `@wordpress/element` to `react` (decision 0002's amendment), and `./bindings` stopped
  being an orphan build output.
