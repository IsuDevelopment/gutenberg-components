---
name: PostPickerControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: experimental
since: 0.2.0
---

## Summary

Opens the post picker modal from any trigger you render. Controlled: the selection comes
in through `value` and leaves through `onChange`, so it can be a block attribute, post meta
or component state — nothing is synced for you.

## When to use / When not to use

Use it in a block that needs "choose a post" behind its own button, card or toolbar item.
Use `PostSelectorControl` for the ready-made sidebar list, and `MetaPostSelectorControl`
when the value is post meta.

## Import

```js
import { PostPickerControl } from '@isudev/gutenberg/controls';
import { PostPickerControl } from '@isudev/gutenberg/controls/PostPickerControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `children` | `( args: PostPickerRenderArgs ) => ReactElement \| null` | — | Yes | Renders the trigger. |
| `value` | `PostSelectionValue` | `undefined` | No | Current selection. |
| `onChange` | `( value: PostSelectionValue ) => void` | — | Yes | Receives the new selection when the modal is saved. |
| `disabled` | `boolean` | `false` | No | Makes `open` a no-op. |
| `modalClassName` | `string` | `undefined` | No | Class name added to the modal. |
| `onClose` | `() => void` | `undefined` | No | Called whenever the modal closes, saved or not. |
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

## Render arguments

| Field | Type | Description |
| --- | --- | --- |
| `open` | `() => void` | Opens the modal; a no-op when disabled. |
| `hasSelection` | `boolean` | True when `value` holds at least one post. |
| `count` | `number` | Number of posts in `value`. |
| `disabled` | `boolean` | The resolved disabled state. |

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

### Block attribute, any post type

```jsx
// block.json: "posts": { "type": "array", "default": [] }
<PostPickerControl
	value={ attributes.posts }
	onChange={ ( posts ) => setAttributes( { posts } ) }
	max={ 4 }
>
	{ ( { open, count } ) => (
		<Button variant="primary" onClick={ open }>
			{ count ? `${ count } selected` : 'Pick posts' }
		</Button>
	) }
</PostPickerControl>
```

### One featured post, stored with its title and link

```jsx
// block.json: "featured": { "type": "object" }
<PostPickerControl
	value={ attributes.featured ?? null }
	onChange={ ( featured ) => setAttributes( { featured: featured ?? undefined } ) }
	postTypes={ [ 'post' ] }
	multiple={ false }
	valueShape="objects"
	fields={ [ 'title', 'link' ] }
>
	{ ( { open, hasSelection } ) => (
		<Button onClick={ open }>
			{ hasSelection ? attributes.featured.title : 'Choose a post' }
		</Button>
	) }
</PostPickerControl>
```

## Behavior

- Owns only the open state; every picker option is forwarded to `PostPickerModal`.
- `onChange` fires only when the modal is saved; cancel leaves `value` untouched.
- `count`/`hasSelection` are derived from `value`, whatever its shape.

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

Adds no markup around the render prop and no stylesheet.

## Gotchas

- Block attributes: declare `"type": "array"` for multiple selections and `"number"`
  (IDs) or `"object"` (objects) for `multiple: false`. A mismatched attribute type is
  silently dropped by the block parser on reload.

## Related

- [`PostPickerModal`](../PostPickerModal/README.md)
- [`PostSelectorControl`](../PostSelectorControl/README.md)
- [`MetaPostSelectorControl`](../../meta/MetaPostSelectorControl/README.md)
