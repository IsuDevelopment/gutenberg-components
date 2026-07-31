# Hooks

`@isudev/gutenberg/hooks` is a collection of small, focused React hooks for building
Gutenberg blocks: responsive attribute editing, post-editor context, and a couple of general
value-handling utilities. Every hook lives in its own folder with its own README —
this page is just a map to them.

## Import

```js
import { usePrevious } from '@isudev/gutenberg/hooks';
import { usePrevious } from '@isudev/gutenberg/hooks/usePrevious';
```

## Hooks

| Hook | What it does |
| --- | --- |
| [useBreakpoint](./useBreakpoint/README.md) | Owns the selected breakpoint, with optional two-way sync to the editor's device preview. |
| [useResponsiveAttribute](./useResponsiveAttribute/README.md) | Reads and writes one logical setting across a breakpoint set. |
| [useCurrentPostType](./useCurrentPostType/README.md) | Returns the post type of the post currently open in the editor. |
| [useCurrentPostId](./useCurrentPostId/README.md) | Returns the ID of the post currently open in the editor. |
| [useDebouncedValue](./useDebouncedValue/README.md) | Returns a debounced copy of a value that only updates after a delay of no changes. |
| [usePrevious](./usePrevious/README.md) | Returns the value a component held on its previous committed render. |

If you want the whole responsive control — switcher, selection state and attribute
plumbing wired together — see
[`ResponsiveControl`](../controls/ResponsiveControl/README.md) instead of composing the
pieces yourself.
