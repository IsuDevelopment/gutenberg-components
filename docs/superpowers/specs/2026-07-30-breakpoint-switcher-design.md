# BreakpointSwitcher — design

- Date: 2026-07-30
- Status: approved (pending written-spec review)
- Scope: first real `components/` + `controls/` + `hooks/` unit of `@isudev/gutenberg`

## 1. Goal

Give block authors a way to edit one setting per breakpoint without writing the same
`switch ( device )` boilerplate in every block, and without inventing a fake "default"
pseudo-device.

Success criteria:

1. A block can make any control responsive by wrapping it, changing no attribute-reading code.
2. The author can see, at a glance, which breakpoints carry an override.
3. Nothing in `components/` knows about block attributes or editor stores.
4. Everything works inside the iframed post editor (WP 7.1 makes the iframe unconditional).

## 2. Non-goals

- No responsive CSS generation. The library stores values; the block decides what CSS to emit.
- No global breakpoint registry or server-side breakpoint settings screen.
- No multi-value (range) breakpoints, no container queries. Media-query semantics are the
  consumer's business.

## 3. Prior art

Three implementations were studied. What we take and what we reject, with reasons:

**T2 `DevicePanelBody`** — a `PanelBody` with a device `Dropdown`.

- Adopt: `Dropdown` + `NavigableMenu` for the collapsed variant; opt-in editor-viewport sync.
- Reject: the `'default'` pseudo-device (cog icon). It stores to an unsuffixed attribute
  *and* sits next to `desktop`, so "default" and "desktop" are two names for overlapping
  ideas and authors cannot tell which one they are editing. Desktop **is** the default.
- Reject: `syncEditorViewport` as a bitmask (`0|1|2|3`). Unreadable at the call site.

**Stackable `stk-label-unit-toggle`** — a 24×24 collapsed stack that expands in place.

- Adopt: desktop is the base attribute (no suffix); `Tablet`/`Mobile` suffixes for overrides.
- Adopt: a per-breakpoint "has an override" indicator (Stackable uses amber `#ffc107`).
- Adopt: render nothing when only one breakpoint is configured.
- Adopt: the base breakpoint is not highlighted as an override (their
  `.is-active:not([data-index="0"])` rule) — only tablet/mobile read as deviations.
- Reject: the implementation. It positions an absolute stack with
  `transform: translateY(-index/len*100%)` inside `overflow:hidden`, and closes on
  `document.body.addEventListener('click')`. That listener binds the top-level document, so
  it silently stops working in the iframed canvas. Its two-step click (first click opens,
  second selects) and hand-rolled `previousElementSibling` arrow handling also reimplement
  what `@wordpress/components` already provides correctly.

**`@10up/block-components`** — a shipping npm library with the same packaging shape.

- Adopt: wildcard subpath `exports` (`"./components/*"`) plus filesystem-discovered build
  entries, so adding a component needs no config edits. See §9.
- Adopt: colocated per-component `readme.md`.
- Adopt: mirroring `DependencyExtractionWebpackPlugin`'s bundled-package list. See §9.2.

## 4. Architecture

Four units, each independently testable:

| Unit | Path | Knows about | Must not know about |
|---|---|---|---|
| `BreakpointSwitcher` | `components/BreakpointSwitcher/` | its own props | attributes, any store |
| `useBreakpoint` | `hooks/useBreakpoint.ts` | `core/editor` (opt-in) | attributes |
| `useResponsiveAttribute` | `hooks/useResponsiveAttribute.ts` | block attributes | UI |
| `ResponsiveControl` | `controls/ResponsiveControl/` | all of the above | — |

Data flow:

```
ResponsiveControl
  ├── useBreakpoint()            → [ breakpoint, setBreakpoint ]  (+ optional editor sync)
  ├── useResponsiveAttribute()   → { value, inheritedValue, hasValue, reset }
  └── BreakpointSwitcher         → pure controlled UI
```

Editor-viewport sync lives in `useBreakpoint`, not on the switcher. The user approved
"opt-in, two booleans" over T2's bitmask; placing them on a hook rather than the component
additionally keeps `components/` free of store access, which AGENTS.md requires.

## 5. Breakpoint model

```ts
export interface Breakpoint {
	/** Stable identifier used as the switcher value. */
	id: string;
	/** Human label, shown in the dropdown and as the button's accessible name. */
	label: string;
	/** Icon element (e.g. from @wordpress/icons). Imported ReactElement rather than the
	 *  global JSX.Element, which React 19's types remove — correct under both 18 and 19. */
	icon?: ReactElement;
	/** Marks the breakpoint whose attribute carries no suffix. Exactly one required. */
	isBase?: boolean;
	/** Attribute-name suffix for non-base breakpoints, e.g. 'Tablet'. */
	suffix?: string;
}

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
	{ id: 'desktop', label: __( 'Desktop' ), icon: desktop, isBase: true },
	{ id: 'tablet',  label: __( 'Tablet' ),  icon: tablet,  suffix: 'Tablet' },
	{ id: 'mobile',  label: __( 'Mobile' ),  icon: mobile,  suffix: 'Mobile' },
];
```

