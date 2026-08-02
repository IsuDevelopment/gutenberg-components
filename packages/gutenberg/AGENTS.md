# `@isudev/gutenberg` — guide for coding agents

You are writing WordPress block code that consumes this library. This file is the index:
skim the catalog at the bottom, then open the `Full docs` README for the specific module you
are about to use. Those READMEs document every prop, default and behaviour; this file
deliberately does not repeat them.

This is the consumer-facing guide shipped inside the npm tarball. If you are working *on*
the library itself, the contributor guide is `AGENTS.md` at the repository root instead.

## What this library is

Components, controls, fields and hooks for the WordPress Gutenberg editor — the parts of a
block's editor UI that would otherwise be rewritten per project. It targets **WordPress 7.0**
and ships ESM with type declarations.

## Import rules

Prefer the narrowest subpath. It bypasses the category barrel and gives the consumer's
bundler the smallest module graph:

```js
import { MediaControl } from '@isudev/gutenberg/controls/MediaControl';
import { useBreakpoint } from '@isudev/gutenberg/hooks/useBreakpoint';
```

The category barrel is fine when several related modules are used together and stays
tree-shakeable in production ESM builds:

```js
import { BlockLinkControl, LinkText } from '@isudev/gutenberg/controls';
```

- **Never import from `dist/`.** Only the subpaths in the catalog below are public API.
- **Never import from `_internal/`.** It is private and not exported.
- The root entry (`@isudev/gutenberg`) works but says less about intent — avoid it in
  reusable block code.

## Rules that are easy to get wrong

1. **Nothing is read from a global registry.** Icons, option lists and configuration are
   passed in as props. If you are looking for a place to register icons globally, there
   isn't one, and adding a module-level registry defeats the design. Pass a collection.
2. **Where a field reads its options is separate from where it reads and writes its value.**
   `optionsSource` and `valueBinding` are independent; do not assume a taxonomy options
   source implies a taxonomy value binding.
3. **Two modes, pick the smaller one.** Easy mode (`MetaSelectControl`,
   `TaxonomySelectControl`) takes one key and covers the common case. Advanced mode
   (`SelectField`, `RadioField`) composes `optionsSource` + `valueBinding` and is for the
   cases easy mode cannot express. Do not reach for advanced mode by default.
4. **Media editing is modular.** `MediaControl` composes the canvas, toolbar and sidebar
   surfaces with per-location switches. Use the individual controls only when you need one
   surface without the others.
5. **Responsive values come from the breakpoint kernel.** `ResponsiveControl` wires the
   switcher, the selection state and the attribute plumbing together — compose
   `useBreakpoint` + `useResponsiveAttribute` + `BreakpointSwitcher` by hand only when you
   need a layout `ResponsiveControl` cannot render.

## Build assumptions

`@wordpress/*`, `react`, `react-dom` and `react/jsx-runtime` are peer dependencies and stay
external — the consumer's build resolves them to the WordPress-provided globals, so there is
exactly one copy at runtime. `@wordpress/scripts` does this out of the box; a custom build
needs `DependencyExtractionWebpackPlugin` or an equivalent externals configuration.

Blocks using this library should be `"apiVersion": 3` in `block.json`. WordPress 7.1 iframes
the post editor unconditionally, and `apiVersion 2` blocks stop working there.

## Module catalog

`@isudev/gutenberg@0.0.1` — 28 public modules.
Read the listed `Full docs` file before using a module; it documents every prop,
behaviour and example. The paths are relative to the package root, so from a consumer
project they resolve as `node_modules/@isudev/gutenberg/<path>`.

### Components

