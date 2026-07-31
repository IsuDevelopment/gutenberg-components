---
name: useDebouncedValue
entrypoint: "@isudev/gutenberg/hooks"
kind: hook
status: stable
since: 0.0.1
---

## Summary

Returns a debounced copy of a value that only updates after a delay of no further changes.

## When to use / When not to use

Use it to smooth out a fast-changing value — typically text input — before it feeds an
expensive operation like a network request. Do not use it to delay a one-off event such as
a button click; it debounces a value over time, not a callback.

## Import

```js
import { useDebouncedValue } from '@isudev/gutenberg/hooks';
import { useDebouncedValue } from '@isudev/gutenberg/hooks/useDebouncedValue';
```

## Props

`useDebouncedValue( value, delay = 300 )` — positional arguments, generic in `T`.

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `T` | — | Yes | The value to debounce. |
| `delay` | `number` | `300` | No | Milliseconds to wait after the last change before updating. |

## Returns

`T` — the debounced value, the same type as `value`.

## Examples

### Debouncing a search field before querying

```jsx
const [ search, setSearch ] = useState( '' );
const debouncedSearch = useDebouncedValue( search, 300 );

const options = useSelect(
	( select ) =>
		select( 'core' ).getEntityRecords( 'postType', 'post', {
			search: debouncedSearch,
		} ),
	[ debouncedSearch ]
);

return (
	<TextControl
		label="Search posts"
		value={ search }
		onChange={ setSearch }
	/>
);
```

### A longer delay for a heavier operation

```jsx
const debouncedQuery = useDebouncedValue( query, 800 );
```

## Behavior

- Returns the initial value immediately on first render; debouncing only applies to
  subsequent changes.
- Changing `delay` restarts the timer for the pending update, it does not apply
  retroactively to a wait already in progress.
- The pending timer is cleared on unmount, so no update fires after the component is gone.

## Styling

Not applicable — this hook renders nothing.

## Gotchas

- Passing a new `delay` on every render (e.g. an inline expression that changes each time)
  restarts the timer constantly and the value never settles. Keep `delay` stable.
- The same applies to `value`: the effect depends on both, and it compares by identity. A value
  whose reference changes every render — an inline object or array, which is plausible for a
  debounced query object — restarts the timer forever and never settles either. Debounce a
  primitive, or memoize the object with `useMemo`.

## Related

- [`usePrevious`](../usePrevious/README.md) — for comparing a value against its previous
  render rather than smoothing it over time.
