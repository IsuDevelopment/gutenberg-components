# `@isudev/gutenberg`

Standalone components, controls, fields and hooks for the WordPress Gutenberg editor. No
host-project coupling: icons, option lists and configuration are passed in as props, never
read from a global registry.

Targets **WordPress 7.0** and ships ESM with type declarations. Nothing but `@wordpress/*`
and React at runtime, and both are peer dependencies.

## Install

```bash
npm install @isudev/gutenberg
```

Requires Node 20 to build, and a block build that externalizes WordPress packages —
`@wordpress/scripts` does this out of the box.

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
| `@isudev/gutenberg/components` | All components. |
| `@isudev/gutenberg/components/*` | One component, e.g. `.../components/BreakpointSwitcher`. |
| `@isudev/gutenberg/controls` | All controls — `ResponsiveControl`, `LinkPickerControl`, `BlockLinkControl`, `LinkText` and link helpers. |
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

Each component, control and hook group ships its own README next to the source, with a prop
table kept in sync with the types by a test:

- [`BreakpointSwitcher`](./src/components/BreakpointSwitcher/README.md)
- [`ResponsiveControl`](./src/controls/ResponsiveControl/README.md)
- [`LinkPickerControl`](./src/controls/LinkPickerControl/README.md)
- [`BlockLinkControl`](./src/controls/BlockLinkControl/README.md)
- [`LinkText`](./src/controls/LinkText/README.md)
- [Hooks](./src/hooks/README.md)

## License

MIT — see [LICENSE](./LICENSE).
