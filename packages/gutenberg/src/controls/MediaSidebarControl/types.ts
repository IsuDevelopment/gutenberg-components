import type { MediaFocalPointControlProps } from '../../components/MediaFocalPointControl/index.js';
import type { MediaPreviewProps } from '../../components/MediaPreview/index.js';
import type {
	MediaActionsConfig,
	MediaChangeHandler,
	MediaFocalPoint,
	MediaSourcesConfig,
	MediaValue,
} from '../../types/index.js';
import type { MediaSourceControlProps } from '../MediaSourceControl/index.js';

export type MediaSidebarPreview = false | 'media' | 'focal-point';

export type MediaSidebarPickerProps = Omit<
	MediaSourceControlProps,
	'value' | 'onChange' | 'onRemove' | 'sources' | 'variant' | 'children'
>;

export interface MediaSidebarControlProps {
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

	/** Sidebar preview mode. Defaults to `media`; false hides it entirely. */
	preview?: MediaSidebarPreview;

	/** Controlled focal point used by the `focal-point` preview. */
	focalPoint?: MediaFocalPoint;

	/** Enables and receives changes from the `focal-point` preview. */
	onFocalPointChange?: ( value: MediaFocalPoint | undefined ) => void;

	/** Inspector panel title. Defaults to `Media settings`. */
	title?: string;

	/** Whether the panel starts expanded. Defaults to true. */
	initialOpen?: boolean;

	/** Label for selecting initial media. Defaults to `Select media`. */
	selectLabel?: string;

	/** Label for editing/replacing existing media. Defaults to `Replace media`. */
	replaceLabel?: string;

	/** Label for clearing existing media. Defaults to `Remove media`. */
	removeLabel?: string;

	/** Additional native picker options. */
	pickerProps?: MediaSidebarPickerProps;

	/** Additional media preview options except the controlled value. */
	previewProps?: Omit< MediaPreviewProps, 'value' >;

	/** Additional focal-point options except controlled media/value/change props. */
	focalPointProps?: Omit<
		MediaFocalPointControlProps,
		'media' | 'value' | 'onChange'
	>;

	/** Additional class name on the generated PanelBody. */
	className?: string;
}
