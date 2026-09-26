---
name: MetaPostSelectorControl
entrypoint: "@isudev/gutenberg/meta"
kind: control
status: experimental
since: 0.2.0
---

## Summary

Easy mode for `PostSelectorControl`: pass a meta key and get the complete sortable post
selection UI reading and writing that post meta.

## When to use / When not to use

Use it in a `PluginDocumentSettingPanel` or `InspectorControls` when the selection belongs
to the post (e.g. "related products" on a product). When the selection belongs to a block,
use `PostSelectorControl` or `PostPickerControl` with a block attribute instead.

## Import

```js
import { MetaPostSelectorControl } from '@isudev/gutenberg/meta';
import { MetaPostSelectorControl } from '@isudev/gutenberg/meta/MetaPostSelectorControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `metaKey` | `string` | — | Yes | Registered post meta key holding the selection. |
| `postType` | `string` | current post type | No | Post type whose meta is edited. |
| `label` | `string` | `undefined` | No | Visible heading above the list. |
| `help` | `string` | reorder hint | No | Help text below the list. |
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

## Registering the meta

The meta key must be registered with `show_in_rest` and a schema that matches what the
control writes. IDs (`valueShape: 'ids'`, the default):

```php
register_post_meta( 'product', 'related_posts', [
	'type'          => 'array',
	'single'        => true,
	'default'       => [],
	'auth_callback' => static fn(): bool => current_user_can( 'edit_posts' ),
	'show_in_rest'  => [
		'schema' => [
			'type'  => 'array',
			'items' => [ 'type' => 'integer' ],
		],
	],
] );
```

Objects (`valueShape: 'objects'`):

```php
register_post_meta( 'product', 'related_content', [
	'type'          => 'array',
	'single'        => true,
	'default'       => [],
	'auth_callback' => static fn(): bool => current_user_can( 'edit_posts' ),
	'show_in_rest'  => [
		'schema' => [
			'type'  => 'array',
			'items' => [
				'type'                 => 'object',
				'additionalProperties' => false,
				'properties'           => [
					'id'    => [ 'type' => 'integer' ],
					'type'  => [ 'type' => 'string' ],
					'title' => [ 'type' => 'string' ],
					'link'  => [ 'type' => 'string' ],
				],
			],
		],
	],
] );
```

For `multiple: false` register `'type' => 'integer'` (IDs) or `'type' => 'object'` with the
same `properties` (objects) instead of an array.

The post type must support `custom-fields` for meta to be exposed over REST (posts and pages
do; add it to custom post types).

## Examples

### Related products in the document sidebar

```jsx
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { registerPlugin } from '@wordpress/plugins';
import { MetaPostSelectorControl } from '@isudev/gutenberg/meta';

registerPlugin( 'related-products', {
	render: () => (
		<PluginDocumentSettingPanel name="related-products" title="Related products">
			<MetaPostSelectorControl
				metaKey="related_posts"
				postTypes={ [ 'product' ] }
				taxonomies={ [ 'product_cat' ] }
				max={ 6 }
			/>
		</PluginDocumentSettingPanel>
	),
} );
```

### Any content type, stored with titles and links

```jsx
<MetaPostSelectorControl
	metaKey="related_content"
	valueShape="objects"
	fields={ [ 'title', 'link', 'type' ] }
	showFeaturedImage={ false }
/>
```

### Rendering the selection in PHP

```php
$ids = (array) get_post_meta( get_the_ID(), 'related_posts', true );

$related = $ids ? get_posts( [
	'post_type'      => 'any',
	'post__in'       => array_map( 'absint', $ids ),
	'orderby'        => 'post__in',
	'posts_per_page' => count( $ids ),
] ) : [];

foreach ( $related as $post ) {
	printf(
		'<a href="%s">%s</a>',
		esc_url( get_permalink( $post ) ),
		esc_html( get_the_title( $post ) )
	);
}
```

## Behavior

Identical to `PostSelectorControl` with `valueBinding={ { type: 'meta', key: metaKey, postType } }`:
changes go into the edited post's meta and are saved with the post.

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

No stylesheet; see `PostSelectorControl`.

## Gotchas

- An unregistered key, a missing `show_in_rest` or a schema mismatch fails without an obvious
  UI error: the control appears to work until the post is saved and the REST request rejects
  the meta.
- `single` must be `true`; the whole ordered array is one meta value.
- Changing `valueShape` on existing data works for reading (any shape is accepted) but the
  schema must accept what is written next.

## Related

- [`PostSelectorControl`](../../controls/PostSelectorControl/README.md)
- [`MetaSelectControl`](../MetaSelectControl/README.md)
