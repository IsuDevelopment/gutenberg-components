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
