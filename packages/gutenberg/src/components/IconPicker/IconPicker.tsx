import { useId, useMemo, useState, type ReactElement } from 'react';
import { BaseControl, Button, SearchControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, resolveIcons } from '../Icon/index.js';
import type { IconPickerProps } from './types.js';

/** A searchable, keyboard-accessible grid of named icons. */
export function IconPicker( {
	value = '',
	onChange,
	defaultIcons = [],
	icons,
	label,
	searchable = true,
	searchLabel = __( 'Search icons' ),
	searchPlaceholder = __( 'Search icons' ),
	noResultsMessage = __( 'No icons found.' ),
	columns = 6,
	iconSize = 24,
	clearable = true,
	clearLabel = __( 'Clear icon' ),
	className,
	style,
}: IconPickerProps ): ReactElement {
	const id = useId();
	const [ search, setSearch ] = useState( '' );
	const resolvedIcons = useMemo(
		() => resolveIcons( defaultIcons, icons ),
		[ defaultIcons, icons ]
	);
	const filteredIcons = useMemo( () => {
		const query = search.trim().toLocaleLowerCase();

		if ( ! query ) {
			return resolvedIcons;
		}

		return resolvedIcons.filter( ( icon ) =>
			[ icon.name, icon.label ?? icon.name, ...( icon.keywords ?? [] ) ]
				.join( ' ' )
				.toLocaleLowerCase()
				.includes( query )
		);
	}, [ resolvedIcons, search ] );
	const safeColumns = Math.max( 1, Math.floor( columns ) || 1 );

	return (
		<BaseControl
			__nextHasNoMarginBottom
			id={ id }
			label={ label }
			className={ className }
		>
			<div style={ { display: 'grid', gap: 12, ...style } }>
				{ searchable && (
					<SearchControl
						value={ search }
						onChange={ setSearch }
						label={ searchLabel }
						placeholder={ searchPlaceholder }
					/>
				) }

				{ filteredIcons.length > 0 ? (
					<div
						role="group"
						aria-label={ label || __( 'Available icons' ) }
						style={ {
							display: 'grid',
							gridTemplateColumns: `repeat(${ safeColumns }, minmax(40px, 1fr))`,
							gap: 6,
						} }
					>
						{ filteredIcons.map( ( icon ) => {
							const isSelected = icon.name === value;

							return (
								<Button
									key={ icon.name }
									variant={ isSelected ? 'primary' : 'secondary' }
									isPressed={ isSelected }
									label={ icon.label ?? icon.name }
									showTooltip
									onClick={ () => onChange( icon.name ) }
									style={ {
										width: '100%',
										minWidth: 40,
										height: 40,
										padding: 7,
										justifyContent: 'center',
									} }
								>
									<Icon
										name={ icon.name }
										defaultIcons={ resolvedIcons }
										size={ iconSize }
									/>
								</Button>
							);
						} ) }
					</div>
				) : (
					<p role="status" style={ { margin: 0 } }>
						{ noResultsMessage }
					</p>
				) }

				{ clearable && (
					<Button
						variant="tertiary"
						disabled={ ! value }
						accessibleWhenDisabled
						onClick={ () => onChange( '' ) }
					>
						{ clearLabel }
					</Button>
				) }
			</div>
		</BaseControl>
	);
}
