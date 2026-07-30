import type { Breakpoint } from './types';

/**
 * Whether an attribute value counts as set.
 *
 * `0` and `false` are values — `columnGap: 0` is a legitimate setting and must not fall
 * through to an inherited value. This is the single place the rule is encoded.
 */
export function isPresent( raw: unknown ): boolean {
	return raw !== undefined && raw !== null && raw !== '';
}

/** The attribute name holding a given breakpoint's value. */
export function resolveAttrName(
	attrName: string,
	breakpoint: Breakpoint
): string {
	return breakpoint.isBase
		? attrName
		: `${ attrName }${ breakpoint.suffix ?? '' }`;
}

/**
 * Walks backwards from the active breakpoint to the base, returning the first value that
 * is present. With `skipActive`, the active breakpoint's own value is ignored — that is
 * the value a control should show as its placeholder.
 */
export function resolveCascade(
	attrName: string,
	breakpoints: Breakpoint[],
	activeId: string,
	attributes: Record< string, unknown >,
	options: { skipActive?: boolean } = {}
): unknown {
	const activeIndex = breakpoints.findIndex(
		( breakpoint ) => breakpoint.id === activeId
	);

	if ( activeIndex === -1 ) {
		return undefined;
	}

	const start = options.skipActive ? activeIndex - 1 : activeIndex;

	for ( let index = start; index >= 0; index-- ) {
		const raw =
			attributes[ resolveAttrName( attrName, breakpoints[ index ] ) ];

		if ( isPresent( raw ) ) {
			return raw;
		}
	}

	return undefined;
}

/**
 * Which breakpoints carry an override, for the switcher's indicator.
 *
 * The base is always `false`: it is not an override, it is the value being overridden.
 */
export function buildHasValueMap(
	attrName: string,
	breakpoints: Breakpoint[],
	attributes: Record< string, unknown >
): Record< string, boolean > {
	const map: Record< string, boolean > = {};

	for ( const breakpoint of breakpoints ) {
		map[ breakpoint.id ] =
			! breakpoint.isBase &&
			isPresent( attributes[ resolveAttrName( attrName, breakpoint ) ] );
	}

	return map;
}
