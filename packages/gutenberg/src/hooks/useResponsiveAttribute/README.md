---
name: useResponsiveAttribute
entrypoint: "@isudev/gutenberg/hooks"
kind: hook
status: stable
since: 0.2.0
---

## Summary

Reads and writes one logical setting across a breakpoint set, resolving the cascade so a
control always has the right own value, inherited value and override state for whichever
breakpoint is active.

## When to use / When not to use

Use it when you are building your own responsive UI and need the value plumbing — pair it
with `useBreakpoint` for the selection state and `BreakpointSwitcher` for the picker.

Do not use it for values that are not stored on block attributes; it takes `attributes` and
`setAttributes` directly and reads no store, so post meta or a custom store need their own
adapter.

If you just want a labelled control with a switcher beside it and do not need to compose the
pieces yourself, use `ResponsiveControl` instead — it wires this hook, `useBreakpoint` and
`BreakpointSwitcher` together.

## Import

```js
import { useResponsiveAttribute } from '@isudev/gutenberg/hooks';
// or, skipping the barrel:
import { useResponsiveAttribute } from '@isudev/gutenberg/hooks/useResponsiveAttribute';
```

## Props

These are the fields of the single args object passed to `useResponsiveAttribute()`.

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `attrName` | `string` | — | Yes | Base attribute name, e.g. `'columnGap'`. |
| `breakpoint` | `string` | — | Yes | Currently selected breakpoint id. |
| `attributes` | `Record<string, unknown>` | — | Yes | The block's attributes. |
| `setAttributes` | `( next: Record<string, unknown> ) => void` | — | Yes | The block's `setAttributes`. |
| `breakpoints` | `Breakpoint[]` | `DEFAULT_BREAKPOINTS` | No | The breakpoint set. |

## Returns

`UseResponsiveAttributeResult` — the fields of the object this hook returns.

| Name | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The active breakpoint's own value; `undefined` when it has no override. |
| `inheritedValue` | `unknown` | What the active breakpoint would fall back to, ignoring its own value. |
| `resolvedValue` | `unknown` | `value` when set, otherwise `inheritedValue` — what the frontend actually renders. |
| `hasOwnValue` | `boolean` | Whether the active breakpoint has its own value present. |
| `hasValue` | `Record<string, boolean>` | Per-breakpoint override flags, keyed by id, for `BreakpointSwitcher`'s indicator. |
| `attrNameForBreakpoint` | `string` | The attribute name currently being read and written, e.g. `columnGap` or `columnGapMobile`. |
| `onChange` | `( next: unknown ) => void` | Writes the active breakpoint's attribute. |
| `reset` | `() => void` | Clears the active breakpoint's attribute by writing `undefined`. |
| `resetAll` | `() => void` | Clears every non-base breakpoint's attribute; leaves the base value alone. |

### `value` vs `inheritedValue` vs `resolvedValue`

These three are genuinely different fields, and mixing them up is the easiest way to build a
control that lies about its own state:

- **`value`** is only the active breakpoint's *own* setting. It is `undefined` whenever that
  breakpoint has no override, even if a wider breakpoint does — this is what belongs in a
  control's `value` prop.
- **`inheritedValue`** looks at every *other* breakpoint from the active one back to the base
  and returns the first present value, skipping the active breakpoint's own. It is what an
  unset field should communicate as its fallback. On a control that has a `placeholder` —
  `TextControl`, `InputControl` — bind it there and the empty field shows the inherited value
  in grey. Controls without one, `RangeControl` above all, need a different affordance (see
  the examples and Gotchas).
- **`resolvedValue`** is `value` when present, otherwise `inheritedValue` — the single value
  that actually applies, i.e. what the frontend would render. Use it for read-only display,
  never for a control's `value` prop, or the control will look like it has an explicit
  override when it does not.

