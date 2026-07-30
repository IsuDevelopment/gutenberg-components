import type { ReactNode } from 'react';
import type { Breakpoint } from '../../breakpoints';
import type { UseResponsiveAttributeResult } from '../../hooks/useResponsiveAttribute';

export interface ResponsiveControlRenderArgs
	extends UseResponsiveAttributeResult {
	/** The breakpoint currently being edited. */
	breakpoint: string;
}

export interface ResponsiveControlProps {
	/** Base attribute name, e.g. `'columnGap'`. */
	attrName: string;

	/** The block's attributes. */
	attributes: Record< string, unknown >;

	/** The block's `setAttributes`. */
	setAttributes: ( next: Record< string, unknown > ) => void;

	/** Renders the actual control with resolved values. */
	children: ( args: ResponsiveControlRenderArgs ) => ReactNode;

	/** Visible label shown beside the switcher. */
	label?: string;

	/** Switcher layout. */
	variant?: 'inline' | 'dropdown';

	/** Breakpoint set; defaults to `DEFAULT_BREAKPOINTS`. */
	breakpoints?: Breakpoint[];

	/** Push breakpoint changes to the editor's device preview. */
	syncToEditor?: boolean;

	/** Follow the editor's device preview. */
	syncFromEditor?: boolean;

	/** Show a reset button when the active breakpoint has an override. */
	showReset?: boolean;

	/** Extra class name on the root element. */
	className?: string;
}
