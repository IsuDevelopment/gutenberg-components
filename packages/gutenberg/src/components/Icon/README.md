---
name: Icon
entrypoint: "@isudev/gutenberg/components"
kind: component
status: stable
since: 0.1.0
---

## Summary

Renders one named icon from an injected collection. Empty and unknown names render nothing.
The folder also exports collection resolution and the explicit `wp_localize_script` adapter
shared by `IconPicker` and `IconSelect`.

## When to use / When not to use

Use `Icon` to display a value already selected and stored by a block. Use `IconPicker` for an
always-visible grid or `IconSelect` for the complete button-and-popover interaction.

The component never reads a global registry by itself. Call `getLocalizedIcons()` at the
integration boundary and pass its result through `defaultIcons`.

## Import

```js
import { Icon, getLocalizedIcons } from '@isudev/gutenberg/components';
```

Or import the single component and its helpers:

```js
import {
	Icon,
	getLocalizedIcons,
} from '@isudev/gutenberg/components/Icon';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `defaultIcons` | `readonly IconDefinition[]` | `[]` | No | Base registry, commonly returned by `getLocalizedIcons()`. |
| `icons` | `readonly IconChoice[]` | `undefined` | No | Complete ordered override. Strings select names from `defaultIcons`; definitions replace the defaults. |
| `name` | `string` | `undefined` | No | Selected icon name. Empty and unknown names render nothing. |
| `size` | `number` | `24` | No | Rendered width and height in pixels. |
| `label` | `string` | `undefined` | No | Accessible label. Omit for a decorative icon. |
| `className` | `string` | `undefined` | No | Extra class on the icon wrapper. |
| `style` | `CSSProperties` | `undefined` | No | Inline styles on the icon wrapper. |

## Examples

### Localized WordPress icons

Localize data on the block or plugin script that consumes it, not on a WordPress Core handle:

```php
$handle = generate_block_asset_handle( 'my-plugin/icon-block', 'editorScript' );

wp_localize_script(
	$handle,
	'isudevIcons',
	[
		[
			'name'  => 'alert',
			'label' => __( 'Alert', 'my-plugin' ),
			'icon'  => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="..."/></svg>',
		],
		[
			'name' => 'arrow-right',
			// label falls back to name.
			'icon' => plugins_url( 'assets/arrow-right.svg', __FILE__ ),
		],
	]
);
```

Read the global once and inject it:

```jsx
const defaultIcons = getLocalizedIcons();

<Icon
	name={ attributes.iconName }
	defaultIcons={ defaultIcons }
	label="Feature icon"
/>
```

Pass another global name when needed:

```js
const icons = getLocalizedIcons( 'myPluginIcons' );
```

### Direct definitions and name subsets

```jsx
const icons = [
	{ name: 'alert', label: 'Alert', icon: alertIcon },
	{ name: 'calendar', label: 'Calendar', icon: calendarIcon },
];

<Icon name="alert" icons={ icons } />
```

A string array is not a second registry. It selects and orders entries from
`defaultIcons`:

```jsx
<Icon
	name={ attributes.iconName }
	defaultIcons={ localizedIcons }
	icons={ [ 'calendar', 'alert' ] }
/>
```

## Behavior

- `IconDefinition` has `name`, optional `label`, `icon` and optional `keywords`. Missing
  labels normalize to `name`.
- `icon` accepts a WordPress `IconType`, a Dashicon name, an image URL or serialized SVG.
- Serialized SVG is percent-encoded and rendered through `<img>`; it is never injected with
  `dangerouslySetInnerHTML`.
- URL-like strings use `<img>`. Other string values go through WordPress' `Icon`, allowing
  Dashicon names.
- `parseLocalizedIcons()` drops malformed values and non-string graphics because localized
  data must remain JSON-compatible.
- `getLocalizedIcons()` reads `globalThis.isudevIcons` by default and returns an empty array
  when the global is unavailable. Components themselves do not touch global state.
- When `icons` is omitted, all `defaultIcons` are available. Once supplied, `icons` is the
  complete collection: unknown names and duplicate names are omitted.

## Styling

Ships no stylesheet. The wrapper is an inline flex box sized by `size`; use `className` and
`style` for context-specific presentation.

## Gotchas

- Localized SVG and URLs are configuration, not user-authored content. Sanitize server-side
  data before localizing it and restrict who can modify the registry.
- Localize on your own registered script handle. Attaching application data to `wp-blocks`
  couples it to Core's loading lifecycle.
- A name-only `icons` array needs `defaultIcons`; unknown names intentionally disappear.
- Localized data cannot contain React elements or functions. Pass those directly as icon
  definitions in JavaScript.

## Related

- [`IconPicker`](../IconPicker/README.md) — visible icon grid.
- [`IconSelect`](../IconSelect/README.md) — selected preview with a dropdown picker.
