import type { IconType } from '@wordpress/components';
import type {
	LinkPickerControlProps,
	LinkValue,
} from '../LinkPickerControl/index.js';

export type BlockLinkControlPickerProps = Omit<
	LinkPickerControlProps,
	'value' | 'onChange' | 'onRemove' | 'children'
>;

export type BlockControlsGroup =
	| 'default'
	| 'block'
	| 'inline'
	| 'other'
	| 'parent';

export interface BlockLinkControlProps {
	/** Current serializable link value. */
	value?: LinkValue;

	/** Receives the normalized link value after picker changes. */
	onChange: ( value: LinkValue ) => void;

	/** Optional custom unlink handler. By default `onChange( {} )` is called. */
	onRemove?: () => void;

	/** Block toolbar group receiving the link actions. */
	group?: BlockControlsGroup;

	/** Disable both toolbar actions. */
	disabled?: boolean;

	/** Show a separate unlink action while a link exists. Defaults to false. */
	showUnlinkButton?: boolean;

	/** Accessible label used while no link exists. */
	addLabel?: string;

	/** Accessible label used while editing an existing link. */
	editLabel?: string;

	/** Accessible label for the unlink action. */
	unlinkLabel?: string;

	/** Icon used by the action while no link exists. */
	linkIcon?: IconType;

	/** Icon used by the action while a link exists. Defaults to a link with a pencil. */
	editIcon?: IconType;

	/** Icon used by the unlink action. */
	unlinkIcon?: IconType;

	/** Extra class name on the toolbar group. */
	toolbarGroupClassName?: string;

	/** Additional picker behavior and popover options. The native text field is enabled by default. */
	pickerProps?: BlockLinkControlPickerProps;
}
