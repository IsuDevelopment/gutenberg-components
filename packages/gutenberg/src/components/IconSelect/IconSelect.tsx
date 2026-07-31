import { useMemo, type ReactElement } from 'react';
import { Button, Dropdown } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, resolveIcons } from '../Icon/index.js';
import { IconPicker } from '../IconPicker/index.js';
import type { IconSelectProps } from './types.js';

/** A selected-icon preview that opens IconPicker in a WordPress dropdown. */
export function IconSelect( {
	value = '',
	onChange,
	label,
	defaultIcons = [],
	icons,
	placeholder = __( 'Select icon' ),
	pickerLabel,
	searchable = true,
	searchLabel,
	searchPlaceholder,
	noResultsMessage,
	columns = 6,
	iconSize = 24,
	clearable = true,
	clearLabel,
	closeOnSelect = true,
	popoverPlacement = 'bottom-start',
	className,
	pickerClassName,
	style,
}: IconSelectProps ): ReactElement {
	const resolvedIcons = useMemo(
		() => resolveIcons( defaultIcons, icons ),
		[ defaultIcons, icons ]
	);
	const selectedIcon = resolvedIcons.find( ( icon ) => icon.name === value );
	const selectedLabel = selectedIcon?.label ?? selectedIcon?.name ?? placeholder;

	return (
		<Dropdown
			popoverProps={ {
				placement: popoverPlacement,
				animate: false,
				offset: 8,
				shift: true,
			} }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					variant="secondary"
					className={ className }
					aria-expanded={ isOpen }
					aria-haspopup="dialog"
					aria-label={ `${ label }: ${ selectedLabel }` }
					onClick={ onToggle }
					style={ {
						width: '100%',
						justifyContent: 'flex-start',
						gap: 8,
						...style,
					} }
				>
					<Icon
						name={ value }
						defaultIcons={ resolvedIcons }
						size={ iconSize }
					/>
					<span>{ selectedLabel }</span>
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<div style={ { width: 288, padding: 12 } }>
					<IconPicker
						value={ value }
						onChange={ ( name ) => {
							onChange( name );

							if ( closeOnSelect ) {
								onClose();
							}
						} }
						defaultIcons={ resolvedIcons }
						label={ pickerLabel }
						searchable={ searchable }
						searchLabel={ searchLabel }
						searchPlaceholder={ searchPlaceholder }
						noResultsMessage={ noResultsMessage }
						columns={ columns }
						iconSize={ iconSize }
						clearable={ clearable }
						clearLabel={ clearLabel }
						className={ pickerClassName }
					/>
				</div>
			) }
		/>
	);
}
