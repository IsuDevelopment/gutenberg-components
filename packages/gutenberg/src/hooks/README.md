---
name: hooks
entrypoint: "@isudev/gutenberg/hooks"
kind: hook
status: stable
since: 0.1.0
---

## Summary

Hooks for editor data: the responsive pair (`useBreakpoint`, `useResponsiveAttribute`) plus
small utilities for post context and value handling.

## When to use / When not to use

Use `useResponsiveAttribute` and `useBreakpoint` when you need responsive values but want to
lay the UI out yourself. If you just want a labelled control with a switcher beside it, use
`ResponsiveControl` instead.

## Import

```js
import { useBreakpoint, useResponsiveAttribute } from '@isudev/gutenberg/hooks';
```

## Props

`useResponsiveAttribute( args )`

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `attrName` | `string` | — | Yes | Base attribute name, e.g. `'columnGap'`. |
| `breakpoint` | `string` | — | Yes | Currently selected breakpoint id. |
| `attributes` | `Record<string, unknown>` | — | Yes | The block's attributes. |
| `setAttributes` | `( next: Record<string, unknown> ) => void` | — | Yes | The block's `setAttributes`. |
| `breakpoints` | `Breakpoint[]` | `DEFAULT_BREAKPOINTS` | No | The breakpoint set. |

`useBreakpoint( options )`

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `initial` | `string` | base breakpoint id | No | Breakpoint selected on first render. |
| `breakpoints` | `Breakpoint[]` | `DEFAULT_BREAKPOINTS` | No | The breakpoint set. |
| `syncToEditor` | `boolean` | `false` | No | Push the selection to the editor's device preview. |
| `syncFromEditor` | `boolean` | `false` | No | Follow the editor's device preview. |

## Examples

### Composing the pieces by hand

```jsx
const [ breakpoint, setBreakpoint ] = useBreakpoint( { syncFromEditor: true } );
const { value, inheritedValue, hasValue, onChange } = useResponsiveAttribute( {
	attrName: 'columnGap',
	breakpoint,
	attributes,
	setAttributes,
} );

<BreakpointSwitcher
	value={ breakpoint }
	onChange={ setBreakpoint }
	hasValue={ hasValue }
/>
<RangeControl value={ value } placeholder={ inheritedValue } onChange={ onChange } />
```

## Behavior

- `useResponsiveAttribute` returns `value` (own), `inheritedValue` (ancestors only) and
  `resolvedValue` (`value ?? inheritedValue`), plus `hasOwnValue`, the `hasValue` map,
  `attrNameForBreakpoint`, `onChange`, `reset` and `resetAll`.
- `resetAll` clears every non-base attribute and leaves the base value alone.
- `useBreakpoint` returns a `[ breakpoint, setBreakpoint ]` tuple. Editor device types are
  capitalized (`'Tablet'`); the hook converts in both directions.
- An editor device type with no matching breakpoint id is ignored rather than guessed at.

## Styling

Not applicable — these hooks render nothing.

## Gotchas

- `useResponsiveAttribute` takes `attributes`/`setAttributes` as arguments and does not read
  a store, so it works outside a block but will not magically find the current block.
- `0` and `false` are values and do not fall back. `''`, `null` and `undefined` do.
- Setting `syncFromEditor` without `syncToEditor` makes the switcher a passive mirror of the
  editor's device preview: a manual selection is reverted on the next render, because
  nothing pushed it to the editor for the effect to agree with. Use both flags together if
  you want the switcher to be interactive, or neither if you want it independent.

## Related

- [`BreakpointSwitcher`](../components/BreakpointSwitcher/README.md)
- [`ResponsiveControl`](../controls/ResponsiveControl/README.md)
