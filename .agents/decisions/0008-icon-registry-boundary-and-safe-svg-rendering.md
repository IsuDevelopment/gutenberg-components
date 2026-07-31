# 0008 — Icon registry boundary and safe SVG rendering

- Status: accepted
- Date: 2026-07-30

## Context

Blocks need three related surfaces: render a stored icon, select from a visible grid, and
open that grid from a compact control. Host projects may expose their icon catalogue with
`wp_localize_script`, while the component library's standalone contract requires icons and
configuration to be injected through props rather than read from a hidden global registry.

Localized SVG is also a security boundary. Rendering configuration strings with
`dangerouslySetInnerHTML` would turn any registry-writing vulnerability into editor DOM
injection.

## Decision

Publish three props-only components from `@isudev/gutenberg/components`:

- `Icon` renders one selected name or nothing;
- `IconPicker` renders the controlled grid, optional search and clear action;
- `IconSelect` composes a selected preview, WordPress `Dropdown` and `IconPicker`.

Use one `IconDefinition` (`name`, optional `label`, `icon`, optional `keywords`) and store only
the stable name in block attributes. `defaultIcons` is the injected base registry. When an
`icons` override is present, it is the complete ordered collection: string entries select
names from the defaults and object entries provide direct replacements.

Keep localized data behind the explicit `getLocalizedIcons()` adapter. It reads
`globalThis.isudevIcons` by default, validates the JSON-compatible array and returns normal
props. Components never access the global themselves. Consumers localize on their own script
handle, not a WordPress Core dependency handle.

Render serialized SVG as a percent-encoded `data:image/svg+xml` image rather than injecting
markup. Image URLs use `<img>`; WordPress icon values and Dashicon names use the stable
`@wordpress/components` `Icon` component.

## Consequences

- The same components work with PHP-localized icons, JavaScript arrays, WordPress icons,
  tests and server-side rendering.
- A missing global or unknown selected name renders an empty state instead of throwing.
- Host integrations can replace the complete catalogue or expose an ordered name-only subset.
- Localized data cannot carry React components; those must be passed directly through props.
- SVG does not inherit surrounding `currentColor` when rendered as an image. Projects needing
  fully themeable SVG should inject a trusted React icon component instead.
