---
name: BlockLinkControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: stable
since: 0.3.0
---

## Summary

Injects an add/edit action and an optional unlink action into Gutenberg's `BlockControls`.
The add/edit action opens the same `LinkPickerControl` used by the lower-level and
editable-text link APIs.

## When to use / When not to use

Use it when a whole block, card, image or other non-text element stores one link and should
expose that link from the selected block's toolbar. Use `LinkText` when the text itself is
editable. Use `LinkPickerControl` when the trigger belongs in custom markup instead of the
block toolbar.

Render this component from a block's `edit` function. It is editor UI and must not be used
from `save`.

## Import

```js
import { BlockLinkControl } from '@isudev/gutenberg/controls';
```

Or import the single control:

```js
import { BlockLinkControl } from '@isudev/gutenberg/controls/BlockLinkControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `LinkValue` | `{}` | No | Current destination and link settings. |
| `onChange` | `( value: LinkValue ) => void` | — | Yes | Updates the block's link attribute with a normalized value. |
| `onRemove` | `() => void` | `onChange( {} )` | No | Custom unlink behavior. The picker closes after it runs. |
| `group` | `BlockControlsGroup` | `'default'` | No | Gutenberg toolbar group: `default`, `block`, `inline`, `other` or `parent`. |
| `disabled` | `boolean` | `false` | No | Disables the add/edit and unlink actions. |
| `showUnlinkButton` | `boolean` | `false` | No | Shows a separate unlink action while a link exists. |
| `addLabel` | `string` | `'Add link'` | No | Accessible label used while no link exists. |
| `editLabel` | `string` | `'Edit link'` | No | Accessible label used while a link exists. |
| `unlinkLabel` | `string` | `'Unlink'` | No | Accessible label for the unlink action. |
| `linkIcon` | `IconType` | WordPress `link` icon | No | Icon for the add/edit action. |
| `unlinkIcon` | `IconType` | WordPress `linkOff` icon | No | Icon for the unlink action. |
| `toolbarGroupClassName` | `string` | `undefined` | No | Extra class name on the generated `ToolbarGroup`. |
| `pickerProps` | `BlockLinkControlPickerProps` | `undefined` | No | Additional picker and popover options except controlled link props. The native text field is enabled by default. |

## Examples

### Link a whole block

```jsx
export function Edit( { attributes, setAttributes } ) {
	return (
		<>
			<BlockLinkControl
				value={ attributes.link }
				onChange={ ( link ) => setAttributes( { link } ) }
			/>
			<div { ...useBlockProps() }>Linked block content</div>
		</>
	);
}
```

For a static block, apply the shared helper in `save`:

```jsx
<a { ...useBlockProps.save() } { ...getLinkAttributes( attributes.link ) }>
	<InnerBlocks.Content />
</a>
```

### Pages only and custom labels

```jsx
<BlockLinkControl
	value={ attributes.cardLink }
	onChange={ ( cardLink ) => setAttributes( { cardLink } ) }
	addLabel={ __( 'Link card' ) }
	editLabel={ __( 'Change card link' ) }
	group="other"
	pickerProps={ {
		noDirectEntry: true,
		noURLSuggestion: true,
		suggestionsQuery: { type: 'post', subtype: 'page' },
	} }
/>
```

The native Text field writes to `value.title` and is included in the object received by
`onChange`. Disable it when the linked element has no meaningful label:

```jsx
<BlockLinkControl
	value={ attributes.cardLink }
	onChange={ ( cardLink ) => setAttributes( { cardLink } ) }
	pickerProps={ { hasTextControl: false } }
/>
```

## Behavior

- The component owns the `BlockControls` and `ToolbarGroup`; consumers only render one
  control from the block's `edit` function.
- With no URL it displays the add action. With a URL it displays the edit action. Set
  `showUnlinkButton` to `true` to add a separate unlink action.
- The link button anchors the popover and receives active state while the picker is open.
- Opening from the toolbar focuses the picker, matching Gutenberg's toolbar-triggered link
  workflow.
- WordPress' native Text field is enabled by default and persists its value as
  `LinkValue.title`. Unlike `LinkText`, this control does not own or render the block's visible
  text, so it does not expose a competing `text` attribute.
- Link normalization, custom `rel` preservation and default unlink behavior come from
  `LinkPickerControl`.

## Styling

Ships no stylesheet. WordPress provides the block-toolbar, icons, picker and popover styles.
Use `toolbarGroupClassName` only for block-specific adjustments.

## Gotchas

- Do not wrap this component in another `BlockControls`; it already creates the fill.
- `BlockControls` only displays for the currently selected block, so the component should
  remain mounted as part of the block's normal edit tree.
- Unlinking remains available from WordPress' link picker when the separate toolbar action is
  hidden.
- A custom `onRemove` must clear the stored link itself.

## Related

- [`LinkPickerControl`](../LinkPickerControl/README.md) — custom trigger and popover composition.
- [`LinkText`](../LinkText/README.md) — editable linked text with native focus behavior.
