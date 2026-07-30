# Adding a component

Applies to anything with a public entry point: a component, a control, a field, or a hook.
Read `../architecture-plan.md` and the core principles in `AGENTS.md` first.

## 1. Pick the category

| Category | Directory | What belongs there |
| --- | --- | --- |
| Component | `src/components/<Name>/` | Pure UI. No editor stores, no knowledge of meta, taxonomies or post types. Everything comes in through props. |
| Control | `src/controls/<Name>/` | UI wired to editor state or block attributes — composes components and hooks. |
| Field | `src/fields/<Name>/` | Goes through the binding engine (`useFieldBinding` → `useOptionsSource` + `useValueBinding`). Never a per-combination component. |
| Hook | `src/hooks/` | Behaviour with no markup. Shares one folder-level README. |

If a new *top-level* directory is needed, it also needs an `exports` key added by hand in
`packages/gutenberg/package.json` — `./components/*`, `./controls/*` and `./fields/*` are
the only wildcards, so within those three a new folder needs no packaging change.

## 2. Create the folder

```
src/components/MyThing/
  MyThing.tsx        # implementation
  types.ts           # exported props interface, one per public surface
  index.ts           # barrel: the value + its props type
  MyThing.test.tsx   # colocated tests
  README.md          # required — see step 4
```

`index.ts`:

```ts
export { MyThing } from './MyThing';
export type { MyThingProps } from './types';
```

Then re-export from the category barrel (`src/components/index.ts`) so both the deep
subpath and the category import work.

Build entries are discovered from the filesystem by `tsup.config.ts` — every `index.ts`
under `src/` becomes an entry. There is no entry list to update.

## 3. Write it test-first

- Test the load-bearing logic: resolution rules, presence semantics, state transitions,
  anything with a branch that could silently do the wrong thing.
- Do **not** write tests for tests, tests for trivial prop pass-through, or tests that
  assert a framework does its job.
- Never guess an ARIA role and then reshape the component to match the guess. Check what
  the `@wordpress/components` version in `package.json` actually renders.
- Every block must be `apiVersion: 3` / iframe-safe: no `document` or `window` globals in
  editor code. Reach the canvas document via `element.ownerDocument` using `useRefEffect`
  from `@wordpress/compose`.
- Import hooks and React types from `react`, not `@wordpress/element` (decision 0002).
- `__experimental*` / `__unstable*` imports from `@wordpress/components` are allowed in
  exactly one file, `src/_internal/wp-components.ts` (decision 0004). Import the stable
  alias from there.
- No dependency outside `@wordpress/*` (peer) without an ADR in `../decisions/`.

## 4. Write the README — required, not optional

**Every component ships a `README.md` in its own folder.** No component is complete
without one, and "I'll document it later" is not a state this project has.

This is not housekeeping. The public documentation site and the MCP tool descriptions are
**generated from these files** — an undocumented feature is an invisible feature, and a
wrong README becomes wrong docs and a wrong tool description. The README, not the source,
is what consumers and agents read.

Document **every** feature the component supports: every prop, every variant, every
behaviour worth relying on, and every way it can surprise someone. If a prop exists, it
appears in the props table. If a behaviour is deliberate, it appears under *Behavior*.

Use `src/components/BreakpointSwitcher/README.md` as the reference — copy its shape:

```md
---
name: MyThing
entrypoint: "@isudev/gutenberg/components"
kind: component        # component | control | field | hook
status: stable         # stable | experimental
since: 0.3.0           # version that first shipped it
---

## Summary
One or two sentences: what it does, in the author's terms.

## When to use / When not to use
Including which sibling component to reach for instead.

## Import
Both the category import and the deep subpath.

## Props
| Name | Type | Default | Required | Description |
Every prop. `—` for no default. Escape pipes inside types as `\|`.

## Examples
At least two, and they must be real, runnable usage — not signatures.
Cover the minimal case first, then each meaningful variant or option.

## Behavior
Rendering rules, controlled/uncontrolled, edge cases, dev warnings.

## Styling
Whether a stylesheet ships, which CSS custom properties matter.

## Gotchas
The things that cost someone an afternoon.

## Related
Relative links to the components and hooks that pair with it.
```

**Examples are the part people actually read.** Give a copy-pasteable block per feature:
the simplest possible use, then each variant, then the awkward-but-real case. An example
that omits required props teaches the wrong thing.

## 5. Guard the README against drift

Add the component to `CASES` in `tests/readme-props-drift.test.ts`:

```ts
{
	name: 'MyThing',
	readme: path.join( SRC, 'components/MyThing/README.md' ),
	types: path.join( SRC, 'components/MyThing/types.ts' ),
	interfaceName: 'MyThingProps',
},
```

The guard compares the props table against the TS interface in **both** directions, so a
new prop cannot land undocumented and a removed prop cannot linger in the docs.

Known limitation: the helper throws on an interface with `extends`. If your props
interface inherits members, either flatten it or resolve inheritance in
`tests/helpers/props-from-interface.ts` — do not skip the guard.

## 6. Verify

Run from `packages/gutenberg` (with the Node version from `.nvmrc`):

```bash
npm test
npm run typecheck
npm run verify:package
```

`verify:package` must be clean: `publint --strict` reports nothing and `attw`'s
`esm-only` profile is green for every subpath. Wildcard subpaths reporting as
`(wildcard)` is expected.

Then exercise it for real in `examples/test-blocks` — add or extend a block, build, and
check it in the editor. A component that has never been rendered in WordPress is not done.

## 7. Record and commit

- Architectural choice made along the way? ADR in `../decisions/`.
- Update `../status.md` (what shipped, what is left).
- New top-level entry point? Add it to the entry-point list in `AGENTS.md`.
- Commit source, tests and README **together**. Never commit a component whose README
  lands in a follow-up.
- Never commit absolute local paths.