| Module | What it does | Narrowest import | Props | Full docs |
| --- | --- | --- | --- | --- |
| `BreakpointSwitcher` | Switches which breakpoint a responsive setting is being edited for, as an always-visible row of icons or a compact dropdown. | `@isudev/gutenberg/components/BreakpointSwitcher` | 8 | `src/components/BreakpointSwitcher/README.md` |
| `ColorPopup` | A color swatch button that opens a popover with `ColorPalette`, and reports back the full color object (`{ color, name, slug }`), not just the hex string `ColorPalette` gives you. | `@isudev/gutenberg/components/ColorPopup` | 9 | `src/components/ColorPopup/README.md` |
| `Icon` | Renders one named icon from an injected collection. Empty and unknown names render nothing. The folder also exports collection resolution and the explicit `wp_localize_script` adapter shared by `IconPicker` and `IconSelect`. | `@isudev/gutenberg/components/Icon` | 7 | `src/components/Icon/README.md` |
| `IconPicker` | Displays an accessible grid of named icons with optional search and clearing. It is the always-visible selection surface used by `IconSelect`. | `@isudev/gutenberg/components/IconPicker` | 15 | `src/components/IconPicker/README.md` |
| `IconSelect` | Shows the current icon and label in a compact WordPress button. Clicking it opens `IconPicker` in a popover; with no selected value, no icon preview is rendered. | `@isudev/gutenberg/components/IconSelect` | 20 | `src/components/IconSelect/README.md` |
| `MediaFocalPointControl` | A standalone wrapper around WordPress' `FocalPointPicker` for a serializable image or video value. It can be imported without any media modal, toolbar or inspector controls. | `@isudev/gutenberg/components/MediaFocalPointControl` | 10 | `src/components/MediaFocalPointControl/README.md` |
| `MediaPreview` | Renders a serializable `MediaValue` as an image or video. It is props-only, performs no REST requests, and maps an optional focal point to safe CSS `object-position` values. | `@isudev/gutenberg/components/MediaPreview` | 12 | `src/components/MediaPreview/README.md` |

### Controls

| Module | What it does | Narrowest import | Props | Full docs |
| --- | --- | --- | --- | --- |
| `BlockLinkControl` | Injects an add/edit action and an optional unlink action into Gutenberg's `BlockControls`. The add/edit action opens the same `LinkPickerControl` used by the lower-level and editable-text link APIs. | `@isudev/gutenberg/controls/BlockLinkControl` | 14 | `src/controls/BlockLinkControl/README.md` |
| `LinkPickerControl` | Adds WordPress' native link picker to any consumer-rendered element. It owns popover state and link normalization, while a render prop keeps the trigger and the block's markup under the consumer's control. | `@isudev/gutenberg/controls/LinkPickerControl` | 28 | `src/controls/LinkPickerControl/README.md` |
| `LinkText` | Provides editable `RichText` rendered as an anchor and a native-style link action in the inline block toolbar. It is the ready-made path for CTA labels, inline links and lists of editable links. | `@isudev/gutenberg/controls/LinkText` | 19 | `src/controls/LinkText/README.md` |
| `MediaCanvasControl` | Renders a media placeholder before selection and an image/video preview with compact replace/remove actions afterward. Each action can be disabled independently. | `@isudev/gutenberg/controls/MediaCanvasControl` | 15 | `src/controls/MediaCanvasControl/README.md` |
| `MediaControl` | The complete single-media editor composed from `MediaCanvasControl`, `MediaToolbarControl` and `MediaSidebarControl`. Every location can be disabled, and each location independently controls its select, replace and remove actions. | `@isudev/gutenberg/controls/MediaControl` | 13 | `src/controls/MediaControl/README.md` |
| `MediaPickerControl` | Connects any consumer-rendered trigger to WordPress' native media modal. A render prop exposes `open`, selection state and the current select/replace action, while selections are normalized to a small serializable `MediaValue`. | `@isudev/gutenberg/controls/MediaPickerControl` | 10 | `src/controls/MediaPickerControl/README.md` |
| `MediaSidebarControl` | Adds a media panel to `InspectorControls` with independently configurable actions and one of three preview modes: static media, interactive focal point, or no preview. | `@isudev/gutenberg/controls/MediaSidebarControl` | 17 | `src/controls/MediaSidebarControl/README.md` |
| `MediaSourceControl` | Provides the native image-block source workflow as either inline placeholder buttons or a replacement dropdown: media library, upload, direct URL, current post featured image and drag-and-drop. Every source is independently configurable. | `@isudev/gutenberg/controls/MediaSourceControl` | 18 | `src/controls/MediaSourceControl/README.md` |
| `MediaToolbarControl` | Adds state-aware select/replace and remove actions to Gutenberg's block toolbar without rendering any block content or inspector UI. | `@isudev/gutenberg/controls/MediaToolbarControl` | 11 | `src/controls/MediaToolbarControl/README.md` |
| `ResponsiveControl` | Makes any control responsive: renders a label and a breakpoint switcher, then hands the resolved per-breakpoint value to a render prop. | `@isudev/gutenberg/controls/ResponsiveControl` | 11 | `src/controls/ResponsiveControl/README.md` |

