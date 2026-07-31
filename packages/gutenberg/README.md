# `@isudev/gutenberg`

Standalone components, controls, fields and hooks for the WordPress Gutenberg editor. No
host-project coupling: icons, option lists and configuration are passed in as props, never
read from a global registry.

Targets **WordPress 7.0** and ships ESM with type declarations. Nothing but `@wordpress/*`
and React at runtime, and both are peer dependencies.

## Release status

The package is currently held at pre-publication version **`0.0.1`**. Version history and
semantic version increments will start with the first npm release.

## Install

```bash
npm install @isudev/gutenberg
```

Requires Node 20 to build, and a block build that externalizes WordPress packages —
`@wordpress/scripts` does this out of the box.

## Importing modules

Prefer the narrowest public subpath. This bypasses the category barrel and gives consumer
bundlers the smallest and most explicit module graph:

```js
import { BlockLinkControl } from '@isudev/gutenberg/controls/BlockLinkControl';
import { IconSelect } from '@isudev/gutenberg/components/IconSelect';
import { useBreakpoint } from '@isudev/gutenberg/hooks/useBreakpoint';
```

Category imports are convenient when several related modules are used together and remain
tree-shakeable in production ESM builds:

```js
import { BlockLinkControl, LinkText } from '@isudev/gutenberg/controls';
```

The root entry point is supported, but component and category subpaths communicate intent
more clearly and are preferred in reusable block code. Never import from `dist/` directly.

## Peer dependencies

The library never bundles React or `@wordpress/*`; your block build resolves them to the
WordPress-provided globals (`wp.element`, `React`, `ReactJSXRuntime`), so there is exactly
one copy at runtime. Install whichever peers you actually use:

```
@wordpress/block-editor  >=15.0.0
@wordpress/components    >=32.0.0
@wordpress/core-data      >=7.0.0
@wordpress/data          >=10.0.0
@wordpress/editor        >=14.0.0
@wordpress/element        >=6.0.0
@wordpress/i18n           >=6.0.0
@wordpress/icons         >=11.0.0
react                    ^18 || ^19
```

## Entry points

Import from the narrowest subpath that has what you need — the per-component subpaths skip
the category barrel entirely.

| Subpath | Contains |
| --- | --- |
| `@isudev/gutenberg` | Everything, re-exported. |
| `@isudev/gutenberg/breakpoints` | `DEFAULT_BREAKPOINTS`, `resolveCascade`, `isPresent`, `validateBreakpoints` and the `Breakpoint` type. |
| `@isudev/gutenberg/components` | Pure components — responsive switching, colors, icons and media/focal previews. |
| `@isudev/gutenberg/components/*` | One component, e.g. `.../components/BreakpointSwitcher`. |
| `@isudev/gutenberg/controls` | Editor controls — responsive, link and modular media editing surfaces. |
| `@isudev/gutenberg/controls/*` | One control, e.g. `.../controls/LinkPickerControl`. |
| `@isudev/gutenberg/fields` | All fields — `SelectField`, `RadioField`. |
| `@isudev/gutenberg/fields/*` | One field. |
| `@isudev/gutenberg/hooks` | `useBreakpoint`, `useResponsiveAttribute`, `useCurrentPostType`, `useCurrentPostId`, `useDebouncedValue`, `usePrevious`. |
| `@isudev/gutenberg/hooks/*` | One hook, e.g. `.../hooks/useBreakpoint`. |
| `@isudev/gutenberg/meta` | Post-meta wrappers — `MetaSelectControl`, `MetaRadioControl`. |
| `@isudev/gutenberg/meta/*` | One wrapper, e.g. `.../meta/MetaSelectControl`. |
| `@isudev/gutenberg/taxonomy` | Taxonomy wrappers — `TaxonomySelectControl`. |
| `@isudev/gutenberg/taxonomy/*` | One wrapper, e.g. `.../taxonomy/TaxonomySelectControl`. |
| `@isudev/gutenberg/bindings` | The binding engine — `useFieldBinding`, `useOptionsSource`, `useValueBinding` and the individual option/value hooks. |
| `@isudev/gutenberg/appenders` | Inner-block appenders — reserved, nothing exported yet. |

