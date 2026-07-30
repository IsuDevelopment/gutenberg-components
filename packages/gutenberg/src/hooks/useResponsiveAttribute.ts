import { useCallback, useMemo } from 'react';
import type { Breakpoint } from '../breakpoints';
import {
	buildHasValueMap,
	isPresent,
	resolveAttrName,
	resolveCascade,
	useValidatedBreakpoints,
} from '../breakpoints';

export interface UseResponsiveAttributeArgs {
	/** Base attribute name, e.g. `'columnGap'`. */
	attrName: string;

	/** Currently selected breakpoint id. */
	breakpoint: string;

	/** The block's attributes. */
	attributes: Record< string, unknown >;

	/** The block's `setAttributes`. */
	setAttributes: ( next: Record< string, unknown > ) => void;

	/** Breakpoint set; defaults to `DEFAULT_BREAKPOINTS`. */
	breakpoints?: Breakpoint[];
}

export interface UseResponsiveAttributeResult {
	/** Value set on the active breakpoint; `undefined` when it has no override. */
	value: unknown;

	/** Value inherited from ancestor breakpoints, ignoring the active one. */
	inheritedValue: unknown;

	/** `value` when set, otherwise `inheritedValue` — what the frontend would render. */
	resolvedValue: unknown;

	/** Whether the active breakpoint has its own value. */
	hasOwnValue: boolean;

	/** Per-breakpoint override flags, for the switcher's indicator. */
	hasValue: Record< string, boolean >;

	/** The attribute name currently being read and written. */
	attrNameForBreakpoint: string;

	/** Writes the active breakpoint's attribute. */
	onChange: ( next: unknown ) => void;

	/** Clears the active breakpoint's attribute. */
	reset: () => void;

	/** Clears every non-base breakpoint's attribute, keeping the base value. */
	resetAll: () => void;
}

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
