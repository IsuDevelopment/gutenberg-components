import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import type { Breakpoint } from '../breakpoints';
import { useValidatedBreakpoints } from '../breakpoints';

export interface UseBreakpointOptions {
	/** Breakpoint selected on first render; defaults to the base breakpoint. */
	initial?: string;

	/** Breakpoint set; defaults to `DEFAULT_BREAKPOINTS`. */
	breakpoints?: Breakpoint[];

	/** Push the selection to the editor's device preview. */
	syncToEditor?: boolean;

	/** Follow the editor's device preview. */
	syncFromEditor?: boolean;
}

function capitalize( value: string ): string {
	return value.charAt( 0 ).toUpperCase() + value.slice( 1 );
}

/**
 * Owns the selected breakpoint, with optional two-way sync to the editor's device preview.
 *
 * Sync is opt-in per direction and off by default: editing a mobile value while looking at
 * the desktop canvas is a legitimate thing to want, so nothing is forced.
 *
 * This hook, not `BreakpointSwitcher`, is where store access lives — components must stay
 * free of it.
 */
export function useBreakpoint(
	options: UseBreakpointOptions = {}
): readonly [ string, ( id: string ) => void ] {
	const { syncToEditor = false, syncFromEditor = false } = options;
	const breakpoints = useValidatedBreakpoints( options.breakpoints );
	const base =
		breakpoints.find( ( item ) => item.isBase ) ?? breakpoints[ 0 ];

	const [ selected, setSelected ] = useState(
		options.initial ?? base.id
	);

	const editorDeviceType = useSelect(
		( select ) => {
			if ( ! syncFromEditor ) {
				return null;
			}

			const store = select( editorStore ) as {
				getDeviceType?: () => string | undefined;
			};

			return store.getDeviceType?.()?.toLowerCase() ?? null;
		},
		[ syncFromEditor ]
	);

	const { setDeviceType } = useDispatch( editorStore ) as {
		setDeviceType: ( deviceType: string ) => void;
	};

	useEffect( () => {
		if ( ! syncFromEditor || ! editorDeviceType ) {
			return;
		}

		if ( editorDeviceType === selected ) {
			return;
		}

		if ( breakpoints.some( ( item ) => item.id === editorDeviceType ) ) {
			setSelected( editorDeviceType );
		}
	}, [ syncFromEditor, editorDeviceType, selected, breakpoints ] );

	const setBreakpoint = useCallback(
		( id: string ) => {
			setSelected( id );

			if ( syncToEditor ) {
				setDeviceType( capitalize( id ) );
			}
		},
		[ syncToEditor, setDeviceType ]
	);

	return [ selected, setBreakpoint ] as const;
}
