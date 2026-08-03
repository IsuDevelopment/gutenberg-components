---
name: LinkPickerControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: stable
since: 0.1.0
---

## Summary

Adds WordPress' native link picker to any consumer-rendered element. It owns popover state
and link normalization, while a render prop keeps the trigger and the block's markup under
the consumer's control.

The same folder exports `normalizeLinkValue` and `getLinkAttributes`, so editor state and
saved anchor attributes use one link model.

## When to use / When not to use

Use it when a card, image, button, toolbar action or another custom element needs a link but
must keep its own markup. Use `LinkText` when the editable element is simply inline link text.

Do not import WordPress' `LinkControl` directly unless you also want to own its popover,
anchor lifecycle, unlink behavior and `rel` normalization.

## Import

```js
import {
	getLinkAttributes,
	LinkPickerControl,
} from '@isudev/gutenberg/controls';
```

Or import only this entry:

```js
import {
	getLinkAttributes,
	LinkPickerControl,
} from '@isudev/gutenberg/controls/LinkPickerControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `LinkValue` | `{}` | No | Current serializable link value. |
| `onChange` | `( value: LinkValue ) => void` | — | Yes | Receives normalized URL, title, entity data, settings and `rel`. |
| `onRemove` | `() => void` | `onChange( {} )` | No | Custom unlink behavior. The picker closes afterward. |
| `children` | `( args: LinkPickerRenderArgs ) => ReactNode` | — | Yes | Renders any trigger UI and receives its anchor ref and actions. |
| `isOpen` | `boolean` | `undefined` | No | Controls popover visibility externally. |
| `defaultOpen` | `boolean` | `false` | No | Initial visibility when uncontrolled. |
| `onOpenChange` | `( isOpen: boolean ) => void` | `undefined` | No | Observes open/close requests in either mode. |
| `settings` | `LinkSetting[]` | New-tab and nofollow | No | Settings shown in WordPress' link settings drawer. |
| `suggestionsQuery` | `LinkSuggestionsQuery` | `undefined` | No | Restricts suggestions, e.g. to one post type or taxonomy. |
| `showSuggestions` | `boolean` | `true` | No | Enables search suggestions. |
| `showInitialSuggestions` | `boolean` | `true` | No | Shows suggestions before typing, matching WordPress' native picker. |
| `forceIsEditingLink` | `boolean` | `true` for an empty link | No | Forces the URL search/editor instead of the saved-link preview. |
| `noDirectEntry` | `boolean` | `false` | No | Prevents arbitrary URL entry. |
| `noURLSuggestion` | `boolean` | `false` | No | Hides the fallback that treats typed text as a URL. |
| `hasTextControl` | `boolean` | `false` | No | Shows WordPress' title input in the picker. |
| `handleEntities` | `boolean` | `false` | No | Locks an entity link until it is explicitly unlinked. |
| `hasRichPreviews` | `boolean` | `true` | No | Enables WordPress' rich preview for selected entities. |
| `searchInputPlaceholder` | `string` | WordPress default | No | Picker search-input placeholder. |
| `popoverPlacement` | `PopoverPlacement` | `'bottom-start'` | No | Placement relative to the anchored element. |
| `popoverOffset` | `number` | `8` | No | Gap from the anchor in pixels. |
| `popoverNoArrow` | `boolean` | `false` | No | Hides the popover arrow. |
| `popoverClassName` | `string` | `undefined` | No | Extra class on the popover. |
| `popoverFocusOnMount` | `'firstElement' \| boolean` | `'firstElement'` | No | Controls focus when the popover opens. |
| `popoverAnimate` | `boolean` | `false` | No | Animates the popover when enabled; native inline links disable it. |
| `popoverShift` | `boolean` | `true` | No | Shifts the popover to keep it inside the viewport. |
| `popoverConstrainTabbing` | `boolean` | `true` | No | Keeps tab navigation inside the open popover. |
| `popoverHeader` | `ReactNode` | `undefined` | No | Content above WordPress' picker. |
| `popoverFooter` | `ReactNode` | `undefined` | No | Content below WordPress' picker. |

The render prop receives `anchorRef`, `isOpen`, `hasLink`, `open`, `close`, `toggle` and
`remove`. Attach `anchorRef` to the actual element the popover should follow; this uses local
state, so it also works inside the iframe editor.

## Examples

### Link an entire card

```jsx
const { cardLink } = attributes;

