---
name: IconPicker
entrypoint: "@isudev/gutenberg/components"
kind: component
status: stable
since: 0.1.0
---

## Summary

Displays an accessible grid of named icons with optional search and clearing. It is the
always-visible selection surface used by `IconSelect`.

## When to use / When not to use

Use it inside an Inspector panel or a custom popover when the grid should remain visible.
Use `IconSelect` for a ready-made compact trigger and popover, or `Icon` only to render a
stored selection.

## Import

```js
import { IconPicker } from '@isudev/gutenberg/components';
```

Or import the single component:

```js
import { IconPicker } from '@isudev/gutenberg/components/IconPicker';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `defaultIcons` | `readonly IconDefinition[]` | `[]` | No | Base registry, commonly returned by `getLocalizedIcons()`. |
| `icons` | `readonly IconChoice[]` | `undefined` | No | Complete ordered override or name subset of `defaultIcons`. |
| `value` | `string` | `''` | No | Selected icon name. Empty string means no selection. |
| `onChange` | `( name: string ) => void` | — | Yes | Receives the selected name or `''` when cleared. |
| `label` | `string` | `undefined` | No | Optional picker heading and grid accessible label. |
| `searchable` | `boolean` | `true` | No | Shows the search field. |
| `searchLabel` | `string` | `'Search icons'` | No | Accessible search field label. |
| `searchPlaceholder` | `string` | `'Search icons'` | No | Search input placeholder. |
| `noResultsMessage` | `string` | `'No icons found.'` | No | Status shown for an empty collection or search result. |
| `columns` | `number` | `6` | No | Number of grid columns; values below one become one. |
| `iconSize` | `number` | `24` | No | Icon size inside each 40px selection button. |
| `clearable` | `boolean` | `true` | No | Shows the clear-selection action. |
| `clearLabel` | `string` | `'Clear icon'` | No | Clear action label. |
| `className` | `string` | `undefined` | No | Extra class on the picker control. |
| `style` | `CSSProperties` | `undefined` | No | Inline styles merged onto the picker content wrapper. |

## Examples

### Localized registry

```jsx
const defaultIcons = getLocalizedIcons();

<IconPicker
	label="Feature icon"
	defaultIcons={ defaultIcons }
	value={ attributes.iconName }
	onChange={ ( iconName ) => setAttributes( { iconName } ) }
/>
```

### Restricted collection without search

```jsx
<IconPicker
	defaultIcons={ defaultIcons }
	icons={ [ 'alert', 'calendar', 'arrow-right' ] }
	value={ attributes.iconName }
	onChange={ ( iconName ) => setAttributes( { iconName } ) }
	searchable={ false }
	columns={ 3 }
	clearable={ false }
/>
```

### Fully custom icons

```jsx
<IconPicker
	icons={ [
		{ name: 'alert', label: 'Alert', icon: alertIcon, keywords: [ 'warning' ] },
		{ name: 'calendar', label: 'Calendar', icon: calendarIcon },
	] }
	value={ iconName }
	onChange={ setIconName }
/>
```

## Behavior

- Search matches `name`, resolved `label` and `keywords`, case-insensitively.
- Every icon is a real WordPress `Button` with an accessible label, tooltip and pressed state;
  the grid is keyboard reachable without hidden checkbox hacks.
- Selection is controlled. The picker does not mutate or retain the selected value itself.
- Clearing emits an empty string. The clear action remains focusable while disabled, following
  WordPress' accessible disabled-control guidance.
- `icons` follows the shared override rules documented by `Icon`.

## Styling

Ships no stylesheet. The layout uses an inline CSS grid and WordPress button styles. Use
`className` and `style` for the surrounding control.

## Gotchas

- `searchable={ false }` is useful for very small curated sets; disabling it for a large
  registry makes selection unnecessarily slow.
- The component does not virtualize the grid. Curate large registries with `icons` or enable
  search rather than sending thousands of graphics to one control.
- `onChange( '' )` must be persisted as the block's empty icon value.

## Related

- [`Icon`](../Icon/README.md) — registry adapter and selected-icon renderer.
- [`IconSelect`](../IconSelect/README.md) — ready-made dropdown composition.
