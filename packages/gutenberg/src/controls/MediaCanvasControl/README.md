---
name: MediaCanvasControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: stable
since: 0.0.1
---

## Summary

Renders a media placeholder before selection and an image/video preview with compact
replace/remove actions afterward. Each action can be disabled independently.

## When to use / When not to use

Use it for direct editing on the block canvas. Use `MediaToolbarControl` for toolbar-only
actions, `MediaSidebarControl` for inspector UI, or `MediaControl` to combine them.

## Import

```js
import { MediaCanvasControl } from '@isudev/gutenberg/controls';
import { MediaCanvasControl } from '@isudev/gutenberg/controls/MediaCanvasControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `MediaValue` | `{}` | No | Current serializable media. |
| `onChange` | `MediaChangeHandler` | — | Yes | Receives normalized media selections. |
| `onRemove` | `() => void` | `onChange( {} )` | No | Custom clearing behavior. |
| `actions` | `MediaActionsConfig` | all enabled | No | Independently controls select, replace and remove. |
| `selectLabel` | `string` | `'Select media'` | No | Initial selection label. |
| `replaceLabel` | `string` | `'Replace media'` | No | Existing-media action label. |
| `removeLabel` | `string` | `'Remove media'` | No | Clear action label. |
| `placeholderLabel` | `string` | `'Media'` | No | Placeholder heading. |
| `placeholderInstructions` | `string` | selection guidance | No | Placeholder help text. |
| `pickerProps` | `MediaCanvasPickerProps` | `undefined` | No | Native picker options except controlled props. |
| `previewProps` | `Omit<MediaPreviewProps, 'value'>` | `undefined` | No | Media preview configuration. |
| `className` | `string` | `undefined` | No | Canvas/placeholder class name. |
| `style` | `CSSProperties` | `undefined` | No | Canvas wrapper style after selection. |

## Nested options

`actions` accepts `false` to hide every action, or an object with these independently
optional switches (each defaults to `true`):

| Field | Visible state | Description |
| --- | --- | --- |
| `select` | No media | Shows the initial picker action. |
| `replace` | Media selected | Shows the edit/replace action. |
| `remove` | Media selected | Shows the remove action. |

`pickerProps` accepts `allowedTypes`, `imageSize`, `disabled`, `title`, `modalClass`,
`onClose` and `fallback` from `MediaPickerControl`. `previewProps` accepts every
`MediaPreview` prop except its controlled `value`.

## Examples

### Complete canvas editor

```jsx
<MediaCanvasControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
/>
```

### Preview without overlay removal

```jsx
<MediaCanvasControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
	actions={ { remove: false } }
	pickerProps={ { allowedTypes: ['image'], imageSize: 'large' } }
	previewProps={ { aspectRatio: '4 / 3' } }
/>
```

## Behavior

- Select is relevant only without media; replace and remove only with media.
- `actions={ false }` leaves the placeholder/preview intact and removes every action.
- The selected preview comes from the pure `MediaPreview` component.

## Styling

Ships no stylesheet. The selected-media wrapper and compact overlay use minimal inline
layout styles; `className`, `style` and `previewProps` provide block-specific control.

## Gotchas

`style` applies after selection. WordPress' `Placeholder` owns the empty-state layout.

## Related

- [`MediaPreview`](../../components/MediaPreview/README.md)
- [`MediaPickerControl`](../MediaPickerControl/README.md)
- [`MediaControl`](../MediaControl/README.md)
