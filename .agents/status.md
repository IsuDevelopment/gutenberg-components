# Project status

Last updated: 2026-07-10

## Where we are

Scaffold is complete and verified end-to-end (built + externalization checked + symlinked
into a local WordPress site).

Done:
- Monorepo (npm workspaces): `packages/gutenberg` (library) + `examples/test-blocks` (WP plugin).
- Build: `tsup` (ESM + `.d.ts`), subpath `exports` for `fields`/`meta`/`taxonomy`/`hooks`/
  `components`/`controls`/`appenders`. React + `@wordpress/*` external (decision 0002).
- Binding engine: `useFieldBinding` → `useOptionsSource` + `useValueBinding`.
  - Options sources: `terms`, `posts`, `users`, `postTypes`, `manual`
    (loading/error via `hasFinishedResolution` / `getResolutionError`).
  - Value bindings: `meta`, `taxonomy` (auto `rest_base` + single↔array mapping), `custom`,
    plus controlled `value`/`onChange` with dev-warning on conflict.
- Fields: `SelectField`, `RadioField`. Easy wrappers: `MetaSelectControl`,
  `MetaRadioControl`, `TaxonomySelectControl`.
- Hooks: `useCurrentPostType`, `useCurrentPostId`, `useDebouncedValue`, `usePrevious`.
- Demo block (`isudev/demo`) exercises `SelectField` (manual options + `postTypes` source).
- `tsc` typecheck clean; library and example both build; `@isudev/gutenberg` bundles into
  the block while `wp-*` + `react-jsx-runtime` stay external.

## Environment notes

- Node 20, npm 10. WP 7.0 on a local site.
- Symlink: `<your-site>/wp-content/plugins/isudev-test-blocks` → `examples/test-blocks`.
  The real path lives in `WP_PLUGINS_DIR` in the developer's shell, never in the repo.
- esbuild's native binary cannot exec inside the agent sandbox (error -88): install with
  `--ignore-scripts`, and run builds outside the sandbox. Normal local terminals are fine.
- `TMPDIR` was pointed at `./.tmp` to avoid filling the sandbox tmp volume (gitignored).
- Not committed yet — `git init` done, no commits.

## Next steps (not started)

1. Initial commit (+ optional GitHub remote via `gh`).
2. Stage 6.5 — tests: Jest + `@testing-library/react`, mock `@wordpress/data`/`core-data`;
   cover `useFieldBinding` (controlled vs bound), each options source, taxonomy single↔array,
   the dev-warning.
3. Remaining fields: `TextField`, `ToggleField`, `CheckboxField`; wrappers
   `MetaTextControl`, `MetaToggleControl`, `TaxonomyRadioControl`, `TaxonomyCheckboxControl`.
4. Stage 7 — real `components/` and `controls/`, written from scratch with config
   injected via props and zero host-project coupling (decision 0001). First component:
   `BreakpointSwitcher` + `useResponsiveAttribute` + `ResponsiveControl`.
5. Consider `searchable` mode for `posts`/`users` sources (avoid `per_page: -1`).
6. Decide CSS strategy if any component ships styles.

See `architecture-plan.md` for the full staged checklist.
