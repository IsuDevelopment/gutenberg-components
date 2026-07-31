---
name: SelectField
entrypoint: "@isudev/gutenberg/fields"
kind: field
status: stable
since: 0.0.1
---

## Summary

A select field that composes an options source and a value binding independently — pick a
static list or a dynamic source for the choices, and separately bind the value to post meta,
a taxonomy, or a custom store.

## When to use / When not to use

Use it when you need a dropdown and the combination of "where the options come from" and
"where the value lives" is not one of the built-in easy-mode shapes — for example, options
from one taxonomy while the value is written somewhere unrelated.

Do not reach for it for the common cases: use `MetaSelectControl` for a select bound to post
meta, or `TaxonomySelectControl` for a select whose options and value are both a single
taxonomy's terms.

Use `RadioField` instead when a small, always-visible set of choices reads better as radio
buttons than as a dropdown.

## Import

```js
import { SelectField } from '@isudev/gutenberg/fields';
// or, skipping the barrel:
import { SelectField } from '@isudev/gutenberg/fields/SelectField';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `options` | `FieldOption[]` | — | No | Static list of choices; takes precedence over `optionsSource`. |
| `optionsSource` | `OptionsSource` | — | No | Dynamic source for the choices — `terms`, `posts`, `users`, `postTypes`, or `manual`. |
| `valueBinding` | `ValueBinding` | — | No | Where the value is read from and written to — `meta`, `taxonomy`, or `custom`. |
| `value` | `unknown` | — | No | Controlled value; when present the field is controlled and `valueBinding` is ignored. |
| `onChange` | `( value: unknown ) => void` | — | No | Controlled change handler; its presence alone also makes the field controlled. |
| `onValueChange` | `( value: unknown ) => void` | — | No | Called after the resolved `onChange` runs, regardless of binding mode. |
| `loadingComponent` | `ReactNode` | — | No | Rendered instead of the control while options or the value are resolving. |
| `errorComponent` | `ReactNode` | — | No | Rendered instead of the control when resolving fails. |

Every `FieldOption` is `{ label: string; value: string | number; disabled?: boolean }`.

## Examples

### Minimal: static options, controlled value

```jsx
import { useState } from '@wordpress/element';
import { SelectField } from '@isudev/gutenberg/fields';

const [ size, setSize ] = useState( 'medium' );

<SelectField
	label="Size"
	value={ size }
	onChange={ setSize }
	options={ [
		{ label: 'Small', value: 'small' },
		{ label: 'Medium', value: 'medium' },
		{ label: 'Large', value: 'large' },
	] }
/>
```

### Options from content: terms, posts, and users

```jsx
// Categories, ordered by post count — value/onChange are still controlled here to
// isolate what `optionsSource` alone does.
<SelectField
	label="Category"
	value={ category }
	onChange={ setCategory }
	optionsSource={ {
		type: 'terms',
		taxonomy: 'category',
		valueField: 'slug',
		labelField: 'name',
		query: { orderby: 'count', order: 'desc' },
	} }
/>

// Pages, used as a "related page" picker.
<SelectField
	label="Related page"
	value={ relatedPage }
	onChange={ setRelatedPage }
	optionsSource={ {
		type: 'posts',
		postTypes: [ 'page' ],
		valueField: 'id',
		labelField: 'title',
		query: { orderby: 'title', order: 'asc' },
	} }
/>

// Editors and admins only, as an "assigned to" picker.
<SelectField
	label="Assigned to"
	value={ assignedTo }
	onChange={ setAssignedTo }
	optionsSource={ {
		type: 'users',
		roles: [ 'editor', 'administrator' ],
		valueField: 'id',
		labelField: 'name',
	} }
/>
```

### Options from post types, or a manual list

```jsx
// Every public, viewable post type.
<SelectField
	label="Post type"
	value={ postType }
	onChange={ setPostType }
	optionsSource={ { type: 'postTypes' } }
/>

// A fixed list expressed as a source rather than the `options` prop — useful when a
// shared helper builds `optionsSource` generically for every field it configures.
<SelectField
	label="Priority"
	value={ priority }
	onChange={ setPriority }
	optionsSource={ {
		type: 'manual',
		options: [
			{ label: 'Low', value: 'low' },
			{ label: 'Medium', value: 'medium' },
			{ label: 'High', value: 'high' },
		],
	} }
