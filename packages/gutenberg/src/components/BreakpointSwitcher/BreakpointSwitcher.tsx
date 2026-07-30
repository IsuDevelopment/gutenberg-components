import type { ReactElement } from 'react';
import { __ } from '@wordpress/i18n';
import { useValidatedBreakpoints } from '../../breakpoints';
import { DropdownSwitcher } from './DropdownSwitcher';
import { InlineSwitcher } from './InlineSwitcher';
import type { BreakpointSwitcherProps } from './types';

/**
 * Switches which breakpoint a responsive setting is being edited for.
 *
 * A pure controlled component: it holds no state, reads no store and knows nothing about
 * block attributes. Pair it with `useBreakpoint` for selection state and
 * `useResponsiveAttribute` for values, or use `ResponsiveControl`, which wires all three.
 */
export function BreakpointSwitcher(
	props: BreakpointSwitcherProps
): ReactElement | null {
	const {
		value,
		onChange,
		variant = 'inline',
		hasValue = {},
		label = __( 'Breakpoint' ),
		hideLabelFromVision,
		className,
	} = props;

	const breakpoints = useValidatedBreakpoints( props.breakpoints );

	// A switcher with one option is noise, not a control.
	if ( breakpoints.length < 2 ) {
		return null;
	}

	if ( variant === 'dropdown' ) {
		return (
			<DropdownSwitcher
				value={ value }
				onChange={ onChange }
				breakpoints={ breakpoints }
				hasValue={ hasValue }
				label={ label }
				className={ className }
			/>
		);
	}

	return (
		<InlineSwitcher
			value={ value }
			onChange={ onChange }
			breakpoints={ breakpoints }
			hasValue={ hasValue }
			label={ label }
			hideLabelFromVision={ hideLabelFromVision }
			className={ className }
		/>
	);
}
