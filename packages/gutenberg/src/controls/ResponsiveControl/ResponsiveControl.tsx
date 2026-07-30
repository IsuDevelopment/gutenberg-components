import type { ReactElement } from 'react';
import { BaseControl, Button, Flex, FlexItem } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { BreakpointSwitcher } from '../../components/BreakpointSwitcher/index.js';
import { useBreakpoint } from '../../hooks/useBreakpoint/index.js';
import { useResponsiveAttribute } from '../../hooks/useResponsiveAttribute/index.js';
import type { ResponsiveControlProps } from './types.js';

/**
 * Makes any control responsive.
 *
 * Owns the breakpoint selection, resolves the value for that breakpoint, and hands both to
 * a render prop. A render prop rather than `cloneElement` because the value prop is not
 * named consistently across `@wordpress/components` — `SelectControl` uses `value`,
 * `RadioControl` uses `selected`, `ToggleControl` uses `checked` — so cloning would have to
 * guess. Explicit wiring is also type-safe.
 */
export function ResponsiveControl(
	props: ResponsiveControlProps
): ReactElement {
	const {
		attrName,
		attributes,
		setAttributes,
		children,
		label,
		variant = 'inline',
		breakpoints,
		syncToEditor,
		syncFromEditor,
		showReset = true,
		className,
	} = props;

	const [ breakpoint, setBreakpoint ] = useBreakpoint( {
		breakpoints,
		syncToEditor,
		syncFromEditor,
	} );

	const responsive = useResponsiveAttribute( {
		attrName,
		breakpoint,
		attributes,
		setAttributes,
		breakpoints,
	} );

	// `hasValue`, not `hasOwnValue`: the base breakpoint's own value is the thing being
	// overridden, not an override, so its entry in the map is always `false` while
	// `hasOwnValue` would be `true` whenever the base has a value at all.
	const activeHasOverride = responsive.hasValue[ breakpoint ] ?? false;

	// `BaseControl.VisualLabel` is not programmatically associated with anything, so the
	// switcher and the reset button would otherwise be named "Breakpoint" and "Reset" in
	// every instance. Two ResponsiveControls in one panel then sound identical to a screen
	// reader, so fold the visible label into both accessible names when there is one.
	const switcherLabel = label
		? sprintf(
				/* translators: %s: the setting's label, e.g. Column Gap. */
				__( 'Breakpoint for %s' ),
				label
		  )
		: __( 'Breakpoint' );

	const resetLabel = label
		? sprintf(
				/* translators: %s: the setting's label, e.g. Column Gap. */
				__( 'Reset %s' ),
				label
		  )
		: __( 'Reset' );

	return (
		<div className={ className }>
			<Flex justify="space-between" align="center" gap={ 2 }>
				<FlexItem>
					{ label && (
						<BaseControl.VisualLabel>
							{ label }
						</BaseControl.VisualLabel>
					) }
				</FlexItem>
				<FlexItem>
					<BreakpointSwitcher
						variant={ variant }
						value={ breakpoint }
						onChange={ setBreakpoint }
						breakpoints={ breakpoints }
						hasValue={ responsive.hasValue }
						label={ switcherLabel }
						hideLabelFromVision
					/>
				</FlexItem>
			</Flex>

			{ children( { ...responsive, breakpoint } ) }

			{ showReset && activeHasOverride && (
				<Button
					size="small"
					variant="tertiary"
					aria-label={ resetLabel }
					onClick={ responsive.reset }
				>
					{ __( 'Reset' ) }
				</Button>
			) }
		</div>
	);
}
