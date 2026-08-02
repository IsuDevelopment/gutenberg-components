/**
 * The one reader for the colocated component documentation.
 *
 * Every agent-facing artifact in this repo is derived from `src/<category>/<Name>/README.md`
 * — the machine-readable `catalog.json`, the `AGENTS.md` shipped inside the npm tarball, and
 * the Starlight pages under `docs/`. Nothing here is a second source of truth: if a fact is
 * not in a colocated README it does not reach an agent.
 *
 * Runs on plain `node` — Node 22 strips the type annotations, so the generator needs no
 * build step and no dependency of its own. Keep it a single file with no relative imports:
 * type stripping does not rewrite specifiers, so `./x.js` would not resolve to `./x.ts`.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname( fileURLToPath( import.meta.url ) );

export const PACKAGE_ROOT = path.resolve( HERE, '..' );
export const SRC = path.join( PACKAGE_ROOT, 'src' );
export const CATALOG_PATH = path.join( PACKAGE_ROOT, 'catalog.json' );
export const AGENTS_PATH = path.join( PACKAGE_ROOT, 'AGENTS.md' );
export const PREAMBLE_PATH = path.join( HERE, 'agents-preamble.md' );

/**
 * The categories that make up the public module surface, in the order they are presented to
 * a reader. `bindings`, `breakpoints`, `types` and `utils` are deliberately absent: they are
 * documented in the package README as entry points, not as one-folder-per-module.
 */
export const CATEGORIES = [
	'components',
	'controls',
	'fields',
	'meta',
	'taxonomy',
	'hooks',
] as const;

export type Category = ( typeof CATEGORIES )[ number ];

export interface CatalogProp {
	name: string;
	type: string;
	default: string | null;
	required: boolean;
	description: string;
}

export interface CatalogModule {
	name: string;
	kind: string;
	category: Category;
	status: string;
	since: string;
	/** Narrowest supported import — bypasses the category barrel. */
	import: string;
	/** The category barrel, convenient when several related modules are used together. */
	categoryImport: string;
	/** Path to the colocated README, relative to the package root. */
	readme: string;
	summary: string;
	/** `null` when the README has no `## Props` table — hooks taking positional arguments. */
	props: CatalogProp[] | null;
}

export interface Catalog {
	package: string;
	version: string;
	generatedFrom: string;
	modules: CatalogModule[];
}

interface Frontmatter {
	data: Record< string, string >;
	body: string;
}

/**
 * Splits the leading `---` block off a README. The frontmatter this project writes is flat
 * `key: value` with optionally quoted values, so a full YAML parser would be a dependency
 * bought for nothing.
 */
