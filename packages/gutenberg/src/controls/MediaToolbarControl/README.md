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

`pickerProps` accepts `allowedTypes`, `imageSize`, `disabled`, `title`, `modalClass`,
`onClose` and `fallback` from `MediaPickerControl`.

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
	group="inline"
/>
```

## Behavior

- With no media, only select can render. With media, select is replaced by replace/edit.
- `actions={ false }` emits no toolbar fill.
- The component owns `BlockControls` and `ToolbarGroup`; do not wrap it in another fill.

## Styling

Ships no stylesheet. WordPress supplies toolbar and icon styles.

## Gotchas

Block toolbar fills display only for the currently selected block.

## Related

- [`MediaPickerControl`](../MediaPickerControl/README.md)
- [`MediaSidebarControl`](../MediaSidebarControl/README.md)
- [`MediaControl`](../MediaControl/README.md)
