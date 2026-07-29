import { defineConfig } from 'tsup';

/**
 * One entry per public subpath export so `dist/` mirrors `src/` and maps 1:1 to the
 * `exports` map in package.json. `@wordpress/*` and React are external (see decision
 * 0002) — the consumer's block build externalizes them to WordPress globals.
 */
export default defineConfig( {
	entry: {
		index: 'src/index.ts',
		'appenders/index': 'src/appenders/index.ts',
		'components/index': 'src/components/index.ts',
		'controls/index': 'src/controls/index.ts',
		'fields/index': 'src/fields/index.ts',
		'meta/index': 'src/meta/index.ts',
		'taxonomy/index': 'src/taxonomy/index.ts',
		'hooks/index': 'src/hooks/index.ts',
	},
	format: [ 'esm' ],
	dts: true,
	clean: true,
	sourcemap: true,
	treeshake: true,
	external: [ /^@wordpress\//, 'react', 'react-dom', 'react/jsx-runtime' ],
	esbuildOptions( options ) {
		options.jsx = 'automatic';
	},
} );
