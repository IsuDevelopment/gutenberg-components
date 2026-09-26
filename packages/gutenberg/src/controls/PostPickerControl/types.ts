import type { ReactElement } from 'react';
import type { PostPickerModalProps } from '../PostPickerModal/types.js';

export interface PostPickerRenderArgs {
	/** Opens the picker modal. No-op while disabled. */
	open: () => void;

	/** Whether the current value holds at least one post. */
	hasSelection: boolean;

	/** Number of posts in the current value. */
	count: number;

	/** Whether opening the modal is disabled. */
	disabled: boolean;
}

export interface PostPickerControlProps
	extends Omit< PostPickerModalProps, 'onClose' | 'className' > {
	/** Render prop receiving the opener and current selection state. */
	children: ( args: PostPickerRenderArgs ) => ReactElement | null;

	/** Disable opening the modal. Defaults to false. */
	disabled?: boolean;

	/** Class name added to the modal. */
	modalClassName?: string;

	/** Called whenever the modal closes, saved or not. */
	onClose?: () => void;
}
