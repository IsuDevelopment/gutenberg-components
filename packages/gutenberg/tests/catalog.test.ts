import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
	CATEGORIES,
	SRC,
	readCatalog,
	renderAgentsMarkdown,
} from '../scripts/catalog';

const catalog = readCatalog();

/**
 * `catalog.json` and `AGENTS.md` are generated on demand rather than committed, so there is
 * no drift to guard against. What is still worth pinning is that the generator sees every
 * module: one silently missing from the catalog is invisible to every agent that reads it,
 * and nothing else in the suite would notice.
 */
describe( 'catalog coverage', () => {
	const publicModules = CATEGORIES.flatMap( ( category ) =>
		readdirSync( path.join( SRC, category ), { withFileTypes: true } )
			.filter(
				( entry ) =>
					entry.isDirectory() &&
					existsSync( path.join( SRC, category, entry.name, 'README.md' ) )
			)
			.map( ( entry ) => ( { category, name: entry.name } ) )
	);

	it.each( publicModules )(
		'includes $category/$name with its narrowest import',
		( { category, name } ) => {
			const entry = catalog.modules.find(
				( module ) => module.name === name
			);

			expect( entry ).toBeDefined();
			expect( entry?.import ).toBe(
				`@isudev/gutenberg/${ category }/${ name }`
			);
			expect( entry?.summary ).not.toBe( '' );
		}
	);

	it( 'projects every catalogued module into the agent guide', () => {
		const guide = renderAgentsMarkdown( catalog );

		for ( const module of catalog.modules ) {
			expect( guide ).toContain( module.import );
			expect( guide ).toContain( module.readme );
		}
	} );
} );

/**
 * The two shapes the README tables use that a naive parser gets wrong: pipes escaped inside
 * a union type, and the single `—` row hooks with no arguments render.
 */
describe( 'props parsing', () => {
	it( 'unescapes pipes inside union types', () => {
		const variant = catalog.modules
			.find( ( module ) => module.name === 'BreakpointSwitcher' )
			?.props?.find( ( prop ) => prop.name === 'variant' );

		expect( variant?.type ).toBe( "'inline' | 'dropdown'" );
		expect( variant?.required ).toBe( false );
		expect( variant?.default ).toBe( "'inline'" );
	} );

	it( 'reads a placeholder row as no props rather than one prop', () => {
		const hook = catalog.modules.find(
			( module ) => module.name === 'useCurrentPostId'
		);

		expect( hook?.props ).toEqual( [] );
	} );
} );
