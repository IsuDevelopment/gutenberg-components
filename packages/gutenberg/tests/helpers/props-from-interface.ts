import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const PACKAGE_ROOT = path.resolve( __dirname, '..', '..' );
const TSCONFIG_PATH = path.join( PACKAGE_ROOT, 'tsconfig.typecheck.json' );

let cachedProgram: ts.Program | undefined;

/**
 * The one `ts.Program` this helper shares across every case.
 *
 * Built from `tsconfig.typecheck.json` — the config that already covers both `src` and
 * `tests` — so the options and file set types are resolved under are exactly the ones
 * `npm run typecheck` uses. Creating a program is the expensive part of this helper, so it
 * happens once per process rather than once per case or, worse, once per property.
 */
function getProgram(): ts.Program {
	if ( cachedProgram ) {
		return cachedProgram;
	}

	const configFile = ts.readConfigFile( TSCONFIG_PATH, ts.sys.readFile );

	if ( configFile.error ) {
		throw new Error(
			`Could not read ${ TSCONFIG_PATH }: ${ ts.flattenDiagnosticMessageText(
				configFile.error.messageText,
				'\n'
			) }`
		);
	}

	// `parseJsonConfigFileContent` follows `extends`, so the base config's options apply too.
	const parsed = ts.parseJsonConfigFileContent(
		configFile.config,
		ts.sys,
		PACKAGE_ROOT,
		undefined,
		TSCONFIG_PATH
	);

	if ( parsed.errors.length ) {
		throw new Error(
			`Invalid compiler options in ${ TSCONFIG_PATH }: ${ parsed.errors
				.map( ( error ) =>
					ts.flattenDiagnosticMessageText( error.messageText, '\n' )
				)
				.join( '; ' ) }`
		);
	}

	cachedProgram = ts.createProgram( {
		rootNames: parsed.fileNames,
		options: parsed.options,
	} );

	return cachedProgram;
}

/**
 * The string literals making up a `Pick`/`Omit` key argument.
 *
 * Throws on anything that is not a literal or a union of literals: a key set this helper
 * cannot read exactly would make the resolved property set a guess, and a guess is the thing
 * this guard exists to prevent.
 */
function stringLiteralKeys(
	checker: ts.TypeChecker,
	keyType: ts.Type,
	context: string
): Set< string > {
	const parts = keyType.isUnion() ? keyType.types : [ keyType ];
	const keys = new Set< string >();

	for ( const part of parts ) {
		if ( ! part.isStringLiteral() ) {
			throw new Error(
				`${ context }: key type \`${ checker.typeToString(
					keyType
				) }\` is not a string literal or a union of them, so the resolved property set cannot be trusted.`
			);
		}

		keys.add( part.value );
	}

	return keys;
}

/**
 * Every named property of a type, following `extends` and utility types.
 *
 * `getPropertiesOfType` already flattens inheritance, including across files, and never
 * reports index signatures — those are pass-through escape hatches, not documentable props.
 *
 * The one thing it cannot answer on its own is `Omit`/`Pick` applied to a type carrying a
 * string index signature, as `FieldBindingProps` does for its pass-through props. There
 * `keyof T` widens to `string`, `Exclude< string, 'someKey' >` stays `string`, and the
 * utility type collapses to a bare index signature with no named members left to enumerate.
 * So when a type both has a string index signature and came from `Omit`/`Pick`, the names are
 * recovered from the alias' own type arguments and the key filter is applied by hand.
 */
function collectPropertyNames(
	checker: ts.TypeChecker,
	type: ts.Type,
	into: Set< string >,
	context: string
): void {
	for ( const property of checker.getPropertiesOfType( type ) ) {
		into.add( property.getName() );
	}

	const alias = type.aliasSymbol?.getName();
	const aliasArgs = type.aliasTypeArguments;
	const collapsedByIndexSignature = Boolean(
		checker.getIndexInfoOfType( type, ts.IndexKind.String )
	);

	if (
		collapsedByIndexSignature &&
		( alias === 'Omit' || alias === 'Pick' ) &&
		aliasArgs?.length === 2
	) {
		const source = new Set< string >();
		collectPropertyNames( checker, aliasArgs[ 0 ], source, context );

		const keys = stringLiteralKeys( checker, aliasArgs[ 1 ], context );

		for ( const name of source ) {
			const keep =
				alias === 'Omit' ? ! keys.has( name ) : keys.has( name );

			if ( keep ) {
				into.add( name );
			}
		}
	}

	if ( type.isClassOrInterface() ) {
		for ( const base of type.getBaseTypes() ?? [] ) {
			collectPropertyNames( checker, base, into, context );
		}
	}
}

/**
 * Property names of an interface, resolved through the TypeScript type checker.
 *
 * Going through a real `ts.Program` rather than a lone AST walk means the full property set
 * is visible: own members, members inherited via `extends`, members inherited from an
 * interface declared in another file, and members surviving an `Omit<>` or `Pick<>` in the
 * heritage clause. Index signatures are excluded — they describe pass-through props, which
 * have no name to document.
 *
 * What this still does NOT check: only the *set of prop names* is compared against the
 * README. A prop whose type changed, whose default changed, whose "Required" column is now
 * wrong, or whose description or examples went stale passes this guard untouched. Those need
 * a human reading the README, or a different guard.
 */
export function propsFromInterface(
	filePath: string,
	interfaceName: string
): string[] {
	const program = getProgram();
	const sourceFile = program.getSourceFile( filePath );

	if ( ! sourceFile ) {
		throw new Error(
			`${ filePath } is not part of the TypeScript program built from ${ TSCONFIG_PATH }`
		);
	}

	let declaration:
		| ts.InterfaceDeclaration
		| ts.TypeAliasDeclaration
		| undefined;

	const visit = ( node: ts.Node ): void => {
		if (
			( ts.isInterfaceDeclaration( node ) ||
				ts.isTypeAliasDeclaration( node ) ) &&
			node.name.text === interfaceName
		) {
			declaration = node;
		}

		ts.forEachChild( node, visit );
	};

	visit( sourceFile );

	if ( ! declaration ) {
		throw new Error(
			`No interface or type alias named "${ interfaceName }" in ${ filePath }`
		);
	}

	const checker = program.getTypeChecker();
	const symbol = checker.getSymbolAtLocation( declaration.name );

	if ( ! symbol ) {
		throw new Error(
			`Could not resolve a symbol for "${ interfaceName }" in ${ filePath }`
		);
	}

	const names = new Set< string >();

	collectPropertyNames(
		checker,
		checker.getDeclaredTypeOfSymbol( symbol ),
		names,
		`Interface "${ interfaceName }" in ${ filePath }`
	);

	// A guard that silently passes is worse than no guard: zero resolved properties would make
	// the comparison trivially agree with an empty README table.
	if ( names.size === 0 ) {
		throw new Error(
			`No properties found for interface "${ interfaceName }" in ${ filePath }`
		);
	}

	return [ ...names ];
}

/**
 * Property names documented in a README's `## Props` table, taken from the first
 * backticked cell of each row.
 */
export function propsFromReadme( filePath: string ): string[] {
	const markdown = readFileSync( filePath, 'utf8' );
	const afterHeading = markdown.split( /^##\s+Props\s*$/m )[ 1 ];

	if ( afterHeading === undefined ) {
		throw new Error( `No "## Props" section in ${ filePath }` );
	}

	const section = afterHeading.split( /^##\s+/m )[ 0 ];

	return [ ...section.matchAll( /^\|\s*`([^`]+)`/gm ) ].map(
		( match ) => match[ 1 ]
	);
}
