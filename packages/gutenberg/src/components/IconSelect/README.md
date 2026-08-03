---
name: IconSelect
entrypoint: "@isudev/gutenberg/components"
kind: component
status: stable
since: 0.1.0
---

## Summary

Shows the current icon and label in a compact WordPress button. Clicking it opens
`IconPicker` in a popover; with no selected value, no icon preview is rendered.

## When to use / When not to use

Use it as the default icon control in Inspector panels or block content. Use `IconPicker`
when the grid must always remain open, and `Icon` when selection is handled elsewhere.

## Import

```js
import { IconSelect } from '@isudev/gutenberg/components';
```

Or import the single component:

```js
import { IconSelect } from '@isudev/gutenberg/components/IconSelect';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `defaultIcons` | `readonly IconDefinition[]` | `[]` | No | Base registry, commonly returned by `getLocalizedIcons()`. |
| `icons` | `readonly IconChoice[]` | `undefined` | No | Complete ordered override or name subset of `defaultIcons`. |
| `value` | `string` | `''` | No | Selected icon name. Empty string means no selection. |
| `onChange` | `( name: string ) => void` | — | Yes | Receives the selected name or `''` when cleared. |
| `label` | `string` | — | Yes | Visible context label and accessible name of the select button. |
| `placeholder` | `string` | `'Select icon'` | No | Text shown while no icon is selected. |
| `pickerLabel` | `string` | `undefined` | No | Optional heading above the picker grid. |
| `searchable` | `boolean` | `true` | No | Shows search inside the picker. |
| `searchLabel` | `string` | `'Search icons'` | No | Accessible search field label. |
| `searchPlaceholder` | `string` | `'Search icons'` | No | Search input placeholder. |
| `noResultsMessage` | `string` | `'No icons found.'` | No | Empty-result status. |
| `columns` | `number` | `6` | No | Number of picker grid columns. |
| `iconSize` | `number` | `24` | No | Preview and grid icon size in pixels. |
| `clearable` | `boolean` | `true` | No | Shows the clear-selection action. |
| `clearLabel` | `string` | `'Clear icon'` | No | Clear action label. |
| `closeOnSelect` | `boolean` | `true` | No | Closes after selecting or clearing an icon. |
| `popoverPlacement` | `PopoverPlacement` | `'bottom-start'` | No | Popover placement relative to the select button. |
| `className` | `string` | `undefined` | No | Extra class on the select button. |
| `pickerClassName` | `string` | `undefined` | No | Extra class on the nested picker. |
| `style` | `CSSProperties` | `undefined` | No | Inline styles on the select button. |

## Examples

### Block attribute and localized defaults

```jsx
const defaultIcons = getLocalizedIcons();

<IconSelect
	label="Icon"
	defaultIcons={ defaultIcons }
	value={ attributes.iconName }
	onChange={ ( iconName ) => setAttributes( { iconName } ) }
/>
```

The same collection renders the saved icon:

```jsx
<Icon
	name={ attributes.iconName }
	defaultIcons={ defaultIcons }
	label="Selected feature icon"
/>
```

### Curated, persistent picker

```jsx
<IconSelect
	label="Social icon"
	defaultIcons={ defaultIcons }
	icons={ [ 'facebook', 'instagram', 'linkedin' ] }
	value={ attributes.iconName }
	onChange={ ( iconName ) => setAttributes( { iconName } ) }
	searchable={ false }
	closeOnSelect={ false }
	columns={ 3 }
/>
```

## Behavior

- The button renders the selected icon and its resolved label. With no valid selection it
  renders only `placeholder`, never a fake fallback graphic.
- The button exposes `aria-expanded`, `aria-haspopup` and a combined accessible name.
- The popover uses WordPress `Dropdown`; it closes after selection by default.
- Search, clear behavior and collection resolution are delegated to `IconPicker`, so both
  public selection surfaces behave identically.
- `icons` follows the shared override rules documented by `Icon`.

## Styling

Ships no stylesheet. The trigger is a full-width WordPress secondary button; the popover
content is 288px wide and uses the picker's inline grid. Use `className`, `pickerClassName`
and `style` for integration-specific adjustments.

## Gotchas

- The component stores only the selected name. Keep the registry stable across editor loads
  so a saved name can still be resolved.
- When using localized data in a static block, the registry must be present while Gutenberg
  evaluates `save()` for block validation.
- `closeOnSelect={ false }` is useful for exploration but requires the user to dismiss the
  popover manually.

## Related

- [`Icon`](../Icon/README.md) — rendering and localized registry helpers.
- [`IconPicker`](../IconPicker/README.md) — the underlying visible grid.
