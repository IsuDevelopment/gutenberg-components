import type { ReactElement } from 'react';
// @ts-expect-error The package does not ship TypeScript declarations for this stable export.
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { media, replace, trash } from '@wordpress/icons';
import {
	MediaPickerControl,
	resolveMediaActions,
} from '../MediaPickerControl/index.js';
import type { MediaToolbarControlProps } from './types.js';

/** Adds state-aware select, replace and remove actions to BlockControls. */
export function MediaToolbarControl( {
	value = {},
	onChange,
	onRemove,
	actions,
	group = 'other',
	selectLabel = __( 'Select media' ),
	replaceLabel = __( 'Replace media' ),
	removeLabel = __( 'Remove media' ),
	toolbarGroupClassName,
	pickerProps,
}: MediaToolbarControlProps ): ReactElement {
	const visibleActions = resolveMediaActions( actions );
	const remove = () => ( onRemove ? onRemove() : onChange( {} ) );

	return (
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
					<BlockControls group={ group }>
						<ToolbarGroup className={ toolbarGroupClassName }>
							{ showPicker && (
								<ToolbarButton
									icon={ hasMedia ? replace : media }
									title={ hasMedia ? replaceLabel : selectLabel }
									disabled={ disabled }
									onClick={ open }
								/>
							) }
							{ showRemove && (
								<ToolbarButton
									icon={ trash }
									title={ removeLabel }
									disabled={ disabled }
									onClick={ remove }
								/>
							) }
						</ToolbarGroup>
					</BlockControls>
				);
			} }
		</MediaPickerControl>
	);
}
