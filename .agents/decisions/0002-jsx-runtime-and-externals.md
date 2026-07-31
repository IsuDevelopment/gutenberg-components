# 0002 — JSX runtime and externals

- Status: accepted
- Date: 2026-07-09

## Context

The library is consumed by WordPress block builds (`@wordpress/scripts` +
`DependencyExtractionWebpackPlugin`), which externalize `@wordpress/*`, `react`,
`react-dom`, and `react/jsx-runtime` to WordPress-provided globals (`wp.element`,
`React`, `ReactJSXRuntime`, available since WP 6.6; target is WP 7.0). If the library
bundled any of these, the runtime would end up with duplicate React and "invalid hook
call" errors.

## Decision

- Compile JSX with the **automatic runtime**, `jsxImportSource: "react"`
  (`tsconfig` `jsx: "react-jsx"`).
- Build with `tsup`, marking as **external**: `@wordpress/*`, `react`, `react-dom`,
  `react/jsx-runtime`. The shipped `dist/` keeps these as bare imports.
- Declare `@wordpress/*` and `react` as **peer dependencies**; the consumer's block
  build externalizes them to WP globals.

## Amendment, 2026-07-30 — import hooks and React types from `react`

The original decision settled the JSX runtime but left the import source for **hooks and
React types** unstated, and the codebase drifted: `useDebouncedValue` and `usePrevious`
import from `@wordpress/element`, while newer code imports from `react`.

**Decision: import hooks (`useState`, `useMemo`, `useCallback`, `useEffect`, `useRef`) and
React types (`ReactElement`, `ReactNode`) from `react`.**

There is no functional difference — `@wordpress/element` re-exports React, and both resolve
to the single WordPress-provided instance because the consumer's build externalizes `react`
to the `React` global. The choice is therefore about consistency, and `react` wins for two
reasons: `jsxImportSource` is already `react`, so a component file otherwise names two
sources for the same module; and `react` is a declared peer dependency, so depending on it
directly makes the peer graph honest rather than routing through an alias.

`@wordpress/element` remains correct for anything genuinely WordPress-specific that React
does not provide.

Follow-up: `useDebouncedValue` and `usePrevious` still import from `@wordpress/element` and
should be migrated for consistency. Deferred rather than folded into unrelated work.

## Consequences

- Exactly one React / `wp.element` copy at runtime — no hook conflicts.
- The library never ships React or `@wordpress/*` code.
- `dist/` structure mirrors `src/` (one entry per subpath export), which is what lets the
  `exports` map be written as straightforward 1:1 paths. The map itself is hand-maintained in
  `package.json`, with wildcards only for `./components/*`, `./controls/*` and `./fields/*`;
  only the tsup entries are discovered from the filesystem.
- One import source for hooks and React types across the codebase.
