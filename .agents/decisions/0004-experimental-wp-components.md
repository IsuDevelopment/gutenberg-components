# 0004 — Isolate `__experimental*` imports from `@wordpress/components`

- Status: accepted
- Date: 2026-07-30

## Context

`ToggleGroupControl` and `ToggleGroupControlOptionIcon` are the right primitives for an
icon-segmented control: they carry editor styling, keyboard navigation and focus management.
Both are still exported behind the `__experimental` prefix on Gutenberg trunk — they were
not stabilized in WP 7.0 (verified 2026-07-30).

A library published to npm that imports an experimental symbol can break when WordPress
renames or removes it, and the breakage lands on consumers rather than on us.

## Decision

Use them, but confine every `__experimental*` and `__unstable*` import from
`@wordpress/components` to `src/_internal/wp-components.ts`, which re-exports them under
stable local names. No other module may import an experimental symbol directly.

## Consequences

- A WordPress rename is a one-line change in one file instead of a search across components.
- `_internal/` is not exported from `package.json`, so the experimental surface never
  becomes part of our public API.
- Reimplementing these controls from scratch was rejected: it would mean owning keyboard
  navigation, focus management and editor styling for no functional gain.
- A future review should re-check whether these symbols have stabilized and drop the alias.
