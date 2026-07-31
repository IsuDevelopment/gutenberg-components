import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { propsFromInterface, propsFromReadme } from './helpers/props-from-interface';

const SRC = path.resolve( __dirname, '..', 'src' );
const PACKAGE_README = path.resolve( __dirname, '..', 'README.md' );
const PUBLIC_MODULE_CATEGORIES = [
	'components',
	'controls',
	'fields',
	'meta',
	'taxonomy',
	'hooks',
] as const;

/**
 * Every component, control, field and hook whose README has a `## Props` table describing a
 * TypeScript interface. `types` is the file the interface is *declared* in; inherited members
 * are resolved from wherever they actually live, so `SelectField` and `RadioField` point
 * straight at the shared `FieldBindingProps` they take as their props type.
 *
 * Deliberately absent: `useCurrentPostType`, `useCurrentPostId`, `useDebouncedValue` and
 * `usePrevious`. They take positional arguments or none at all, so there is no props
 * interface for their READMEs to be compared against.
 */
const CASES = [
	{
		name: 'BreakpointSwitcher',
		readme: path.join( SRC, 'components/BreakpointSwitcher/README.md' ),
		types: path.join( SRC, 'components/BreakpointSwitcher/types.ts' ),
		interfaceName: 'BreakpointSwitcherProps',
	},
	{
		name: 'ColorPopup',
		readme: path.join( SRC, 'components/ColorPopup/README.md' ),
		types: path.join( SRC, 'components/ColorPopup/types.ts' ),
		interfaceName: 'ColorPopupProps',
	},
	{
		name: 'Icon',
		readme: path.join( SRC, 'components/Icon/README.md' ),
		types: path.join( SRC, 'components/Icon/types.ts' ),
		interfaceName: 'IconProps',
	},
	{
		name: 'IconPicker',
		readme: path.join( SRC, 'components/IconPicker/README.md' ),
		types: path.join( SRC, 'components/IconPicker/types.ts' ),
		interfaceName: 'IconPickerProps',
	},
	{
		name: 'IconSelect',
		readme: path.join( SRC, 'components/IconSelect/README.md' ),
		types: path.join( SRC, 'components/IconSelect/types.ts' ),
		interfaceName: 'IconSelectProps',
	},
	{
		name: 'MediaPreview',
		readme: path.join( SRC, 'components/MediaPreview/README.md' ),
		types: path.join( SRC, 'components/MediaPreview/types.ts' ),
		interfaceName: 'MediaPreviewProps',
	},
	{
		name: 'MediaFocalPointControl',
		readme: path.join( SRC, 'components/MediaFocalPointControl/README.md' ),
		types: path.join( SRC, 'components/MediaFocalPointControl/types.ts' ),
		interfaceName: 'MediaFocalPointControlProps',
	},
	{
		name: 'ResponsiveControl',
		readme: path.join( SRC, 'controls/ResponsiveControl/README.md' ),
		types: path.join( SRC, 'controls/ResponsiveControl/types.ts' ),
		interfaceName: 'ResponsiveControlProps',
	},
	{
		name: 'LinkPickerControl',
		readme: path.join( SRC, 'controls/LinkPickerControl/README.md' ),
		types: path.join( SRC, 'controls/LinkPickerControl/types.ts' ),
		interfaceName: 'LinkPickerControlProps',
	},
	{
		name: 'LinkText',
		readme: path.join( SRC, 'controls/LinkText/README.md' ),
		types: path.join( SRC, 'controls/LinkText/types.ts' ),
		interfaceName: 'LinkTextProps',
	},
	{
		name: 'BlockLinkControl',
		readme: path.join( SRC, 'controls/BlockLinkControl/README.md' ),
		types: path.join( SRC, 'controls/BlockLinkControl/types.ts' ),
		interfaceName: 'BlockLinkControlProps',
	},
	{
		name: 'MediaPickerControl',
		readme: path.join( SRC, 'controls/MediaPickerControl/README.md' ),
		types: path.join( SRC, 'controls/MediaPickerControl/types.ts' ),
		interfaceName: 'MediaPickerControlProps',
	},
	{
		name: 'MediaCanvasControl',
		readme: path.join( SRC, 'controls/MediaCanvasControl/README.md' ),
		types: path.join( SRC, 'controls/MediaCanvasControl/types.ts' ),
		interfaceName: 'MediaCanvasControlProps',
	},
	{
		name: 'MediaToolbarControl',
		readme: path.join( SRC, 'controls/MediaToolbarControl/README.md' ),
		types: path.join( SRC, 'controls/MediaToolbarControl/types.ts' ),
		interfaceName: 'MediaToolbarControlProps',
	},
	{
		name: 'MediaSidebarControl',
		readme: path.join( SRC, 'controls/MediaSidebarControl/README.md' ),
		types: path.join( SRC, 'controls/MediaSidebarControl/types.ts' ),
		interfaceName: 'MediaSidebarControlProps',
	},
	{
		name: 'MediaControl',
		readme: path.join( SRC, 'controls/MediaControl/README.md' ),
		types: path.join( SRC, 'controls/MediaControl/types.ts' ),
		interfaceName: 'MediaControlProps',
	},
	{
		name: 'MetaSelectControl',
		readme: path.join( SRC, 'meta/MetaSelectControl/README.md' ),
		types: path.join( SRC, 'meta/MetaSelectControl/types.ts' ),
		interfaceName: 'MetaSelectControlProps',
	},
	{
		name: 'MetaRadioControl',
		readme: path.join( SRC, 'meta/MetaRadioControl/README.md' ),
		types: path.join( SRC, 'meta/MetaRadioControl/types.ts' ),
		interfaceName: 'MetaRadioControlProps',
	},
	{
		name: 'TaxonomySelectControl',
		readme: path.join( SRC, 'taxonomy/TaxonomySelectControl/README.md' ),
		types: path.join( SRC, 'taxonomy/TaxonomySelectControl/types.ts' ),
		interfaceName: 'TaxonomySelectControlProps',
	},
	{
		name: 'SelectField',
		readme: path.join( SRC, 'fields/SelectField/README.md' ),
		types: path.join( SRC, 'types/fields.ts' ),
		interfaceName: 'FieldBindingProps',
	},
	{
		name: 'RadioField',
		readme: path.join( SRC, 'fields/RadioField/README.md' ),
		types: path.join( SRC, 'types/fields.ts' ),
		interfaceName: 'FieldBindingProps',
	},
	{
		name: 'useBreakpoint',
		readme: path.join( SRC, 'hooks/useBreakpoint/README.md' ),
		types: path.join( SRC, 'hooks/useBreakpoint/types.ts' ),
		interfaceName: 'UseBreakpointOptions',
	},
	{
		name: 'useResponsiveAttribute',
		readme: path.join( SRC, 'hooks/useResponsiveAttribute/README.md' ),
		types: path.join( SRC, 'hooks/useResponsiveAttribute/types.ts' ),
		interfaceName: 'UseResponsiveAttributeArgs',
	},
];