/>
```

### Value bound to post meta

```jsx
<SelectField
	label="Layout"
	optionsSource={ {
		type: 'manual',
		options: [
			{ label: 'Full width', value: 'full' },
			{ label: 'Boxed', value: 'boxed' },
		],
	} }
	valueBinding={ { type: 'meta', key: '_layout_style' } }
/>
```

### Value bound to taxonomy terms

```jsx
<SelectField
	label="Genre"
	optionsSource={ {
		type: 'terms',
		taxonomy: 'genre',
		valueField: 'id',
		labelField: 'name',
	} }
	valueBinding={ { type: 'taxonomy', taxonomy: 'genre' } }
/>
```

### Value bound to a custom store

```jsx
import { useDispatch, useSelect } from '@wordpress/data';
import { SelectField } from '@isudev/gutenberg/fields';

function ThemeColorField() {
	const themeColor = useSelect(
		( select ) => select( 'my-plugin/settings' ).getThemeColor(),
		[]
	);
	const { setThemeColor } = useDispatch( 'my-plugin/settings' );

	return (
		<SelectField
			label="Theme color"
			optionsSource={ {
				type: 'manual',
				options: [
					{ label: 'Blue', value: 'blue' },
					{ label: 'Green', value: 'green' },
				],
			} }
			valueBinding={ {
				type: 'custom',
				value: themeColor,
				onChange: setThemeColor,
			} }
		/>
	);
}
```

### Loading and error placeholders

```jsx
import { Notice, Spinner } from '@wordpress/components';
import { SelectField } from '@isudev/gutenberg/fields';

<SelectField
	label="Author"
	optionsSource={ {
		type: 'users',
		roles: [ 'author', 'editor' ],
	} }
	valueBinding={ { type: 'meta', key: '_featured_author' } }
	loadingComponent={ <Spinner /> }
	errorComponent={
		<Notice status="error" isDismissible={ false }>
			Could not load authors.
		</Notice>
	}
/>
```

### Composition an easy-mode wrapper cannot express

```jsx
// Options list every "genre" term, but the pick is written to a separate
// "featured-genre" taxonomy used only to drive a homepage query — the post's actual
// genre assignment, read elsewhere in the editor, is untouched.
<SelectField
	label="Feature under genre"
	help="Does not change the post's own genre — only where it's featured."
	optionsSource={ {
		type: 'terms',
		taxonomy: 'genre',
		valueField: 'slug',
		labelField: 'name',
	} }
	valueBinding={ {
		type: 'taxonomy',
		taxonomy: 'featured-genre',
	} }
