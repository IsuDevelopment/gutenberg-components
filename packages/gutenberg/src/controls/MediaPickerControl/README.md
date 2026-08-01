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

## Render arguments

| Field | Type | Description |
| --- | --- | --- |
| `open` | `() => void` | Opens the native media modal; it is a no-op when disabled. |
| `hasMedia` | `boolean` | True when `value` has an attachment ID or URL. |
| `disabled` | `boolean` | The resolved disabled state for a custom trigger. |
| `action` | `'select' \| 'replace'` | State-dependent action derived from `hasMedia`. |

## Normalized media value

`onChange` receives this serializable `MediaValue` as its first argument and the untouched
WordPress selection as its optional second argument:

| Field | Type | Source |
| --- | --- | --- |
| `source` | `'attachment'` | Native media-library selection. |
| `id` | `number` | Attachment ID. |
| `url` | `string` | Requested `imageSize`, then `source_url`, then the original URL. |
| `type` | `string` | Broad media type, inferred from the MIME type when necessary. |
| `mime` | `string` | Native `mime_type` or `mime`. |
| `alt` | `string` | Native `alt_text` or `alt`. |
| `width` | `number` | Requested rendition width, then original width. |
| `height` | `number` | Requested rendition height, then original height. |

## Exported helpers

| Helper | Signature | Description |
| --- | --- | --- |
| `normalizeMediaValue` | `( media: unknown, imageSize?: string ) => MediaValue` | Normalizes a native WordPress selection. |
| `hasMediaValue` | `( value?: MediaValue ) => boolean` | Checks for an attachment ID or URL. |
| `resolveMediaActions` | `( actions?: MediaActionsConfig ) => Required<MediaActionVisibility>` | Resolves default-visible action switches. |

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
- Normalized native selections include `source: 'attachment'`; `MediaSourceControl` adds URL
  and featured-image source values.
- The three normalization/state helpers above are exported from both the direct entry point
  and the controls barrel.

## Styling

Ships no markup around the render prop and no stylesheet.

## Gotchas

This is a single-media picker. Gallery/multiple selection is intentionally excluded from
the base API because its value and editing semantics are different and deserve a separate
module.

## Related

- [`MediaCanvasControl`](../MediaCanvasControl/README.md)
- [`MediaSourceControl`](../MediaSourceControl/README.md)
- [`MediaToolbarControl`](../MediaToolbarControl/README.md)
- [`MediaSidebarControl`](../MediaSidebarControl/README.md)
- [`MediaControl`](../MediaControl/README.md)
