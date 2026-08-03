---
name: MediaSidebarControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: stable
since: 0.1.0
---

## Summary

Adds a media panel to `InspectorControls` with independently configurable actions and one
of three preview modes: static media, interactive focal point, or no preview.

## When to use / When not to use

Use it for inspector-only media editing. Use `MediaFocalPointControl` directly when no
panel should be created, or `MediaControl` to combine the sidebar with canvas and toolbar
locations.

## Import

```js
import { MediaSidebarControl } from '@isudev/gutenberg/controls';
import { MediaSidebarControl } from '@isudev/gutenberg/controls/MediaSidebarControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `MediaValue` | `{}` | No | Current serializable media. |
| `onChange` | `MediaChangeHandler` | — | Yes | Receives normalized selections. |
| `onRemove` | `() => void` | `onChange( {} )` | No | Custom clearing behavior. |
| `actions` | `MediaActionsConfig` | all enabled | No | Independently controls select, replace and remove. |
| `sources` | `MediaSourcesConfig` | all enabled | No | Independently controls library, upload, URL, featured image and drop zone. |
| `preview` | `false \| 'media' \| 'focal-point'` | `'media'` | No | Selects or disables sidebar preview UI. |
| `focalPoint` | `MediaFocalPoint` | `undefined` | No | Controlled focal point. |
| `onFocalPointChange` | `( value: MediaFocalPoint \| undefined ) => void` | `undefined` | No | Enables focal-point editing and receives changes. |
| `title` | `string` | `'Media settings'` | No | Inspector panel title. |
| `initialOpen` | `boolean` | `true` | No | Initial panel expansion state. |
| `selectLabel` | `string` | `'Select media'` | No | Initial action label. |
| `replaceLabel` | `string` | `'Replace media'` | No | Existing-media action label. |
| `removeLabel` | `string` | `'Remove media'` | No | Clear action label. |
| `pickerProps` | `MediaSidebarPickerProps` | `undefined` | No | Native picker options except controlled props. |
| `previewProps` | `Omit<MediaPreviewProps, 'value'>` | `undefined` | No | Static preview options. |
| `focalPointProps` | `Omit<MediaFocalPointControlProps, controlled props>` | `undefined` | No | Focal-point display options. |
| `className` | `string` | `undefined` | No | Additional `PanelBody` class name. |

## Nested options

`actions` accepts `false` to hide every sidebar action, or an object whose fields each
default to `true`:

| Field | Visible state | Description |
| --- | --- | --- |
| `select` | No media | Shows the initial picker button. |
| `replace` | Media selected | Shows the edit/replace button. |
| `remove` | Media selected | Shows the remove button. |

The `preview` modes are:

| Value | Result |
| --- | --- |
| `'media'` | Static `MediaPreview`; configured through `previewProps`. |
| `'focal-point'` | Interactive `MediaFocalPointControl`; configured through `focalPointProps`. |
| `false` | No preview; action buttons remain independent. |

`sources` is `false` or an object with `library`, `upload`, `url`, `featured` and `dropZone`
booleans. `dropZone` has no effect in the sidebar dropdown. `pickerProps` accepts
`allowedTypes`, `accept`, `imageSize`, `disabled`, `featuredMedia`, `onFilesUpload`,
`onError`, `title`, `modalClass`, `onClose`, `fallback` and `labels`. `previewProps` accepts
every `MediaPreview` prop except `value`.
`focalPointProps` accepts `label`, `help`, `hideLabelFromVision`, `autoPlay`, `showReset`,
`resetLabel` and `emptyFallback`.

## Examples

### Static preview and actions

```jsx
<MediaSidebarControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
	preview="media"
/>
```

### Focal point without sidebar buttons

```jsx
<MediaSidebarControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
	actions={ false }
	preview="focal-point"
	focalPoint={ attributes.focalPoint }
	onFocalPointChange={ ( focalPoint ) => setAttributes( { focalPoint } ) }
/>
```

Disable only the preview while retaining buttons with `preview={ false }`.

## Behavior

- `preview="media"` renders `MediaPreview` only when a URL exists.
- `preview="focal-point"` requires `onFocalPointChange`; development builds warn and fall
  back to the static preview when it is missing.
- Preview visibility and action visibility are independent.
- Select/replace opens the same source dropdown as the toolbar. Reset is inside that menu
  when replace and remove are enabled.

## Styling

Ships no stylesheet. WordPress supplies inspector styles; preview spacing and button layout
use minimal inline styles.

## Gotchas

The component owns `InspectorControls` and `PanelBody`; render it directly from `edit`.

## Related

- [`MediaPreview`](../../components/MediaPreview/README.md)
- [`MediaFocalPointControl`](../../components/MediaFocalPointControl/README.md)
- [`MediaToolbarControl`](../MediaToolbarControl/README.md)
- [`MediaSourceControl`](../MediaSourceControl/README.md)
- [`MediaControl`](../MediaControl/README.md)
