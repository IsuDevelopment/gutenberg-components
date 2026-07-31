import { useRef, useState, type ReactElement } from 'react';
import {
	BaseControl,
	Button,
	ColorPalette,
	PanelRow,
	Popover,
	RangeControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ColorPopupColor, ColorPopupProps } from './types.js';

const EMPTY_COLOR: ColorPopupColor = { color: '', slug: '', name: '', alpha: 1 };

function resolveColor(
	newColor: string,
	colors: NonNullable< ColorPopupProps[ 'colors' ] >,
	alpha: number
): ColorPopupColor {
	if ( newColor === '' ) {
		return EMPTY_COLOR;
	}

	// The value may be a hex/rgb string or a palette slug — check both.
	const match =
		colors.find( ( entry ) => entry.color === newColor ) ??
		colors.find( ( entry ) => entry.slug === newColor );

	if ( match ) {
		return { ...match, alpha };
	}

	return { color: newColor, slug: '', name: '', alpha };
}

/**
 * A color picker that opens in a popover and always returns the full color object
 * (`{ color, name, slug }`), not just the hex value `ColorPalette` gives you.
 *
 * A pure controlled component: the `colors` it offers are a prop, never read from a store
 * or a theme.json lookup — see decision 0001. A caller that wants the theme palette by
 * default fetches it with `useSettings` and passes it in.
 */
export function ColorPopup( props: ColorPopupProps ): ReactElement {
	const {
		label,
		value,
		onChange,
		colors = [],
		enableAlpha = false,
		alpha = 1,
		popupLabel = __( 'Select Color' ),
		clearable = false,
		className,
	} = props;

	const [ isOpen, setIsOpen ] = useState( false );
	const anchorRef = useRef< HTMLButtonElement >( null );

	const selectedColor = resolveColor( value, colors, alpha );

	const handleColorChange = ( newColor: string | undefined ) => {
		if ( ! newColor ) {
			return;
		}
		onChange( resolveColor( newColor, colors, alpha ) );
	};

	const handleAlphaChange = ( newAlpha: number | undefined ) => {
		if ( ! value || newAlpha === undefined ) {
			return;
		}
		onChange( { ...selectedColor, alpha: newAlpha } );
	};

	return (
		<>
			<PanelRow>
				<Button
					ref={ anchorRef }
					variant="secondary"
					className={ className }
					onClick={ () => setIsOpen( ( open ) => ! open ) }
					style={ { width: '100%', justifyContent: 'flex-start' } }
				>
					<span
						aria-hidden="true"
						style={ {
							display: 'inline-block',
							width: '20px',
							height: '20px',
							borderRadius: '50%',
							border: '1px solid #ccc',
							marginRight: '8px',
							flexShrink: 0,
							background:
								selectedColor.color ||
								'#fff linear-gradient(-45deg, #0000 48%, #ddd 0, #ddd 52%, #0000 0)',
							opacity: enableAlpha ? selectedColor.alpha : 1,
						} }
					/>
					{ label }
				</Button>
			</PanelRow>

			{ isOpen && (
				<Popover
					placement="left-start"
					onClose={ () => setIsOpen( false ) }
					anchor={ anchorRef.current ?? undefined }
				>
					<VStack style={ { padding: '16px', width: '260px' } }>
						<BaseControl __nextHasNoMarginBottom label={ popupLabel } id="isudev-color-popup">
							<ColorPalette
								colors={ colors }
								value={ value }
								onChange={ handleColorChange }
								clearable={ false }
							/>
						</BaseControl>

						{ enableAlpha && (
							<RangeControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label={ __( 'Opacity' ) }
								value={ selectedColor.alpha ?? 1 }
								onChange={ handleAlphaChange }
								min={ 0 }
								max={ 1 }
								step={ 0.01 }
							/>
						) }

						{ clearable && (
							<Button
								variant="tertiary"
								disabled={ value === '' }
								onClick={ () => onChange( EMPTY_COLOR ) }
							>
								{ __( 'Clear' ) }
							</Button>
						) }
					</VStack>
				</Popover>
			) }
		</>
	);
}
