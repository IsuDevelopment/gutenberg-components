import type { ReactElement } from 'react';
// @ts-expect-error The package does not ship TypeScript declarations for this stable export.
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { media, replace, trash } from '@wordpress/icons';
import { hasMediaValue, resolveMediaActions } from '../MediaPickerControl/index.js';
import { MediaSourceControl } from '../MediaSourceControl/index.js';
import type { MediaToolbarControlProps } from './types.js';

/** Adds state-aware select, replace and remove actions to BlockControls. */
export function MediaToolbarControl( {
	value = {},
	onChange,
	onRemove,
	actions,
	sources,
	group = 'other',
	selectLabel = __( 'Select media' ),
	replaceLabel = __( 'Replace media' ),
	removeLabel = __( 'Remove media' ),
	toolbarGroupClassName,
	pickerProps,
}: MediaToolbarControlProps ): ReactElement {
	const visibleActions = resolveMediaActions( actions );
	const remove = () => ( onRemove ? onRemove() : onChange( {} ) );
	const hasMedia = hasMediaValue( value );
	const showPicker = hasMedia
		? visibleActions.replace
		: visibleActions.select;
	const showRemove = hasMedia && visibleActions.remove;

	if ( ! showPicker && ! showRemove ) {
		return <></>;
	}

	return (
		<BlockControls group={ group }>
			<ToolbarGroup className={ toolbarGroupClassName }>
				{ showPicker && (
					<MediaSourceControl
						{ ...pickerProps }
						value={ value }
						onChange={ onChange }
						onRemove={ showRemove ? remove : undefined }
						sources={ sources }
						variant="dropdown"
						labels={ {
							...pickerProps?.labels,
							select: selectLabel,
							replace: replaceLabel,
							remove: removeLabel,
						} }
					>
						{ ( { toggle, disabled, isOpen } ) => (
							<ToolbarButton
								icon={ hasMedia ? replace : media }
								title={ hasMedia ? replaceLabel : selectLabel }
								disabled={ disabled }
								isPressed={ isOpen }
								onClick={ toggle }
							/>
						) }
					</MediaSourceControl>
				) }
				{ showRemove && ! showPicker && (
					<ToolbarButton
						icon={ trash }
						title={ removeLabel }
						disabled={ pickerProps?.disabled }
						onClick={ remove }
					/>
				) }
			</ToolbarGroup>
		</BlockControls>
	);
}