Attribute naming: `attrName` for the base, `attrName + suffix` otherwise. For
`attrName: 'columnGap'` → `columnGap`, `columnGapTablet`, `columnGapMobile`.

Cascade order is array order. A non-base breakpoint inherits from the previous breakpoints,
walking backwards to the base — so `mobile` falls back to `tablet`, then `desktop`. This
matches the `max-width` media-query stacking the default set implies.

Validation, dev-mode only: exactly one `isBase`; every non-base breakpoint has a non-empty
`suffix`; all `id`s unique; all `suffix`es unique. Violations `console.warn` once and the
component falls back to `DEFAULT_BREAKPOINTS`.

## 6. Value semantics

This is the part that must be exactly right, because everything else is presentation.

**A breakpoint has an override when its attribute value is present.** Present means: not
`undefined`, not `null`, not `''`. Notably `0` and `false` **are** values — `columnGap: 0`
is a legitimate setting and must not fall through to the inherited value. (Stackable's code
carries `t || 0 === t ? parseInt( t ) : ''` gymnastics throughout for exactly this reason;
we encode it once in one predicate.)

```ts
/** The single place this rule is encoded. */
function isPresent( raw: unknown ): boolean {
	return raw !== undefined && raw !== null && raw !== '';
}
```

**The hook returns own and inherited values separately.**

```ts
const {
	value,           // own value for the active breakpoint; undefined when no override
	inheritedValue,  // value from ancestor breakpoints only, ignoring the active one
	resolvedValue,   // value ?? inheritedValue — what the frontend would render
	hasOwnValue,     // boolean, for the active breakpoint
	hasValue,        // Record<breakpointId, boolean>, for the switcher's indicator
	onChange,        // writes the active breakpoint's attribute
	reset,           // clears the active breakpoint's attribute → back to inherited
	resetAll,        // clears overrides on all non-base breakpoints; leaves the base value
} = useResponsiveAttribute( {
	attrName: 'columnGap',
	breakpoint,
	attributes,
	setAttributes,
	breakpoints,     // optional, defaults to DEFAULT_BREAKPOINTS
} );
```

Keeping these separate is what makes the UI honest. If the control bound to `value` fell
back to the desktop value, the author could not tell whether a mobile override exists. So
`value` drives the input and `inheritedValue` drives the input's `placeholder`, which reads
as "empty here, inherits 24".

`resolvedValue` exists so consumers never have to recombine the two themselves. Each of the
three is unambiguous on its own: `value` is "what is set here", `inheritedValue` is "what it
would fall back to", `resolvedValue` is "what actually applies".

`reset` writes `undefined` (not `''`) so the attribute returns to its `block.json` default
and disappears from serialized block markup.

## 7. `BreakpointSwitcher`

```tsx
interface BreakpointSwitcherProps {
	value: string;
	onChange: ( id: string ) => void;
	variant?: 'inline' | 'dropdown';       // default 'inline'
	breakpoints?: Breakpoint[];            // default DEFAULT_BREAKPOINTS
	hasValue?: Record< string, boolean >;   // drives the override indicator
	label?: string;                         // accessible group name
	hideLabelFromVision?: boolean;
	className?: string;
}
```

Returns `null` when fewer than two breakpoints are configured.

**`inline`** — a row of icon buttons, always visible. Built on
`__experimentalToggleGroupControl` + `__experimentalToggleGroupControlOptionIcon`, which
give keyboard navigation, roving focus, the active-segment treatment and 40px sizing for
free, already matching editor chrome.

**`dropdown`** — a single button showing the active breakpoint's icon, opening a menu.
Built on `DropdownMenu`, whose popover is iframe-aware and handles outside-click, focus
return and `Escape` for us. This is where we deliberately part with Stackable's CSS trick
(§3).

**Experimental-import risk, accepted with mitigation.** `ToggleGroupControl` is still
exported as `__experimentalToggleGroupControl` on Gutenberg trunk — it was *not* stabilized
in WP 7.0 (verified against trunk docs, 2026-07-30). A published library importing an
experimental symbol can break on a WP minor. Mitigation: every `__experimental*` import in
the package is confined to one module, `_internal/wp-components.ts`, which re-exports under
stable local names. A future rename is then a one-line change rather than a search across
components. This is recorded as decision 0004.

**Override indicator.** A breakpoint with `hasValue[id] === true` gets a small dot and its
accessible name gains a suffix, e.g. `"Tablet (modified)"`. The base breakpoint never shows
the indicator — it is not an override, it is the value being overridden.

