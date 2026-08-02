import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import {
	AGENTS_PATH,
	CATALOG_PATH,
	CATEGORIES,
	SRC,
	readCatalog,
	renderAgentsMarkdown,
} from '../scripts/catalog';

const catalog = readCatalog();

/**
 * `catalog.json` and `AGENTS.md` are generated but committed — they have to be readable on
 * GitHub and inside the tarball without running a build. That makes them driftable, and a
 * stale agent guide is worse than none: it ships confidently wrong imports.
 */
describe( 'generated catalog artifacts', () => {
	it( 'catalog.json matches the colocated READMEs', () => {
		expect( readFileSync( CATALOG_PATH, 'utf8' ) ).toBe(
			`${ JSON.stringify( catalog, null, '\t' ) }\n`
		);
	} );

	it( 'AGENTS.md matches the colocated READMEs', () => {
		expect( readFileSync( AGENTS_PATH, 'utf8' ) ).toBe(
			renderAgentsMarkdown( catalog )
		);
	} );
} );

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
