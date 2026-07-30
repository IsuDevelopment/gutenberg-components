import type { ReactElement } from 'react';
import { DropdownMenu } from '@wordpress/components';
import type { Breakpoint } from '../../breakpoints/index.js';
import { optionLabel } from './InlineSwitcher.js';

/**
 * `DropdownMenu` is used rather than a hand-positioned overlay because its popover is
 * already iframe-aware and handles outside-click, focus return and Escape. The post editor
 * is iframed in WP 7.1 with no fallback, and a hand-rolled listener bound to the top-level
 * document would silently stop working there.
 */
export function DropdownSwitcher( {
	value,
	onChange,
	breakpoints,
	hasValue,
	label,
	className,
}: {
	value: string;
	onChange: ( id: string ) => void;
	breakpoints: Breakpoint[];
	hasValue: Record< string, boolean >;
	label: string;
	className?: string;
} ): ReactElement {
	const active =
		breakpoints.find( ( breakpoint ) => breakpoint.id === value ) ??
		breakpoints[ 0 ];

	return (
		<DropdownMenu
			className={ className }
			icon={ active.icon }
			label={ label }
			toggleProps={ { size: 'compact' } }
			controls={ breakpoints.map( ( breakpoint ) => ( {
				title: optionLabel( breakpoint, hasValue ),
				icon: breakpoint.icon,
				isActive: breakpoint.id === value,
				onClick: () => onChange( breakpoint.id ),
			} ) ) }
		/>
	);
}
