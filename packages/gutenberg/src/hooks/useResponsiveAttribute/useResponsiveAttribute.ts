import { useCallback, useMemo } from 'react';
import {
	buildHasValueMap,
	isPresent,
	resolveAttrName,
	resolveCascade,
	useValidatedBreakpoints,
} from '../../breakpoints/index.js';
import type {
	UseResponsiveAttributeArgs,
	UseResponsiveAttributeResult,
} from './types.js';

/**
 * Reads and writes one logical setting across a breakpoint set.
 *
 * Takes `attributes` and `setAttributes` directly rather than reaching into a store, which
 * keeps it usable outside a block context and trivially testable.
 */
export function useResponsiveAttribute(
	args: UseResponsiveAttributeArgs
): UseResponsiveAttributeResult {
	const { attrName, breakpoint, attributes, setAttributes } = args;
	const breakpoints = useValidatedBreakpoints( args.breakpoints );

	const active = useMemo( () => {
		return (
			breakpoints.find( ( item ) => item.id === breakpoint ) ??
			breakpoints.find( ( item ) => item.isBase ) ??
			breakpoints[ 0 ]
		);
	}, [ breakpoints, breakpoint ] );

	const attrNameForBreakpoint = resolveAttrName( attrName, active );
	const raw = attributes[ attrNameForBreakpoint ];
	const hasOwnValue = isPresent( raw );

	const inheritedValue = resolveCascade(
		attrName,
		breakpoints,
		active.id,
		attributes,
		{ skipActive: true }
	);

	const hasValue = useMemo(
		() => buildHasValueMap( attrName, breakpoints, attributes ),
		[ attrName, breakpoints, attributes ]
	);

	const onChange = useCallback(
		( next: unknown ) => {
			setAttributes( { [ attrNameForBreakpoint ]: next } );
		},
		[ setAttributes, attrNameForBreakpoint ]
	);

	const reset = useCallback( () => {
		setAttributes( { [ attrNameForBreakpoint ]: undefined } );
	}, [ setAttributes, attrNameForBreakpoint ] );

	const resetAll = useCallback( () => {
		const patch: Record< string, unknown > = {};

		for ( const item of breakpoints ) {
			if ( ! item.isBase ) {
				patch[ resolveAttrName( attrName, item ) ] = undefined;
			}
		}

		setAttributes( patch );
	}, [ setAttributes, breakpoints, attrName ] );

	return {
		value: hasOwnValue ? raw : undefined,
		inheritedValue,
		resolvedValue: hasOwnValue ? raw : inheritedValue,
		hasOwnValue,
		hasValue,
		attrNameForBreakpoint,
		onChange,
		reset,
		resetAll,
	};
}
