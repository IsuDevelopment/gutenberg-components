---
name: BreakpointSwitcher
entrypoint: "@isudev/gutenberg/components"
kind: component
status: stable
since: 0.0.1
---

## Summary

Switches which breakpoint a responsive setting is being edited for, as an always-visible row
of icons or a compact dropdown.

## When to use / When not to use

Use it when a block setting needs a different value per breakpoint and you want the author
to see which breakpoints carry an override.

Do not use it to preview the site at a device size — that is the editor's own device
preview. `useBreakpoint`'s `syncToEditor` connects the two if you want them linked.

Do not reach for this component alone if you also need the values: `ResponsiveControl` wires
the switcher, the selection state and the attribute plumbing together.

## Import

```js
import { BreakpointSwitcher } from '@isudev/gutenberg/components';
// or, skipping the barrel:
import { BreakpointSwitcher } from '@isudev/gutenberg/components/BreakpointSwitcher';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `string` | — | Yes | Currently selected breakpoint id. |
| `onChange` | `( id: string ) => void` | — | Yes | Called with the newly selected breakpoint id. |
| `variant` | `'inline' \| 'dropdown'` | `'inline'` | No | Always-visible row, or a button that opens a menu. |
| `breakpoints` | `Breakpoint[]` | `DEFAULT_BREAKPOINTS` | No | The breakpoint set to offer. |
| `hasValue` | `Record<string, boolean>` | `{}` | No | Which breakpoints carry an override, keyed by id. Drives the indicator. |
| `label` | `string` | `'Breakpoint'` | No | Accessible name for the group or dropdown toggle. |
| `hideLabelFromVision` | `boolean` | `false` | No | Show the label to screen readers only. Inline variant only. |
| `className` | `string` | `undefined` | No | Extra class name on the root element. |

## Examples

### Standalone, controlled

```jsx
const [ breakpoint, setBreakpoint ] = useState( 'desktop' );

<BreakpointSwitcher value={ breakpoint } onChange={ setBreakpoint } />
```

### Compact dropdown with override indicators

```jsx
<BreakpointSwitcher
	variant="dropdown"
	value={ breakpoint }
	onChange={ setBreakpoint }
	hasValue={ { desktop: false, tablet: true, mobile: false } }
/>
```

### A custom breakpoint set

```jsx
import { DEFAULT_BREAKPOINTS } from '@isudev/gutenberg/breakpoints';
import { desktop } from '@wordpress/icons';

const BREAKPOINTS = [
	...DEFAULT_BREAKPOINTS,
	{ id: 'wide', label: 'Wide', icon: desktop, suffix: 'Wide' },
];

<BreakpointSwitcher
	value={ breakpoint }
	onChange={ setBreakpoint }
	breakpoints={ BREAKPOINTS }
/>
```

## Behavior

- Renders `null` when fewer than two breakpoints are configured — a one-option switcher is
  noise.
- Fully controlled. It holds no state, reads no store, and knows nothing about block
  attributes.
- The inline variant is built on `ToggleGroupControl`, so arrow keys move between options
  and focus is managed for you. The dropdown variant is built on `DropdownMenu`, which
  handles outside-click, focus return and `Escape`.
- An overridden breakpoint gains `(modified)` in its accessible name in both variants, and in the
  inline variant its icon also carries a dot. The base breakpoint never shows either: it is not an
  override, it is the value being overridden.
- An invalid `breakpoints` set warns once in development and falls back to
  `DEFAULT_BREAKPOINTS`.

## Styling

Ships no stylesheet. Both variants inherit editor chrome from `@wordpress/components`. The
override dot is an inline style using `var(--wp-admin-theme-color, #3858e9)`.

Tint icons with the CSS `color` property, not `fill` — `@wordpress/icons` v15 switched to
`fill="currentColor"`.

## Gotchas

- Cascade direction follows the **order** of the `breakpoints` array, and nothing validates
  that the order is sensible. List them from base outwards, widest to narrowest for a
  desktop-first set.
- `hasValue` is not computed here. Pass the map from `useResponsiveAttribute`, or the
  indicator will never appear.
- `hideLabelFromVision` affects the inline variant only; the dropdown's label is always the
  toggle's accessible name and is never rendered as text.

## Related

- [`useBreakpoint`](../../hooks/README.md) — selection state and editor sync.
- [`useResponsiveAttribute`](../../hooks/README.md) — per-breakpoint values.
- [`ResponsiveControl`](../../controls/ResponsiveControl/README.md) — all three wired up.
