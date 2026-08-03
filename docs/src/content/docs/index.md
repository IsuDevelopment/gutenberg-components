---
title: '@isudev/gutenberg'
description: Standalone components, controls, fields and hooks for the WordPress Gutenberg editor.
---

Components, controls, fields and hooks for the WordPress Gutenberg editor — the parts of a
block's editor UI that would otherwise be rewritten per project. Targets **WordPress 7.0**,
ships ESM with type declarations, and has nothing but `@wordpress/*` and React at runtime.

```bash
npm install @isudev/gutenberg
```

## Importing modules

Prefer the narrowest public subpath. It bypasses the category barrel and gives your bundler
the smallest and most explicit module graph:

```js
import { MediaControl } from '@isudev/gutenberg/controls/MediaControl';
import { useBreakpoint } from '@isudev/gutenberg/hooks/useBreakpoint';
```

Category imports are convenient when several related modules are used together, and stay
tree-shakeable in production ESM builds:

```js
import { BlockLinkControl, LinkText } from '@isudev/gutenberg/controls';
```

Never import from `dist/` — only the documented subpaths are public API.

## ESM only

The package ships ESM exclusively and defines its public surface with `exports` alone, so a
TypeScript consumer needs `"moduleResolution": "bundler"` (or `"node16"`/`"nodenext"`) to see
its types — the legacy `"node"` strategy reads only `main` and finds nothing. From CommonJS,
use `await import( … )` instead of `require()`. `@wordpress/scripts` needs no configuration
for either.

## Where to start

- **[Reference](/reference/controls/)** — every public component, control, field and hook,
  with all of its props and runnable examples. Each page is generated from the README that
  ships beside that module's source.
- **[Guide for coding agents](/agents/)** — the module catalog and the rules that are easy
  to get wrong, in the form shipped inside the npm tarball.

## For AI coding agents

This site publishes [`/llms.txt`](/llms.txt), [`/llms-full.txt`](/llms-full.txt) and
[`/llms-small.txt`](/llms-small.txt), plus the machine-readable module catalog at
[`/catalog.json`](/catalog.json).

In a project that already depends on the library, run:

```bash
npx @isudev/gutenberg init
```

That vendors the module catalog into `.agents/vendor/` and points your `AGENTS.md` — and
your Cursor rules or Copilot instructions, if you use them — at it, so your agent finds the
documentation without being told about it every time.
