# Post selector — design

- Date: 2026-09-25
- Status: approved, implemented (see §10)
- Scope: new `components/` + `controls/` + `meta/` unit of `@isudev/gutenberg`

## 1. Goal

Let block and plugin authors pick one or more posts, of one or several post types, through
a searchable, filterable modal, and keep an ordered selection — without rebuilding the same
picker for every "related posts", "featured product" or "pick an article" feature.

Success criteria:

1. A block can open the picker from **any** trigger it renders and receive the selection
   through a plain `onChange` — no meta, no store coupling (block-attribute use case).
2. A sidebar panel gets the complete UX — ordered drag-and-drop list, counter, remove,
   "change selection" button — from one component (screen 1, "related products").
3. Post meta is supported as easy mode: one `metaKey` in, working control out.
4. The author can restrict the pool: allowed post types, which taxonomy filters appear,
   hard term constraints, a maximum count.
5. Taxonomy filters appear only once a single post type is chosen, and only that type's
   taxonomies (intersected with the allowed list).
6. Featured image thumbnails are optional.
7. Everything works in the iframed post editor. No dependency beyond `@wordpress/*`.

## 2. Non-goals

- No PHP. The library is JS-only; registering meta and rendering the selection on the
  frontend are the consumer's job. READMEs ship a copy-pasteable `register_post_meta`
  snippet and a render example.
- No custom REST endpoint. Everything uses core `wp/v2` routes through `core-data`.
- No selection of terms, users or attachments — posts (any post type) only.
- No nested/hierarchical tree display of pages.
- No inline creation of new posts from the modal.

## 3. Architecture

Five public units plus private helpers. Mirrors the media suite (decision 0009): each
location is independently importable, the composite composes them.

| Unit | Path | Knows about | Must not know about |
|---|---|---|---|
| `SortablePostList` | `components/SortablePostList/` | its props (items, order, remove) | stores, meta, REST |
| `PostPickerModal` | `controls/PostPickerModal/` | `core-data` queries, draft selection | where the value is stored |
| `PostPickerControl` | `controls/PostPickerControl/` | modal open state, render prop | where the value is stored |
| `PostSelectorControl` | `controls/PostSelectorControl/` | value binding (controlled or `ValueBinding`) | — |
| `MetaPostSelectorControl` | `meta/MetaPostSelectorControl/` | pre-filled meta binding | — |

Private (`_internal/post-picker/`): query building, fan-out merge, hydration,
value-shape conversion. Never exported.

Data flow:

```
PostSelectorControl ── useValueBinding (controlled | meta | custom)
  ├── usePostHydration(value)   → display records for stored IDs/objects
  ├── SortablePostList          → reorder / remove → onChange
  └── PostPickerControl         → render-prop trigger
        └── PostPickerModal      → draft selection → "Save selection" → onChange
```

`PostPickerControl` alone is the block-attribute path:

```jsx
<PostPickerControl value={ attributes.posts } onChange={ ( posts ) => setAttributes( { posts } ) }>
	{ ( { open } ) => <Button onClick={ open }>Choose post</Button> }
</PostPickerControl>
```

## 4. Value model

Two shapes, chosen with `valueShape`. Both preserve order.

```ts
type PostSelectionField = 'title' | 'link' | 'type';

interface PostReference {
	id: number;
	type?: string;   // post type slug
	title?: string;  // rendered title, decoded
	link?: string;   // permalink
}

type PostSelectionValue = number[] | PostReference[];
```

- `valueShape: 'ids'` (default) → `number[]`. Smallest, never stale, trivially queryable
  in PHP (`post__in` + `orderby => post__in`).
- `valueShape: 'objects'` → `PostReference[]`; `fields` (default `['title', 'link', 'type']`)
  picks which snapshot fields are stored alongside `id`. Lets the frontend render without
  extra queries. The snapshot is refreshed whenever the selection is saved; it can go stale
  if a post is renamed later — the README says so and recommends reading the live title in
  PHP when correctness matters.
- `multiple: false` → the value is a single item (`number | PostReference | null`) instead
  of an array; the modal behaves as single-select (checking one unchecks the other) and
  `max` is ignored. This is the "block picks one post" case.

Conversion lives in one private module (`toValue` / `fromValue`) and is unit-tested.

## 5. Units in detail

### 5.1 `PostPickerModal`

Stable primitives only: `Modal`, `SearchControl`, `SelectControl`, `TabPanel`,
`CheckboxControl`, `Button`, `Spinner`.

