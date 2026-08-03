---
name: MetaRadioControl
entrypoint: "@isudev/gutenberg/meta"
kind: control
status: stable
since: 0.1.0
---

## Summary

A radio group bound to a single post meta value — pass the meta key, get a working
`RadioControl` that reads and writes it, with the options coming from wherever you like.

## When to use / When not to use

Use it whenever a block setting is "pick one option, store it in post meta," and radio
buttons (all choices visible at once) suit the option count better than a dropdown. It fixes
`valueBinding` to `{ type: 'meta', key: metaKey, postType }` and forwards everything else,
including `optionsSource`, straight through to `RadioField` — that's the whole point:
`optionsSource !== valueBinding`, and this control exists so the common case (some options,
one meta key) doesn't require wiring both by hand.

Do not use it when the value isn't post meta at all — a taxonomy term
(`TaxonomySelectControl`), a custom store, or controlled component state. In those cases, or
if you need a `valueBinding` more specific than a meta key, drop down to `RadioField`
directly. For a dropdown over the same meta value, use `MetaSelectControl` instead.

## Import

```js
import { MetaRadioControl } from '@isudev/gutenberg/meta';
// or, skipping the barrel:
import { MetaRadioControl } from '@isudev/gutenberg/meta/MetaRadioControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `metaKey` | `string` | — | Yes | The post meta key to read from and write to. |
| `postType` | `string` | current post type | No | Overrides which post type the meta belongs to; otherwise the post type currently open in the editor is used. |
| `options` | `FieldOption[]` | — | No | Static options; takes precedence over `optionsSource` when both are given. |
| `optionsSource` | `OptionsSource` | — | No | Dynamic options source (`terms`, `posts`, `users`, `postTypes`, `manual`). |
| `value` | `unknown` | — | No | Controlled value; when set, the meta binding is ignored entirely — you likely want `RadioField` instead. |
| `onChange` | `( value: unknown ) => void` | — | No | Controlled change handler; its presence alone marks the field as controlled, same caveat as `value`. |
| `onValueChange` | `( value: unknown ) => void` | — | No | Runs after the meta value has been written (or after a controlled `onChange`) — a hook for side effects, not a substitute for the binding. |
| `loadingComponent` | `ReactNode` | `null` | No | Rendered while the meta value or its options are still resolving. |
| `errorComponent` | `ReactNode` | `null` | No | Rendered if resolving the value or options fails. |

## Examples

### The one-liner

```jsx
import { MetaRadioControl } from '@isudev/gutenberg/meta';

<MetaRadioControl metaKey="difficulty" />
```

Only `metaKey` is required — the meta binding is already wired. On its own, though, this
renders **nothing at all**: with no options the resolved list is empty and `RadioControl`
returns `null` for an empty options array, so there is no fieldset and no legend. `options` or
`optionsSource` (below) is effectively required.

### With explicit options

```jsx
<MetaRadioControl
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
<MetaRadioControl
	metaKey="featured_category"
	optionsSource={ { type: 'terms', taxonomy: 'category' } }
/>
```

The selected term's ID is stored in post meta while the *choices* come from the `category`
taxonomy's terms — `optionsSource` and `valueBinding` composed without touching `RadioField`
by hand. Term IDs arrive as numbers but `RadioControl` writes back strings, so the stored value
will be `'12'` against an option value of `12`; see the strict-equality gotcha below before
using numeric option values.

### With postType set explicitly

```jsx
<MetaRadioControl
	metaKey="rating"
	postType="book"
	options={ [
		{ label: '1 star', value: '1' },
		{ label: '5 stars', value: '5' },
	] }
/>
```

The option values are strings on purpose. `RadioControl` reports back `event.target.value`,
always a string, and marks an option checked with `option.value === selected` — strictly. Write
these as `1`/`5` and the first click stores `'1'` while the option value stays `1`, so the group
shows nothing selected from then on.

Pass `postType` whenever the control isn't rendered inside the main editor for the post type
it targets. The Site Editor is the case to watch: `getCurrentPostType()` resolves there too,
but to the entity being edited — `'wp_template'` — so without an explicit `postType` this
control reads and writes `meta` on the **template**, not on any post. It renders normally and
gives no hint that it is pointed at the wrong record.

### Loading and error components

```jsx
import { Notice, Spinner } from '@wordpress/components';

<MetaRadioControl
	metaKey="difficulty"
	optionsSource={ { type: 'terms', taxonomy: 'difficulty_level' } }
	loadingComponent={ <Spinner /> }
	errorComponent={ <Notice status="error">Could not load difficulty levels.</Notice> }
/>
```

## Behavior

- Delegates entirely to `RadioField`; the only thing this wrapper does is fix
  `valueBinding` to `{ type: 'meta', key: metaKey, postType }` before spreading the rest of
  the props through. `RadioField` in turn maps that value onto `RadioControl`'s `selected`
  prop — `RadioControl` doesn't use `value`.
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
  reads `undefined` (no radio selected) and any change you make is silently dropped when the
  post saves — no error is shown anywhere in the editor.
- `isLoading` is true whenever the resolved post type (explicit `postType`, or the current
  post type as a fallback) is empty. If it never resolves, `loadingComponent` (`null` by
  default) renders indefinitely instead of the control. This only happens where the editor has
  no post at all, such as the widgets screen — the Site Editor does resolve a post type
  (`wp_template`), so loading state is not what protects you there.
- `options`, when provided, takes over completely — `optionsSource` is not merged with it
  and is not evaluated for the visible list.
- Passing a controlled `value` and/or `onChange` overrides the meta binding entirely, and
  logs a development-only console warning. At that point the meta key is no longer read or
  written by this component at all — you have effectively re-implemented `RadioField`, and
  should use it directly instead.
- Any other prop (`label`, `help`, etc.) is passed straight through to the underlying
  `RadioControl`.

## Styling

Ships no stylesheet of its own. Rendering is entirely `RadioField`'s — see its README for
the `@wordpress/components` styling it inherits.

## Gotchas

- `valueBinding` cannot be set through this component. TypeScript will not stop you —
  `MetaRadioControlProps` omits the key, but `FieldBindingProps` has an index signature, so
  `Omit` does not actually remove it and the compiler accepts the prop. It is discarded at
  runtime instead: the wrapper spreads your props first and applies its own `valueBinding`
  last, silently and with **no** warning (unlike controlled `value`/`onChange`, which do
  warn). If you need a different binding, use `RadioField`.
- `RadioControl` matches the checked option with strict equality (`option.value === selected`)
  and its `onChange` always hands back a string (`event.target.value`), which goes into meta
  unchanged. Numeric option values — including the numeric term/post/user IDs that
  `optionsSource` produces by default — therefore stop matching as soon as the author clicks:
  the stored value is `'5'` while the option value is `5`, and **no radio shows as checked**.
  Use string option values, or `valueField: 'slug'` for a dynamic source.
- Per-option `disabled` on a `FieldOption` has no effect: `RadioControl` supports only
  `label`, `value`, and `description` per option and never reads a per-option `disabled` flag.
  Disable the whole group with a top-level `disabled` prop instead.
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

- [`RadioField`](../../fields/RadioField/README.md) — compose your own `optionsSource` and
  `valueBinding` when the easy mode doesn't fit.
- [`MetaSelectControl`](../MetaSelectControl/README.md) — the same meta binding as a
  dropdown.
- [`TaxonomySelectControl`](../../taxonomy/TaxonomySelectControl/README.md) — the same easy
  mode for a taxonomy term instead of a meta key.