## 8. `ResponsiveControl`

```tsx
<ResponsiveControl
	attrName="columnGap"
	attributes={ attributes }
	setAttributes={ setAttributes }
	label={ __( 'Column Gap' ) }
	variant="dropdown"
	syncToEditor
>
	{ ( { value, inheritedValue, onChange, breakpoint } ) => (
		<RangeControl
			value={ value }
			placeholder={ inheritedValue }
			onChange={ onChange }
			__next40pxDefaultSize
		/>
	) }
</ResponsiveControl>
```

Owns the active-breakpoint state, renders label and switcher on one row (label left, switcher
right, as in the reference screenshots), and passes resolved values to a **render prop**.

Render prop rather than `cloneElement`: cloning would require guessing the child's value prop
name, and `@wordpress/components` is inconsistent about it — `SelectControl` uses `value`,
`RadioControl` uses `selected`, `ToggleControl` uses `checked`. This library already hit that
inconsistency in `RadioField`. A render prop makes the wiring explicit and type-safe.

Also renders a reset affordance when the active breakpoint has an override.

## 9. Packaging changes

### 9.1 Wildcard exports and discovered entries

Today a new subpath must be added in two places — `tsup.config.ts` `entry` and
`package.json` `exports` — as [`local-development.md`](../../../.agents/instructions/local-development.md)
itself warns. Two places to forget, and the workspace symlink cannot reveal the mistake
(§9.3). Adopting 10up's approach:

- `exports` gains wildcards alongside the existing barrels:
  `"./components/*": { types: "./dist/components/*/index.d.ts", import: "./dist/components/*/index.js" }`
- `tsup` entries are globbed from the filesystem instead of enumerated.

Both the barrel (`@isudev/gutenberg/components`) and the direct path
(`@isudev/gutenberg/components/BreakpointSwitcher`) stay valid; the direct path lets
consumers skip the barrel for better tree-shaking.

### 9.2 `@wordpress/icons` must not be externalized — existing bug

`tsup.config.ts` externalizes `/^@wordpress\//` wholesale. That is wrong for three packages.
`DependencyExtractionWebpackPlugin` deliberately does **not** externalize
`@wordpress/icons`, `@wordpress/interface` or `@wordpress/style-engine`, because WordPress
registers no script global for them — they are meant to be bundled. (10up's
`webpack.config.js` mirrors this list verbatim.)

This bites immediately: `DEFAULT_BREAKPOINTS` carries icons from `@wordpress/icons`.
Resolution: keep them external in our build and declare `@wordpress/icons` a **peer
dependency**, so the consumer's own build bundles it. AGENTS.md rule 6 permits this — it is
still a `@wordpress/*` package. The alternative, bundling icons into our `dist`, would
duplicate them across every subpath entry.

Related, from the WP 7.1 notes: `@wordpress/icons` v15 switches to `fill="currentColor"`.
Icons must therefore be tinted with CSS `color`, never `fill`.

### 9.3 `verify:package`

The workspace symlink resolves the whole package directory, so `files` and `exports`
mistakes are invisible locally and surface only for the first npm consumer — the worst
possible place, given that per-subpath imports are this library's main promise. Add a
pre-publish gate: `npm pack`, then `publint` (package-field correctness) and
`@arethetypeswrong/cli` (per-subpath type resolution, which matters because the package is
`"type": "module"` with `moduleResolution: "Bundler"`). Both are devDependencies only.

### 9.4 Toolchain upgrade to WP 7.0

Prerequisite, agreed separately. Current devDependencies pin `@wordpress/components`
28.13.0 — between the `wp-6.6` and `wp-6.7` tags — while the target runtime is WP 7.0,
whose tag resolves to 32.2.1. That is four minor lines of drift, and it covers exactly the
components this design uses. Pin devDependencies from the `wp-7.0` dist-tag (verified
2026-07-30): `components@32.2.1`, `block-editor@15.13.2`, `core-data@7.40.2`,
`data@10.40.1`, `editor@14.40.2`, `element@6.40.1`, `i18n@6.13.1`, `icons@11.7.1`,
`compose@7.40.1`, and `scripts@31.5.1` for the example plugin.

**React version, corrected.** The WP 7.0 npm line is still **React 18**, not 19:
`@wordpress/element@6.40.1` depends on `react@^18.3.0` and `@types/react@^18.3.27`
(verified against the registry, 2026-07-30). Development therefore stays on React 18 —
installing 19 would produce a genuine peer conflict against every `wp-7.0` package.

Published `peerDependencies.react` is nonetheless widened to `^18.0.0 || ^19.0.0`, which is
what `@wordpress/components@latest` already declares. This costs nothing today and spares
consumers a peer error once WordPress moves. The distinction matters: the *dev* range
describes what we typecheck against, the *peer* range describes what we tolerate at runtime.

