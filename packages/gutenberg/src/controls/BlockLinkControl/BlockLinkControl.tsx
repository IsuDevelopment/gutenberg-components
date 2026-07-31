import type { ReactElement } from 'react';
// @ts-expect-error The package does not ship TypeScript declarations for this stable export.
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { link, linkOff } from '@wordpress/icons';
import { EditLinkIcon } from '../../_internal/EditLinkIcon.js';
import { LinkPickerControl } from '../LinkPickerControl/index.js';
import type { BlockLinkControlProps } from './types.js';

/** Adds a link action and an optional unlink action to BlockControls. */
export function BlockLinkControl( {
	value = {},
	onChange,
	onRemove,
	group = 'default',
	disabled = false,
	showUnlinkButton = false,
	addLabel = __( 'Add link' ),
	editLabel = __( 'Edit link' ),
	unlinkLabel = __( 'Unlink' ),
	linkIcon = link,
	editIcon = EditLinkIcon,
	unlinkIcon = linkOff,
	toolbarGroupClassName,
	pickerProps,
}: BlockLinkControlProps ): ReactElement {
	return (
		<LinkPickerControl
			{ ...pickerProps }
			value={ value }
			onChange={ onChange }
			onRemove={ onRemove }
			hasTextControl={ pickerProps?.hasTextControl ?? true }
		>
			{ ( { anchorRef, open, remove, hasLink, isOpen } ) => (
				<BlockControls group={ group }>
					<ToolbarGroup className={ toolbarGroupClassName }>
						<ToolbarButton
							ref={ anchorRef }
							icon={ hasLink ? editIcon : linkIcon }
							title={ hasLink ? editLabel : addLabel }
							isActive={ isOpen }
							disabled={ disabled }
							aria-haspopup="dialog"
							aria-expanded={ isOpen }
							onClick={ open }
						/>

						{ showUnlinkButton && hasLink && (
							<ToolbarButton
								icon={ unlinkIcon }
								title={ unlinkLabel }
								disabled={ disabled }
								onClick={ remove }
							/>
						) }
					</ToolbarGroup>
				</BlockControls>
			) }
		</LinkPickerControl>
	);
}