Header row: search · post type · taxonomy filter(s) · sort (screens 2–3).

- **Post type select.** Options = `postTypes` prop, or every viewable REST-enabled type
  (`getPostTypes`, filtered to `viewable && rest_base`, minus `attachment`) when omitted.
  "All types" first unless only one type is allowed, in which case the select is hidden.
- **Taxonomy filters.** Hidden while "All types" is active. With a type chosen:
  `getTaxonomies({ type })` ∩ `taxonomies` prop (all of the type's visible taxonomies when
  the prop is omitted). One `SelectControl` per taxonomy, options via the existing
  `useTermsOptions`. Changing type resets taxonomy filters.
- **Sort.** Newest (default), oldest, title A–Z, title Z–A. Maps to `orderby`/`order`.
- **Search.** Debounced with `useDebouncedValue` (300 ms).
- **Tabs.** "All (n)" lists query results; "Selected (n)" lists the draft selection in its
  current order, independent of filters. Counts come from
  `getEntityRecordsTotalItems` (summed across types in fan-out mode).
- **Rows.** Checkbox · optional thumbnail · title · "Type label · first term" · date.
  Whole row toggles. Rows beyond `max` are disabled (checked ones stay toggleable).
- **Paging.** "Load more" at the end of the list (infinite scroll is a later option),
  `perPage` default 20.
- **Footer.** "Selected x of max" · Cancel · Save selection. The modal edits a **draft**;
  nothing reaches `onChange` until Save. Cancel/Escape/overlay discard the draft.
- **Hard constraints** (`query` prop), applied to every request and not shown in the UI:
  `{ status?: string[]; taxonomies?: Record<string, number[]>; exclude?: number[] }`.
  `excludeCurrentPost` (default `true`) adds the edited post's ID to `exclude`.

**"All types" mode — fan-out, not `/wp/v2/search`.** The search endpoint cannot filter by
taxonomy, cannot sort by date/title and does not return thumbnails. Instead the modal issues
one `getEntityRecords('postType', type, query)` per allowed type and merges the pages
client-side by the active sort key (k-way merge with a cursor per type). "Load more" fetches
the next page only for types whose buffer is exhausted. Cost: N requests per page, cached by
`core-data`. Accepted because it keeps sort, counts and thumbnails consistent across modes.

Requests use `_fields` (id, type, date, title, link, featured_media, taxonomy fields) and
`_embed` with `wp:term` and, only when `showFeaturedImage`, `wp:featuredmedia` — one
request per type per page, no follow-up media lookups.

### 5.2 `PostPickerControl`

Render-prop boundary, same shape as `MediaPickerControl` / `LinkPickerControl`:

```ts
interface PostPickerRenderArgs {
	open: () => void;
	hasSelection: boolean;
	count: number;
	disabled: boolean;
}
```

Owns only open/closed state and forwards every picker prop to `PostPickerModal`. Accepts
`value` / `onChange` (controlled) — the block-attribute path from success criterion 1.

### 5.3 `SortablePostList`

Pure UI over already-resolved display items (`{ id, title, meta?, thumbnailUrl? }`).

- Native HTML5 drag and drop on a drag handle (no `@dnd-kit` — would need an ADR and break
  principle 6). Drop indicator via a CSS class; no stylesheet dependency on the canvas.
- Keyboard: the handle is a button; Alt+↑/Alt+↓ moves the item, plus a live-region
  announcement via `speak` from `@wordpress/a11y`. Drag and drop is never the only way.
- Remove button (×) per row. Missing/unavailable items render "Unavailable post (#id)"
  with remove still enabled.
- Uses the element's `ownerDocument` for any document access (iframe-safe).

### 5.4 `PostSelectorControl`

The all-in-one sidebar control (screen 1): header with label and "x / max" counter,
`SortablePostList` (drag-and-drop reorder directly in the sidebar — the order is the stored
order, written through `onChange` on drop), help text ("Drag to reorder"), and a
`PostPickerControl` whose trigger is "Choose posts"
(empty) / "Change selection" (non-empty). Collapsible when rendered inside a `PanelBody`
by the consumer — the control itself is not a panel.

Value resolution goes through the existing `useValueBinding`: controlled `value`/`onChange`
wins, otherwise `valueBinding` (`meta` or `custom`). `taxonomy` bindings are rejected with a
dev warning — they store terms, not posts.

