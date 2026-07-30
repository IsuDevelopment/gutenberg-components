import type { Breakpoint } from '../../breakpoints/index.js';

export interface BreakpointSwitcherProps {
	/** Currently selected breakpoint id. */
	value: string;

	/** Called with the newly selected breakpoint id. */
	onChange: ( id: string ) => void;

	/** Layout: a always-visible row, or a button that opens a menu. */
	variant?: 'inline' | 'dropdown';

	/** Breakpoint set; defaults to `DEFAULT_BREAKPOINTS`. */
	breakpoints?: Breakpoint[];

	/** Which breakpoints carry an override, keyed by id. Drives the indicator. */
	hasValue?: Record< string, boolean >;

	/** Accessible name for the group or dropdown toggle. */
	label?: string;

	/** Show the label to screen readers only. */
	hideLabelFromVision?: boolean;

	/** Extra class name on the root element. */
	className?: string;
}