Every component, control, field, wrapper and hook has a `README.md` beside its source
documenting all of its props, behaviour and examples; those files ship with the package.

## Public module catalog

This is the complete public UI and hook surface currently available. The direct imports
shown below are the narrowest supported entry points.

### Components

| Module | Purpose | Direct import |
| --- | --- | --- |
| [`BreakpointSwitcher`](./src/components/BreakpointSwitcher/README.md) | Switches the breakpoint currently being edited, with optional editor-preview synchronization. | `import { BreakpointSwitcher } from '@isudev/gutenberg/components/BreakpointSwitcher';` |
| [`ColorPopup`](./src/components/ColorPopup/README.md) | Opens a WordPress color palette from a swatch and returns the full selected color object. | `import { ColorPopup } from '@isudev/gutenberg/components/ColorPopup';` |
| [`Icon`](./src/components/Icon/README.md) | Renders a named icon from an injected collection and exports the icon collection helpers. | `import { Icon } from '@isudev/gutenberg/components/Icon';` |
| [`IconPicker`](./src/components/IconPicker/README.md) | Displays a searchable, accessible grid for choosing or clearing an icon. | `import { IconPicker } from '@isudev/gutenberg/components/IconPicker';` |
| [`IconSelect`](./src/components/IconSelect/README.md) | Opens `IconPicker` from a compact select-style button with the current icon preview. | `import { IconSelect } from '@isudev/gutenberg/components/IconSelect';` |
| [`MediaPreview`](./src/components/MediaPreview/README.md) | Renders a serializable image/video value with optional focal positioning. | `import { MediaPreview } from '@isudev/gutenberg/components/MediaPreview';` |
| [`MediaFocalPointControl`](./src/components/MediaFocalPointControl/README.md) | Provides standalone WordPress focal-point editing for an image or video. | `import { MediaFocalPointControl } from '@isudev/gutenberg/components/MediaFocalPointControl';` |

### Controls

| Module | Purpose | Direct import |
| --- | --- | --- |
| [`ResponsiveControl`](./src/controls/ResponsiveControl/README.md) | Adds breakpoint selection and responsive attribute resolution to any consumer-rendered control. | `import { ResponsiveControl } from '@isudev/gutenberg/controls/ResponsiveControl';` |
| [`LinkPickerControl`](./src/controls/LinkPickerControl/README.md) | Attaches WordPress' native link picker to a consumer-rendered trigger through a render prop. | `import { LinkPickerControl } from '@isudev/gutenberg/controls/LinkPickerControl';` |
| [`BlockLinkControl`](./src/controls/BlockLinkControl/README.md) | Adds an add/edit link action for a whole block or non-text element to `BlockControls`. | `import { BlockLinkControl } from '@isudev/gutenberg/controls/BlockLinkControl';` |
| [`LinkText`](./src/controls/LinkText/README.md) | Combines editable `RichText`, anchor rendering and a native-style toolbar link action. | `import { LinkText } from '@isudev/gutenberg/controls/LinkText';` |
| [`MediaPickerControl`](./src/controls/MediaPickerControl/README.md) | Attaches the native media modal to any consumer-rendered trigger and normalizes its value. | `import { MediaPickerControl } from '@isudev/gutenberg/controls/MediaPickerControl';` |
| [`MediaCanvasControl`](./src/controls/MediaCanvasControl/README.md) | Renders a media placeholder/preview with configurable on-canvas actions. | `import { MediaCanvasControl } from '@isudev/gutenberg/controls/MediaCanvasControl';` |
| [`MediaToolbarControl`](./src/controls/MediaToolbarControl/README.md) | Adds configurable select, replace and remove actions to `BlockControls`. | `import { MediaToolbarControl } from '@isudev/gutenberg/controls/MediaToolbarControl';` |
| [`MediaSidebarControl`](./src/controls/MediaSidebarControl/README.md) | Adds inspector actions with a static, focal-point or disabled preview. | `import { MediaSidebarControl } from '@isudev/gutenberg/controls/MediaSidebarControl';` |
| [`MediaControl`](./src/controls/MediaControl/README.md) | Composes canvas, toolbar and sidebar media editing with per-location feature switches. | `import { MediaControl } from '@isudev/gutenberg/controls/MediaControl';` |

