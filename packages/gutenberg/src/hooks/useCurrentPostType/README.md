---
name: useCurrentPostType
entrypoint: "@isudev/gutenberg/hooks"
kind: hook
status: stable
since: 0.0.1
---

## Summary

Returns the post type of the post currently open in the editor.

## When to use / When not to use

Use it inside a block or plugin sidebar that needs to change behavior for specific post
types — hiding a panel on `page`, for example. If you need the post's numeric ID instead,
use `useCurrentPostId`. If you already have the post type from a block's own attributes or
a REST response, do not reach for this hook — it only reflects the editor's own state.

## Import

```js
import { useCurrentPostType } from '@isudev/gutenberg/hooks';
import { useCurrentPostType } from '@isudev/gutenberg/hooks/useCurrentPostType';
```

## Props

Takes no arguments.

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `—` | — | — | — | This hook takes no arguments. |

## Returns

`string | undefined` — the post type slug of the entity currently open in the editor (e.g.
`'post'`, `'page'`, or `'wp_template'` in the site editor), or `undefined` when the editor
has no post set (for example the widgets screen, or before the post has loaded).

`core/editor`'s `getCurrentPostType()` returns `null` in that empty case, not `undefined`.
The hook normalizes that `null` to `undefined` so consumers have a single absent value to
guard against — which is why the `undefined`/falsy checks below are the right ones.

## Examples

### Gating a panel to a single post type

```jsx
const postType = useCurrentPostType();

if ( postType !== 'product' ) {
	return null;
}

return <ProductFieldsPanel />;
```

### Handling the undefined case explicitly

```jsx
const postType = useCurrentPostType();

const label = postType ? `Editing a ${ postType }` : 'Post type unavailable';

return <Text>{ label }</Text>;
```

## Behavior

- Reads `core/editor`'s `getCurrentPostType()` via `useSelect`, normalizing the store's `null`
  to `undefined`.
- It reports whatever entity the editor has loaded, not only a post. In the site editor that
  is `'wp_template'` or `'wp_template_part'`, and `'page'`/`'post'` when editing content
  there. It does **not** return `undefined` in the site editor.
- The value is empty only where the editor has no post set at all, e.g. the widgets screen or
  the first renders before the post resolves.

## Styling

Not applicable — this hook renders nothing.

## Gotchas

- A consumer must handle `undefined`, not assume a string. Treating the return value as
  always-present will crash or silently misbehave where no post is loaded.
- A defined value is not proof that a real post is open. In the site editor the value is
  `'wp_template'`, so anything built from it — a meta binding above all — quietly targets the
  template entity instead of a post. Pass an explicit `postType` in that case rather than
  relying on this hook.

## Related

- [`useCurrentPostId`](../useCurrentPostId/README.md) — the same post, by numeric ID.
