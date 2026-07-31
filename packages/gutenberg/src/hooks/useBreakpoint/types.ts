import type { Breakpoint } from '../../breakpoints/index.js';

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