### Fields

| Module | Purpose | Direct import |
| --- | --- | --- |
| [`SelectField`](./src/fields/SelectField/README.md) | Composes a select control from independent options-source and value-binding definitions. | `import { SelectField } from '@isudev/gutenberg/fields/SelectField';` |
| [`RadioField`](./src/fields/RadioField/README.md) | Composes a radio control from independent options-source and value-binding definitions. | `import { RadioField } from '@isudev/gutenberg/fields/RadioField';` |

### Easy-mode wrappers

| Module | Purpose | Direct import |
| --- | --- | --- |
| [`MetaSelectControl`](./src/meta/MetaSelectControl/README.md) | Binds `SelectField` to one post-meta key. | `import { MetaSelectControl } from '@isudev/gutenberg/meta/MetaSelectControl';` |
| [`MetaRadioControl`](./src/meta/MetaRadioControl/README.md) | Binds `RadioField` to one post-meta key. | `import { MetaRadioControl } from '@isudev/gutenberg/meta/MetaRadioControl';` |
| [`TaxonomySelectControl`](./src/taxonomy/TaxonomySelectControl/README.md) | Provides a single-term taxonomy picker bound to the current post. | `import { TaxonomySelectControl } from '@isudev/gutenberg/taxonomy/TaxonomySelectControl';` |

### Hooks

| Module | Purpose | Direct import |
| --- | --- | --- |
| [`useBreakpoint`](./src/hooks/useBreakpoint/README.md) | Owns the selected breakpoint with optional two-way editor-preview synchronization. | `import { useBreakpoint } from '@isudev/gutenberg/hooks/useBreakpoint';` |
| [`useResponsiveAttribute`](./src/hooks/useResponsiveAttribute/README.md) | Reads, resolves and writes one logical attribute across a breakpoint cascade. | `import { useResponsiveAttribute } from '@isudev/gutenberg/hooks/useResponsiveAttribute';` |
| [`useCurrentPostType`](./src/hooks/useCurrentPostType/README.md) | Returns the post type currently open in the editor. | `import { useCurrentPostType } from '@isudev/gutenberg/hooks/useCurrentPostType';` |
| [`useCurrentPostId`](./src/hooks/useCurrentPostId/README.md) | Returns the ID of the post currently open in the editor. | `import { useCurrentPostId } from '@isudev/gutenberg/hooks/useCurrentPostId';` |
| [`useDebouncedValue`](./src/hooks/useDebouncedValue/README.md) | Returns a value only after the configured quiet period has elapsed. | `import { useDebouncedValue } from '@isudev/gutenberg/hooks/useDebouncedValue';` |
| [`usePrevious`](./src/hooks/usePrevious/README.md) | Returns the value from the component's previous committed render. | `import { usePrevious } from '@isudev/gutenberg/hooks/usePrevious';` |

The lower-level `breakpoints` and `bindings` entry points are also public for advanced
composition. Their API is summarized in [Entry points](#entry-points); the modules above
are the recommended starting point for block development.

## Example

A block setting that differs per breakpoint:

```jsx
import { ResponsiveControl } from '@isudev/gutenberg/controls';
import { RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

<ResponsiveControl
	attrName="columnGap"
	label={ __( 'Column Gap' ) }
	attributes={ attributes }
	setAttributes={ setAttributes }
>
	{ ( { value, inheritedValue, onChange } ) => (
		<RangeControl
			value={ value }
			placeholder={ inheritedValue }
			onChange={ onChange }
			__next40pxDefaultSize
		/>
	) }
</ResponsiveControl>
```

The base breakpoint writes `columnGap`; the others write `columnGapTablet` and
`columnGapMobile`. Declare every one of them in `block.json`.

## Documentation

The colocated module READMEs are the source of truth for API documentation and will feed a
dedicated GitBook in the future. The [public module catalog](#public-module-catalog) is the
current documentation index and must stay synchronized with the exported modules.

## License

MIT — see [LICENSE](./LICENSE).
