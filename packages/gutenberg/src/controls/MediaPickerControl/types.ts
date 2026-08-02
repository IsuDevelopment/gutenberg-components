import type { ReactElement, ReactNode } from 'react';
import type {
	MediaChangeHandler,
	MediaValue,
} from '../../types/index.js';

export interface MediaPickerRenderArgs {
	/** Opens the native WordPress media modal. No-op while disabled. */
	open: () => void;

	/** Whether the controlled value currently contains an attachment ID or URL. */
	hasMedia: boolean;

	/** Whether opening the media modal is disabled. */
	disabled: boolean;

	/** State-dependent action: select without media, replace with media. */
	action: 'select' | 'replace';
}

export interface MediaPickerControlProps {
	/** Current serializable media value. */
	value?: MediaValue;

	/** Receives normalized media plus the untouched WordPress selection. */
	onChange: MediaChangeHandler;

	/** Render prop receiving the native modal opener and current picker state. */
	children: ( args: MediaPickerRenderArgs ) => ReactElement | null;

	/** WordPress media types or MIME types allowed in the modal. Defaults to image. */
	allowedTypes?: string[];

	/** Preferred WordPress image rendition. Falls back to the selected/full URL. */
	imageSize?: string;

	/** Disable opening the modal. Defaults to false. */
	disabled?: boolean;

	/** Native media modal title. */
	title?: string;

	/** Native media modal class name. */
	modalClass?: string;

	/** Called whenever the native media modal closes. */
	onClose?: () => void;

	/** Rendered when the current user cannot upload media. Defaults to null. */
	fallback?: ReactNode;
}