## 10. Styling and iframe safety

**v1 ships no CSS files.** Both variants are built from `@wordpress/components` primitives
that already carry editor styling; the only custom pixel is the override-indicator dot,
rendered with an inline style referencing `var(--wp-admin-theme-color)`. This keeps
`sideEffects: false` honest and defers the library-wide CSS strategy to the first component
that genuinely needs a stylesheet (`ColorPopup`, `IconSelect`). When that lands, `sideEffects`
must change to `["**/*.css"]` — the current `false` would let a consumer's bundler drop a
stylesheet import as dead code.

**Iframe rules, non-negotiable.** No `document` or `window` globals anywhere. Popovers come
from `@wordpress/components`, which is already iframe-aware. If any future DOM access is
needed, reach it via `element.ownerDocument` through `useRefEffect` from
`@wordpress/compose`. This is what Stackable's `document.body` listener gets wrong and the
reason WP 7.1 matters: the iframe becomes unconditional with no fallback.

## 11. README contract

Every component, hook and control gets a colocated `README.md`, since generated docs and MCP
descriptions will be derived from these files.

```markdown
---
name: BreakpointSwitcher
entrypoint: "@isudev/gutenberg/components"
kind: component            # component | control | hook | field
status: stable             # stable | experimental | deprecated
since: 0.2.0
---

## Summary                 — one sentence
## When to use / When not to use
## Import
## Props                   — table: name | type | default | required | description
## Examples                — each titled and runnable
## Behavior                — states, keyboard, accessibility
## Styling                 — class names, CSS custom properties
## Gotchas
## Related
```

**Drift guard.** A generator that reads a stale README produces confident, wrong
documentation — worse than no documentation. A test therefore parses the exported props
interface and asserts every prop appears as a row in `## Props`, and that no row names a
prop that no longer exists. Roughly a dozen lines; it protects the whole docs pipeline.

## 12. Testing

This is where the deferred Stage 6.5 harness comes into existence — today
`packages/gutenberg` `test` is `echo "TODO" && exit 0`, so a green CI is currently lying.
Set up Jest + `@testing-library/react` with `@wordpress/data` and `core-data` mocked, then:

*`useResponsiveAttribute`*
- base reads/writes the unsuffixed attribute; non-base read/write suffixed ones
- cascade: mobile with no override inherits tablet, then desktop
- `0` and `false` count as overrides and do not fall through
- `''`, `null`, `undefined` do not count as overrides
- `hasValue` map is correct across mixed states
- `reset` writes `undefined`; `resetAll` clears only non-base attributes

*`useBreakpoint`*
- local state by default, touching no store
- `syncToEditor` dispatches `core/editor` `setDeviceType` with a capitalized value
- `syncFromEditor` follows external device-type changes
- neither flag set → zero store interaction

*`BreakpointSwitcher`*
- renders `null` below two breakpoints
- inline: keyboard navigation and active state
- dropdown: opens, selects, closes
- indicator appears only for breakpoints with overrides, never for the base
- invalid `breakpoints` (no base, duplicate suffix) warns and falls back

*`ResponsiveControl`*
- switching breakpoint swaps which attribute the child edits
- `placeholder` receives the inherited value
- reset affordance appears only with an override present

## 13. Example block

A second block in `examples/test-blocks` — `isudev/responsive-demo` — exercising both
variants: a `RangeControl` for `columnGap` via `ResponsiveControl` with `variant="inline"`,
and a `SelectControl` for a layout attribute with `variant="dropdown"` and `syncToEditor`.
It renders the resolved per-breakpoint values as text so the cascade is visible in the editor
without opening devtools.

## 14. Deliverables

1. WP 7.0 toolchain upgrade; `react` peer range widened; `@wordpress/icons` peer added.
2. `tsup`/`exports` switched to discovered entries plus wildcard subpaths.
3. Jest harness.
4. `useBreakpoint`, `useResponsiveAttribute`, `BreakpointSwitcher`, `ResponsiveControl`,
   each with a `README.md` and tests.
5. `_internal/wp-components.ts` isolating `__experimental*` imports; decision 0004.
6. Decision 0003 recording the breakpoint/cascade model.
7. `verify:package` script.
8. `isudev/responsive-demo` example block.
9. `status.md` updated.

## 15. Follow-ups, explicitly out of scope

- `BreakpointProvider` for setting the breakpoint set once per plugin. Additive later; the
  `breakpoints` prop covers v1.
- Library-wide CSS strategy (§10), forced by the next component rather than this one.
- Persisting the chosen breakpoint across panel remounts.
- A `responsive` flag on `SelectField`/`RadioField` so the existing binding engine can drive
  responsive values directly. Attractive, but it crosses `optionsSource`/`valueBinding` with a
  third axis and deserves its own design pass.
