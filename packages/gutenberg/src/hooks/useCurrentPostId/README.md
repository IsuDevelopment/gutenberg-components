---
name: useCurrentPostId
entrypoint: "@isudev/gutenberg/hooks"
kind: hook
status: stable
since: 0.0.1
---

## Summary

Returns the ID of the post currently open in the editor.

## When to use / When not to use

Use it when a component needs the current post's ID to query related data, e.g. fetching
sibling posts over the REST API. If you need the post type instead, use
`useCurrentPostType`. If the ID is already available as a prop or block attribute, do not
duplicate it with this hook.

## Import

```js
import { useCurrentPostId } from '@isudev/gutenberg/hooks';
import { useCurrentPostId } from '@isudev/gutenberg/hooks/useCurrentPostId';
```

## Props

Takes no arguments.

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `—` | — | — | — | This hook takes no arguments. |

## Returns

`number | undefined` as declared — the ID of the entity currently open in the editor, or
`undefined` when the editor has no post set (for example the widgets screen, or before the post
has loaded). The declared type is optimistic: in the site editor the id of a template is a
string (see Behavior).

`core/editor`'s `getCurrentPostId()` returns `null` in that empty case, not `undefined`.
The hook normalizes that `null` to `undefined` so consumers have a single absent value to
guard against — which is why the `undefined` checks below are the right ones.

## Examples

### Fetching related posts over the REST API

```jsx
const postId = useCurrentPostId();

const relatedPosts = useSelect(
	( select ) =>
		postId
			? select( 'core' ).getEntityRecords( 'postType', 'post', {
					exclude: [ postId ],
					per_page: 3,
			  } )
			: undefined,
	[ postId ]
);
```

### Handling the undefined case explicitly

```jsx
const postId = useCurrentPostId();

if ( postId === undefined ) {
	return <Spinner />;
}

return <PostMetaPanel postId={ postId } />;
```

## Behavior

- Reads `core/editor`'s `getCurrentPostId()` via `useSelect`, normalizing the store's `null`
  to `undefined`.
- It reports whatever entity the editor has loaded, not only a post. In the site editor that
  is the entity being edited: a **string** template id such as `'twentytwentyfive//home'`, or
  a numeric page id when editing a page there. It does **not** return `undefined` in the site
  editor.
- The declared return type is `number | undefined`, so a template id arrives as a string
  despite the type. Do not assume the value is numeric without checking.
- The value is empty only where the editor has no post set at all, e.g. the widgets screen or
  the first renders before the post resolves.

## Styling

Not applicable — this hook renders nothing.

## Gotchas

- A consumer must handle `undefined`, not assume a number. Passing it straight into a REST
  query without a guard produces a request for post ID `undefined`.
- A defined value is not proof that a real post is open. In the site editor you get the
  template's id, so a query built from it targets the template. Pair the check with
  `useCurrentPostType` when the code only makes sense for a specific post type.

## Related

- [`useCurrentPostType`](../useCurrentPostType/README.md) — the same post, by post type.
