import { readdirSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'tsup';

const SRC = path.resolve( __dirname, 'src' );

/**
 * Every `index.ts` under src/ becomes a build entry, so dist/ mirrors src/ and the
 * wildcard `exports` in package.json resolve without enumerating anything. Adding a
 * component is therefore a matter of creating a folder — there is no second place to
 * forget. `_internal/` is skipped: it is private and is pulled in as a shared chunk by
 * whichever entries import it.
 */
function findEntries( root: string ): Record< string, string > {
	const entries: Record< string, string > = {};

	const walk = ( dir: string ): void => {
		for ( const dirent of readdirSync( dir, { withFileTypes: true } ) ) {
			const full = path.join( dir, dirent.name );

			if ( dirent.isDirectory() ) {
				if ( dirent.name !== '_internal' ) {
					walk( full );
				}
				continue;
			}

			if ( dirent.name === 'index.ts' || dirent.name === 'index.tsx' ) {
				const key = path
					.relative( root, full )
					.replace( /\\/g, '/' )
					.replace( /\.tsx?$/, '' );
				entries[ key ] = full;
			}
		}
	};

	walk( root );
	return entries;
}

export default defineConfig( {
	entry: findEntries( SRC ),
	format: [ 'esm' ],
	/**
	 * Declarations come from `tsc -p tsconfig.build.json`, not from tsup. tsup builds one
	 * rollup program per entry, which ran out of heap once every component folder became an
	 * entry; `tsc` types the package once. See the comment in tsconfig.build.json.
	 */
	dts: false,
	clean: true,
	sourcemap: true,
	treeshake: true,
	/**
	 * WordPress exposes most @wordpress/* packages as script globals, and
	 * DependencyExtractionWebpackPlugin maps bare imports onto them. A handful are NOT
	 * exposed that way and are meant to be bundled by the consumer's build — as of DEWP
	 * 6.50.0: admin-ui, dataviews, fields, grid, icons, interface, style-runtime, ui,
	 * undo-manager, views. We keep those as bare imports too, so the consumer bundles a
	 * single copy rather than us inlining one per entry point. Any package from that list
	 * we actually import must be declared a peer dependency — today only @wordpress/icons.
	 */
	external: [ /^@wordpress\//, 'react', 'react-dom', 'react/jsx-runtime' ],
	esbuildOptions( options ) {
		options.jsx = 'automatic';
	},
} );
