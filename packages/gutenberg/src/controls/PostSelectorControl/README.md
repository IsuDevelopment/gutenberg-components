---
name: PostSelectorControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: experimental
since: 0.2.0
---

## Summary

The all-in-one post selection UI: a heading with an "x / max" counter, a drag-and-drop
sortable list of the selected posts (thumbnail, title, term · date, remove), a reorder hint
and a "Choose posts" / "Change selection" button that opens the picker modal. Controlled,
or bound to post meta through `valueBinding`.

## When to use / When not to use

Use it in `InspectorControls` or a `PluginDocumentSettingPanel` for "related posts",
"featured products" and similar lists. Use `MetaPostSelectorControl` when the value is one
meta key, and `PostPickerControl` when you only need a trigger.

## Import

```js
import { PostSelectorControl } from '@isudev/gutenberg/controls';
import { PostSelectorControl } from '@isudev/gutenberg/controls/PostSelectorControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `PostSelectionValue` | `undefined` | No | Controlled selection. Takes precedence over `valueBinding`. |
| `onChange` | `( value: PostSelectionValue ) => void` | `undefined` | No | Controlled change handler, called after reorder, removal and modal save. |
| `valueBinding` | `ValueBinding` | `undefined` | No | `meta` or `custom` binding used when not controlled. `taxonomy` is ignored with a dev warning. |
| `label` | `string` | `undefined` | No | Visible heading above the list. |
| `help` | `string` | reorder hint | No | Help text below the list. Defaults to `labels.reorderHelp` while two or more posts are selected. |
| `disabled` | `boolean` | `false` | No | Disable reordering, removal and the picker. |
| `className` | `string` | `undefined` | No | Class name added to the wrapper. |
| `postTypes` | `string[]` | all viewable REST types | No | Allowed post type slugs. Unknown or non-REST types are dropped with a dev warning. |
| `taxonomies` | `string[]` | all of the type's visible taxonomies | No | Taxonomy slugs offered as filters once a single post type is chosen. |
| `query` | `PostPickerQuery` | `{ status: ['publish'] }` | No | Hard constraints on every request: `status`, `taxonomies` (term IDs per taxonomy slug) and `exclude`. |
| `excludeCurrentPost` | `boolean` | `true` | No | Leave the post being edited out of the results. |
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

### Block attribute in the inspector

```jsx
// block.json: "relatedPosts": { "type": "array", "default": [] }
<InspectorControls>
	<PanelBody title="Related posts">
		<PostSelectorControl
			label="Related posts"
			value={ attributes.relatedPosts }
			onChange={ ( relatedPosts ) => setAttributes( { relatedPosts } ) }
			postTypes={ [ 'post', 'page' ] }
			taxonomies={ [ 'category' ] }
			max={ 6 }
			valueShape="objects"
		/>
	</PanelBody>
</InspectorControls>
```

### Post meta through a binding

```jsx
<PostSelectorControl
	valueBinding={ { type: 'meta', key: 'related_products' } }
	postTypes={ [ 'product' ] }
	taxonomies={ [ 'product_cat' ] }
	max={ 8 }
/>
```

### Without thumbnails, one post

```jsx
<PostSelectorControl
	value={ attributes.post ?? null }
	onChange={ ( post ) => setAttributes( { post } ) }
	multiple={ false }
	showFeaturedImage={ false }
/>
```

## Behavior

- Selected posts are resolved for display with one cached `include` request per post type
  (bare IDs are looked up in every allowed type). Stored snapshot titles show while loading.
- Drag and drop and ↑/↓ on a row's handle reorder the list; the new order is written
  immediately through `onChange`. Reordering is disabled in single mode.
- Removing, reordering or saving with `valueShape: 'objects'` refreshes snapshots with live
  data for every resolved post.
- Posts that no longer resolve (deleted, trashed, status outside `query.status`) are shown
  as "Unavailable post (#id)" and stay in the value until removed — never silently dropped.
- The counter shows `count / max`, or just the count without a `max` (hidden with no label
  and no max).
- Row meta is "first term · date"; the date uses the admin document's `lang`.

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

No stylesheet; inline layout styles only. Target `className`.

## Gotchas

- Meta must be registered with a schema matching `valueShape` — see
  [`MetaPostSelectorControl`](../../meta/MetaPostSelectorControl/README.md) for the PHP.
  A mismatch makes the editor's save fail with a REST error.
- `valueShape: 'objects'` snapshots can go stale when a post is renamed later. Read the live
  title/permalink by ID when rendering if that matters.

## Related

- [`MetaPostSelectorControl`](../../meta/MetaPostSelectorControl/README.md)
- [`PostPickerControl`](../PostPickerControl/README.md)
- [`SortablePostList`](../../components/SortablePostList/README.md)
