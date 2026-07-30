import type { Breakpoint } from '../../breakpoints/index.js';

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