export function parseFrontmatter( source: string ): Frontmatter {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec( source );

	if ( ! match ) {
		return { data: {}, body: source };
	}

	const data: Record< string, string > = {};

	for ( const line of match[ 1 ].split( /\r?\n/ ) ) {
		const separator = line.indexOf( ':' );

		if ( separator === -1 ) {
			continue;
		}

		const key = line.slice( 0, separator ).trim();
		const value = line
			.slice( separator + 1 )
			.trim()
			.replace( /^["']|["']$/g, '' );

		if ( key ) {
			data[ key ] = value;
		}
	}

	return { data, body: source.slice( match[ 0 ].length ) };
}

/** Returns the body of a `## <heading>` section, up to the next heading of the same level. */
export function sectionOf( body: string, heading: string ): string | null {
	const pattern = new RegExp( `^##\\s+${ heading }\\s*$`, 'm' );
	const afterHeading = body.split( pattern )[ 1 ];

	if ( afterHeading === undefined ) {
		return null;
	}

	return afterHeading.split( /^##\s+/m )[ 0 ].trim();
}

/**
 * Collapses the first paragraph of a section onto one line. READMEs are hard-wrapped, and a
 * summary that carries its wrapping into a table cell or a JSON string is unreadable.
 */
function firstParagraph( section: string ): string {
	return section.split( /\r?\n\s*\r?\n/ )[ 0 ].replace( /\s*\r?\n\s*/g, ' ' ).trim();
}

/**
 * Splits one markdown table row into cells. Pipes inside inline code are escaped as `\|` —
 * union types like `` `'inline' \| 'dropdown'` `` are common — so the split has to ignore
 * those.
 */
function splitRow( row: string ): string[] {
	return row
		.trim()
		.replace( /^\||\|$/g, '' )
		.split( /(?<!\\)\|/ )
		.map( ( cell ) => cell.trim() );
}

/** Strips the inline-code backticks a cell is written with, and normalizes escaped pipes. */
function cellText( cell: string ): string {
	return cell
		.replace( /^`|`$/g, '' )
		.replace( /\\\|/g, '|' )
		.trim();
}

/**
 * Parses the `## Props` table. Returns `null` when there is no such section: hooks that take
 * positional arguments or none at all have nothing to tabulate, and that is not a defect.
 */
export function parsePropsTable( body: string ): CatalogProp[] | null {
	const section = sectionOf( body, 'Props' );

	if ( section === null ) {
		return null;
	}

	const props: CatalogProp[] = [];

	for ( const line of section.split( /\r?\n/ ) ) {
		if ( ! line.trim().startsWith( '|' ) ) {
			continue;
		}

		const cells = splitRow( line );

		// Header row and the `| --- |` separator carry no prop.
		if ( cells.length < 5 || ! /^`[^`]+`$/.test( cells[ 0 ] ) ) {
			continue;
		}

		const name = cellText( cells[ 0 ] );

		// Hooks that take no arguments still render the table, with a single `—` row.
		if ( name === '—' ) {
			continue;
		}

		const defaultValue = cellText( cells[ 2 ] );

		props.push( {
			name,
			type: cellText( cells[ 1 ] ),
			default: defaultValue === '—' || defaultValue === '' ? null : defaultValue,
			required: /^yes$/i.test( cellText( cells[ 3 ] ) ),
			description: cells.slice( 4 ).join( ' | ' ).replace( /\\\|/g, '|' ).trim(),
		} );
	}

	return props;
}

/** Every module folder in a category that carries a README, in filesystem order. */
function moduleFolders( category: Category ): string[] {
	const categoryDir = path.join( SRC, category );

	if ( ! existsSync( categoryDir ) ) {
		return [];
	}

	return readdirSync( categoryDir, { withFileTypes: true } )
		.filter(
			( entry ) =>
				entry.isDirectory() &&
				existsSync( path.join( categoryDir, entry.name, 'README.md' ) )
		)
		.map( ( entry ) => entry.name )
		.sort();
}

export function readCatalog(): Catalog {
	const manifest = JSON.parse(
		readFileSync( path.join( PACKAGE_ROOT, 'package.json' ), 'utf8' )
	) as { name: string; version: string };

	const modules: CatalogModule[] = [];

	for ( const category of CATEGORIES ) {
		for ( const folder of moduleFolders( category ) ) {
			const readme = `src/${ category }/${ folder }/README.md`;
			const source = readFileSync( path.join( PACKAGE_ROOT, readme ), 'utf8' );
			const { data, body } = parseFrontmatter( source );

			if ( ! data.name ) {
				throw new Error(
					`${ readme } has no \`name\` in its frontmatter. Every module README needs name, entrypoint, kind, status and since.`
				);
			}

			const summarySection = sectionOf( body, 'Summary' );

			if ( summarySection === null ) {
				throw new Error(
					`${ readme } has no "## Summary" section. The catalog entry and the agent guide are generated from it.`
				);
			}

			modules.push( {
				name: data.name,
				kind: data.kind ?? 'module',
				category,
				status: data.status ?? 'stable',
				since: data.since ?? manifest.version,
				import: `${ manifest.name }/${ category }/${ folder }`,
				categoryImport: data.entrypoint ?? `${ manifest.name }/${ category }`,
				readme,
				summary: firstParagraph( summarySection ),
				props: parsePropsTable( body ),
			} );
		}
	}

	return {
		package: manifest.name,
		version: manifest.version,
		generatedFrom: 'src/<category>/<Name>/README.md',
		modules,
	};
}

