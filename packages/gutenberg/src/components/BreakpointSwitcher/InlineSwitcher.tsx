import type { ReactElement } from 'react';
import { sprintf, __ } from '@wordpress/i18n';
import type { Breakpoint } from '../../breakpoints';
import {
	ToggleGroupControl,
	ToggleGroupControlOptionIcon,
} from '../../_internal/wp-components';
import { IconWithOverrideDot } from './IconWithOverrideDot';

/**
 * Accessible name for one option. The base breakpoint never gains the "modified" suffix:
 * it is not an override, it is the value being overridden.
 */
export function optionLabel(
	breakpoint: Breakpoint,
	hasValue: Record< string, boolean >
): string {
	return ! breakpoint.isBase && hasValue[ breakpoint.id ]
		? sprintf(
				/* translators: %s: breakpoint label, e.g. Tablet. */
				__( '%s (modified)' ),
				breakpoint.label
		  )
		: breakpoint.label;
}

export function InlineSwitcher( {
	value,
	onChange,
	breakpoints,
	hasValue,
	label,
	hideLabelFromVision,
	className,
}: {
	value: string;
	onChange: ( id: string ) => void;
	breakpoints: Breakpoint[];
	hasValue: Record< string, boolean >;
	label: string;
	hideLabelFromVision?: boolean;
	className?: string;
} ): ReactElement {
	return (
		<ToggleGroupControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			className={ className }
			label={ label }
			hideLabelFromVision={ hideLabelFromVision }
			value={ value }
			onChange={ ( next?: string | number ) => {
				if ( next !== undefined ) {
					onChange( String( next ) );
				}
			} }
		>
			{ breakpoints.map( ( breakpoint ) => (
				<ToggleGroupControlOptionIcon
					key={ breakpoint.id }
					value={ breakpoint.id }
					label={ optionLabel( breakpoint, hasValue ) }
					icon={
						(
							! breakpoint.isBase && hasValue[ breakpoint.id ] ? (
								<IconWithOverrideDot icon={ breakpoint.icon } />
							) : (
								breakpoint.icon
							)
						) as ReactElement
					}
				/>
			) ) }
		</ToggleGroupControl>
	);
}