<LinkPickerControl
	value={ cardLink }
	onChange={ ( next ) => setAttributes( { cardLink: next } ) }
>
	{ ( { anchorRef, open, hasLink, remove } ) => (
		<div ref={ anchorRef } className="card-editor">
			<RichText value={ attributes.heading } onChange={ setHeading } />
			<Button icon={ link } onClick={ open }>
				{ hasLink ? __( 'Edit card link' ) : __( 'Add card link' ) }
			</Button>
			{ hasLink && <Button onClick={ remove }>{ __( 'Unlink' ) }</Button> }
		</div>
	) }
</LinkPickerControl>
```

For a static block, use the same model in `save`:

```jsx
<a
	{ ...useBlockProps.save() }
	{ ...getLinkAttributes( attributes.cardLink ) }
>
	<RichText.Content tagName="span" value={ attributes.heading } />
</a>
```

### Limit suggestions to pages and control the popover

```jsx
const [ isOpen, setIsOpen ] = useState( false );

<LinkPickerControl
	value={ attributes.link }
	onChange={ ( linkValue ) => setAttributes( { link: linkValue } ) }
	isOpen={ isOpen }
	onOpenChange={ setIsOpen }
	noDirectEntry
	noURLSuggestion
	suggestionsQuery={ { type: 'post', subtype: 'page' } }
	popoverPlacement="bottom"
>
	{ ( { anchorRef, toggle } ) => (
		<Button ref={ anchorRef } onClick={ toggle }>
			{ __( 'Choose page' ) }
		</Button>
	) }
</LinkPickerControl>
```

### Dynamic PHP rendering

`getLinkAttributes` is for JSX serialization. A dynamic block must escape each value on the
server:

```php
<?php
$url = isset( $attributes['link']['url'] )
	? esc_url( $attributes['link']['url'] )
	: '';
?>
<a href="<?php echo $url; ?>">
	<?php echo esc_html( $attributes['label'] ?? '' ); ?>
</a>
```

Build `target` and `rel` with `wp_targeted_link_rel()` or equivalent server-side logic; do
not trust attributes merely because the editor normalized them.

## Behavior

- The component is controlled for link data and optionally controlled for popover state.
- WordPress 7's stable `LinkControl` provides URL search, direct entry and entity selection.
- An empty value is passed to WordPress as `null`, with editing forced and initial suggestions
  enabled. This is the same new-link mode used by WordPress' `LinkPicker`; passing a truthy,
  normalized empty object changes `LinkControl`'s internal state machine and is deliberately
  avoided.
- Existing values retain WordPress' preview → edit transition. Rich previews are enabled by
  default.
- `normalizeLinkValue` trims the URL, deduplicates `rel`, keeps consumer tokens such as
  `ugc`/`sponsored`, synchronizes `nofollow`, and adds `noopener noreferrer` for `_blank`.
- Default unlink calls `onChange( {} )`; supplying `onRemove` transfers storage cleanup to
  the consumer. Both paths close the popover.
- `getLinkAttributes` omits blank links and obvious executable protocols (`javascript:`,
  `data:`, `vbscript:`), but server-rendered output still requires WordPress escaping.

## Styling

Ships no stylesheet. WordPress owns the picker and popover styles; the trigger markup is
entirely yours.

## Gotchas

- `children` is a function, not a React element.
- Attach `anchorRef` to a mounted HTML element. Opening before an anchor exists intentionally
  renders no popover.
- In controlled `isOpen` mode, `onOpenChange` is a request; the parent must update `isOpen`.
- Use `popoverFocusOnMount="firstElement"` for a button/toolbar action. Use `false` when the
  picker was opened by clicking editable text, so the caret is not stolen.
- `LinkValue.title` is the selected entity title. It is not the HTML `title` attribute unless
  a consumer deliberately maps it there.
- A static block's attributes remain author-controlled data. The URL guard is defense in
  depth, not a substitute for server-side escaping in dynamic blocks.

## Related

- [`LinkText`](../LinkText/README.md) — ready-made RichText link UI.
- [`BlockLinkControl`](../BlockLinkControl/README.md) — ready-made block-toolbar actions.
- [WordPress block attributes and serialization](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/).
