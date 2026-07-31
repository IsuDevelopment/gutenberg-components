# 0009 — Modular single-media control

- Status: accepted
- Date: 2026-07-31

## Context

Blocks commonly need one WordPress attachment with editing in up to three places: directly
on the canvas, in `BlockControls`, and in the inspector. Image/video previews and focal-point
editing are useful independently. A prior-art media suite combined those concerns with a
custom `MediaReplaceFlow`, featured-image synchronization, captions, embeds, URL input and a
global Slot/Fill panel, making the common single-attachment path large and tightly coupled.

The library must preserve per-component imports and allow consumers to omit unused editor
surfaces from their bundle.

## Decision

Publish a small serializable `MediaValue` and seven independently importable modules:

- `MediaPreview` renders image/video values without editor stores;
- `MediaFocalPointControl` wraps the stable WordPress focal-point picker;
- `MediaPickerControl` is the render-prop boundary around native `MediaUpload`;
- `MediaCanvasControl`, `MediaToolbarControl` and `MediaSidebarControl` own one editor
  location each;
- `MediaControl` composes those locations and coordinates optional focal-point reset.

All location controls use the same `MediaActionsConfig`, where select, replace and remove
can be enabled independently. `MediaSidebarControl.preview` is a closed choice between
`'media'`, `'focal-point'` and `false`, preventing overlapping preview modes. The composite
accepts `false` or a location-specific options object for canvas, toolbar and sidebar.

Store the normalized URL, type and accessible metadata alongside the attachment ID. Pure
previews therefore render immediately after block reload without an attachment REST request.
Selection still returns the untouched native media object as a second callback argument for
advanced consumers.

Do not include galleries, arbitrary URL media, embeds, captions or featured-image state in
this suite. Those concerns have different value models, security boundaries or post-level
stores and may become separate modules later.

## Consequences

- Consumers needing one surface import only that surface; the complete control intentionally
  includes every enabled submodule.
- The implementation uses native `MediaUpload` rather than maintaining a private copy of
  Gutenberg's `MediaReplaceFlow`.
- Sidebar preview, focal point and buttons are independent and can all be disabled.
- Replacing media does not silently reset focal point unless
  `resetFocalPointOnChange` is enabled.
- ID-only values can still be selected/replaced, but previews require the stored URL.
