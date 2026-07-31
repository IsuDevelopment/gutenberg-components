import type { ReactElement } from 'react';
// @ts-expect-error The package does not ship TypeScript declarations for this stable export.
import { InspectorControls } from '@wordpress/block-editor';
import { Button, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { replace, trash } from '@wordpress/icons';
import { MediaFocalPointControl } from '../../components/MediaFocalPointControl/index.js';
import { MediaPreview } from '../../components/MediaPreview/index.js';
import {
	MediaPickerControl,
	resolveMediaActions,
} from '../MediaPickerControl/index.js';
import type { MediaSidebarControlProps } from './types.js';

/** Inspector media panel with optional preview, focal point and actions. */
export function MediaSidebarControl( {
	value = {},
	onChange,
	onRemove,
	actions,
	preview = 'media',
	focalPoint,
	onFocalPointChange,
	title = __( 'Media settings' ),
	initialOpen = true,
	selectLabel = __( 'Select media' ),
	replaceLabel = __( 'Replace media' ),
	removeLabel = __( 'Remove media' ),
	pickerProps,
	previewProps,
	focalPointProps,
	className,
}: MediaSidebarControlProps ): ReactElement {
	const visibleActions = resolveMediaActions( actions );
	const remove = () => ( onRemove ? onRemove() : onChange( {} ) );

	if (
		process.env.NODE_ENV !== 'production' &&
		preview === 'focal-point' &&
		! onFocalPointChange
	) {
		console.warn(
			'MediaSidebarControl: preview="focal-point" requires onFocalPointChange. Falling back to a static media preview.'
		);
	}

	return (
		<InspectorControls>
			<PanelBody
				title={ title }
				initialOpen={ initialOpen }
				className={ className }
			>
				{ preview === 'media' && value.url && (
					<div style={ { marginBottom: 16 } }>
						<MediaPreview value={ value } { ...previewProps } />
					</div>
				) }
				{ preview === 'focal-point' && onFocalPointChange && (
					<MediaFocalPointControl
						media={ value }
						value={ focalPoint }
						onChange={ onFocalPointChange }
						{ ...focalPointProps }
					/>
				) }
				{ preview === 'focal-point' && ! onFocalPointChange && value.url && (
					<div style={ { marginBottom: 16 } }>
						<MediaPreview value={ value } { ...previewProps } />
					</div>
				) }

				<MediaPickerControl
					{ ...pickerProps }
					value={ value }
					onChange={ onChange }
				>
					{ ( { open, hasMedia, disabled } ) => {
						const showPicker = hasMedia
							? visibleActions.replace
							: visibleActions.select;
						const showRemove = hasMedia && visibleActions.remove;

						if ( ! showPicker && ! showRemove ) {
							return null;
						}

						return (
							<div style={ { display: 'grid', gap: 8 } }>
								{ showPicker && (
									<Button
										icon={ hasMedia ? replace : undefined }
										variant="secondary"
										disabled={ disabled }
										onClick={ open }
										style={ { justifyContent: 'center', width: '100%' } }
									>
										{ hasMedia ? replaceLabel : selectLabel }
									</Button>
								) }
								{ showRemove && (
									<Button
										icon={ trash }
										variant="secondary"
										isDestructive
										disabled={ disabled }
										onClick={ remove }
										style={ { justifyContent: 'center', width: '100%' } }
									>
										{ removeLabel }
									</Button>
								) }
							</div>
						);
					} }
				</MediaPickerControl>
			</PanelBody>
		</InspectorControls>
	);
}