### Fields (advanced mode)

| Module | What it does | Narrowest import | Props | Full docs |
| --- | --- | --- | --- | --- |
| `RadioField` | A radio-button field that composes an options source and a value binding independently — pick a static list or a dynamic source for the choices, and separately bind the value to post meta, a taxonomy, or a custom store. | `@isudev/gutenberg/fields/RadioField` | 8 | `src/fields/RadioField/README.md` |
| `SelectField` | A select field that composes an options source and a value binding independently — pick a static list or a dynamic source for the choices, and separately bind the value to post meta, a taxonomy, or a custom store. | `@isudev/gutenberg/fields/SelectField` | 8 | `src/fields/SelectField/README.md` |

### Post meta (easy mode)

| Module | What it does | Narrowest import | Props | Full docs |
| --- | --- | --- | --- | --- |
| `MetaRadioControl` | A radio group bound to a single post meta value — pass the meta key, get a working `RadioControl` that reads and writes it, with the options coming from wherever you like. | `@isudev/gutenberg/meta/MetaRadioControl` | 9 | `src/meta/MetaRadioControl/README.md` |
| `MetaSelectControl` | A dropdown bound to a single post meta value — pass the meta key, get a working `SelectControl` that reads and writes it, with the options coming from wherever you like. | `@isudev/gutenberg/meta/MetaSelectControl` | 9 | `src/meta/MetaSelectControl/README.md` |

### Taxonomy (easy mode)

| Module | What it does | Narrowest import | Props | Full docs |
| --- | --- | --- | --- | --- |
| `TaxonomySelectControl` | A dropdown whose options are a taxonomy's terms and whose value is that same taxonomy's terms on the current post — pass the taxonomy name, get a working single-term picker. | `@isudev/gutenberg/taxonomy/TaxonomySelectControl` | 8 | `src/taxonomy/TaxonomySelectControl/README.md` |

### Hooks

| Module | What it does | Narrowest import | Props | Full docs |
| --- | --- | --- | --- | --- |
| `useBreakpoint` | Owns which breakpoint a responsive setting is currently being edited for, with optional two-way sync to the editor's device preview. | `@isudev/gutenberg/hooks/useBreakpoint` | 4 | `src/hooks/useBreakpoint/README.md` |
| `useCurrentPostId` | Returns the ID of the post currently open in the editor. | `@isudev/gutenberg/hooks/useCurrentPostId` | 0 | `src/hooks/useCurrentPostId/README.md` |
| `useCurrentPostType` | Returns the post type of the post currently open in the editor. | `@isudev/gutenberg/hooks/useCurrentPostType` | 0 | `src/hooks/useCurrentPostType/README.md` |
| `useDebouncedValue` | Returns a debounced copy of a value that only updates after a delay of no further changes. | `@isudev/gutenberg/hooks/useDebouncedValue` | 2 | `src/hooks/useDebouncedValue/README.md` |
| `usePrevious` | Returns the value a component held on its previous committed render. | `@isudev/gutenberg/hooks/usePrevious` | 1 | `src/hooks/usePrevious/README.md` |
| `useResponsiveAttribute` | Reads and writes one logical setting across a breakpoint set, resolving the cascade so a control always has the right own value, inherited value and override state for whichever breakpoint is active. | `@isudev/gutenberg/hooks/useResponsiveAttribute` | 5 | `src/hooks/useResponsiveAttribute/README.md` |

---

<!-- Generated by scripts/catalog.ts from the colocated READMEs. Do not edit by hand:
     run `npm run catalog` instead. The prose above lives in scripts/agents-preamble.md. -->
