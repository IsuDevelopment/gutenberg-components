# Project status

Last updated: 2026-07-30

## Where we are

Scaffold is complete and verified end-to-end (built + externalization checked + symlinked
into a local WordPress site). The `feat/breakpoint-switcher` plan (10 tasks) has landed the
responsive-value stack described below; only the plan's manual in-editor checks (task 10,
step 4) remain undone — see "Next steps".

Done:
- Monorepo (npm workspaces): `packages/gutenberg` (library) + `examples/test-blocks` (WP plugin).
- Toolchain targets **WP 7.0**: `@wordpress/*` deps pinned to the 7.0 line, `@wordpress/icons`
  declared as a peer, example plugin's `Requires at least` bumped to 7.0. All blocks
  (`demo`, `responsive-demo`) are `apiVersion: 3` so the post editor can iframe them.
- Build: `tsup` (ESM + `.d.ts`). Build **entries** are discovered from the filesystem;
  subpath `exports` in `package.json` are **hand-maintained**. Wildcard exports exist for
  `./components/*`, `./controls/*` and `./fields/*` only, so a new component folder in one of
  those categories needs no change, while a new top-level source directory needs its
  `exports` key added by hand. React + `@wordpress/*` external (decision 0002).
- Test harness: Jest + `@swc/jest` + `@testing-library/react` + `jest-environment-jsdom`.
  27 tests pass across breakpoint validation/resolution, both hooks, `BreakpointSwitcher`,
  `ResponsiveControl`, and a README-vs-`types.ts` prop-table drift guard.
- Binding engine: `useFieldBinding` → `useOptionsSource` + `useValueBinding`.
  - Options sources: `terms`, `posts`, `users`, `postTypes`, `manual`
    (loading/error via `hasFinishedResolution` / `getResolutionError`).
  - Value bindings: `meta`, `taxonomy` (auto `rest_base` + single↔array mapping), `custom`,
    plus controlled `value`/`onChange` with dev-warning on conflict.
- Fields: `SelectField`, `RadioField`. Easy wrappers: `MetaSelectControl`,
  `MetaRadioControl`, `TaxonomySelectControl`.
- Hooks: `useCurrentPostType`, `useCurrentPostId`, `useDebouncedValue`, `usePrevious`.
- **Breakpoints kernel** (`src/breakpoints/`): `DEFAULT_BREAKPOINTS`, `isPresent`,
  `resolveAttrName`, `resolveCascade` (with `skipActive`), `buildHasValueMap`,
  `validateBreakpoints`/`useValidatedBreakpoints`. Zero-is-a-value semantics throughout.
- **`useBreakpoint`** (`src/hooks/`): breakpoint selection state with opt-in `syncToEditor`/
  `syncFromEditor` against `core/editor`'s device-preview store (capitalized device-type
  values).
- **`useResponsiveAttribute`** (`src/hooks/`): per-breakpoint attribute read/write/reset
  against a block's `attributes`/`setAttributes`, built on the kernel above.
- **`BreakpointSwitcher`** (`src/components/`): inline (`ToggleGroupControl`) and dropdown
  (`DropdownMenu`) variants, override indicator, dev-warning fallback for invalid
  breakpoint sets. No CSS shipped; override dot is an inline style.
- **`ResponsiveControl`** (`src/controls/`): wires switcher + hook + a render-prop child
  together; `variant`, `syncToEditor`/`syncFromEditor`, `showReset` all exposed.
- Each component/control ships a `README.md` with a YAML front-matter + prop table, checked
  against its `types.ts` by `tests/readme-props-drift.test.ts` — a drift guard that reads the
  interface off the TypeScript AST and fails the suite if the docs and the types disagree.
- `verify:package` (`npm run build && publint --strict && attw --pack . --profile esm-only`)
  is clean: `publint` reports no issues; `attw`'s `esm-only` profile is green for every
  subpath (wildcard subpaths report as "(wildcard)", which is expected — `attw` cannot
  resolve a glob export to a concrete file).
- Demo block (`isudev/demo`) exercises `SelectField` (manual options + `postTypes` source).
  Responsive demo block (`isudev/responsive-demo`) exercises `ResponsiveControl` in both
  variants: an inline `RangeControl` with no editor sync, and a dropdown `SelectControl`
  with `syncToEditor`/`syncFromEditor` enabled, printing the resolved value per breakpoint
  as visible text.
- `tsc` typecheck clean (library + `tests/`); library and both example blocks build;
  `@isudev/gutenberg` bundles into each block while `wp-*` + `react-jsx-runtime` stay
  external. `examples/test-blocks/test-blocks.php` registers every directory under
  `build/` via `glob()`, so a third example block needs no PHP change.

## Environment notes

- Node 20, npm 10. WP 7.0 on a local site.
- Symlink: `<your-site>/wp-content/plugins/isudev-test-blocks` → `examples/test-blocks`.
  The real path lives in `WP_PLUGINS_DIR` in the developer's shell, never in the repo.
- Node: `.nvmrc` pins 20.19.6. A system Node 16 at `/usr/local/bin/node` shadows nvm in
  non-login shells, so run `nvm use` (or prefix `PATH`) before anything — a stale Node 16
  breaks Jest, tsup and `@wordpress/scripts` in ways whose error messages do not mention Node.
