# 0007 — Shared link value with a render-prop picker

- Status: accepted
- Date: 2026-07-30

## Context

Blocks need two related link workflows:

1. attach a destination to arbitrary editor UI such as a card, image or custom toolbar;
2. edit link text and destination together through a ready-made control.

A legacy project-specific proof of concept combined toolbar buttons, inspector controls,
RichText, popover state and document-level outside-click handling in one component. The
vendored `@10up/block-components` example offers a smaller RichText link, but couples that
single presentation directly to the picker and depends on host styling libraries.

The library must remain standalone, iframe-safe and extensible without creating one link
component for each block presentation. WordPress 7 now exposes a stable `LinkControl`, but
publishing our wrapper under that same name would make imports ambiguous.

## Decision

Publish four public surfaces from `@isudev/gutenberg/controls`:

- `LinkPickerControl`: a controlled link picker whose `children` render prop owns the trigger
  markup and receives an anchor callback plus open/close/remove actions;
- `BlockLinkControl`: a ready-made `BlockControls` fill with add/edit and unlink actions;
- `LinkText`: a ready-made RichText anchor composed over `LinkPickerControl`;
- `normalizeLinkValue` and `getLinkAttributes`: pure helpers around the shared `LinkValue`
  domain object.

Use the modern WordPress shape (`url`, `title`, `id`, `kind`, `type`, `opensInNewTab`,
`nofollow`, `rel`) instead of retaining the proof of concept's duplicate `linkTarget` field.
Derive `_blank` only when rendering attributes. Normalize managed `rel` tokens centrally,
preserve consumer tokens, and reject obvious executable URL protocols when mapping to JSX
anchor attributes.

Name the general control `LinkPickerControl`, not `LinkControl`, to avoid colliding with the
stable export from `@wordpress/block-editor`.

## Consequences

- A block can attach one picker to any mounted HTML element without library-owned wrappers or
  global document listeners.
- The anchor is stored in local React state, as required by the current Popover API, and works
  inside the iframe editor.
- `LinkText` and custom link UIs cannot silently diverge on target/rel behavior.
- Consumers own persistence. Block attributes, entity data or another store can all use the
  same controlled API.
- `getLinkAttributes` is defense in depth for static JSX. Dynamic PHP still must use WordPress
  escaping and server-side rel handling.
- The package targets WordPress 7, where `LinkControl` is stable. Supporting older WordPress
  releases would require an internal compatibility alias and is outside the current target.

## Amendment — native LinkControl state and focus

The initial implementation normalized an empty link to a truthy object before passing it to
WordPress and opened `LinkText` on every text click with `focusOnMount="firstElement"`. Both
choices diverged from Gutenberg's own state machine: the first changed new-link rendering;
the second moved the caret from RichText into the popup and made typing impractical.

The control now follows the two upstream flows deliberately:

- the private Gutenberg `LinkPicker` remains reference behavior, not a dependency; the
  library composes the stable public `LinkControl` instead;
- empty picker values use `null`, forced editing and initial suggestions, following
  `LinkPicker`;
- `LinkText` opens a new link from `BlockControls` with autofocus, while clicking an existing
  link opens its preview with autofocus disabled, following the format library's
  `InlineLinkUI`.

Native popover defaults (`animate={ false }`, `shift`, constrained tabbing and rich previews)
are now explicit so refactors cannot silently revert the interaction.
