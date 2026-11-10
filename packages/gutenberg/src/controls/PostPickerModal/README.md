---
name: PostPickerModal
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: experimental
since: 0.2.0
---

## Summary

A modal for searching, filtering and selecting posts across one or more post types:
search, post type, per-type taxonomy filters, sort, "All / Selected" tabs, a maximum and
"Save selection". It edits a draft; `onChange` fires once, on save.

## When to use / When not to use

Use it when you control the open state yourself. In almost every case prefer
`PostPickerControl` (render-prop trigger that owns the open state) or `PostSelectorControl`
(the complete sidebar UI).

## Import

```js
import { PostPickerModal } from '@isudev/gutenberg/controls';
import { PostPickerModal } from '@isudev/gutenberg/controls/PostPickerModal';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `PostSelectionValue` | `undefined` | No | Selection the modal starts from. Any stored shape is accepted. |
| `onChange` | `( value: PostSelectionValue ) => void` | — | Yes | Called once with the new selection on "Save selection". |
| `onClose` | `() => void` | — | Yes | Called on save, cancel, Escape or overlay click. |
| `className` | `string` | `undefined` | No | Class name added to the modal. |
| `postTypes` | `string[]` | all viewable REST types | No | Allowed post type slugs. Unknown or non-REST types are dropped with a dev warning. |
| `taxonomies` | `string[]` | all of the type's visible taxonomies | No | Taxonomy slugs offered as filters once a single post type is chosen. |
| `query` | `PostPickerQuery` | `{ status: ['publish'] }` | No | Hard constraints on every request: `status`, `taxonomies` (term IDs per taxonomy slug) and `exclude`. |
| `excludeCurrentPost` | `boolean` | `true` | No | Leave the post being edited out of the results when it has a positive numeric ID. Site Editor template and template-part identifiers are ignored. |
| `max` | `number` | unlimited | No | Maximum number of selected posts. Ignored when `multiple` is false. |
| `multiple` | `boolean` | `true` | No | `false` stores one post (`number \| PostReference \| null`) and renders radio buttons. |
| `valueShape` | `'ids' \| 'objects'` | `'ids'` | No | Store `number[]` or `PostReference[]` snapshots. |
| `fields` | `PostSelectionField[]` | `['title', 'link', 'type']` | No | Snapshot fields stored next to `id` with `valueShape: 'objects'`. |
| `showFeaturedImage` | `boolean` | `true` | No | Show featured image thumbnails (a neutral box when a post has none). |
| `perPage` | `number` | `20` | No | Posts per page and per post type. |
| `labels` | `Partial<PostPickerLabels>` | English defaults | No | Overrides any string; see *Labels*. |

## Value model

| `valueShape` | `multiple: true` | `multiple: false` |
| --- | --- | --- |
| `'ids'` (default) | `number[]` | `number \| null` |
| `'objects'` | `PostReference[]` | `PostReference \| null` |

`PostReference` is `{ id: number; type?: string; title?: string; link?: string }`, with only
the keys listed in `fields`. Any stored shape is accepted on input — an ID array can be read
by an `'objects'` control and vice versa — and the order of the array is the order the author
chose.

## Examples

### Controlled open state

```jsx
const [ isOpen, setIsOpen ] = useState( false );

<Button onClick={ () => setIsOpen( true ) }>Pick posts</Button>
{ isOpen && (
	<PostPickerModal
		value={ attributes.posts }
		onChange={ ( posts ) => setAttributes( { posts } ) }
		onClose={ () => setIsOpen( false ) }
		postTypes={ [ 'post', 'product' ] }
		max={ 6 }
	/>
) }
```

### Only posts from one category

```jsx
<PostPickerModal
	value={ value }
	onChange={ setValue }
	onClose={ close }
	postTypes={ [ 'post' ] }
	query={ { taxonomies: { category: [ 12 ] } } }
	taxonomies={ [] }
/>
```

## Behavior

- **Post type filter** lists the allowed types plus "All types"; it is hidden when only one
  type is allowed.
- **Taxonomy filters** are hidden while "All types" is active. With one type chosen, one
  select is shown per taxonomy of that type, intersected with `taxonomies`. Changing the type
  resets them. A taxonomy constrained in `query.taxonomies` only offers the allowed terms.
- **"All types"** issues one `wp/v2` request per type and merges the results client-side in
  the chosen order, so sort, counts and thumbnails behave the same as with a single type.
  "Load more" grows the window by `perPage`; a type's next page is requested only when its
  previous page came back full.
- `query.taxonomies` drops post types that do not have a constrained taxonomy — they cannot
  match. A UI filter on a constrained taxonomy is narrowed to the intersection.
- Search is debounced by 300 ms. Sort options: newest (default), oldest, title A→Z, Z→A.
- The "Selected" tab lists the draft in selection order, regardless of filters.
- With `max` reached, unchecked rows are disabled; checked rows stay toggleable. In single
  mode rows are radio buttons and choosing one replaces the selection.
- Saving with `valueShape: 'objects'` refreshes every snapshot with live data for posts that
  were resolved during the session; others keep their stored snapshot.
- Request errors show a notice in the list. Dates are formatted with the admin document's
  `lang` (e.g. `pl-PL` → "18 wrz 2026").

## Labels

Every string goes through `__()` and can be overridden with `labels`. Placeholders are
`sprintf`-style: `modalTitle`, `search`, `postType`, `allTypes`, `allTerms` (`%s` taxonomy),
`order`, `newest`, `oldest`, `titleAsc`, `titleDesc`, `tabAll` (`%d`), `tabSelected` (`%d`),
`selectedOfMax` (`%1$d`, `%2$d`), `selectedCount` (`%d`), `cancel`, `save`, `loadMore`,
`noResults`, `noSelection`, `choose`, `change`, `remove` (`%s` title), `reorder` (`%s`
title), `reorderHelp`, `moved` (`%1$d`, `%2$d`), `unavailable` (`%d` ID), `error`.

```jsx
labels={ { modalTitle: 'Wybierz powiązane wpisy', save: 'Zapisz wybór', cancel: 'Anuluj' } }
```

## Styling

No stylesheet. Uses `Modal size="large"` and inline layout styles; target `className`.
The list does not scroll on its own — the modal is the only scroll container, and the
footer (counter, Cancel, Save) sticks to its bottom edge.

## Gotchas

- Requests use the `edit` context through `core-data`, so the current user must be able to
  edit the listed post types; otherwise the request fails and the notice shows.
- A post type needs `show_in_rest` to be listed.

## Related

- [`PostPickerControl`](../PostPickerControl/README.md)
- [`PostSelectorControl`](../PostSelectorControl/README.md)
