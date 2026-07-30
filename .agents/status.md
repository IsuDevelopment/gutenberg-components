# Project status

Last updated: 2026-07-30

## Layout convention (2026-07-30)

**One component, one folder, one README** — see decision 0005. `meta/`, `taxonomy/` and
`hooks/` used to hold loose files; every entry point now has its own directory with its
implementation, `types.ts`, `index.ts`, colocated test and `README.md`. `src/hooks/README.md`
is now only the folder index. Wildcard `exports` were added for `./meta/*`, `./taxonomy/*`
and `./hooks/*`, and `./bindings` gained a key of its own.

Instructions for agents: `instructions/adding-a-component.md`,
`instructions/changing-a-component.md`. The code map lives in `AGENTS.md`.

## Where we are

Scaffold is complete and verified end-to-end (built + externalization checked + symlinked
into a local WordPress site). The `feat/breakpoint-switcher` plan (10 tasks) has landed the
responsive-value stack described below; only the plan's manual in-editor checks (task 10,
step 4) remain undone — see "Next steps".

Done:
- Monorepo (npm workspaces): `packages/gutenberg` (library) + `examples/test-blocks` (WP plugin).
- Toolchain targets **WP 7.0**: `@wordpress/*` deps pinned to the 7.0 line, `@wordpress/icons`
  declared as a peer, example plugin's `Requires at least` bumped to 7.0. All blocks
  (`demo`, `responsive-demo`, `link-demo`) are `apiVersion: 3` so the post editor can iframe them.
- Build: `tsup` (ESM) + `tsc` for `.d.ts` (decision 0006). Build **entries** are discovered from the filesystem;
  subpath `exports` in `package.json` are **hand-maintained**. Wildcard exports exist for
  `./components/*`, `./controls/*` and `./fields/*` only, so a new component folder in one of
  those categories needs no change, while a new top-level source directory needs its
  `exports` key added by hand. React + `@wordpress/*` external (decision 0002).
- Test harness: Jest + `@swc/jest` + `@testing-library/react` + `jest-environment-jsdom`.
  57 tests pass across breakpoint validation/resolution, hooks, controls, link normalization,
  and the README-vs-`types.ts` prop-table drift guard.
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
- **`ColorPopup`** (`src/components/`): toggle button + `Popover` around `ColorPalette`
  that resolves the picked value against a `colors` prop and reports the full
  `{ color, name, slug, alpha? }` object, not a bare hex string. Pure UI — no
  `useSettings`/`useSelect` inside; a caller wires in the theme palette. Optional alpha
  slider (`RangeControl`) and clear button. No CSS shipped.
- **`ResponsiveControl`** (`src/controls/`): wires switcher + hook + a render-prop child
  together; `variant`, `syncToEditor`/`syncFromEditor`, `showReset` all exposed.
- **Link controls** (`src/controls/`): `LinkPickerControl` anchors WordPress' stable link
  picker to arbitrary consumer UI through a render prop; `BlockLinkControl` injects ready-made
  link/unlink actions into `BlockControls`; `LinkText` composes the picker with RichText and a
  native-style toolbar action.
  Both share `LinkValue`, `normalizeLinkValue` and `getLinkAttributes`, including managed
  new-tab/nofollow rel tokens and an executable-protocol guard (decision 0007). The
  `isudev/link-demo` example exercises an arbitrary card, its block-toolbar actions and the
  ready-made text link.
  Empty values use WordPress' native picker mode; `LinkText` separates toolbar autofocus from
  existing-link click behavior so its RichText caret is never stolen.
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
- `tsc` typecheck clean (library + `tests/`); library and all three example blocks build;
  `@isudev/gutenberg` bundles into each block while `wp-*` + `react-jsx-runtime` stay
  external. `examples/test-blocks/test-blocks.php` registers every directory under
  `build/` via `glob()`, so another example block needs no PHP change.

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
   2. Set gap 24 on Desktop. Switch to Tablet: the slider sits at 24 and its help text reads
      "Inherited: 24"; the list line for tablet reads 24. (This step used to say the range
      would be *empty with 24 as placeholder* — that was never possible: `RangeControl` has
      no `placeholder` prop and spreads unknown props onto `<input type="range">`, where one
      is inert. The demo now shows `value ?? inheritedValue` plus `help` instead.)
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
3. Manually verify `isudev/link-demo` in the WP 7.0 iframe editor: card/text picker anchoring,
   entity-title fill, new-tab/nofollow settings, unlink, save/reload and frontend attributes.
