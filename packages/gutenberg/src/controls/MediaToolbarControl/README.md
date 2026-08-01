---
name: MediaToolbarControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: stable
since: 0.0.1
---

## Summary

Adds state-aware select/replace and remove actions to Gutenberg's block toolbar without
rendering any block content or inspector UI.

## When to use / When not to use

Use it when media editing belongs only in `BlockControls`. Use `MediaControl` to combine
toolbar actions with canvas and sidebar editing.

## Import

```js
import { MediaToolbarControl } from '@isudev/gutenberg/controls';
import { MediaToolbarControl } from '@isudev/gutenberg/controls/MediaToolbarControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `MediaValue` | `{}` | No | Current serializable media. |
| `onChange` | `MediaChangeHandler` | — | Yes | Receives normalized media selections. |
| `onRemove` | `() => void` | `onChange( {} )` | No | Custom clearing behavior. |
| `actions` | `MediaActionsConfig` | all enabled | No | Independently controls select, replace and remove. |
| `sources` | `MediaSourcesConfig` | all enabled | No | Independently controls library, upload, URL, featured image and drop zone. |
| `group` | `BlockControlsGroup` | `'other'` | No | Toolbar group receiving the actions. |
| `selectLabel` | `string` | `'Select media'` | No | Accessible initial action label. |
| `replaceLabel` | `string` | `'Replace media'` | No | Accessible existing-media label. |
| `removeLabel` | `string` | `'Remove media'` | No | Accessible clear label. |
| `toolbarGroupClassName` | `string` | `undefined` | No | Extra class on `ToolbarGroup`. |
| `pickerProps` | `MediaToolbarPickerProps` | `undefined` | No | Native picker options except controlled props. |

## Nested options

`actions` accepts `false` to hide the complete toolbar fill, or an object whose fields each
default to `true`:

| Field | Visible state | Description |
| --- | --- | --- |
| `select` | No media | Shows the initial picker action. |
| `replace` | Media selected | Shows the edit/replace action. |
| `remove` | Media selected | Shows the remove action. |

`sources` is `false` or an object with `library`, `upload`, `url`, `featured` and `dropZone`
booleans. `dropZone` has no effect in a toolbar dropdown. `pickerProps` accepts
`allowedTypes`, `accept`, `imageSize`, `disabled`, `featuredMedia`, `onFilesUpload`,
`onError`, `title`, `modalClass`, `onClose`, `fallback` and `labels` from
`MediaSourceControl`.

## Examples

### Toolbar media actions

```jsx
<MediaToolbarControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
/>
```

### Replace only

```jsx
<MediaToolbarControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
	actions={ { select: false, remove: false } }
	sources={ { upload: false, featured: false } }
	group="inline"
/>
```

## Behavior

- With no media, only select can render. With media, it becomes a native-style replacement
  dropdown containing enabled sources.
- Reset is inside the dropdown when replace and remove are both enabled. It remains a
  standalone toolbar action when replace is disabled.
- `actions={ false }` emits no toolbar fill.
- The component owns `BlockControls` and `ToolbarGroup`; do not wrap it in another fill.

## Styling

Ships no stylesheet. WordPress supplies toolbar and icon styles.

## Gotchas

Block toolbar fills display only for the currently selected block.

## Related

- [`MediaPickerControl`](../MediaPickerControl/README.md)
- [`MediaSourceControl`](../MediaSourceControl/README.md)
- [`MediaSidebarControl`](../MediaSidebarControl/README.md)
- [`MediaControl`](../MediaControl/README.md)
