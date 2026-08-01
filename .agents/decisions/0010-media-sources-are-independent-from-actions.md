# 0010 — Media sources are independent from actions

- Status: accepted
- Date: 2026-08-01

## Context

Decision 0009 deliberately limited the first media suite to WordPress attachments opened
through `MediaUpload`. Real image blocks also need the native `core/image` authoring flow:
upload, media library, direct URL and drag-and-drop. This library additionally needs the
current post's featured image as an image source. Consumers must be able to disable each
source without losing unrelated select, replace or remove behavior.

WordPress' stable `MediaPlaceholder` and `MediaReplaceFlow` provide the default visual model,
but their public APIs do not let library and upload be hidden independently. Copying their
private implementation would couple the package to Gutenberg internals and retains a known
blank-modal failure when replacement dropdowns live inside iframe block content.

## Decision

Publish `MediaSourceControl`, composed only from stable WordPress primitives. It has button
and dropdown variants and keeps `MediaUpload`/`FormFileUpload` outside dropdown content so
the native modal survives dropdown state changes.

Model source visibility with `MediaSourcesConfig`: `library`, `upload`, `url`, `featured`
and `dropZone`. Keep `MediaActionsConfig` unchanged: select, replace and remove are actions,
not sources. `MediaCanvasControl.placeholder` independently controls whether an empty canvas
surface exists.

Extend `MediaValue` with `source: 'attachment' | 'url' | 'featured'`. Featured selections
read the current post's `featured_media` through stable editor/core-data stores and remain
synchronized while the stored source is `featured`. Direct URLs remain inert data and never
inject HTML. Arbitrary embeds remain outside this image/media value model.

## Consequences

- The default canvas workflow matches the native image block: drag/drop, Upload, Media
  Library and Insert from URL, with Use featured image added.
- Every source can be disabled without conflating it with reset/remove visibility.
- Existing location controls now compose `MediaSourceControl`; `MediaPickerControl` remains
  the smaller media-library-only render-prop adapter.
- Direct URL values have no attachment ID. Rendering code must continue to escape the URL at
  its final HTML/PHP boundary.
- This decision supersedes only 0009's exclusion of arbitrary URL and featured-image sources;
  its modular single-media architecture and exclusion of galleries/captions/embeds remain.
