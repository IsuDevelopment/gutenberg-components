---
name: TaxonomySelectControl
entrypoint: "@isudev/gutenberg/taxonomy"
kind: control
status: stable
since: 0.1.0
---

## Summary

A dropdown whose options are a taxonomy's terms and whose value is that same taxonomy's
terms on the current post — pass the taxonomy name, get a working single-term picker.

## When to use / When not to use

Use it for the common case of "let the author pick one term from this taxonomy for the
current post." It fills in both halves of the binding for you: `optionsSource` becomes
`{ type: 'terms', taxonomy }` and `valueBinding` becomes `{ type: 'taxonomy', taxonomy,
restBase }`. Unlike the meta controls, neither of those can be overridden here — they aren't
even part of this component's props — because the whole point of this control is that they
already match by construction.

Do not use it when you need to select **more than one** term (this control is always
single-select — see Behavior and Gotchas), when the options should come from somewhere other
than that same taxonomy's terms, or when you need to target a post type other than the one
currently open in the editor. In all of those cases, compose `SelectField` yourself with an
explicit `optionsSource` and `valueBinding` (e.g. `{ type: 'taxonomy', taxonomy, multiple:
true }` for a multi-select).

## Import

```js
import { TaxonomySelectControl } from '@isudev/gutenberg/taxonomy';
// or, skipping the barrel:
import { TaxonomySelectControl } from '@isudev/gutenberg/taxonomy/TaxonomySelectControl';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `taxonomy` | `string` | — | Yes | The taxonomy whose terms are both the options and the stored value. |
| `restBase` | `string` | resolved from `taxonomy`, falling back to the slug | No | The REST base used to read/write the post's terms. Pass it whenever the taxonomy's REST base isn't identical to its slug (`category` → `categories`, `post_tag` → `tags`): until `getTaxonomy()` resolves, the binding uses the slug and touches the wrong entity property. |
| `options` | `FieldOption[]` | — | No | Static options that replace the fetched taxonomy terms entirely. |
| `value` | `unknown` | — | No | Controlled value; when set, the taxonomy binding is ignored entirely — you likely want `SelectField` instead. |
| `onChange` | `( value: unknown ) => void` | — | No | Controlled change handler; its presence alone marks the field as controlled, same caveat as `value`. |
| `onValueChange` | `( value: unknown ) => void` | — | No | Runs after the post's terms have been written (or after a controlled `onChange`) — a hook for side effects, not a substitute for the binding. |
| `loadingComponent` | `ReactNode` | `null` | No | Rendered while the term list or the post's terms are still resolving. |
| `errorComponent` | `ReactNode` | `null` | No | Rendered if fetching the terms fails. |

## Examples

### The one-liner

```jsx
import { TaxonomySelectControl } from '@isudev/gutenberg/taxonomy';

<TaxonomySelectControl taxonomy="category" />
```

Only `taxonomy` is required. Every term in `category` becomes an option, and selecting one
sets it as the post's only term for that taxonomy.

Two things this one-liner does *not* handle. First, no empty option: when the post has no term
assigned the value resolves to `undefined`, `SelectControl` passes that to a native `<select>`
without injecting a placeholder, and the browser shows the **first term as if it were
selected** — with nothing stored and no `onChange` until the author picks a *different* option.
The only way to add an empty option here is `options`, which replaces the fetched term list
entirely, so you would be supplying the terms yourself; if "no term" has to be selectable and
you still want the terms fetched for you, compose `SelectField` instead. Second, `category`'s
REST base is
`categories`, not `category`, and until `getTaxonomy()` resolves the binding falls back to the
slug — so the first renders read and write the wrong entity property. Pass
`restBase="categories"` here (see Gotchas).

### With explicit options

```jsx
<TaxonomySelectControl
	taxonomy="category"
	restBase="categories"
	options={ [
		{ label: '—', value: '' },
		{ label: 'Uncategorized', value: 1 },
		{ label: 'Announcements', value: 12 },
	] }
/>
```

`options` fully replaces the fetched term list — use this to restrict the choices to a
curated subset while still storing into the same taxonomy, and to add the empty option the
fetched list does not have. The selected term ID is written back as a string either way.

### Single-select storing one term, and what restBase is for

```jsx
<TaxonomySelectControl taxonomy="genre" restBase="book-genres" />
```

The control always stores a **single** term: the underlying binding reads the post's array
of term IDs for the taxonomy and takes just the first one, and writes a one-element array
back (or an empty array when cleared) — see Behavior. `restBase` pins the entity property the
terms are read from and written to. Automatic resolution via `getTaxonomy()` gets there
eventually, but it falls back to the taxonomy slug until the taxonomy record has resolved, so
pass `restBase` for every taxonomy whose REST base differs from its slug — including core's
`category` (`categories`) and `post_tag` (`tags`). It can be left out only where the slug and
the REST base are the same, which is the default for a custom taxonomy registered without an
explicit `rest_base`.

### Loading and error components

```jsx
import { Notice, Spinner } from '@wordpress/components';

