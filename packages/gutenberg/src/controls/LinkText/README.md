---
name: LinkText
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: stable
since: 0.0.1
---

## Summary

Provides editable `RichText` rendered as an anchor and a native-style link action in the
inline block toolbar. It is the ready-made path for CTA labels, inline links and lists of
editable links.

## When to use / When not to use

Use it when both the link text and destination belong to the block's attributes. Use
`LinkPickerControl` when the linked UI is a card, image, composite component or anything
other than editable text. Use `BlockLinkControl` when an entire block only needs toolbar
actions and no editable link text.

This is editor UI, not a frontend component. Serialize with `RichText.Content` and
`getLinkAttributes`, or escape the values in a dynamic PHP render.

## Import

```js
import { LinkText } from '@isudev/gutenberg/controls';
```

Or import the single control:

```js
import { LinkText } from '@isudev/gutenberg/controls/LinkText';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `text` | `string` | `''` | No | Current RichText content. |
| `onTextChange` | `( text: string ) => void` | — | Yes | Updates the text attribute. |
| `link` | `LinkValue` | `{}` | No | Current destination and link settings. |
| `onLinkChange` | `( link: LinkValue ) => void` | — | Yes | Updates the normalized link attribute. |
| `onLinkRemove` | `() => void` | `onLinkChange( {} )` | No | Custom unlink behavior. |
| `placeholder` | `string` | `'Link text…'` | No | Placeholder for empty text. |
| `className` | `string` | `undefined` | No | Extra class on the editor anchor. |
| `ariaLabel` | `string` | Text or `'Link text'` | No | Accessible name for the editable anchor. |
| `allowedFormats` | `string[]` | `[]` | No | RichText formats permitted inside the link. |
| `disableLineBreaks` | `boolean` | `true` | No | Prevents multiline link labels. |
| `showIncompleteWarning` | `boolean` | `true` | No | Shows an editor-only warning if text or a safe URL is missing. |
| `incompleteWarningText` | `string` | `'Link text or URL is missing'` | No | Warning tooltip and accessible label. |
| `warningSuffix` | `ReactNode` | `undefined` | No | Extra content beside the warning icon. |
| `pickerProps` | `LinkTextPickerProps` | `undefined` | No | Additional picker and popover options except its controlled link props. |
| `richTextProps` | `Record<string, unknown>` | `undefined` | No | Additional RichText props; LinkText's controlled props take precedence. |
| `showToolbarButton` | `boolean` | `true` | No | Adds the native-style link action to `BlockControls`. |
| `toolbarLabel` | `string` | `'Link'` | No | Accessible title for the toolbar action. |
| `toolbarIcon` | `IconType` | WordPress `link` icon | No | Toolbar icon used while no link exists. |
| `toolbarEditIcon` | `IconType` | Link-with-pencil icon | No | Toolbar icon used while a link exists. |

## Examples

### Minimal editable link

```jsx
const { linkText, link } = attributes;

<LinkText
	text={ linkText }
	link={ link }
	onTextChange={ ( nextText ) => setAttributes( { linkText: nextText } ) }
	onLinkChange={ ( nextLink ) => setAttributes( { link: nextLink } ) }
/>
```

Declare the attributes in `block.json`:

```json
{
	"attributes": {
		"linkText": { "type": "string", "default": "" },
		"link": { "type": "object", "default": {} }
	}
}
```

Serialize a static block:

```jsx
<a { ...getLinkAttributes( attributes.link ) }>
	<RichText.Content tagName="span" value={ attributes.linkText } />
</a>
```

### Pages only and custom formatting

```jsx
<LinkText
	text={ attributes.ctaText }
	link={ attributes.ctaLink }
	onTextChange={ ( ctaText ) => setAttributes( { ctaText } ) }
	onLinkChange={ ( ctaLink ) => setAttributes( { ctaLink } ) }
	allowedFormats={ [ 'core/bold' ] }
	pickerProps={ {
		noDirectEntry: true,
		noURLSuggestion: true,
		suggestionsQuery: { type: 'post', subtype: 'page' },
		popoverPlacement: 'bottom',
	} }
	richTextProps={ { identifier: 'ctaText' } }
/>
```

## Behavior

- Clicking unlinked text only places the caret and never opens the picker, so typing remains
  uninterrupted. Add the destination through the link action in the block toolbar.
- Opening from the toolbar autofocuses WordPress' search field, forces its new-link mode and
  shows initial suggestions. Gutenberg only displays the `BlockControls` fill for the active
  block.
- The toolbar uses the regular link icon without a destination and the link-with-pencil icon
  with a destination. Its active state reflects only an open picker, never the stored URL.
- Clicking text that already has an `href` opens WordPress' link preview but passes
  `focusOnMount={ false }`, exactly like the native RichText link flow, so the popup does not
  steal the caret.
- The picker receives the current RichText value as its native Text field. Changes made in
  that field update `text`; selecting an entity preserves existing text and fills empty text
  with the entity title.
- Link data is normalized by `LinkPickerControl`; the editor anchor previews its `href`,
  `_blank` target and managed `rel` values.
- The warning is editor-only. It appears for empty text, a missing URL or a URL rejected by
  `getLinkAttributes`.
- Controlled RichText props (`tagName`, `ref`, value callbacks, link attributes and click
  behavior) override conflicting entries in `richTextProps`.

## Styling

Ships no stylesheet. Style the editable anchor through `className` or block editor styles.
The warning uses the WordPress caution icon and a small inline layout style only.

## Gotchas

- `text` may contain RichText markup. Use `RichText.Content` for static JSX output and
  `wp_kses_post()` for an equivalent dynamic PHP render.
- `LinkValue.title` is used as plain text when auto-filling an empty label.
- Overriding `pickerProps.popoverFocusOnMount` also overrides the native split between toolbar
  autofocus and existing-link click behavior. Do so only when supplying an equivalent focus
  strategy.
- `onLinkRemove` must clear the consumer's stored link. If it does not, the old destination
  will remain controlled and reappear.
- Do not put another interactive element inside the editable anchor through `richTextProps`.

## Related

- [`LinkPickerControl`](../LinkPickerControl/README.md) — the lower-level arbitrary-element picker.
- [`BlockLinkControl`](../BlockLinkControl/README.md) — ready-made link/unlink block toolbar.
