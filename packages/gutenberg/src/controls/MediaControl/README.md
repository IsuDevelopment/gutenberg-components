---
name: MediaControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: stable
since: 0.1.0
---

## Summary

The complete single-media editor composed from `MediaCanvasControl`,
`MediaToolbarControl` and `MediaSidebarControl`. Every location can be disabled, and each
location independently controls its select, replace and remove actions.

## When to use / When not to use

Use it for the common block workflow where one media value needs canvas, toolbar and/or
sidebar editing. Import an individual submodule when only one location is required so the
consumer bundle does not include the other surfaces.

## Import

```js
import { MediaControl } from '@isudev/gutenberg/controls';
import { MediaControl } from '@isudev/gutenberg/controls/MediaControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `MediaValue` | `{}` | No | Current serializable media. |
| `onChange` | `MediaChangeHandler` | — | Yes | Receives normalized selections. |
| `onRemove` | `() => void` | `onChange( {} )` | No | Shared custom remove behavior. |
| `focalPoint` | `MediaFocalPoint` | `undefined` | No | Focal point passed to the sidebar. |
| `onFocalPointChange` | `( value: MediaFocalPoint \| undefined ) => void` | `undefined` | No | Enables focal-point editing. |
| `allowedTypes` | `string[]` | `['image']` | No | Default allowed types for every location. |
| `imageSize` | `string` | `undefined` | No | Default image rendition for every location. |
| `disabled` | `boolean` | `false` | No | Disables actions in every location. |
| `sources` | `MediaSourcesConfig` | all enabled | No | Default media-source visibility for every location. |
| `resetFocalPointOnChange` | `boolean` | `false` | No | Resets focal point after replace/remove. |
| `canvas` | `false \| MediaControlCanvasOptions` | `{}` | No | Configures or disables inline editing. |
| `toolbar` | `false \| MediaControlToolbarOptions` | `{}` | No | Configures or disables toolbar editing. |
| `sidebar` | `false \| MediaControlSidebarOptions` | `{}` | No | Configures or disables inspector editing. |

## Location configuration

Passing `false` removes a location and its WordPress fill completely. An object accepts the
following options; `value`, change handlers and focal-point state remain owned by
`MediaControl`:

| Location | Supported option fields |
| --- | --- |
| `canvas` | `actions`, `sources`, `placeholder`, `selectLabel`, `replaceLabel`, `removeLabel`, `placeholderLabel`, `placeholderInstructions`, `pickerProps`, `previewProps`, `className`, `style` |
| `toolbar` | `actions`, `sources`, `group`, `selectLabel`, `replaceLabel`, `removeLabel`, `toolbarGroupClassName`, `pickerProps` |
| `sidebar` | `actions`, `sources`, `preview`, `title`, `initialOpen`, `selectLabel`, `replaceLabel`, `removeLabel`, `pickerProps`, `previewProps`, `focalPointProps`, `className` |

For every location, `actions` is either `false` or an object with optional `select`,
`replace` and `remove` booleans; every action defaults to visible in the state where it is
relevant. Sidebar `preview` accepts `'media'`, `'focal-point'` or `false`.

At the composite or location level, `sources` is either `false` or an object with optional
`library`, `upload`, `url`, `featured` and `dropZone` booleans. Every source defaults to
enabled. A location's `sources` overrides the composite default. `dropZone` applies only to
the empty canvas placeholder. Canvas `placeholder={false}` removes that empty surface while
leaving toolbar/sidebar selection available.

Each location's `pickerProps` can override the common `allowedTypes`, `imageSize` and
`disabled` values and additionally accepts `title`, `modalClass`, `onClose` and `fallback`.
The full meaning and defaults of location-specific options are documented in the linked
submodule READMEs below.

## Examples

### Complete image control

```jsx
<MediaControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
	focalPoint={ attributes.focalPoint }
	onFocalPointChange={ ( focalPoint ) => setAttributes( { focalPoint } ) }
	resetFocalPointOnChange
	sidebar={ { preview: 'focal-point' } }
/>
```

### Canvas plus limited toolbar, no sidebar

```jsx
<MediaControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
	allowedTypes={ ['image', 'video'] }
	sources={ { featured: false } }
	canvas={ { actions: { remove: false } } }
	toolbar={ { actions: { select: false, remove: true } } }
	sidebar={ false }
/>
```

Each location can be removed completely:

```jsx
<MediaControl
	value={ attributes.media }
	onChange={ ( media ) => setAttributes( { media } ) }
	canvas={ false }
	toolbar={ false }
	sidebar={ { preview: false, actions: { remove: false } } }
/>
```

## Behavior

- Canvas, toolbar and sidebar are enabled by default.
- Common picker settings are inherited by every location; location `pickerProps` override
  common values.
- Common media-source switches are inherited by every location; location `sources` override
  the composite value.
- All locations share one change/remove pipeline.
- Optional focal reset runs only when media identity changes or media is removed.

## Styling

Ships no stylesheet. Each submodule uses WordPress UI plus minimal inline layout styles.

## Gotchas

- This component intentionally handles one media value, not galleries, captions or embeds.
- Direct URLs have no attachment ID. Featured-image values stay synchronized only while
  their stored `source` remains `'featured'`.
- If only one surface is required, import that surface directly for the narrowest bundle.
- Store the normalized media object, not only its ID, so pure previews work after reload.

## Related

- [`MediaCanvasControl`](../MediaCanvasControl/README.md)
- [`MediaToolbarControl`](../MediaToolbarControl/README.md)
- [`MediaSidebarControl`](../MediaSidebarControl/README.md)
- [`MediaPickerControl`](../MediaPickerControl/README.md)
- [`MediaSourceControl`](../MediaSourceControl/README.md)
