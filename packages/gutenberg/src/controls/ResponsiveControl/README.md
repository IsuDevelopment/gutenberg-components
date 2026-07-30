---
name: ResponsiveControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: stable
since: 0.2.0
---

## Summary

Makes any control responsive: renders a label and a breakpoint switcher, then hands the
resolved per-breakpoint value to a render prop.

## When to use / When not to use

Use it whenever a block setting should differ per breakpoint. It is the shortest path from a
plain `RangeControl` to a responsive one.

Do not use it if you need the switcher somewhere other than beside the control — compose
`useBreakpoint`, `useResponsiveAttribute` and `BreakpointSwitcher` yourself instead.

Do not use it for values that are not stored on block attributes; the hooks are the lower
level building block for post meta or custom stores.

## Import

```js
import { ResponsiveControl } from '@isudev/gutenberg/controls';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `attrName` | `string` | — | Yes | Base attribute name, e.g. `'columnGap'`. |
| `attributes` | `Record<string, unknown>` | — | Yes | The block's attributes. |
| `setAttributes` | `( next: Record<string, unknown> ) => void` | — | Yes | The block's `setAttributes`. |
| `children` | `( args: ResponsiveControlRenderArgs ) => ReactNode` | — | Yes | Renders the control with resolved values. |
| `label` | `string` | `undefined` | No | Visible label shown beside the switcher. |
| `variant` | `'inline' \| 'dropdown'` | `'inline'` | No | Switcher layout. |
| `breakpoints` | `Breakpoint[]` | `DEFAULT_BREAKPOINTS` | No | The breakpoint set to offer. |
| `syncToEditor` | `boolean` | `false` | No | Push breakpoint changes to the editor's device preview. |
| `syncFromEditor` | `boolean` | `false` | No | Follow the editor's device preview. |
| `showReset` | `boolean` | `true` | No | Show a reset button when the active breakpoint has an override. |
| `className` | `string` | `undefined` | No | Extra class name on the root element. |

## Examples

### A responsive range

```jsx
<ResponsiveControl
	attrName="columnGap"
	label={ __( 'Column Gap' ) }
	attributes={ attributes }
	setAttributes={ setAttributes }
>
	{ ( { value, inheritedValue, hasOwnValue, onChange } ) => (
		/*
		 * `RangeControl` has no `placeholder` — unknown props are spread onto its
		 * `<input type="range">`, where one is inert. So the slider shows the value that
		 * actually applies and `help` says where it came from. `??`, not `||`: an explicit
		 * `0` is a real override.
		 */
		<RangeControl
			min={ 0 }
			max={ 100 }
			value={ value ?? inheritedValue }
			help={
				hasOwnValue || inheritedValue === undefined
					? undefined
					: `${ __( 'Inherited:' ) } ${ inheritedValue }`
			}
			onChange={ onChange }
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	) }
</ResponsiveControl>
```

Bind `inheritedValue` to a `placeholder` only on controls that have one — `TextControl` and
`InputControl` forward it to their `<input>`:

```jsx
{ ( { value, inheritedValue, onChange } ) => (
	<TextControl
		value={ value ?? '' }
		placeholder={
			inheritedValue === undefined ? undefined : String( inheritedValue )
		}
		onChange={ onChange }
		__next40pxDefaultSize
		__nextHasNoMarginBottom
	/>
) }
```

### Compact switcher, linked to the editor preview

```jsx
<ResponsiveControl
	attrName="layout"
	label={ __( 'Layout' ) }
	variant="dropdown"
	syncToEditor
	attributes={ attributes }
	setAttributes={ setAttributes }
>
	{ ( { value, onChange } ) => (
		/*
		 * The empty option matters: with no override, `value` is `undefined` and a native
		 * `<select>` would otherwise show the first option as if it were set.
		 */
		<SelectControl
			value={ value ?? '' }
			options={ [ { label: '—', value: '' }, ...LAYOUT_OPTIONS ] }
			onChange={ onChange }
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	) }
</ResponsiveControl>
```

### Rendering what the frontend would use

```jsx
{ ( { resolvedValue } ) => <p>{ `Applied: ${ resolvedValue }` }</p> }
```

## Behavior

- The base breakpoint's value lives in `attrName`; others live in `attrName + suffix`, so
  `columnGap`, `columnGapTablet`, `columnGapMobile`.
- `value` is the active breakpoint's own value and is `undefined` when it has none.
  `inheritedValue` is what it would fall back to — bind it to `placeholder` on controls that
  have one, otherwise surface it through `help`. `resolvedValue` is what actually applies.
- Reset writes `undefined`, so the attribute returns to its `block.json` default and
  disappears from serialized markup.
- The reset button never appears on the base breakpoint: its value is not an override.
- Editor sync is off unless you opt in, per direction.

## Styling

Ships no stylesheet. Layout uses `Flex` from `@wordpress/components`; pass `className` to
position the whole row.

## Gotchas

- `children` is a function, not an element. Passing an element renders nothing useful.
- Numeric controls: `0` is a real value and will *not* fall back to an inherited value. This
  is deliberate. Merge with `??` if you must merge at all — `value || inheritedValue` shows the
  inherited value where `0` was set on purpose.
- `RangeControl` has no `placeholder` prop, so passing `inheritedValue` to one does nothing
  visible: it is spread onto the underlying `<input type="range">` and ignored. Reserve that
  pattern for `TextControl`/`InputControl` and use `value ?? inheritedValue` plus `help`
  elsewhere.
- Attributes must be declared in `block.json` for every breakpoint you offer —
  `columnGapTablet` and `columnGapMobile` do not spring into existence.
- `syncFromEditor` without `syncToEditor` makes the switcher read-only in practice. Clicking
  a breakpoint selects it, then the effect that follows the editor's device preview sees an
  unchanged device type and reverts the selection — nothing pushed the click outwards for it
  to agree with. Pass both flags for an interactive switcher tied to the preview, or neither
  for one that stands alone.

## Related

- [`BreakpointSwitcher`](../../components/BreakpointSwitcher/README.md) — the switcher alone.
- [`useResponsiveAttribute`, `useBreakpoint`](../../hooks/README.md) — the pieces underneath.
- Decision 0003 — why base plus suffixes, and why there is no `default` breakpoint.
