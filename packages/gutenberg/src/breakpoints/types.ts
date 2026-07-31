import type { ReactElement } from 'react';

/**
 * One breakpoint in a responsive set.
 *
 * Exactly one breakpoint in a set is the **base**: its attribute carries no suffix, and it
 * is the value every other breakpoint ultimately falls back to. There is deliberately no
 * separate "default" pseudo-breakpoint — the base *is* the default.
 */
export interface Breakpoint {
	/** Stable identifier, used as the switcher's value. */
	id: string;

	/** Human-readable label, shown in the dropdown and as the accessible name. */
	label: string;

	/**
	 * Icon element, e.g. from `@wordpress/icons`. Imported `ReactElement` rather than the
	 * global `JSX.Element`, which React 19's types remove.
	 */
	icon?: ReactElement;

	/** Marks the base breakpoint, whose attribute name carries no suffix. */
	isBase?: boolean;

	/** Attribute-name suffix for non-base breakpoints, e.g. `'Tablet'`. */
	suffix?: string;
}
