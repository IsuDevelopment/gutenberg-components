# 0003 — Breakpoint model: base attribute plus suffixed overrides

- Status: accepted
- Date: 2026-07-30

## Context

Responsive block settings need a place to store one value per breakpoint. Two shapes were
studied in existing plugins: a nested object per attribute, and a base attribute plus
suffixed siblings. One studied implementation additionally offers a `default`
pseudo-device alongside `desktop`, which stores to the unsuffixed attribute.

## Decision

A breakpoint set is an ordered array. Exactly one breakpoint is the **base**; its value
lives in the unsuffixed attribute. Every other breakpoint declares a `suffix`, and its
value lives in `attrName + suffix` — `columnGap`, `columnGapTablet`, `columnGapMobile`.

There is **no** `default` pseudo-breakpoint. The base is the default.

Reading walks backwards through array order to the base and returns the first value that
is present, where present means not `undefined`, not `null` and not `''` — so `0` and
`false` are values.

## Consequences

- Attributes stay flat, so `block.json` defaults and block deprecations keep working.
- Adding a breakpoint is additive: a new suffix, no migration of existing attributes.
- A `default` option cannot be reintroduced without making two names mean overlapping
  things, which is why it was rejected.
- Cascade direction is coupled to array order. The one part of that which is mechanical —
  the base must sit at index 0, since reading walks back to zero and stops there — *is*
  checked by `validateBreakpoints`. The ordering of the remaining breakpoints carries no
  such marker, so "widest first, narrowest last" stays a convention documented in the
  README rather than something the validator can enforce.
