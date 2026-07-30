# Changing a component

For any change to an existing component, control, field or hook. See
`adding-a-component.md` for new ones — the README rules there apply here too.

## The rule

**A change to a component's behaviour or API is not finished until its `README.md`
matches it, in the same commit.**

The docs site and the MCP tool descriptions are generated from these READMEs. A stale
README is not a cosmetic problem: it ships as documentation and as a tool description that
tells an agent to call the component the old way. Code and README are one unit of work.

The props-table drift guard (`tests/readme-props-drift.test.ts`) catches added and removed
props. It cannot catch a changed default, a changed behaviour, a new variant, or an example
that no longer runs. Those are on you.

## What to update, by kind of change

| Change | README sections to update |
| --- | --- |
| Added a prop | *Props* (+ an *Examples* block if it unlocks a real use case) |
| Removed a prop | *Props*, and every *Examples* block that used it |
| Renamed a prop | *Props*, *Examples*, *Gotchas* if the old name lingers anywhere |
| Changed a default | *Props* default column, and *Behavior* if the default drives it |
| New variant or mode | *Props*, a dedicated *Examples* block, *Behavior* |
| Changed rendering or edge-case handling | *Behavior*, and *Gotchas* if it can surprise |
| Added or changed a dev warning | *Behavior* |
| Now ships or drops CSS | *Styling*, and `sideEffects` in `package.json` |
| Deprecated something | *Props* description, *Behavior*, and `status` in the front matter |
| Fixed a bug people worked around | *Gotchas* — remove the stale warning |

If a change makes an example obsolete, **rewrite the example**. Deleting it is second best;
leaving it is not an option. Examples are what consumers copy.

## Front matter

- `since:` records when the component first shipped — do not touch it on a change.
- `status:` moves `experimental` → `stable` only deliberately.
- Breaking change? Note it in the relevant section in the author's terms — what to change
  in their code, not what changed in ours.

## Checklist

1. Change the code and its tests together. Extend the existing colocated test file; add a
   case only where the new behaviour could silently regress.
2. Update the README per the table above.
3. Update any *sibling* README that cross-references the changed behaviour — the *Related*
   links tell you which ones. `ResponsiveControl`, `BreakpointSwitcher` and the hooks
   README describe each other.
4. From `packages/gutenberg`: `npm test`, `npm run typecheck`, and `npm run verify:package`
   if anything about exports, entry points or dependencies moved.
5. Re-check it in the editor via `examples/test-blocks` if rendering or markup changed.
   Tests pin structure, not appearance.
6. Architectural change? ADR in `../decisions/`, or a dated amendment to the existing one
   rather than a rewrite. Behavioural change to something a spec in `../specs/` describes?
   Amend the spec with a dated note.
7. Update `../status.md` if the change moves the project's state.
8. Commit code, tests and README together.

## Do not

- Reshape a component to satisfy a test you guessed at — verify what
  `@wordpress/components` actually renders at the version pinned in `package.json`.
- Reach for `__experimental*` outside `src/_internal/wp-components.ts` (decision 0004).
- Add a dependency outside `@wordpress/*` without an ADR.
- Introduce `document` / `window` globals — the post editor is iframed unconditionally in
  WP 7.1 (`element.ownerDocument` via `useRefEffect`).
- Commit absolute local paths.
