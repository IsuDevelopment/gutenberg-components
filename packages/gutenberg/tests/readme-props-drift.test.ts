import path from 'node:path';
import { propsFromInterface, propsFromReadme } from './helpers/props-from-interface';

const SRC = path.resolve( __dirname, '..', 'src' );

const CASES = [
	{
		name: 'BreakpointSwitcher',
		readme: path.join( SRC, 'components/BreakpointSwitcher/README.md' ),
		types: path.join( SRC, 'components/BreakpointSwitcher/types.ts' ),
		interfaceName: 'BreakpointSwitcherProps',
	},
	{
		name: 'ResponsiveControl',
		readme: path.join( SRC, 'controls/ResponsiveControl/README.md' ),
		types: path.join( SRC, 'controls/ResponsiveControl/types.ts' ),
		interfaceName: 'ResponsiveControlProps',
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
