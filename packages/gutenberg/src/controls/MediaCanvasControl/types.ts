import type { CSSProperties } from 'react';
import type { MediaPreviewProps } from '../../components/MediaPreview/index.js';
import type {
	MediaActionsConfig,
	MediaChangeHandler,
	MediaSourcesConfig,
	MediaValue,
} from '../../types/index.js';
import type { MediaSourceControlProps } from '../MediaSourceControl/index.js';

export type MediaCanvasPickerProps = Omit<
	MediaSourceControlProps,
	'value' | 'onChange' | 'onRemove' | 'sources' | 'variant' | 'children'
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

	/** Media-library, upload, URL, featured-image and drop-zone visibility. */
	sources?: MediaSourcesConfig;

	/** Render the native-style empty placeholder. Defaults to true. */
	placeholder?: boolean;

	/** Label for selecting initial media. Defaults to `Select media`. */
	selectLabel?: string;

	/** Label for editing/replacing existing media. Defaults to `Replace media`. */
	replaceLabel?: string;

	/** Label for clearing existing media. Defaults to `Remove media`. */
	removeLabel?: string;

	/** Placeholder heading. Defaults to `Image`. */
	placeholderLabel?: string;

	/** Placeholder guidance. */
	placeholderInstructions?: string;

	/** Additional media source and native picker options. */
	pickerProps?: MediaCanvasPickerProps;

	/** Additional preview options except the controlled media value. */
	previewProps?: Omit< MediaPreviewProps, 'value' >;

	/** Additional class name on the canvas wrapper. */
	className?: string;

	/** Additional style on the canvas wrapper. */
	style?: CSSProperties;
}
