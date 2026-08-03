---
name: ColorPopup
entrypoint: "@isudev/gutenberg/components"
kind: component
status: stable
since: 0.1.0
---

## Summary

A color swatch button that opens a popover with `ColorPalette`, and reports back the full
color object (`{ color, name, slug }`), not just the hex string `ColorPalette` gives you.

## When to use / When not to use

Use it inside `InspectorControls` wherever a setting needs a color and you want to persist
the palette slug alongside the value, so the frontend can react to a theme.json palette
change instead of a frozen hex string.

Do not use it if a bare hex value is all you need — reach for `ColorPalette` directly. Do
not expect it to read a theme's color palette on its own: `colors` is a prop, never fetched
from a store (see decision 0001) — pass the result of `useSettings( 'color.palette.theme' )`
or similar from the caller.

## Import

```js
import { ColorPopup } from '@isudev/gutenberg/components';
// or, skipping the barrel:
import { ColorPopup } from '@isudev/gutenberg/components/ColorPopup';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | — | Yes | Text next to the color swatch on the toggle button. |
| `value` | `string` | — | Yes | Currently selected color or slug. Empty string for no selection. |
| `onChange` | `( color: ColorPopupColor ) => void` | — | Yes | Called with the full resolved color object, never a bare string. |
| `colors` | `Array<{ color: string; name: string; slug: string }>` | `[]` | No | Palette offered in the popup. |
| `enableAlpha` | `boolean` | `false` | No | Adds an opacity slider to the popup. |
| `alpha` | `number` | `1` | No | Current alpha, 0–1. Only meaningful when `enableAlpha` is set. |
| `popupLabel` | `string` | `'Select Color'` | No | Heading shown inside the popup, above the palette. |
| `clearable` | `boolean` | `false` | No | Shows a button that resets the value to empty. |
| `className` | `string` | `undefined` | No | Extra class name on the toggle button. |

`ColorPopupColor` is `{ color: string; name: string; slug: string; alpha?: number }`. `name`
and `slug` are empty strings for a color typed or picked outside the given `colors`.

## Examples

### Minimal

```jsx
const [ value, setValue ] = useState( '' );

<ColorPopup
	label={ __( 'Background' ) }
	value={ value }
	onChange={ ( color ) => setValue( color.color ) }
	colors={ [
		{ color: '#111111', name: 'Contrast', slug: 'contrast' },
		{ color: '#ffffff', name: 'Base', slug: 'base' },
	] }
/>
```

### Persisting the slug, driven by the theme palette

```jsx
const [ palette ] = useSettings( 'color.palette.theme' );

<ColorPopup
	label={ __( 'Background' ) }
	value={ attributes.backgroundColor ?? '' }
	colors={ palette ?? [] }
	clearable
	onChange={ ( color ) =>
		setAttributes( { backgroundColor: color.slug || color.color } )
	}
/>
```

### With opacity

```jsx
<ColorPopup
	label={ __( 'Overlay' ) }
	value={ attributes.overlayColor ?? '' }
	alpha={ attributes.overlayAlpha ?? 1 }
	enableAlpha
	colors={ palette }
	onChange={ ( color ) =>
		setAttributes( {
			overlayColor: color.slug || color.color,
			overlayAlpha: color.alpha,
		} )
	}
/>
```

## Behavior

- `value` may be either a hex/rgb string or a palette `slug` — both are matched against
  `colors` so a saved slug still resolves correctly after a hex value elsewhere.
- A value that matches nothing in `colors` is treated as a custom color: `onChange` receives
  it with empty `name` and `slug`.
- Changing the alpha slider is a no-op while `value` is empty — there is no color to attach
  an opacity to.
- The clear button (`clearable`) is disabled while `value` is already empty.

## Styling

No stylesheet ships; the toggle button's swatch uses inline styles. `sideEffects: false`
on the package holds.

## Gotchas

- `onChange` always receives an object, never a string — do not treat it like
  `ColorPalette`'s own `onChange`.
- This component does not read a theme.json palette by itself. Pass `colors={ [] }` (the
  default) and only the custom-color picker will show.

## Related

- `@wordpress/components` `ColorPalette` — the lower-level primitive this wraps.
