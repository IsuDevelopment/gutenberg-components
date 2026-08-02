#!/usr/bin/env node
/**
 * `npx @isudev/gutenberg init` — makes this library's documentation discoverable to whatever
 * coding agent the consumer uses.
 *
 * The problem it solves: agents in Cursor, Copilot, Windsurf, Zed and friends do not index
 * `node_modules`, so shipping documentation inside the tarball is not enough on its own. This
 * copies the agent guide into the consumer's own tree and adds a pointer to the files those
 * agents *do* read — `AGENTS.md` first, since every one of them reads it, plus Cursor rules
 * and Copilot instructions when those directories already exist.
 *
 * Plain JavaScript on purpose: this runs on the consumer's Node, which may predate the
 * type stripping the rest of this package's tooling relies on.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const manifest = JSON.parse(
	readFileSync( path.join( PACKAGE_ROOT, 'package.json' ), 'utf8' )
);

const NAME = manifest.name;
const VERSION = manifest.version;
const SLUG = 'isudev-gutenberg';
const VENDOR_PATH = path.join( '.agents', 'vendor', `${ SLUG }.md` );
const BEGIN = `<!-- ${ SLUG }:begin -->`;
const END = `<!-- ${ SLUG }:end -->`;

/**
 * Replaces the managed block in `source`, or appends one when it is not there yet. Anything
 * outside the markers is the consumer's and is never touched, so re-running is safe.
 */
function upsertBlock( source, block ) {
	const managed = `${ BEGIN }\n${ block }\n${ END }`;
	const start = source.indexOf( BEGIN );
	const end = source.indexOf( END );

	if ( start !== -1 && end > start ) {
		return `${ source.slice( 0, start ) }${ managed }${ source.slice(
			end + END.length
		) }`;
	}

	const separator = source.trim() === '' ? '' : '\n\n';

	return `${ source.trimEnd() }${ separator }${ managed }\n`;
}

function read( file ) {
	return existsSync( file ) ? readFileSync( file, 'utf8' ) : '';
}

function writeFile( file, contents ) {
	mkdirSync( path.dirname( file ), { recursive: true } );
	writeFileSync( file, contents );
}

/** The pointer written into every agent-instruction file. Deliberately short. */
function pointer() {
	return [
		`## ${ NAME }`,
		'',
		`This project uses \`${ NAME }\` for Gutenberg editor UI. Before writing block code`,
		`that touches components, controls, fields or hooks from it, read`,
		`[\`${ VENDOR_PATH }\`](./${ VENDOR_PATH.split( path.sep ).join( '/' ) }) — it lists`,
		'every public module, its narrowest import and where the full documentation for that',
		'module lives. Import from the narrowest subpath; never from `dist/`.',
		'',
		`Pinned to ${ NAME }@${ VERSION }. Refresh with \`npx ${ NAME } init\`.`,
	].join( '\n' );
}

function vendorContents() {
	const guide = readFileSync( path.join( PACKAGE_ROOT, 'AGENTS.md' ), 'utf8' );

	return [
		'<!-- Vendored from ' + NAME + '@' + VERSION + '. Do not edit.',
		'     Refresh with `npx ' + NAME + ' init` after upgrading the package. -->',
		'',
		guide,
	].join( '\n' );
}

function init( { check } ) {
	const cwd = process.cwd();
	const vendorFile = path.join( cwd, VENDOR_PATH );
	const expected = vendorContents();

	if ( check ) {
		if ( ! existsSync( vendorFile ) ) {
			process.stderr.write(
				`${ VENDOR_PATH } is missing. Run \`npx ${ NAME } init\`.\n`
			);
			process.exit( 1 );
		}

		if ( readFileSync( vendorFile, 'utf8' ) !== expected ) {
			process.stderr.write(
				`${ VENDOR_PATH } is out of date with ${ NAME }@${ VERSION }. Run \`npx ${ NAME } init\` and commit the result.\n`
			);
			process.exit( 1 );
		}

		process.stdout.write( `${ VENDOR_PATH } matches ${ NAME }@${ VERSION }.\n` );
		return;
	}

	const written = [];

	writeFile( vendorFile, expected );
	written.push( VENDOR_PATH );

	// Read natively by Codex, Cursor, Copilot, Windsurf, Zed, Junie, Aider and others, so it
	// is the one file always written.
	const agentsFile = path.join( cwd, 'AGENTS.md' );
	writeFile( agentsFile, upsertBlock( read( agentsFile ), pointer() ) );
	written.push( 'AGENTS.md' );

	// Tool-specific files are only touched when the project already uses that tool — this
	// should not be the thing that introduces a `.cursor/` directory to someone's repo.
	if ( existsSync( path.join( cwd, '.cursor', 'rules' ) ) ) {
		const rule = path.join( '.cursor', 'rules', `${ SLUG }.mdc` );
		writeFile(
			path.join( cwd, rule ),
			[
				'---',
				`description: How to use ${ NAME } components, controls, fields and hooks.`,
				'alwaysApply: false',
				'---',
				'',
				pointer(),
				'',
			].join( '\n' )
		);
		written.push( rule );
	}

	if ( existsSync( path.join( cwd, '.github' ) ) ) {
		const instructions = path.join( '.github', 'copilot-instructions.md' );
		const file = path.join( cwd, instructions );
		writeFile( file, upsertBlock( read( file ), pointer() ) );
		written.push( instructions );
	}

	process.stdout.write(
		`${ NAME }@${ VERSION } — wrote:\n${ written
			.map( ( file ) => `  ${ file }` )
			.join( '\n' ) }\n`
	);
}

function help() {
	process.stdout.write(
		[
			`${ NAME }@${ VERSION }`,
			'',
			'Usage:',
			`  npx ${ NAME } init            Make the module catalog discoverable to coding agents`,
			`  npx ${ NAME } init --check    Fail if the vendored catalog is missing or stale (CI)`,
			'',
			'`init` writes the agent guide to .agents/vendor/, adds a pointer to AGENTS.md, and',
			'updates .cursor/rules and .github/copilot-instructions.md when those already exist.',
			'Everything outside the managed markers is left alone, so it is safe to re-run.',
			'',
		].join( '\n' )
	);
}

const [ command, ...flags ] = process.argv.slice( 2 );

switch ( command ) {
	case 'init':
		init( { check: flags.includes( '--check' ) } );
		break;
	case undefined:
	case '-h':
	case '--help':
	case 'help':
		help();
		break;
	default:
		process.stderr.write( `Unknown command: ${ command }\n\n` );
		help();
		process.exit( 1 );
}
