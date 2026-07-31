---
name: MediaPickerControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: stable
since: 0.0.1
---

## Summary

Connects any consumer-rendered trigger to WordPress' native media modal. A render prop
exposes `open`, selection state and the current select/replace action, while selections are
normalized to a small serializable `MediaValue`.

## When to use / When not to use

Use it when the trigger belongs to custom markup. Use `MediaCanvasControl`,
`MediaToolbarControl` or `MediaSidebarControl` for ready-made locations, and `MediaControl`
to compose all locations.

## Import

```js
import { MediaPickerControl } from '@isudev/gutenberg/controls';
import { MediaPickerControl } from '@isudev/gutenberg/controls/MediaPickerControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `MediaValue` | `{}` | No | Current serializable media value. |
| `onChange` | `MediaChangeHandler` | — | Yes | Receives normalized and native media values. |
| `children` | `( args: MediaPickerRenderArgs ) => ReactElement \| null` | — | Yes | Renders the modal trigger. |
| `allowedTypes` | `string[]` | `['image']` | No | Allowed WordPress media or MIME types. |
| `imageSize` | `string` | `undefined` | No | Preferred image rendition with full-size fallback. |
| `disabled` | `boolean` | `false` | No | Makes the exposed `open` function a no-op. |
| `title` | `string` | WordPress default | No | Native media modal title. |
| `modalClass` | `string` | `undefined` | No | Class name added to the native modal. |
| `onClose` | `() => void` | `undefined` | No | Called whenever the media modal closes. |
| `fallback` | `ReactNode` | `null` | No | Rendered when the user cannot upload media. |

## Examples

### Custom button

```jsx
<MediaPickerControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
>
	{ ( { open, action } ) => (
		<Button onClick={ open }>
			{ action === 'replace' ? 'Replace image' : 'Select image' }
		</Button>
	) }
</MediaPickerControl>
```

### Video and selected rendition

```jsx
<MediaPickerControl
	value={ attributes.media }
	onChange={ ( media, nativeMedia ) => {
		setAttributes( { media } );
		console.log( nativeMedia );
	} }
	allowedTypes={ ['image', 'video'] }
	imageSize="large"
>
	{ ( { open, hasMedia } ) => (
		<Button onClick={ open }>{ hasMedia ? 'Edit media' : 'Choose media' }</Button>
	) }
</MediaPickerControl>
```

## Behavior

- Wraps `MediaUpload` in `MediaUploadCheck`.
- `hasMedia` is true when the controlled value contains an ID or URL.
- `imageSize` reads the requested rendition from WordPress' selection and falls back to
  `source_url`/`url`.
- `normalizeMediaValue`, `hasMediaValue` and `resolveMediaActions` are exported with the
  control for advanced composition.

## Styling

Ships no markup around the render prop and no stylesheet.

## Gotchas

This is a single-media picker. Gallery/multiple selection is intentionally excluded from
the base API because its value and editing semantics are different and deserve a separate
module.

## Related

- [`MediaCanvasControl`](../MediaCanvasControl/README.md)
- [`MediaToolbarControl`](../MediaToolbarControl/README.md)
- [`MediaSidebarControl`](../MediaSidebarControl/README.md)
- [`MediaControl`](../MediaControl/README.md)
