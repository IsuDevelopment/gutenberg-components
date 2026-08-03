---
name: MediaPreview
entrypoint: "@isudev/gutenberg/components"
kind: component
status: stable
since: 0.1.0
---

## Summary

Renders a serializable `MediaValue` as an image or video. It is props-only, performs no
REST requests, and maps an optional focal point to safe CSS `object-position` values.

## When to use / When not to use

Use it for block and inspector previews when the media URL is already stored. Use
`MediaPickerControl` to select media and `MediaControl` for the complete editor workflow.
It intentionally does not render audio, documents or embeds; provide
`unsupportedFallback` or a separate renderer for those formats.

## Import

```js
import { MediaPreview } from '@isudev/gutenberg/components';
import { MediaPreview } from '@isudev/gutenberg/components/MediaPreview';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `MediaValue` | `{}` | No | Serializable media URL, type and metadata. |
| `focalPoint` | `MediaFocalPoint` | `undefined` | No | Normalized coordinates mapped to `object-position`. |
| `aspectRatio` | `CSSProperties['aspectRatio']` | `undefined` | No | CSS aspect ratio of the media. |
| `objectFit` | `CSSProperties['objectFit']` | `'cover'` | No | CSS object-fit mode. |
| `width` | `CSSProperties['width']` | `'100%'` | No | CSS width of the media. |
| `height` | `CSSProperties['height']` | `undefined` | No | CSS height of the media. |
| `style` | `CSSProperties` | `undefined` | No | Additional media-element styles. |
| `className` | `string` | `undefined` | No | Additional media-element class name. |
| `imageProps` | `ImgHTMLAttributes` | `undefined` | No | Image-only props except controlled `src` and `alt`. |
| `videoProps` | `VideoHTMLAttributes` | `undefined` | No | Video-only props except controlled `src`. |
| `emptyFallback` | `ReactNode` | `null` | No | Rendered without a URL. |
| `unsupportedFallback` | `ReactNode` | `null` | No | Rendered for non-image/video types. |

## Media value

`value` is intentionally small enough to store directly in a block attribute:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `number` | No | WordPress attachment ID. |
| `url` | `string` | No | URL rendered by the preview. |
| `type` | `string` | No | Broad type; this component supports `image` and `video`. |
| `mime` | `string` | No | MIME type such as `image/jpeg`. |
| `alt` | `string` | No | Alternative text used for images. |
| `width` | `number` | No | Selected rendition width in pixels. |
| `height` | `number` | No | Selected rendition height in pixels. |

`imageProps` accepts native image attributes except `src` and `alt`, which remain controlled
by `value`. `videoProps` accepts native video attributes except `src`.

## Examples

### Image with focal point

```jsx
<MediaPreview
	value={ attributes.media }
	focalPoint={ attributes.focalPoint }
	aspectRatio="16 / 9"
/>
```

### Video preview

```jsx
<MediaPreview
	value={ attributes.media }
	objectFit="contain"
	videoProps={ { controls: true, muted: true } }
	unsupportedFallback={ <p>Preview unavailable.</p> }
/>
```

## Behavior

- Missing URLs render `emptyFallback`; unsupported types render `unsupportedFallback`.
- Images use `value.alt ?? ''`, so decorative or missing-alt previews remain valid.
- Focal coordinates are clamped to 0–1 before conversion to percentages.
- Videos render controls by default; `videoProps` can override that default.

## Styling

Ships no stylesheet. Layout and media sizing are controlled by props and inline styles.

## Gotchas

Store `url` and `type` alongside an attachment `id`; this pure component does not hydrate
attachment records from the editor store.

## Related

- [`MediaFocalPointControl`](../MediaFocalPointControl/README.md)
- [`MediaCanvasControl`](../../controls/MediaCanvasControl/README.md)
- [`MediaControl`](../../controls/MediaControl/README.md)
