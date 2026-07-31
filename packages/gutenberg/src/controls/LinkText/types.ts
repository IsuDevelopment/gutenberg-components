import type { IconType } from '@wordpress/components';
import type { ReactNode } from 'react';
import type {
	LinkPickerControlProps,
	LinkValue,
} from '../LinkPickerControl/index.js';

export type LinkTextPickerProps = Omit<
	LinkPickerControlProps,
	'value' | 'onChange' | 'onRemove' | 'children'
>;

export interface LinkTextProps {
	/** Current plain or formatted RichText content. */
	text?: string;

	/** Called when the editable text changes. */
	onTextChange: ( text: string ) => void;

	/** Current serializable link destination and settings. */
	link?: LinkValue;

	/** Called with the normalized link after picker changes. */
	onLinkChange: ( link: LinkValue ) => void;

	/** Optional custom unlink handler. By default the link is reset to `{}`. */
	onLinkRemove?: () => void;

	/** Placeholder shown while the text is empty. */
	placeholder?: string;

	/** Extra class name on the editable anchor. */
	className?: string;

	/** Accessible label. Falls back to the current text and then "Link text". */
	ariaLabel?: string;

	/** RichText format names allowed inside the link. Defaults to none. */
	allowedFormats?: string[];

	/** Prevent line breaks inside the link text. */
	disableLineBreaks?: boolean;

	/** Display an editor-only warning when text or a safe URL is missing. */
	showIncompleteWarning?: boolean;

	/** Accessible tooltip shown by the incomplete-link warning. */
	incompleteWarningText?: string;

	/** Additional content rendered next to the warning icon. */
	warningSuffix?: ReactNode;

	/** Additional picker behavior and popover options. */
	pickerProps?: LinkTextPickerProps;

	/** Additional props forwarded to RichText; controlled props always win. */
	richTextProps?: Record< string, unknown >;

	/** Show the native-style link action in `BlockControls`. */
	showToolbarButton?: boolean;

	/** Accessible title for the toolbar link action. */
	toolbarLabel?: string;

	/** Toolbar icon used while no link exists. */
	toolbarIcon?: IconType;

	/** Toolbar icon used while a link exists. Defaults to a link with a pencil. */
	toolbarEditIcon?: IconType;
}
