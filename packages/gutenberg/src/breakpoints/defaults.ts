import { desktop, mobile, tablet } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import type { Breakpoint } from './types';

/**
 * The conventional desktop-first set. Desktop is the base, so `columnGap` holds the
 * desktop value while `columnGapTablet` and `columnGapMobile` hold overrides — matching
 * the `max-width` media queries this ordering implies.
 *
 * Cascade order is array order: mobile falls back to tablet, then desktop.
 */
export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
	{ id: 'desktop', label: __( 'Desktop' ), icon: desktop, isBase: true },
	{ id: 'tablet', label: __( 'Tablet' ), icon: tablet, suffix: 'Tablet' },
	{ id: 'mobile', label: __( 'Mobile' ), icon: mobile, suffix: 'Mobile' },
];
