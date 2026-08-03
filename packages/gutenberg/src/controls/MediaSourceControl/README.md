---
name: MediaSourceControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: stable
since: 0.1.0
---

## Summary

Provides the native image-block source workflow as either inline placeholder buttons or a
replacement dropdown: media library, upload, direct URL, current post featured image and
drag-and-drop. Every source is independently configurable.

## When to use / When not to use

Use it to add the same source workflow to custom markup. Use `MediaCanvasControl`,
`MediaToolbarControl`, `MediaSidebarControl` or `MediaControl` when the library should also
create the editor surface. Use `MediaPickerControl` when a single custom trigger should open
only the media library. This is a single-media control, not a gallery or embed renderer.

## Import

```js
import { MediaSourceControl } from '@isudev/gutenberg/controls';
import { MediaSourceControl } from '@isudev/gutenberg/controls/MediaSourceControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `MediaValue` | `{}` | No | Current serializable media value. |
| `onChange` | `MediaChangeHandler` | — | Yes | Receives normalized attachment, URL and featured-image selections. |
| `onRemove` | `() => void` | `undefined` | No | Enables the reset item while a value exists. |
| `sources` | `MediaSourcesConfig` | all enabled | No | Independently controls library, upload, URL, featured image and drop zone. |
| `variant` | `'buttons' \| 'dropdown'` | `'dropdown'` | No | Selects inline placeholder buttons or the replacement menu. |
| `allowedTypes` | `string[]` | `['image']` | No | Allowed WordPress media types or MIME types. |
| `accept` | `string` | inferred | No | Native file-input accept value; overrides inference from `allowedTypes`. |
| `imageSize` | `string` | `undefined` | No | Preferred WordPress image rendition. |
| `disabled` | `boolean` | `false` | No | Disables every source interaction. |
| `featuredMedia` | `MediaValue \| null` | auto-resolved | No | Overrides the current post featured image; `null` marks it unavailable. |
| `onFilesUpload` | `( files: File[] \| FileList ) => void` | `undefined` | No | Runs before direct files enter WordPress' uploader. |
| `onError` | `( message: string ) => void` | `undefined` | No | Receives upload errors. |
| `title` | `string` | WordPress default | No | Native media modal title. |
| `modalClass` | `string` | `undefined` | No | Class added to the native media modal. |
| `onClose` | `() => void` | `undefined` | No | Runs whenever the media modal closes. |
| `fallback` | `ReactNode` | `null` | No | Replaces permission-gated library/upload actions. |
| `labels` | `Partial<MediaSourceLabels>` | translated defaults | No | Overrides source, toggle, reset and URL-form labels. |
| `children` | `( args: MediaSourceToggleArgs ) => ReactElement \| null` | default button | No | Custom dropdown toggle; ignored by `variant="buttons"`. |

## Source configuration

`sources={false}` hides every source. An object overrides the following default-enabled
fields independently:

| Field | Buttons variant | Dropdown variant |
| --- | --- | --- |
| `library` | Shows `Media Library`. | Shows `Open Media Library`. |
| `upload` | Shows `Upload`. | Shows the direct-upload menu item. |
| `url` | Shows `Insert from URL` and its popover. | Shows the current-media URL form. |
| `featured` | Shows `Use featured image`. | Shows the featured-image menu item. |
| `dropZone` | Accepts drag-and-drop uploads. | Ignored; dropdowns have no drop target. |

`onRemove` is deliberately separate: reset is an action, not a media source. It remains
available even with `sources={false}`.

`labels` accepts `select`, `replace`, `library`, `upload`, `url`, `featured`, `remove`,
`currentUrl` and `applyUrl`.

## Examples

### Native image-placeholder sources

Render this inside a WordPress `Placeholder`:

```jsx
<MediaSourceControl
	variant="buttons"
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
/>
```

### Replacement dropdown with selected sources

```jsx
<MediaSourceControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
	onRemove={ () => setAttributes( { media: {} } ) }
	sources={ { upload: false, dropZone: false } }
>
	{ ( { toggle, isOpen, disabled, label } ) => (
		<Button onClick={ toggle } isPressed={ isOpen } disabled={ disabled }>
			{ label }
		</Button>
	) }
</MediaSourceControl>
```

### Injected featured image outside the post editor

```jsx
<MediaSourceControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
	featuredMedia={ { id: 12, url: '/featured.jpg', type: 'image' } }
	sources={ { library: false, upload: false, url: false } }
/>
```

## Behavior

- Attachment choices are normalized with `source: 'attachment'`; direct URLs use
  `source: 'url'`; featured images use `source: 'featured'`.
- When a selected value has `source: 'featured'`, it follows later changes to the current
  post's featured image. Removing the post featured image clears the media fields but keeps
  featured mode, so assigning a new one restores the value. Choosing another source stops
  that synchronization.
- `featuredMedia={undefined}` reads `featured_media` from the current post and its attachment
  from `core-data`. Passing `null` prevents automatic resolution.
- The media picker and file input live outside the dropdown content. This avoids Gutenberg's
  blank media-modal failure when a dropdown is rendered inside an iframe block.
- URL values are trimmed and emitted as data; the component never injects URL content or raw
  embed HTML.
- A direct URL keeps the current broad media type or uses the first `allowedTypes` entry, so
  place the intended URL type first when allowing both images and videos.
- `getMediaAccept` and `resolveMediaSources` are exported for custom compositions.

## Styling

Ships no stylesheet. It uses WordPress buttons, menus, dropdowns and the standard
`block-editor-media-replace-flow` content classes.

## Gotchas

- Direct URLs do not create WordPress attachments and therefore have no attachment ID.
- `upload` controls the visible file-picker button and `dropZone` controls drag-and-drop.
  Disable both to prohibit every direct file-upload path.
- Consumers must escape URLs in PHP and JSX at the final rendering boundary. This control
  stores a URL; it does not authorize or proxy it.
- The featured-image source is disabled until the attachment record resolves. Pass
  `featuredMedia` when no post editor store exists.

## Related

- [`MediaPickerControl`](../MediaPickerControl/README.md)
- [`MediaCanvasControl`](../MediaCanvasControl/README.md)
- [`MediaToolbarControl`](../MediaToolbarControl/README.md)
- [`MediaSidebarControl`](../MediaSidebarControl/README.md)
- [`MediaControl`](../MediaControl/README.md)
