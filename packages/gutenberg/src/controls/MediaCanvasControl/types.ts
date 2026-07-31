import type { CSSProperties } from 'react';
import type { MediaPreviewProps } from '../../components/MediaPreview/index.js';
import type {
	MediaActionsConfig,
	MediaChangeHandler,
	MediaValue,
} from '../../types/index.js';
import type { MediaPickerControlProps } from '../MediaPickerControl/index.js';

export type MediaCanvasPickerProps = Omit<
	MediaPickerControlProps,
	'value' | 'onChange' | 'children'
>;

export interface MediaCanvasControlProps {
	/** Current serializable media value. */
	value?: MediaValue;

	/** Receives normalized selections and the untouched WordPress media object. */
	onChange: MediaChangeHandler;

	/** Optional remove handler. Defaults to `onChange( {} )`. */
	onRemove?: () => void;

	/** Select, replace and remove action visibility. All are enabled by default. */
	actions?: MediaActionsConfig;

	/** Label for selecting initial media. Defaults to `Select media`. */
	selectLabel?: string;

	/** Label for editing/replacing existing media. Defaults to `Replace media`. */
	replaceLabel?: string;

	/** Label for clearing existing media. Defaults to `Remove media`. */
	removeLabel?: string;

	/** Placeholder heading. Defaults to `Media`. */
	placeholderLabel?: string;

	/** Placeholder guidance. */
	placeholderInstructions?: string;

	/** Additional native picker options. */
	pickerProps?: MediaCanvasPickerProps;

	/** Additional preview options except the controlled media value. */
	previewProps?: Omit< MediaPreviewProps, 'value' >;

	/** Additional class name on the canvas wrapper. */
	className?: string;

	/** Additional style on the canvas wrapper. */
	style?: CSSProperties;
}
