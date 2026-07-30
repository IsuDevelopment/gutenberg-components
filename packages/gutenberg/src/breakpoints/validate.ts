import { DEFAULT_BREAKPOINTS } from './defaults.js';
import type { Breakpoint } from './types.js';

/**
 * Returns a list of problems with a breakpoint set; empty means valid.
 *
 * Pure and exported so it can be unit-tested without rendering anything.
 */
export function validateBreakpoints( breakpoints: Breakpoint[] ): string[] {
	const errors: string[] = [];
	const bases = breakpoints.filter( ( breakpoint ) => breakpoint.isBase );

	if ( bases.length !== 1 ) {
		errors.push(
			`exactly one breakpoint must set isBase: true (found ${ bases.length })`
		);
	}

	// `resolveCascade` walks from the active breakpoint back to index 0, so a base anywhere
	// else is unreachable and every non-base breakpoint resolves to `undefined`.
	const baseIndex = breakpoints.findIndex( ( breakpoint ) => breakpoint.isBase );

	if ( baseIndex > 0 ) {
		errors.push(
			`the base breakpoint must be first (found "${ breakpoints[ baseIndex ].id }" at index ${ baseIndex })`
		);
	}

	const seenIds = new Set< string >();
	const seenSuffixes = new Set< string >();

	for ( const breakpoint of breakpoints ) {
		if ( seenIds.has( breakpoint.id ) ) {
			errors.push( `duplicate id "${ breakpoint.id }"` );
		}
		seenIds.add( breakpoint.id );

		if ( breakpoint.isBase ) {
			continue;
		}

		if ( ! breakpoint.suffix ) {
			errors.push( `breakpoint "${ breakpoint.id }" has no suffix` );
			continue;
		}

		if ( seenSuffixes.has( breakpoint.suffix ) ) {
			errors.push( `duplicate suffix "${ breakpoint.suffix }"` );
		}
		seenSuffixes.add( breakpoint.suffix );
	}

	return errors;
}

const warned = new Set< string >();

/**
 * Validates a caller-supplied set in development and falls back to the default set when it
 * is unusable. Warns once per distinct problem so a re-rendering editor does not flood the
 * console.
 */
export function useValidatedBreakpoints(
	breakpoints?: Breakpoint[]
): Breakpoint[] {
	if ( ! breakpoints ) {
		return DEFAULT_BREAKPOINTS;
	}

	const errors = validateBreakpoints( breakpoints );

	if ( errors.length === 0 ) {
		return breakpoints;
	}

	if ( process.env.NODE_ENV !== 'production' ) {
		const message = errors.join( '; ' );

		if ( ! warned.has( message ) ) {
			warned.add( message );
			// eslint-disable-next-line no-console
			console.warn(
				`[@isudev/gutenberg] Invalid breakpoints: ${ message }. Falling back to DEFAULT_BREAKPOINTS.`
			);
		}
	}

	return DEFAULT_BREAKPOINTS;
}
