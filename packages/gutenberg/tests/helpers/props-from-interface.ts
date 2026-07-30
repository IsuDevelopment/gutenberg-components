import { readFileSync } from 'node:fs';
import ts from 'typescript';

/**
 * Property names declared on an interface, read from the TypeScript AST.
 *
 * Uses the compiler API rather than a regex because optional markers, generics and
 * multi-line types make interface members genuinely hard to match textually, and a false
 * negative here would let documentation drift silently.
 */
export function propsFromInterface(
	filePath: string,
	interfaceName: string
): string[] {
	const source = ts.createSourceFile(
		filePath,
		readFileSync( filePath, 'utf8' ),
		ts.ScriptTarget.Latest,
		true
	);

	const names: string[] = [];

	const visit = ( node: ts.Node ): void => {
		if (
			ts.isInterfaceDeclaration( node ) &&
			node.name.text === interfaceName
		) {
			// Only the interface's own members are walked, so an `extends` clause would
			// quietly shrink the set being compared and turn the drift guard into false
			// confidence — a green test documenting one prop out of ten. Fail loudly instead.
			if ( node.heritageClauses?.length ) {
				throw new Error(
					`Interface "${ interfaceName }" in ${ filePath } uses extends; inherited members are not collected. Flatten the interface or handle the inherited props explicitly in the test.`
				);
			}

			for ( const member of node.members ) {
				if ( ts.isPropertySignature( member ) && member.name ) {
					names.push( member.name.getText( source ) );
				}
			}
		}

		ts.forEachChild( node, visit );
	};

	visit( source );

	if ( names.length === 0 ) {
		throw new Error(
			`No properties found for interface "${ interfaceName }" in ${ filePath }`
		);
	}

	return names;
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
