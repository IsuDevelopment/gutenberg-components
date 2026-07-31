import type { ReactElement } from 'react';
import { Placeholder, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { image, replace, trash } from '@wordpress/icons';
import { MediaPreview } from '../../components/MediaPreview/index.js';
import {
	MediaPickerControl,
	resolveMediaActions,
} from '../MediaPickerControl/index.js';
import type { MediaCanvasControlProps } from './types.js';

/** Inline placeholder/preview with independently configurable media actions. */
export function MediaCanvasControl( {
	value = {},
	onChange,
	onRemove,
	actions,
	selectLabel = __( 'Select media' ),
	replaceLabel = __( 'Replace media' ),
	removeLabel = __( 'Remove media' ),
	placeholderLabel = __( 'Media' ),
	placeholderInstructions = __( 'Choose an image or video from the media library.' ),
	pickerProps,
	previewProps,
	className,
	style,
}: MediaCanvasControlProps ): ReactElement {
	const visibleActions = resolveMediaActions( actions );
	const remove = () => ( onRemove ? onRemove() : onChange( {} ) );

	return (
		<MediaPickerControl
			{ ...pickerProps }
			value={ value }
			onChange={ onChange }
		>
			{ ( { open, hasMedia, disabled } ) => {
				if ( ! hasMedia ) {
					return (
						<Placeholder
							icon={ image }
							label={ placeholderLabel }
							instructions={ placeholderInstructions }
							className={ className }
						>
							{ visibleActions.select && (
								<Button
									variant="primary"
									disabled={ disabled }
									onClick={ open }
								>
									{ selectLabel }
								</Button>
							) }
						</Placeholder>
					);
				}

				return (
					<div
						className={ className }
						style={ { position: 'relative', ...style } }
					>
						<MediaPreview value={ value } { ...previewProps } />
						{ ( visibleActions.replace || visibleActions.remove ) && (
							<div
								style={ {
									position: 'absolute',
									top: 8,
									right: 8,
									display: 'flex',
									gap: 4,
									padding: 4,
									background: 'rgba(255, 255, 255, 0.92)',
									borderRadius: 2,
								} }
							>
								{ visibleActions.replace && (
									<Button
										icon={ replace }
										label={ replaceLabel }
										variant="secondary"
										disabled={ disabled }
										onClick={ open }
										showTooltip
									/>
								) }
								{ visibleActions.remove && (
									<Button
										icon={ trash }
										label={ removeLabel }
										variant="secondary"
										isDestructive
										disabled={ disabled }
										onClick={ remove }
										showTooltip
									/>
								) }
							</div>
						) }
					</div>
				);
			} }
		</MediaPickerControl>
	);
}