/>
```

`TaxonomySelectControl` cannot do this: it takes a single `taxonomy` prop and locks the
options and the value to that same taxonomy. `SelectField` lets the two diverge — options
from one place, the value written somewhere else entirely.

## Behavior

- Built on `useFieldBinding`, which composes `useOptionsSource` (from `options`/
  `optionsSource`) and `useValueBinding` (from `valueBinding`, or controlled `value`/
  `onChange`). The two never interact by design — see `optionsSource !== valueBinding`.
- `options` beats `optionsSource` outright: if `options` is set, `optionsSource` is never
  consulted, even when both are passed.
- The field is controlled as soon as either `value` or `onChange` is present — not only when
  both are — and `valueBinding` is then ignored entirely. In development, passing both a
  `valueBinding` and a controlled prop logs a `console.warn` explaining that the controlled
  props win.
- Whatever the binding mode, the field's own change handler always runs the resolved writer
  first (the controlled `onChange`, or the binding's writer), then calls `onValueChange` (if
  provided) with the same value — useful for side effects like tracking without taking over
  the write.
- `isLoading` is true while either the options source or the value binding is still
  resolving; `error` prefers the options source's error, falling back to the value binding's.
- Per source: `terms`, `posts`, and `users` are loading/erroring based on `core-data`'s
  `getEntityRecords` resolution for that query; `postTypes` is the same via `getPostTypes`.
  `manual` and static `options` never load and never error.
- Every fetching source (`terms`, `posts`, `users`, `postTypes`) queries with `per_page: -1`
  by default — the whole collection, not a first page. `query` is merged over that default, so
  narrow it (`per_page`, `search`, `include`) for anything that can grow; the source for
  `posts` flags this in its own comments as the reason a searchable mode would be needed for
  large datasets.
- Per binding: `meta` only reports loading while the post type itself hasn't resolved yet
  (not while the meta value is loading), and never reports an error. `taxonomy` never reports
  loading at all: its REST base falls back to the taxonomy slug synchronously when
  `getTaxonomy()` hasn't resolved, so the base is always truthy and `isLoading` is always
  `false` — whether or not `restBase` was passed. It never reports an error either. `custom`
  never reports loading or an error — the field trusts whatever is passed. In practice,
  `errorComponent` only ever fires from a failed options fetch, never from the value side.
- While `isLoading` or `error` is true, the field renders `loadingComponent`/
  `errorComponent` (or nothing, if omitted) instead of `SelectControl` — the control is not
  mounted underneath.
- Any prop besides the eight above (`label`, `help`, `disabled`, `multiple`, …) is forwarded
  unchanged to the underlying `SelectControl`.
- `terms`/`posts`/`users` default `valueField`/`labelField` to `id`/`name` (`title` for
  posts). `postTypes` ignores both and always uses `slug`/singular name, filtering out
  non-viewable and internal post types (`attachment`, `wp_block`, `wp_template`,
  `wp_template_part`, `wp_navigation`, `wp_font_family`, `wp_font_face`).
- All four options-source hooks and all three value-binding hooks are called on every
  render regardless of which type is active (Rules of Hooks) — inactive ones receive `null`
  and skip fetching, so switching `optionsSource.type` or `valueBinding.type` at runtime is
  safe.

## Styling

Ships no stylesheet. Renders `@wordpress/components`' `SelectControl` directly and inherits
its editor chrome; there are no custom properties to override.

## Gotchas

- `SelectControl` always hands back the string value of the chosen `<option>`
  (`event.target.value`), never the option's original type. If `optionsSource` resolves
  numeric values (the default `valueField: 'id'` for `terms`/`posts`/`users`), what actually
  reaches `valueBinding`/`onChange`/`onValueChange` is a numeric-looking string, not a
  number.
- A `taxonomy` binding reads and writes the entity property named after the taxonomy's REST
  base, and until `getTaxonomy()` resolves it falls back to the taxonomy **slug**. Where the
  two differ — core's `category` is exposed as `categories`, `post_tag` as `tags` — the first
  renders read `undefined` from a property that does not exist, and a write inside that window
  goes to that non-existent property. There is no loading flag covering it, so nothing surfaces
  the problem. Pass `restBase` explicitly (`{ type: 'taxonomy', taxonomy: 'category',
  restBase: 'categories' }`) for any taxonomy whose REST base isn't identical to its name.
- Passing only `onChange` without `value` (or the reverse) is enough to switch the field to
  controlled mode and silently drop `valueBinding` — pass both, or neither.
- If both `options` and `optionsSource` are set, `optionsSource` is ignored outright rather
  than merged with it — remove `options` once a field moves to a dynamic source.
- An options list that resolves empty (no matching terms/posts/users, or a query that
  matches nothing) renders nothing: `SelectControl` returns `null` for an empty `options`
  array, so there is no visible "no results" state.
- An unset value is displayed as the *first* option. When the binding resolves `undefined`,
  `SelectControl` hands that to a native `<select>` and injects no placeholder, so the browser
  shows the first option as though it were selected while nothing is stored — and no `onChange`
  fires until the author picks a different one. Prepend an empty option (e.g.
  `{ label: '—', value: '' }`) wherever "nothing selected" is a legitimate state.
- `optionsSource: { type: 'postTypes' }` has no `valueField`/`labelField` — check the
  `OptionsSource` type before assuming every source supports them.

## Related

- [`RadioField`](../RadioField/README.md) — same engine, radio buttons instead of a
  dropdown.
- [`MetaSelectControl`](../../meta/MetaSelectControl/README.md) — easy mode for a select
  bound to post meta.
- [`TaxonomySelectControl`](../../taxonomy/TaxonomySelectControl/README.md) — easy mode for
  a select whose options and value are the same taxonomy.
- [`useCurrentPostType`](../../hooks/useCurrentPostType/README.md) — what a `meta`/
  `taxonomy` binding falls back to when `postType` is omitted.