4. Implement the other stage 7 components/controls beyond `BreakpointSwitcher`,
   `ResponsiveControl`, `LinkPickerControl`, `BlockLinkControl` and `LinkText`.
5. Consider `searchable` mode for `posts`/`users` sources (avoid `per_page: -1`).
6. Decide the CSS strategy once a component actually needs a stylesheet — `sideEffects`
   stays `false` until then; see the BreakpointSwitcher README and decision 0001 for what
   must change when one ships.

### Source bugs found while writing the per-component READMEs (2026-07-30)

Documenting every feature forced a read of code that had never been read closely, and it
surfaced defects the tests do not cover. Fixed immediately:

- **`useCurrentPostId` / `useCurrentPostType` returned `null`, not `undefined`.** `core/editor`'s
  `postId`/`postType` reducers default to `null` and the selectors pass it through, while both
  hooks were *typed* `| undefined`. A consumer's `=== undefined` guard never fired. Both hooks
  now normalize to `undefined`.
- **The demo block and `ResponsiveControl`'s README bound `inheritedValue` to
  `RangeControl`'s `placeholder`**, which does not exist — see next-step 1.2 above.

Not fixed — real, and each needs a decision rather than a patch:

13. **`RadioField` cannot show a selection when option values are numbers.**
    `RadioControl` marks an option checked with `option.value === selected` (strict, verified in
    `@wordpress/components@32.2.1`) and its `onChange` always yields `event.target.value`, a
    string. The `terms`/`posts`/`users` sources default `valueField` to `id`, a number. So the
    first change writes `'5'`, `5 === '5'` is false, and the group renders with nothing checked.
    `SelectField` escapes this because a native `<select>` compares DOM strings. Fix by coercing
    in `normalizeOptions` or in `useValueBinding`, and add a test — this is a real user-visible
    bug, not a documentation nuance.
14. **`FieldOption.disabled` is silently ignored by `RadioField`.** `RadioControl`'s option type
    is `{ label, value, description }` only. The shared `FieldOption` type therefore promises
    something one of the two fields cannot honour.
15. **`useTaxonomyBinding`'s `isLoading` is effectively always false.** It is computed as
    `! restBase`, and `restBase` resolves to `binding.restBase ?? getTaxonomy()?.rest_base ??
    binding.taxonomy` — the slug fallback makes it truthy on the first render, before the
    taxonomy record has resolved. Two consequences: `loadingComponent` covers only the options
    fetch, and when a taxonomy's real `rest_base` differs from its slug there is a window where
    the wrong entity property is read and written. Fix by distinguishing "not resolved yet" from
    "resolved to the slug".
16. **`errorComponent` can never fire for a value binding.** All three value bindings return
    `error: null` unconditionally; only options sources produce an error. A failed meta or term
    write is invisible.
17. **`RadioField` spreads pass-through props onto every radio `<input>`**, not onto the
    `<fieldset>`, because `RadioControl` does. A top-level `disabled` therefore lands on each
    input — which happens to work, but by accident.

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
9. ~~**`useDebouncedValue` and `usePrevious` still import from `@wordpress/element`**~~ —
   fixed 2026-07-30 during the folder restructure; both now import from `react`
   (decision 0002 amendment). No `@wordpress/element` import remains in `src/`, so the peer
   dependency can be dropped once nothing else needs it.
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
