import type { ReactElement } from 'react';
import { Button, FocalPointPicker } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { reset } from '@wordpress/icons';
import type { MediaFocalPointControlProps } from './types.js';

const CENTER = { x: 0.5, y: 0.5 };

/** Optional, standalone focal-point editor for image and video values. */
export function MediaFocalPointControl( {
	media = {},
	value,
	onChange,
	label = __( 'Focal point' ),
	help,
	hideLabelFromVision = false,
	autoPlay,
	showReset = true,
	resetLabel = __( 'Reset focal point' ),
	emptyFallback = null,
}: MediaFocalPointControlProps ): ReactElement | null {
	if (
		! media.url ||
		( media.type !== 'image' && media.type !== 'video' )
	) {
		return <>{ emptyFallback }</>;
	}

	return (
		<div>
			<FocalPointPicker
				url={ media.url }
				value={ value ?? CENTER }
				onChange={ onChange }
				label={ label }
				help={ help }
				hideLabelFromVision={ hideLabelFromVision }
				autoPlay={ autoPlay }
				__nextHasNoMarginBottom
			/>
			{ showReset && value && (
				<Button
					icon={ reset }
					variant="tertiary"
					onClick={ () => onChange( undefined ) }
				>
					{ resetLabel }
				</Button>
			) }
		</div>
	);
}
