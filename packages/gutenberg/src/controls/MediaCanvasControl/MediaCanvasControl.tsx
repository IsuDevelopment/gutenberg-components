import type { ReactElement } from 'react';
import { Placeholder, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { image, replace, trash } from '@wordpress/icons';
import { MediaPreview } from '../../components/MediaPreview/index.js';
import { hasMediaValue, resolveMediaActions } from '../MediaPickerControl/index.js';
import { MediaSourceControl } from '../MediaSourceControl/index.js';
import type { MediaCanvasControlProps } from './types.js';

/** Inline placeholder/preview with independently configurable media actions. */
export function MediaCanvasControl( {
	value = {},
	onChange,
	onRemove,
	actions,
	sources,
	placeholder = true,
	selectLabel = __( 'Select media' ),
	replaceLabel = __( 'Replace media' ),
	removeLabel = __( 'Remove media' ),
	placeholderLabel = __( 'Image' ),
	placeholderInstructions = __(
		'Drag and drop an image, upload, or choose from your library.'
	),
	pickerProps,
	previewProps,
	className,
	style,
}: MediaCanvasControlProps ): ReactElement {
	const visibleActions = resolveMediaActions( actions );
	const remove = () => ( onRemove ? onRemove() : onChange( {} ) );
	const hasMedia = hasMediaValue( value );

	if ( ! hasMedia ) {
		if ( ! placeholder ) {
			return <></>;
		}

		return (
			<Placeholder
				icon={ image }
				label={ placeholderLabel }
				instructions={ placeholderInstructions }
				className={ className }
			>
				{ visibleActions.select && (
					<MediaSourceControl
						{ ...pickerProps }
						value={ value }
						onChange={ onChange }
						sources={ sources }
						variant="buttons"
						labels={ {
							...pickerProps?.labels,
							select: selectLabel,
						} }
					/>
				) }
			</Placeholder>
		);
	}

	return (
		<div className={ className } style={ { position: 'relative', ...style } }>
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
						<MediaSourceControl
							{ ...pickerProps }
							value={ value }
							onChange={ onChange }
							onRemove={ visibleActions.remove ? remove : undefined }
							sources={ sources }
							variant="dropdown"
							labels={ {
								...pickerProps?.labels,
								replace: replaceLabel,
								remove: removeLabel,
							} }
						>
							{ ( { toggle, disabled, isOpen } ) => (
								<Button
									icon={ replace }
									label={ replaceLabel }
									variant="secondary"
									disabled={ disabled }
									isPressed={ isOpen }
									onClick={ toggle }
									showTooltip
								/>
							) }
						</MediaSourceControl>
					) }
					{ visibleActions.remove && ! visibleActions.replace && (
						<Button
							icon={ trash }
							label={ removeLabel }
							variant="secondary"
							isDestructive
							disabled={ pickerProps?.disabled }
							onClick={ remove }
							showTooltip
						/>
					) }
				</div>
			) }
		</div>
	);
}
