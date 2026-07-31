---
name: MediaFocalPointControl
entrypoint: "@isudev/gutenberg/components"
kind: component
status: stable
since: 0.0.1
---

## Summary

A standalone wrapper around WordPress' `FocalPointPicker` for a serializable image or video
value. It can be imported without any media modal, toolbar or inspector controls.

## When to use / When not to use

Use it wherever focal-point editing is required independently. Use `MediaSidebarControl`
with `preview="focal-point"` for a ready-made inspector panel, or `MediaControl` for the
complete workflow.

## Import

```js
import { MediaFocalPointControl } from '@isudev/gutenberg/components';
import { MediaFocalPointControl } from '@isudev/gutenberg/components/MediaFocalPointControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `media` | `MediaValue` | `{}` | No | Image or video displayed by the picker. |
| `value` | `MediaFocalPoint` | `{ x: 0.5, y: 0.5 }` | No | Controlled normalized focal point. |
| `onChange` | `( value: MediaFocalPoint \| undefined ) => void` | — | Yes | Receives changes and reset as `undefined`. |
| `label` | `string` | `'Focal point'` | No | Visible picker label. |
| `help` | `string` | `undefined` | No | Help text below the picker. |
| `hideLabelFromVision` | `boolean` | `false` | No | Visually hides the accessible label. |
| `autoPlay` | `boolean` | WordPress default | No | Controls video autoplay in the picker. |
| `showReset` | `boolean` | `true` | No | Shows reset while a custom value exists. |
| `resetLabel` | `string` | `'Reset focal point'` | No | Reset button label. |
| `emptyFallback` | `ReactNode` | `null` | No | Rendered without a supported media URL. |

## Focal-point value

`MediaFocalPoint` contains numeric `x` and `y` coordinates. Both use WordPress' normalized
`0`–`1` range: `{ x: 0, y: 0 }` is the top-left corner and `{ x: 1, y: 1 }` is the
bottom-right corner. An `undefined` value represents the default center without persisting
`{ x: 0.5, y: 0.5 }` to the block.

## Examples

### Controlled focal point

```jsx
<MediaFocalPointControl
	media={ attributes.media }
	value={ attributes.focalPoint }
	onChange={ ( focalPoint ) => setAttributes( { focalPoint } ) }
/>
```

### Without reset UI

```jsx
<MediaFocalPointControl
	media={ attributes.video }
	value={ attributes.videoFocalPoint }
	onChange={ ( videoFocalPoint ) => setAttributes( { videoFocalPoint } ) }
	showReset={ false }
	hideLabelFromVision
/>
```

## Behavior

- Supports image and video URLs only.
- Undefined focal points display the center without writing a value.
- Reset emits `undefined`, allowing the block attribute to return to its default.

## Styling

Ships no stylesheet and uses WordPress component styles.

## Gotchas

The component is controlled. Update the value passed back by `onChange` or the picker will
return to the previous point.

## Related

- [`MediaPreview`](../MediaPreview/README.md)
- [`MediaSidebarControl`](../../controls/MediaSidebarControl/README.md)
