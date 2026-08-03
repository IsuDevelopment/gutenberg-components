---
name: usePrevious
entrypoint: "@isudev/gutenberg/hooks"
kind: hook
status: stable
since: 0.1.0
---

## Summary

Returns the value a component held on its previous committed render.

## When to use / When not to use

Use it to detect a transition — a status changing from `'draft'` to `'publish'`, for
example — by comparing the current value against what `usePrevious` returns. Do not use it
expecting a synchronous "value before this render finished"; it updates in an effect, one
commit behind, which is the whole reason it can surprise people (see Behavior below). If you
need a value smoothed over time rather than a one-render-back snapshot, use
`useDebouncedValue`.

## Import

```js
import { usePrevious } from '@isudev/gutenberg/hooks';
import { usePrevious } from '@isudev/gutenberg/hooks/usePrevious';
```

## Props

`usePrevious( value )` — positional argument, generic in `T`.

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `T` | — | Yes | The value to track across renders. |

## Returns

`T | undefined` — the value from the previous committed render, or `undefined` on the
first render, before any previous render exists.

## Examples

### Detecting a status transition

```jsx
const status = useSelect( ( select ) => select( editorStore ).getEditedPostAttribute( 'status' ), [] );
const previousStatus = usePrevious( status );

useEffect( () => {
	if ( previousStatus === 'draft' && status === 'publish' ) {
		createNotice( 'success', 'Post published.' );
	}
}, [ status, previousStatus ] );
```

### Reading the previous value directly

```jsx
const previousValue = usePrevious( value );

return (
	<p>
		{ value } (was { previousValue ?? 'nothing yet' })
	</p>
);
```

## Behavior

- The stored value updates inside a `useEffect`, not during render. On the render where
  `value` first changes, `usePrevious` still returns the value from before that change; it
  only catches up after that render commits.
- Returns `undefined` on the first render, since no previous render exists yet.

## Styling

Not applicable — this hook renders nothing.

## Gotchas

- Because the update happens in an effect, `usePrevious` is always one committed render
  behind, never "the value before this render's props changed" — a distinction that matters
  when a value changes more than once between renders you actually see.

## Related

- [`useDebouncedValue`](../useDebouncedValue/README.md) — smooths a value over time instead
  of exposing its previous render.
