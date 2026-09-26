---
name: SortablePostList
entrypoint: "@isudev/gutenberg/components"
kind: component
status: experimental
since: 0.2.0
---

## Summary

An ordered list of posts with a drag handle, optional thumbnail, title, meta line and
remove button. Rows are reordered by drag and drop or with the arrow keys on the handle.
Pure UI: it never fetches, it only reports moves and removals.

## When to use / When not to use

Use it to show an already-resolved selection anywhere — a block canvas, a custom panel —
when you want the same list `PostSelectorControl` renders. Use `PostSelectorControl` when
you also want fetching, a counter and the picker button.

## Import

```js
import { SortablePostList } from '@isudev/gutenberg/components';
import { SortablePostList } from '@isudev/gutenberg/components/SortablePostList';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `items` | `SortablePostListItem[]` | — | Yes | Rows in their current order: `{ id, title, meta?, thumbnailUrl?, isUnavailable? }`. |
| `onMove` | `( from: number, to: number ) => void` | `undefined` | No | Called after a drop or keyboard move. Omit to disable reordering. |
| `onRemove` | `( index: number ) => void` | `undefined` | No | Called with the removed row's index. Omit to hide remove buttons. |
| `showThumbnail` | `boolean` | `true` | No | Show the 48×48 thumbnail box. |
| `disabled` | `boolean` | `false` | No | Disable reordering and removal. |
| `labels` | `Partial<Pick<PostPickerLabels, 'remove' \| 'reorder' \| 'moved' \| 'unavailable'>>` | English defaults | No | Overrides the list's strings. |
| `className` | `string` | `undefined` | No | Class name added to the `<ul>`. |

## Examples

### Reorderable list in block state

```jsx
const [ items, setItems ] = useState( [
	{ id: 1, title: 'Autumn coats', meta: 'Styling · 18 Sep 2026' },
	{ id: 2, title: 'Season colours', meta: 'Trends · 12 Sep 2026' },
] );

<SortablePostList
	items={ items }
	onMove={ ( from, to ) => {
		const next = [ ...items ];
		next.splice( to, 0, next.splice( from, 1 )[ 0 ] );
		setItems( next );
	} }
	onRemove={ ( index ) => setItems( items.filter( ( _, i ) => i !== index ) ) }
/>
```

### Read-only list without thumbnails

```jsx
<SortablePostList items={ items } showThumbnail={ false } />
```

## Behavior

- Reordering is available only with `onMove`, while not `disabled`, and with two or more rows.
- Drag and drop uses native HTML5 events; the drop position (above/below the hovered row)
  is shown as a theme-colored inset line.
- Keyboard: focus a row's handle and press ↑/↓. Focus stays on the moved row's handle, and
  a polite live region announces the new position (`labels.moved`).
- `isUnavailable` rows show `labels.unavailable` with the ID, hide the meta line and stay
  removable.
- Renders nothing for an empty `items` array.

## Styling

No stylesheet. Layout uses inline styles and `--wp-admin-theme-color` for the drop line;
target `className` to restyle.

## Gotchas

- `onMove` receives the **final** index, already corrected for the dragged row leaving its
  slot — splice it out and back in, do not subtract again.
- Titles are rendered as text. Pass decoded plain text, not `title.rendered` markup.

## Related

- [`PostSelectorControl`](../../controls/PostSelectorControl/README.md)
- [`PostPickerControl`](../../controls/PostPickerControl/README.md)