const CATEGORY_HEADINGS: Record< Category, string > = {
	components: 'Components',
	controls: 'Controls',
	fields: 'Fields (advanced mode)',
	meta: 'Post meta (easy mode)',
	taxonomy: 'Taxonomy (easy mode)',
	hooks: 'Hooks',
};

/** Escapes the pipes in a cell so a summary containing one cannot break the table. */
function tableCell( text: string ): string {
	return text.replace( /\|/g, '\\|' );
}

export function renderAgentsMarkdown( catalog: Catalog ): string {
	const preamble = readFileSync( PREAMBLE_PATH, 'utf8' ).trimEnd();
	const sections: string[] = [];

	for ( const category of CATEGORIES ) {
		const modules = catalog.modules.filter(
			( module ) => module.category === category
		);

		if ( modules.length === 0 ) {
			continue;
		}

		const rows = modules.map( ( module ) => {
			const propCount =
				module.props === null ? '—' : String( module.props.length );

			return `| \`${ module.name }\` | ${ tableCell(
				module.summary
			) } | \`${ module.import }\` | ${ propCount } | \`${ module.readme }\` |`;
		} );

		sections.push(
			[
				`### ${ CATEGORY_HEADINGS[ category ] }`,
				'',
				'| Module | What it does | Narrowest import | Props | Full docs |',
				'| --- | --- | --- | --- | --- |',
				...rows,
			].join( '\n' )
		);
	}

	return [
		preamble,
		'',
		'## Module catalog',
		'',
		`\`${ catalog.package }@${ catalog.version }\` — ${ catalog.modules.length } public modules.`,
		'Read the listed `Full docs` file before using a module; it documents every prop,',
		'behaviour and example. The paths are relative to the package root, so from a consumer',
		`project they resolve as \`node_modules/${ catalog.package }/<path>\`.`,
		'',
		...sections.flatMap( ( section ) => [ section, '' ] ),
		'---',
		'',
		'<!-- Generated by scripts/catalog.ts from the colocated READMEs. Do not edit by hand:',
		'     run `npm run catalog` instead. The prose above lives in scripts/agents-preamble.md. -->',
		'',
	].join( '\n' );
}

function write(): void {
	const catalog = readCatalog();

	writeFileSync( CATALOG_PATH, `${ JSON.stringify( catalog, null, '\t' ) }\n` );
	writeFileSync( AGENTS_PATH, renderAgentsMarkdown( catalog ) );

	process.stdout.write(
		`Catalog: ${ catalog.modules.length } modules → catalog.json, AGENTS.md\n`
	);
}

/**
 * CI gate. The generated artifacts are committed so they are readable on GitHub and inside
 * the tarball without a build, which means they can drift; this fails the build when they do.
 */
function check(): void {
	const catalog = readCatalog();
	const stale: string[] = [];

	const expectedCatalog = `${ JSON.stringify( catalog, null, '\t' ) }\n`;
	const expectedAgents = renderAgentsMarkdown( catalog );

	if (
		! existsSync( CATALOG_PATH ) ||
		readFileSync( CATALOG_PATH, 'utf8' ) !== expectedCatalog
	) {
		stale.push( 'catalog.json' );
	}

	if (
		! existsSync( AGENTS_PATH ) ||
		readFileSync( AGENTS_PATH, 'utf8' ) !== expectedAgents
	) {
		stale.push( 'AGENTS.md' );
	}

	if ( stale.length > 0 ) {
		process.stderr.write(
			`Stale generated documentation: ${ stale.join(
				', '
			) }. Run \`npm run catalog\` and commit the result.\n`
		);
		process.exit( 1 );
	}

	process.stdout.write( 'Catalog is up to date.\n' );
}

const invokedDirectly =
	process.argv[ 1 ] !== undefined &&
	path.resolve( process.argv[ 1 ] ) === fileURLToPath( import.meta.url );

if ( invokedDirectly ) {
	if ( process.argv.includes( '--check' ) ) {
		check();
	} else {
		write();
	}
}
