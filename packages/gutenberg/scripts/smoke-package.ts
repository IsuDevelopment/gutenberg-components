/**
 * Resolves every public subpath out of the packed tarball, the way a consumer would.
 *
 * `attw` reports the six wildcard `exports` keys as `(wildcard)` and skips them, so the 22
 * per-module subpaths — `@isudev/gutenberg/controls/MediaControl` and friends, the ones
 * consumers actually write — are checked by nothing. That they work follows from `dist/`
 * mirroring `src/`, which is reasoning rather than a test: a component folder whose
 * declaration failed to emit, or one missing from the build entirely, would ship silently.
 *
 * The tarball is extracted into a temporary `node_modules` rather than installed. `npm
 * install` would auto-install the `@wordpress/*` peers, making a packaging check depend on
 * the network and on a few hundred megabytes of unrelated tree.
 *
 * Resolution runs in a child process whose entry file lives inside the temporary project, so
 * the specifiers resolve against that `node_modules` and are subject to the real `exports`
 * map. `import.meta.resolve` resolves without evaluating, which matters: these modules import
 * `@wordpress/*`, which is not there and is not supposed to be.
 */
import { execFileSync } from 'node:child_process';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	renameSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = path.resolve(
	path.dirname( fileURLToPath( import.meta.url ) ),
	'..'
);

interface CatalogModule {
	name: string;
	import: string;
	categoryImport: string;
	readme: string;
}

interface Catalog {
	package: string;
	version: string;
	modules: CatalogModule[];
}

interface ProbeResult {
	specifier: string;
	resolved?: string;
	error?: string;
}

function run( command: string, args: string[], cwd: string ): string {
	return execFileSync( command, args, {
		cwd,
		encoding: 'utf8',
		stdio: [ 'ignore', 'pipe', 'inherit' ],
	} );
}

const workspace = mkdtempSync( path.join( tmpdir(), 'isudev-smoke-' ) );

try {
	// `npm pack` runs prepack, so this exercises the same artifact `npm publish` would upload.
	// Its `--json` output is unusable here: prepack's own stdout — the generator, then tsup —
	// lands on the same stream. The destination directory is freshly created and empty, so
	// finding the tarball in it is both simpler and immune to whatever the build prints.
	run(
		'npm',
		[ 'pack', '--pack-destination', workspace ],
		PACKAGE_ROOT
	);

	const tarballs = readdirSync( workspace ).filter( ( entry ) =>
		entry.endsWith( '.tgz' )
	);

	if ( tarballs.length !== 1 ) {
		throw new Error(
			`Expected exactly one tarball in the pack destination, found ${ tarballs.length }.`
		);
	}

	const tarball = path.join( workspace, tarballs[ 0 ] );

	const installed = path.join(
		workspace,
		'node_modules',
		'@isudev',
		'gutenberg'
	);
	mkdirSync( path.dirname( installed ), { recursive: true } );
	run( 'tar', [ '-xzf', tarball, '-C', workspace ], workspace );
	renameSync( path.join( workspace, 'package' ), installed );

	// The catalog ships in the tarball, so the list of things to check comes from the
	// artifact under test rather than from the working tree.
	const catalog = JSON.parse(
		readFileSync( path.join( installed, 'catalog.json' ), 'utf8' )
	) as Catalog;

	const manifest = JSON.parse(
		readFileSync( path.join( installed, 'package.json' ), 'utf8' )
	) as { exports: Record< string, { types?: string; import?: string } > };

	const specifiers = [
		catalog.package,
		...new Set( catalog.modules.map( ( module ) => module.categoryImport ) ),
		...catalog.modules.map( ( module ) => module.import ),
	];

	writeFileSync(
		path.join( workspace, 'package.json' ),
		`${ JSON.stringify( { name: 'smoke', private: true, type: 'module' } ) }\n`
	);

	writeFileSync(
		path.join( workspace, 'probe.mjs' ),
		`const specifiers = ${ JSON.stringify( specifiers, null, '\t' ) };
const results = [];

for ( const specifier of specifiers ) {
	try {
		results.push( { specifier, resolved: import.meta.resolve( specifier ) } );
	} catch ( error ) {
		results.push( { specifier, error: error.message } );
	}
}

process.stdout.write( JSON.stringify( results ) );
`
	);

	const results = JSON.parse(
		run( process.execPath, [ 'probe.mjs' ], workspace )
	) as ProbeResult[];

	const failures: string[] = [];

	for ( const result of results ) {
		if ( result.error !== undefined || result.resolved === undefined ) {
			failures.push(
				`${ result.specifier } — does not resolve (${ result.error ?? 'no result' })`
			);
			continue;
		}

		const file = fileURLToPath( result.resolved );

		if ( ! existsSync( file ) ) {
			failures.push(
				`${ result.specifier } — resolves to a file that is not in the tarball: ${ path.relative(
					installed,
					file
				) }`
			);
			continue;
		}

		// `import.meta.resolve` uses the `import` condition, so the `types` condition beside
		// it is unverified. Expanding the wildcard is a string substitution rather than a
		// second resolution algorithm, and it catches the realistic failure: a component
		// folder for which `tsc` emitted no declaration.
		const declaration = file.replace( /\.js$/, '.d.ts' );

		if ( file.endsWith( '.js' ) && ! existsSync( declaration ) ) {
			failures.push(
				`${ result.specifier } — no type declaration beside ${ path.relative(
					installed,
					file
				) }`
			);
		}
	}

	// Every wildcard key must declare both conditions, or a whole category resolves for one
	// consumer and not the other.
	for ( const [ key, target ] of Object.entries( manifest.exports ) ) {
		if ( key.endsWith( '/*' ) && ( ! target.types || ! target.import ) ) {
			failures.push(
				`${ key } — wildcard export is missing its "types" or "import" condition`
			);
		}
	}

	if ( failures.length > 0 ) {
		process.stderr.write(
			`Package smoke test failed for ${ catalog.package }@${ catalog.version }:\n${ failures
				.map( ( failure ) => `  ${ failure }` )
				.join( '\n' ) }\n`
		);
		process.exit( 1 );
	}

	process.stdout.write(
		`Package smoke test: ${ results.length } public subpaths resolve from the tarball, each with declarations.\n`
	);
} finally {
	rmSync( workspace, { recursive: true, force: true } );
}