describe.each( CASES )(
	'$name README documents its props',
	( { readme, types, interfaceName } ) => {
		it( 'matches the declared props in both directions', () => {
			const documented = propsFromReadme( readme );
			const declared = propsFromInterface( types, interfaceName );

			expect(
				declared.filter( ( prop ) => ! documented.includes( prop ) )
			).toEqual( [] );

			expect(
				documented.filter( ( prop ) => ! declared.includes( prop ) )
			).toEqual( [] );
		} );
	}
);

describe( 'main package README module catalog', () => {
	const packageReadme = readFileSync( PACKAGE_README, 'utf8' );
	const publicModules = PUBLIC_MODULE_CATEGORIES.flatMap( ( category ) =>
		readdirSync( path.join( SRC, category ), { withFileTypes: true } )
			.filter(
				( entry ) =>
					entry.isDirectory() &&
					existsSync(
						path.join( SRC, category, entry.name, 'README.md' )
					)
			)
			.map( ( entry ) => ( { category, name: entry.name } ) )
	);

	it.each( publicModules )(
		'lists $category/$name with docs and its narrowest import',
		( { category, name } ) => {
			expect( packageReadme ).toContain(
				`./src/${ category }/${ name }/README.md`
			);
			expect( packageReadme ).toContain(
				`from '@isudev/gutenberg/${ category }/${ name }'`
			);
		}
	);
} );
