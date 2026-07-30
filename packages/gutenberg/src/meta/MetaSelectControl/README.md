---
name: MetaSelectControl
entrypoint: "@isudev/gutenberg/meta"
kind: control
status: stable
since: 0.1.0
---

## Summary

A dropdown bound to a single post meta value — pass the meta key, get a working
`SelectControl` that reads and writes it, with the options coming from wherever you like.

## When to use / When not to use

Use it whenever a block setting is "pick one option, store it in post meta." It fixes
`valueBinding` to `{ type: 'meta', key: metaKey, postType }` and forwards everything else,
including `optionsSource`, straight through to `SelectField` — that's the whole point:
`optionsSource !== valueBinding`, and this control exists so the common case (some options,
one meta key) doesn't require wiring both by hand.

Do not use it when the value isn't post meta at all — a taxonomy term
(`TaxonomySelectControl`), a custom store, or controlled component state. In those cases, or
if you need a `valueBinding` more specific than a meta key (e.g. a fully custom read/write
pair), drop down to `SelectField` directly. For radio-button UI over the same meta value,
use `MetaRadioControl` instead.

## Import

```js
import { MetaSelectControl } from '@isudev/gutenberg/meta';
// or, skipping the barrel:
import { MetaSelectControl } from '@isudev/gutenberg/meta/MetaSelectControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `metaKey` | `string` | — | Yes | The post meta key to read from and write to. |
| `postType` | `string` | current post type | No | Overrides which post type the meta belongs to; otherwise the post type currently open in the editor is used. |
| `options` | `FieldOption[]` | — | No | Static options; takes precedence over `optionsSource` when both are given. |
| `optionsSource` | `OptionsSource` | — | No | Dynamic options source (`terms`, `posts`, `users`, `postTypes`, `manual`). |
| `value` | `unknown` | — | No | Controlled value; when set, the meta binding is ignored entirely — you likely want `SelectField` instead. |
| `onChange` | `( value: unknown ) => void` | — | No | Controlled change handler; its presence alone marks the field as controlled, same caveat as `value`. |
| `onValueChange` | `( value: unknown ) => void` | — | No | Runs after the meta value has been written (or after a controlled `onChange`) — a hook for side effects, not a substitute for the binding. |
| `loadingComponent` | `ReactNode` | `null` | No | Rendered while the meta value or its options are still resolving. |
| `errorComponent` | `ReactNode` | `null` | No | Rendered if resolving the value or options fails. |

## Examples

### The one-liner

```jsx
import { MetaSelectControl } from '@isudev/gutenberg/meta';

<MetaSelectControl metaKey="difficulty" />
```

Only `metaKey` is required — the meta binding is already wired. On its own, though, this
renders **nothing at all**: with no options the resolved list is empty and `SelectControl`
returns `null` for an empty options array, so there is no label and no dropdown. `options` or
`optionsSource` (below) is effectively required.

### With explicit options

```jsx
<MetaSelectControl
	metaKey="difficulty"
	options={ [
		{ label: 'Easy', value: 'easy' },
		{ label: 'Medium', value: 'medium' },
		{ label: 'Hard', value: 'hard' },
	] }
/>
```

### With a dynamic optionsSource

```jsx
<MetaSelectControl
	metaKey="featured_category"
	optionsSource={ { type: 'terms', taxonomy: 'category' } }
/>
```

The selected term's ID is stored in post meta while the *choices* come from the `category`
taxonomy's terms — `optionsSource` and `valueBinding` composed without touching `SelectField`
by hand. Note that `SelectControl`'s `onChange` hands back `event.target.value`, always a
string, so the ID lands in meta as `'12'` rather than `12` (see Gotchas).

### With postType set explicitly

```jsx
<MetaSelectControl
	metaKey="rating"
	postType="book"
	options={ [
		{ label: '1 star', value: '1' },
		{ label: '5 stars', value: '5' },
	] }
/>
```

The option values are strings on purpose: `SelectControl` always reports back a string, so
writing them as `1`/`5` would store `'1'`/`'5'` in meta anyway and leave the option values
disagreeing with what is stored.

Pass `postType` whenever the control isn't rendered inside the main editor for the post type
it targets. The Site Editor is the case to watch: `getCurrentPostType()` resolves there too,
but to the entity being edited — `'wp_template'` — so without an explicit `postType` this
control reads and writes `meta` on the **template**, not on any post. It renders normally and
gives no hint that it is pointed at the wrong record.

### Loading and error components

```jsx
import { Notice, Spinner } from '@wordpress/components';