Never merge them with `||`: that breaks on `0` and `false`, showing the inherited value where
an explicit `0` was set (see Gotchas). Prefer keeping them in separate props — `value` and
`placeholder` — because merging erases the distinction the switcher's override indicator
depends on. Where the control has no `placeholder`, merging with `??` is the honest fallback
(`value ?? inheritedValue` never confuses `0` for absent), but then say so in `help`: without
that, an inherited value is indistinguishable from an override.

`hasOwnValue` and `hasValue` also look similar but answer different questions.
`hasOwnValue` is `true` whenever the *active* breakpoint has a value present — including the
base, if the base attribute is set. `hasValue` is a map across every breakpoint that always
reports `false` for the base, because the base's value is the thing being overridden, not an
override of anything. Gate a per-breakpoint "has an override" indicator or reset button on
`hasValue[ breakpoint ]`, not on `hasOwnValue`, or a reset button will incorrectly appear on
the base breakpoint whenever it has a value at all.

## Examples

### Reading and writing one setting

```jsx
const { value, onChange } = useResponsiveAttribute( {
	attrName: 'columnGap',
	breakpoint: 'tablet',
	attributes,
	setAttributes,
} );

<RangeControl value={ value } onChange={ onChange } __next40pxDefaultSize />
```

### Showing the inherited value on a control that has a `placeholder`

```jsx
const { value, inheritedValue, onChange } = useResponsiveAttribute( {
	attrName: 'columnGap',
	breakpoint,
	attributes,
	setAttributes,
} );

// `value` is undefined until this breakpoint has its own override, so the field shows
// empty. `inheritedValue` is what would apply instead, so it belongs in `placeholder` — not
// merged into `value`, which would make an override indistinguishable from an inherited
// value once the field is cleared. This works because `TextControl` forwards `placeholder`
// to its `<input>`; only use this pattern on controls that do. `TextControl` reports strings
// back, so the attribute should be declared as a string (e.g. `2rem`) in `block.json`.
<TextControl
	label={ __( 'Column Gap' ) }
	value={ value ?? '' }
	placeholder={
		inheritedValue === undefined ? undefined : String( inheritedValue )
	}
	onChange={ onChange }
	__next40pxDefaultSize
	__nextHasNoMarginBottom
/>
```

### Showing the inherited value on a control that has no `placeholder`

```jsx
const { value, inheritedValue, hasOwnValue, onChange } = useResponsiveAttribute( {
	attrName: 'columnGap',
	breakpoint,
	attributes,
	setAttributes,
} );

// `RangeControl` has no `placeholder`: unknown props are spread onto its
// `<input type="range">`, where one is inert. So show the value that actually applies and
// say where it came from in `help`. `??`, not `||` — an explicit `0` is a real override.
<RangeControl
	label={ __( 'Column Gap' ) }
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
```

### Driving `BreakpointSwitcher`'s override indicator

```jsx
import { BreakpointSwitcher } from '@isudev/gutenberg/components/BreakpointSwitcher';

const [ breakpoint, setBreakpoint ] = useBreakpoint();
const { hasValue } = useResponsiveAttribute( {
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
```

### A reset button gated on the right field

```jsx
const { hasValue, reset } = useResponsiveAttribute( {
	attrName: 'columnGap',
	breakpoint,
	attributes,
	setAttributes,
} );

{ /*
	Gate on `hasValue[ breakpoint ]`, not `hasOwnValue`: `hasOwnValue` is `true` whenever the
	base breakpoint has a value at all, since the base value is not an override of anything.
	`hasValue` keeps the base entry `false` by design, so the button correctly never appears
	there.
*/ }
{ hasValue[ breakpoint ] && (
	<Button variant="tertiary" onClick={ reset }>
		{ __( 'Reset' ) }
	</Button>
) }
```

### Both hooks composed by hand with a real control

