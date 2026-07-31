---
name: useBreakpoint
entrypoint: "@isudev/gutenberg/hooks"
kind: hook
status: stable
since: 0.0.1
---

## Summary

Owns which breakpoint a responsive setting is currently being edited for, with optional
two-way sync to the editor's device preview.

## When to use / When not to use

Use it when you are building your own responsive UI and only need the selection state — the
"which breakpoint am I looking at" piece. Pair it with `useResponsiveAttribute` to also read
and write a value per breakpoint.

Do not use it to preview the site at a device size; that is the editor's own device preview.
`syncToEditor` and `syncFromEditor` connect the two if you want them linked, but the hook does
not replace the preview.

If you just want a labelled control with a switcher beside it and do not need to compose the
pieces yourself, use `ResponsiveControl` instead — it wires this hook, `useResponsiveAttribute`
and `BreakpointSwitcher` together.

## Import

```js
import { useBreakpoint } from '@isudev/gutenberg/hooks';
// or, skipping the barrel:
import { useBreakpoint } from '@isudev/gutenberg/hooks/useBreakpoint';
```

## Props

These are the fields of the single options object passed to `useBreakpoint()`.

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `initial` | `string` | base breakpoint id | No | Breakpoint selected on first render. |
| `breakpoints` | `Breakpoint[]` | `DEFAULT_BREAKPOINTS` | No | The breakpoint set. |
| `syncToEditor` | `boolean` | `false` | No | Push the selection to the editor's device preview. |
| `syncFromEditor` | `boolean` | `false` | No | Follow the editor's device preview. |

## Returns

`useBreakpoint` returns a `readonly [ string, ( id: string ) => void ]` tuple, the same shape
as `useState`.

- The **first element** is the currently selected breakpoint id — one of the `id`s in the
  active breakpoint set, e.g. `'desktop'`, `'tablet'` or `'mobile'` with the default set.
- The **second element** is the setter. Call it with a breakpoint id to select it. When
  `syncToEditor` is set, calling it also capitalizes that id and pushes it to the editor's
  device preview as the new device type.

## Examples

### Bare selection

```jsx
const [ breakpoint, setBreakpoint ] = useBreakpoint();

<BreakpointSwitcher value={ breakpoint } onChange={ setBreakpoint } />
```

### Starting on a breakpoint other than the base

```jsx
const [ breakpoint, setBreakpoint ] = useBreakpoint( { initial: 'mobile' } );
```

### Both sync flags together

```jsx
const [ breakpoint, setBreakpoint ] = useBreakpoint( {
	syncToEditor: true,
	syncFromEditor: true,
} );

<BreakpointSwitcher value={ breakpoint } onChange={ setBreakpoint } />
```

### A custom breakpoint set

```jsx
import { DEFAULT_BREAKPOINTS } from '@isudev/gutenberg/breakpoints';
import { desktop } from '@wordpress/icons';

const BREAKPOINTS = [
	...DEFAULT_BREAKPOINTS,
	{ id: 'wide', label: 'Wide', icon: desktop, suffix: 'Wide' },
];

const [ breakpoint, setBreakpoint ] = useBreakpoint( {
	breakpoints: BREAKPOINTS,
} );
```

Array order *is* the cascade order — it is walked backwards from the active breakpoint to
index 0 — so appending has consequences: spread this way, `wide` sits after `mobile` and
therefore inherits from `mobile` first, then `tablet`, then `desktop`. The base must stay at
index 0, so a wider breakpoint cannot be put in front of it; place it immediately **after** the
base instead, and every entry then inherits from the one before it:

```js
const [ base, ...narrower ] = DEFAULT_BREAKPOINTS;

const BREAKPOINTS = [
	base,
	{ id: 'wide', label: 'Wide', icon: desktop, suffix: 'Wide' },
	...narrower,
];
```

## Behavior

- Selection is local component state, seeded from `initial` or, if omitted, the breakpoint
  marked `isBase` in the active set. An invalid `breakpoints` array is replaced with
  `DEFAULT_BREAKPOINTS` before that lookup happens (see `useResponsiveAttribute`'s README, or
  `src/breakpoints/validate.ts`, for the validation rules), so the base is always resolvable.
- This hook, not `BreakpointSwitcher`, is where store access lives — components that render
  the switcher stay free of `@wordpress/data`.
- `syncFromEditor`: on every render the hook reads the editor's device type from
  `core/editor`'s `getDeviceType()` and lowercases it. If that differs from the current
  selection **and** matches an id in the breakpoint set, local state follows it. A device
  type with no matching id (e.g. a third-party device the current breakpoint set does not
  define) is left alone rather than guessed at.
- `syncToEditor`: the setter capitalizes the id (`'tablet'` → `'Tablet'`) and calls the
  editor store's `setDeviceType` with it.
- Both flags are independent and off by default: editing a mobile value while looking at the
  desktop canvas is a legitimate thing to want, so nothing is forced.

## Styling

Not applicable — this hook renders nothing.

## Gotchas

- **`syncFromEditor` without `syncToEditor` makes the switcher a passive mirror.** Clicking a
  breakpoint updates local state for one render, but the effect that follows the editor's
  device type sees an unchanged device type on the next render and reverts the selection,
  because nothing pushed the click outward for the editor to agree with. Pass both flags
  together for an interactive switcher tied to the preview, or neither for one that stands
  alone.
- Editor device types are capitalized (`'Tablet'`, `'Mobile'`); this hook lowercases on the
  way in and capitalizes on the way out, so compare against lowercase ids in your own code.
- An editor device type with no matching breakpoint id (e.g. `'Watch'`) is ignored — the
  selection stays whatever it already was; it is not coerced to the base.
- The outbound direction has no such filter. `syncToEditor` capitalizes whatever id you select
  and dispatches it, so a custom breakpoint like `wide` pushes `'Wide'` into `core/editor`'s
  device type — a value the editor only meaningfully handles for `Desktop`, `Tablet` and
  `Mobile`. Either keep `syncToEditor` for sets whose ids map onto those three, or accept that
  the preview will not follow the extra breakpoints.

## Related

- [`useResponsiveAttribute`](../useResponsiveAttribute/README.md) — per-breakpoint values.
- [`BreakpointSwitcher`](../../components/BreakpointSwitcher/README.md) — the switcher this
  hook's selection is usually bound to.
- [`ResponsiveControl`](../../controls/ResponsiveControl/README.md) — all three wired up.