<TaxonomySelectControl
	taxonomy="category"
	restBase="categories"
	loadingComponent={ <Spinner /> }
	errorComponent={ <Notice status="error">Could not load categories.</Notice> }
/>
```

## Behavior

- Delegates entirely to `SelectField`, fixing both `optionsSource` (`{ type: 'terms',
  taxonomy }`) and `valueBinding` (`{ type: 'taxonomy', taxonomy, restBase }`) before
  spreading the rest of the props through. Neither prop can be set from outside — though not
  because TypeScript rejects it: `TaxonomySelectControlProps` omits both keys, but
  `FieldBindingProps` has an index signature, so `Omit` does not really remove them and the
  compiler accepts either prop. They are discarded at runtime, because the wrapper spreads your
  props first and applies its own two last.
- **Options** are every term of `taxonomy` (`per_page: -1`, no other filtering), fetched via
  `core-data`'s `getEntityRecords( 'taxonomy', taxonomy, ... )` and labeled by term name,
  valued by term ID.
- **Value** is the post's terms for that taxonomy, read and written through the same entity
  prop that backs the core taxonomy panel (keyed by the taxonomy's REST base). The REST base
  is resolved automatically from the taxonomy's registration and falls back to the taxonomy
  name itself if that hasn't resolved yet; pass `restBase` to pin it explicitly.
- **This control is always single-select.** There is no `multiple` prop — the binding always
  treats the value as a one-element array: it reads the first term ID of the post's term
  array for that taxonomy and, on change, writes back a new one-element array (or `[]` when
  cleared). If the post already has more than one term assigned to this taxonomy, only the
  first one is shown as selected, and picking a different one **replaces the entire term
  list** for that taxonomy — any other existing terms are dropped.
- There is no `postType` prop. The post type is always whichever post is currently open in
  the editor; this control cannot target a different one.
- `options`, when provided, takes over completely from the terms fetch — the taxonomy is
  still used for the value binding, but no longer for the options.
- Passing a controlled `value` and/or `onChange` overrides the taxonomy binding entirely, and
  logs a development-only console warning. At that point the post's terms are no longer read
  or written by this component at all.
- Any other prop (`label`, `help`, `hideLabelFromVision`, etc.) is passed straight through to
  the underlying `SelectControl`.

## Styling

Ships no stylesheet of its own. Rendering is entirely `SelectField`'s — see its README for
the `@wordpress/components` styling it inherits.

## Gotchas

- **No PHP registration is required for a public, built-in taxonomy** (`category`,
  `post_tag`, and any custom taxonomy registered with `show_in_rest => true`) — unlike the
  meta controls, term data is exposed over REST as soon as the taxonomy itself is
  REST-enabled. If a custom taxonomy was registered with `show_in_rest` left `false`, terms
  won't resolve and the control stays in its loading/error state.
- The value side's loading state is not very informative: it is only `true` when the
  resolved REST base is falsy, and the REST base falls back to the taxonomy name itself
  the moment `getTaxonomy()` returns nothing — which happens immediately, not after a real
  resolution check. In practice this means the value binding is rarely, if ever, seen as
  "loading" by `loadingComponent`; a slow-to-resolve term list is still covered (that part
  does track real resolution), but a slow-to-resolve *taxonomy record* is not.
- Following from the point above: whenever a taxonomy's real `rest_base` differs from its slug,
  there is a window where the fallback (the slug) is used as the REST base before the taxonomy
  record resolves — the control reads `undefined` and, if the author changes the selection in
  that window, writes to a non-existent entity property. Silently, with no loading state. This
  is not a custom-taxonomy edge case: core's `category` has the REST base `categories` and
  `post_tag` has `tags`. Pass `restBase` explicitly for any taxonomy whose REST base isn't
  identical to its name.
- The value written back is a **string**. `SelectControl` reports `event.target.value`, so a
  term ID selected from the default options (valued by term ID) is stored as `[ '12' ]`, and
  `onValueChange` receives `'12'`. That is also what a controlled `value` has to match if you
  compare it against numeric term IDs.
- With no term assigned, the control shows the first term as though it were selected: the value
  is `undefined` and `SelectControl` adds no placeholder option of its own. Supply an empty
  option through `options` whenever "no term" is a legitimate state.
- Because this control is single-select and always overwrites the full term list, using it
  on a taxonomy where posts commonly carry more than one term (e.g. `post_tag`) will
  silently discard the others the first time an author changes the selection.

## Related

- [`SelectField`](../../fields/SelectField/README.md) — compose your own `optionsSource` and
  `valueBinding`, including a multi-select taxonomy binding.
- [`MetaSelectControl`](../../meta/MetaSelectControl/README.md) — the same easy-mode idea for
  a post meta key instead of a taxonomy.
