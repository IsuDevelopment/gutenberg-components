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

## Consequences

- Exactly one React / `wp.element` copy at runtime — no hook conflicts.
- The library never ships React or `@wordpress/*` code.
- `dist/` structure mirrors `src/` (one entry per subpath export) so `exports` map 1:1.