```jsx
import { useBreakpoint } from '@isudev/gutenberg/hooks/useBreakpoint';
import { BreakpointSwitcher } from '@isudev/gutenberg/components/BreakpointSwitcher';

const [ breakpoint, setBreakpoint ] = useBreakpoint( { syncFromEditor: true, syncToEditor: true } );
const { value, inheritedValue, hasOwnValue, hasValue, onChange } =
	useResponsiveAttribute( {
		attrName: 'columnGap',
		breakpoint,
		attributes,
		setAttributes,
	} );

<Flex justify="space-between" align="center">
	<BaseControl.VisualLabel>{ __( 'Column Gap' ) }</BaseControl.VisualLabel>
	<BreakpointSwitcher
		value={ breakpoint }
		onChange={ setBreakpoint }
		hasValue={ hasValue }
	/>
</Flex>
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
```

## Behavior

- The base breakpoint's value lives in `attrName` unsuffixed; every other breakpoint's value
  lives in `attrName + suffix`, e.g. `columnGap`, `columnGapTablet`, `columnGapMobile`.
  `attrNameForBreakpoint` is the resolved name for whichever breakpoint is currently active.
- A value counts as present when it is not `undefined`, not `null` and not `''`. `0` and
  `false` are values and do not fall back to an inherited one.
- The cascade walks from the active breakpoint back towards the base, in the order of the
  `breakpoints` array, and returns the first present value. The base must be first in that
  array — an invalid set is rejected and replaced with `DEFAULT_BREAKPOINTS`.
- `reset` writes `undefined` to the active breakpoint's attribute, so it returns to its
  `block.json` default and disappears from serialized markup.
- `resetAll` writes `undefined` to every **non-base** breakpoint's attribute in one
  `setAttributes` call and never touches the base attribute.
- If `breakpoint` does not match any id in the set, the hook falls back to the base
  breakpoint, then to the first entry in the array.
- Takes `attributes` and `setAttributes` as plain arguments rather than reaching into a
  store, so it is usable outside a block and trivially testable — but it also means it will
  not find the current block for you; the caller is responsible for supplying both.

## Styling

Not applicable — this hook renders nothing.

## Gotchas

- **`0` and `false` are values and will not fall back.** A consumer writing
  `value || inheritedValue` to "simplify" the wiring will silently show the inherited value
  whenever the override is `0` or `false`. Keep them as separate props (`value` /
  `placeholder`) where the control supports it, and use `??` — never `||` — where you have to
  merge them.
- **Only bind `inheritedValue` to `placeholder` on a control that has one.** `TextControl` and
  `InputControl` forward `placeholder` to their `<input>`; `RangeControl` does not have the prop
  at all — unrecognised props end up spread onto its `<input type="range">`, where a
  `placeholder` is inert, so nothing renders and the mistake is invisible. For `RangeControl`,
  pass `value ?? inheritedValue` and put the inheritance in `help`. (`UnitControl` and
  `NumberControl` do forward `placeholder`, but at the pinned `@wordpress/components` version
  they are still exported under `__experimental*` names.)
- `hasValue` is `false` for the base breakpoint by design, even when the base has a value —
  it answers "is this an override", and the base value is the thing being overridden, not an
  override of anything. `hasOwnValue` has no such special case and can be `true` on the base.
  Use `hasValue[ breakpoint ]`, not `hasOwnValue`, to decide whether to show a reset button or
  an override indicator.
- This hook reads no store: it will not locate the "current" block's attributes for you. Pass
  `attributes` and `setAttributes` from the block's own `edit` function (or an equivalent
  source) explicitly.
- Attributes must be declared in `block.json` for every breakpoint you offer —
  `columnGapTablet` and `columnGapMobile` do not spring into existence just because the
  breakpoint set includes `tablet` and `mobile`.

## Related

- [`useBreakpoint`](../useBreakpoint/README.md) — selection state and editor sync.
- [`BreakpointSwitcher`](../../components/BreakpointSwitcher/README.md) — the switcher this
  hook's `hasValue` map is usually bound to.
- [`ResponsiveControl`](../../controls/ResponsiveControl/README.md) — both hooks wired up
  with a switcher and a reset button for you.