Hydration: for `'ids'` values the type is unknown when several types are allowed, so the
private `usePostHydration` first resolves types via `/wp/v2/search?include=…` (supported
since WP 5.9), then fetches display records per type with `include`. For `'objects'`
values with a stored `type`, the search step is skipped. Stored snapshots display
immediately while hydration runs.

### 5.5 `MetaPostSelectorControl`

`<PostSelectorControl valueBinding={{ type: 'meta', key: metaKey, postType }} />` — nothing
more, like `MetaSelectControl`. README carries the PHP registration:

```php
register_post_meta( 'product', 'related_posts', [
	'type'          => 'array',
	'single'        => true,
	'show_in_rest'  => [ 'schema' => [ 'items' => [ 'type' => 'integer' ] ] ],
	'auth_callback' => fn() => current_user_can( 'edit_posts' ),
] );
```

plus the `'objects'` variant (`items` as an object schema with `id`/`type`/`title`/`link`).
A meta schema mismatch makes the REST save fail silently in the editor — the README's
Gotchas section says so.

## 6. Shared props

Shared by `PostPickerModal`, `PostPickerControl`, `PostSelectorControl` and the meta wrapper
(one `PostPickerOptions` type, re-exported):

| Prop | Type | Default |
|---|---|---|
| `postTypes` | `string[]` | all viewable REST types |
| `taxonomies` | `string[]` | all visible taxonomies of the chosen type |
| `query` | `{ status?, taxonomies?, exclude? }` | `{ status: ['publish'] }` |
| `excludeCurrentPost` | `boolean` | `true` |
| `max` | `number` | unlimited |
| `multiple` | `boolean` | `true` |
| `valueShape` | `'ids' \| 'objects'` | `'ids'` |
| `fields` | `PostSelectionField[]` | `['title', 'link', 'type']` |
| `showFeaturedImage` | `boolean` | `true` |
| `perPage` | `number` | `20` |
| `labels` | `Partial<PostPickerLabels>` | English defaults via `__()` |

Strings use `__()` without a text domain, as the rest of the library does; `labels`
overrides any of them (the Polish UI on the screenshots is a `labels` or translation concern).

## 7. Error handling

- REST errors (`getResolutionError`) render a `Notice` inside the modal list; other types
  in fan-out mode still render.
- Posts in the value that no longer exist, are trashed or not readable render as
  unavailable and can be removed; they are never silently dropped from the stored value.
- `max` below the current selection length: existing items are kept, adding is disabled,
  a dev warning explains.
- A `postTypes` entry that is not REST-enabled is dropped with a dev warning.

## 8. Testing

Load-bearing logic only (see memory: no over-testing):

- value conversion (`ids` ↔ `objects`, `fields`, `multiple: false`);
- fan-out k-way merge and per-type cursors;
- query building (constraints, `exclude` + current post, taxonomy filter reset on type change);
- draft semantics: Cancel discards, Save emits once, `max` gating;
- list reorder by keyboard and removal.

Plus the README props drift guard entry for every public props interface. Manual checks in
a new `examples/test-blocks/src/post-selector-demo` block: trigger-only attribute use,
sidebar meta use on a CPT, single-select, "All types" with mixed types.

## 9. Open for the plan

- Whether `SortablePostList`'s drop indicator needs a small shipped stylesheet or inline
  styles suffice (library ships no CSS today).
- Infinite scroll vs. "Load more" — start with the button.

## 10. Amendment — 2026-09-25 (implementation)

- **Hydration without `/wp/v2/search`.** §5.4 planned to resolve the type of bare IDs through
  the search endpoint. `core-data` has no search entity and `@wordpress/api-fetch` is not a
  peer dependency, so bare IDs are instead looked up with `include` in every allowed type —
  one cached request per type. Same result, no new dependency.
- **Paging in "All types" mode.** Instead of per-type cursors, the modal fetches pages
  `1..n` of every type and shows the merged top `n × perPage`. This is exact: any post in the
  global top `K` is in its own type's top `K`. A type's next page is requested only when its
  previous page was full (WordPress answers a page past the end with a 400).
- **No `@wordpress/a11y` / `@wordpress/date`.** The reorder announcement uses a
  `VisuallyHidden` live region and dates use `Intl.DateTimeFormat` with the admin
  document's `lang`, avoiding two new peer dependencies.
- **Keyboard reorder** is plain ↑/↓ on the focused handle rather than Alt+↑/↓.
- Modules ship as `status: experimental` until verified in the editor.