- esbuild's native binary was previously noted as unable to exec in the agent sandbox
  (error -88). Re-checked 2026-07-30 under Node 20: it runs fine (`esbuild --version` →
  0.27.7). Treat the old note as stale, but if a build fails with a native-binary error,
  fall back to installing with `--ignore-scripts` and building in a normal terminal.
- `TMPDIR` was pointed at `./.tmp` to avoid filling the sandbox tmp volume (gitignored).
- Committed on `feat/breakpoint-switcher`, off `master`; not yet merged.

## Next steps

1. **Manual in-editor verification of `isudev/responsive-demo`** (the `feat/breakpoint-switcher`
   plan's task 10, step 4 — not yet done by anyone; no browser was available while landing
   this commit). Add the block to a post in a local WP 7.0 site and check:
   1. The Column Gap row shows three icons; Desktop is selected.
   2. Set gap 24 on Desktop. Switch to Tablet: the range is empty and shows 24 as
      placeholder; the list line for tablet reads 24.
   3. Set gap 0 on Mobile. The mobile line reads 0, not 24 — the zero-is-a-value rule.
   4. Tablet and Mobile icons show the override dot; Desktop never does.
   5. A Reset button appears on Tablet and Mobile but not on Desktop.
   6. The Layout row shows a single dropdown button; opening it lists all three breakpoints
      with the active one marked.
   7. Changing the Layout breakpoint also changes the editor's device preview, and using the
      editor's own preview switcher moves the Layout breakpoint. Column Gap does not follow,
      since it opted out.
   8. Browser console: no warnings from `@isudev/gutenberg`, no React key or hook warnings.

   Fix anything that fails. If step 7 misbehaves, check `core/editor`'s device-type values
   are capitalized.
2. Remaining fields: `TextField`, `ToggleField`, `CheckboxField`; wrappers
   `MetaTextControl`, `MetaToggleControl`, `TaxonomyRadioControl`, `TaxonomyCheckboxControl`.
3. The other stage 7 components/controls beyond `BreakpointSwitcher`/`ResponsiveControl`.
4. Consider `searchable` mode for `posts`/`users` sources (avoid `per_page: -1`).
5. Decide the CSS strategy once a component actually needs a stylesheet — `sideEffects`
   stays `false` until then; see the BreakpointSwitcher README and decision 0001 for what
   must change when one ships.

### Carried over from the `feat/breakpoint-switcher` review

Real but deliberately not fixed in that branch. None blocks anything; each is recorded so it
is not rediscovered from scratch.

6. **Source maps ship without their sources.** `npm pack` includes `dist/**/*.js.map`, but
   `files` publishes no `src/*.ts`, so the maps are dead weight for consumers. Decide: publish
   `src`, or drop `sourcemap` for release builds.
7. **The README drift guard cannot handle `extends`.** `propsFromInterface` now throws loudly
   on `heritageClauses` instead of silently under-counting, but that means
   `ResponsiveControlRenderArgs` — which extends `UseResponsiveAttributeResult`, and is the
   obvious next entry for the guard — cannot join `CASES` until the helper resolves inherited
   members. Consequence today: those inherited render-prop fields (`hasValue`, `hasOwnValue`,
   `attrNameForBreakpoint`, `reset`, `resetAll`, `breakpoint`) are undocumented and unguarded.
8. **`bindings/`, `types/` and `utils/` build to `dist/` with no `exports` key**, so they ship
   as orphan files (~2 KB). Nothing is truly unreachable, since the root barrel re-exports
   them. Consider adding `./bindings` — `AGENTS.md` calls the binding engine the central design
   idea, yet it has no subpath of its own.
9. **`useDebouncedValue` and `usePrevious` still import from `@wordpress/element`** while all
   newer code imports from `react` (decision 0002 amendment). Migrating them is what finally
   makes `@wordpress/element` droppable from the peer list.
10. **Three ways to resolve "the active breakpoint"** exist across `useBreakpoint`,
    `useResponsiveAttribute` and `DropdownSwitcher`, with different fallbacks (base vs
    `breakpoints[0]`). They coincide now that the base is validated to be first, so this is
    cosmetic — but one kernel helper would collapse all three.
11. **`useValidatedBreakpoints` is public, named as a hook, and calls no hooks.** It is an
    internal guard carrying React's hook-rules expectations for no reason. Renaming or
    unexporting it is a pre-1.0 cleanup.
12. ~~**`AGENTS.md`'s "Build & tooling (to finalize in Stage 1)" section is stale**~~ —
    fixed 2026-07-30: the section now describes the shipped setup (discovered entries,
    `jsxImportSource: "react"`, hand-maintained exports, `verify:package` as the gate).

## Documentation gap

`src/fields/SelectField` and `src/fields/RadioField` have **no `README.md`**, and neither do
the `meta`/`taxonomy` wrappers. They predate the rule in `AGENTS.md` principle 7 and
`instructions/adding-a-component.md`. Every one of them needs a README before the docs
generation or the MCP tool descriptions can be built, and each should join `CASES` in
`tests/readme-props-drift.test.ts` once written.

See `architecture-plan.md` for the full staged checklist.