<MetaSelectControl
	metaKey="difficulty"
	optionsSource={ { type: 'terms', taxonomy: 'difficulty_level' } }
	loadingComponent={ <Spinner /> }
	errorComponent={ <Notice status="error">Could not load difficulty levels.</Notice> }
/>
```

## Behavior

- Delegates entirely to `SelectField`; the only thing this wrapper does is fix
  `valueBinding` to `{ type: 'meta', key: metaKey, postType }` before spreading the rest of
  the props through.
- The value is read and written through `@wordpress/core-data`'s entity prop for
  `postType`/`meta` — the same record backing the core Post Meta / custom fields panel.
  Edits mark the post dirty and are only persisted on Save/Update, exactly like any other
  entity field.
- **The meta key must be registered on the PHP side with `show_in_rest`, or nothing works.**
  A minimal registration that matches what this binding reads and writes:

  ```php
  register_post_meta(
  	'post',
  	'difficulty',
  	array(
  		'type'         => 'string',
  		'single'       => true,
  		'show_in_rest' => true,
  	)
  );
  ```

  `single` must be `true` — the binding reads and writes one scalar value per key, not the
  array WordPress returns for non-single meta. If the key isn't registered with
  `show_in_rest`, the REST API neither returns it nor accepts updates to it: the control
  reads `undefined` and any change you make is silently dropped when the post saves — no
  error is shown anywhere in the editor.
- `isLoading` is true whenever the resolved post type (explicit `postType`, or the current
  post type as a fallback) is empty. If it never resolves, `loadingComponent` (`null` by
  default) renders indefinitely instead of the control. This only happens where the editor has
  no post at all, such as the widgets screen — the Site Editor does resolve a post type
  (`wp_template`), so loading state is not what protects you there.
- `options`, when provided, takes over completely — `optionsSource` is not merged with it
  and is not evaluated for the visible list.
- Passing a controlled `value` and/or `onChange` overrides the meta binding entirely, and
  logs a development-only console warning. At that point the meta key is no longer read or
  written by this component at all — you have effectively re-implemented `SelectField`, and
  should use it directly instead.
- Any other prop (`label`, `help`, `hideLabelFromVision`, etc.) is passed straight through to
  the underlying `SelectControl`.

## Styling

Ships no stylesheet of its own. Rendering is entirely `SelectField`'s — see its README for
the `@wordpress/components` styling it inherits.

## Gotchas

- `valueBinding` cannot be set through this component. TypeScript will not stop you —
  `MetaSelectControlProps` omits the key, but `FieldBindingProps` has an index signature, so
  `Omit` does not actually remove it and the compiler accepts the prop. It is discarded at
  runtime instead: the wrapper spreads your props first and applies its own `valueBinding`
  last, silently and with **no** warning (unlike controlled `value`/`onChange`, which do
  warn). If you need a different binding, use `SelectField`.
- With no term or value stored, `value` resolves to `undefined` and `SelectControl` forwards
  that to a native `<select>` without injecting a placeholder option — the browser then
  displays the first option as though it were selected, and no `onChange` fires until the
  author picks a *different* one. Prepend an empty option yourself (e.g.
  `{ label: '—', value: '' }`) whenever the value can be unset.
- Values come back from `SelectControl` as strings. Numeric-looking option values are stored
  in meta as `'1'`, not `1`, so register the meta as `'type' => 'string'` or convert on read.
- Unregistered or misregistered meta (missing `show_in_rest`, or `single` not `true`) fails
  completely silently — no console warning, no visible error. If a control appears to "not
  save," check the post's REST representation
  (`/wp-json/wp/v2/<post_type>/<id>?context=edit`) for the meta key before suspecting the
  component.
- In the Site Editor the danger is not a stuck spinner but a wrong target: the current post
  type resolves to `wp_template`, so without an explicit `postType` the control reads and
  writes the template's `meta` instead of the post's, with no warning. Always pass `postType`
  wherever the surface isn't the editor for the post type you mean. Where the editor has no
  post at all (the widgets screen) the control instead stays in its loading state.

## Related

- [`SelectField`](../../fields/SelectField/README.md) — compose your own `optionsSource` and
  `valueBinding` when the easy mode doesn't fit.
- [`MetaRadioControl`](../MetaRadioControl/README.md) — the same meta binding as radio
  buttons.
- [`TaxonomySelectControl`](../../taxonomy/TaxonomySelectControl/README.md) — the same easy
  mode for a taxonomy term instead of a meta key.
