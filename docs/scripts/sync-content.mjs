/**
 * Projects the colocated component READMEs into Starlight's content collection.
 *
 * The library's READMEs stay the single source of truth — this script only reshapes them:
 * frontmatter is translated to Starlight's schema, and relative `README.md` links are
 * rewritten to site paths. Everything it writes under `src/content/docs/reference/` is
 * generated and gitignored; hand-written pages live beside it and are never touched.
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	CATEGORIES,
	PACKAGE_ROOT,
	SRC,
	parseFrontmatter,
	readCatalog,
} from '../../packages/gutenberg/scripts/catalog.ts';

const DOCS_ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const CONTENT_ROOT = path.join( DOCS_ROOT, 'src', 'content', 'docs' );
const REFERENCE_ROOT = path.join( CONTENT_ROOT, 'reference' );

const CATEGORY_TITLES = {
	components: 'Components',
	controls: 'Controls',
	fields: 'Fields',
	meta: 'Post meta',
	taxonomy: 'Taxonomy',
	hooks: 'Hooks',
};

const CATEGORY_DESCRIPTIONS = {
	components: 'Pure, props-only UI for breakpoints, colors, icons and media previews.',
	controls: 'Editor UI: responsive, link and modular media editing surfaces.',
	fields: 'Advanced mode — compose an options source with a value binding.',
	meta: 'Easy mode over a field, with the post meta binding pre-filled.',
	taxonomy: 'Easy mode over a field, with the taxonomy binding pre-filled.',
	hooks: 'Small, focused React hooks for building blocks.',
};

/** `MediaCanvasControl` → `media-canvas-control`, `useBreakpoint` → `use-breakpoint`. */
function slugify( name ) {
	return name
		.replace( /([a-z0-9])([A-Z])/g, '$1-$2' )
		.replace( /([A-Z]+)([A-Z][a-z])/g, '$1-$2' )
		.toLowerCase();
}

function pagePath( category, name ) {
	return `/reference/${ category }/${ slugify( name ) }/`;
}

/**
 * Rewrites the relative links the READMEs use between each other. They point at
 * `README.md` files on disk, which do not exist as such on the site.
 */
function rewriteLinks( body, readmeDir ) {
	return body.replace( /\]\(([^)\s]+README\.md)(#[^)\s]*)?\)/g, ( match, target, hash = '' ) => {
		const resolved = path.resolve( readmeDir, target );
		const relative = path.relative( SRC, resolved );

		if ( relative.startsWith( '..' ) ) {
			return match;
		}

		const segments = relative.split( path.sep );

		// <category>/<Name>/README.md
		if ( segments.length === 3 && CATEGORIES.includes( segments[ 0 ] ) ) {
			return `](${ pagePath( segments[ 0 ], segments[ 1 ] ) }${ hash })`;
		}

		// <category>/README.md — the category index.
		if ( segments.length === 2 && CATEGORIES.includes( segments[ 0 ] ) ) {
			return `](/reference/${ segments[ 0 ] }/${ hash })`;
		}

		return match;
	} );
}

function frontmatter( fields ) {
	return [
		'---',
		...Object.entries( fields ).map(
			( [ key, value ] ) => `${ key }: ${ JSON.stringify( value ) }`
		),
		'---',
		'',
	].join( '\n' );
}

function writePage( file, contents ) {
	mkdirSync( path.dirname( file ), { recursive: true } );
	writeFileSync( file, contents );
}

const catalog = readCatalog();

rmSync( REFERENCE_ROOT, { recursive: true, force: true } );

let pages = 0;

for ( const category of CATEGORIES ) {
	const modules = catalog.modules.filter( ( module ) => module.category === category );

	if ( modules.length === 0 ) {
		continue;
	}

	for ( const module of modules ) {
		const absoluteReadme = path.join( PACKAGE_ROOT, module.readme );
		const { body } = parseFrontmatter( readFileSync( absoluteReadme, 'utf8' ) );

		writePage(
			path.join( REFERENCE_ROOT, category, `${ slugify( module.name ) }.md` ),
			frontmatter( {
				title: module.name,
				description: module.summary,
			} ) + rewriteLinks( body, path.dirname( absoluteReadme ) ).trimStart()
		);
		pages += 1;
	}

	// A category may ship a hand-written index (`src/hooks/README.md` does). Use it when it
	// is there, and always append the generated table so the index cannot go stale.
	const categoryReadme = path.join( SRC, category, 'README.md' );
	const intro = existsSync( categoryReadme )
		? rewriteLinks(
				parseFrontmatter( readFileSync( categoryReadme, 'utf8' ) ).body,
				path.join( SRC, category )
		  ).trimStart()
		: '';

	const table = [
		'## Modules',
		'',
		'| Module | What it does | Narrowest import |',
		'| --- | --- | --- |',
		...modules.map(
			( module ) =>
				`| [\`${ module.name }\`](${ pagePath( category, module.name ) }) | ${ module.summary.replace(
					/\|/g,
					'\\|'
				) } | \`${ module.import }\` |`
		),
		'',
	].join( '\n' );

	writePage(
		path.join( REFERENCE_ROOT, category, 'index.md' ),
		frontmatter( {
			title: CATEGORY_TITLES[ category ],
			description: CATEGORY_DESCRIPTIONS[ category ],
		} ) +
			( intro ? `${ intro }\n\n` : '' ) +
			table
	);
	pages += 1;
}

// The agent guide is part of the published docs: it is what `llms.txt` consumers and
// human readers alike should land on when they ask "how do I use this library".
writePage(
	path.join( CONTENT_ROOT, 'agents.md' ),
	frontmatter( {
		title: 'Guide for coding agents',
		description:
			'The module catalog and usage rules shipped inside the npm tarball as AGENTS.md.',
	} ) +
		rewriteLinks(
			readFileSync( path.join( PACKAGE_ROOT, 'AGENTS.md' ), 'utf8' ).replace(
				/^#\s+.*\n/,
				''
			),
			PACKAGE_ROOT
		).trimStart()
);
pages += 1;

// Served verbatim so tooling can fetch the machine-readable catalog from the docs site.
mkdirSync( path.join( DOCS_ROOT, 'public' ), { recursive: true } );
cpSync(
	path.join( PACKAGE_ROOT, 'catalog.json' ),
	path.join( DOCS_ROOT, 'public', 'catalog.json' )
);

process.stdout.write( `Synced ${ pages } pages from the colocated READMEs.\n` );
