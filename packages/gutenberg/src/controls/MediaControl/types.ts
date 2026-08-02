import type {
	MediaChangeHandler,
	MediaFocalPoint,
	MediaSourcesConfig,
	MediaValue,
} from '../../types/index.js';
import type { MediaCanvasControlProps } from '../MediaCanvasControl/index.js';
import type { MediaSidebarControlProps } from '../MediaSidebarControl/index.js';
import type { MediaToolbarControlProps } from '../MediaToolbarControl/index.js';

export type MediaControlCanvasOptions = Omit<
	MediaCanvasControlProps,
	'value' | 'onChange' | 'onRemove'
>;

export type MediaControlToolbarOptions = Omit<
	MediaToolbarControlProps,
	'value' | 'onChange' | 'onRemove'
>;

export type MediaControlSidebarOptions = Omit<
	MediaSidebarControlProps,
	| 'value'
	| 'onChange'
	| 'onRemove'
	| 'focalPoint'
	| 'onFocalPointChange'
>;

export interface MediaControlProps {
	/** Current serializable media value. */
	value?: MediaValue;

	/** Receives normalized selections and the untouched WordPress media object. */
	onChange: MediaChangeHandler;

	/** Optional custom remove handler. Defaults to `onChange( {} )`. */
	onRemove?: () => void;

	/** Current focal point shared with the optional sidebar focal-point picker. */
	focalPoint?: MediaFocalPoint;

	/** Enables focal-point editing and receives focal-point changes. */
	onFocalPointChange?: ( value: MediaFocalPoint | undefined ) => void;

	/** Default allowed media types for every enabled location. Defaults to image. */
	allowedTypes?: string[];

	/** Default preferred image rendition for every enabled location. */
	imageSize?: string;

	/** Disable media selection and actions in every enabled location. Defaults to false. */
	disabled?: boolean;

	/** Default media-source visibility for every enabled location. */
	sources?: MediaSourcesConfig;

	/** Reset focal point when media identity changes or is removed. Defaults to false. */
	resetFocalPointOnChange?: boolean;

	/** Canvas configuration; false disables the complete inline surface. Enabled by default. */
	canvas?: false | MediaControlCanvasOptions;

	/** Toolbar configuration; false disables all toolbar media actions. Enabled by default. */
	toolbar?: false | MediaControlToolbarOptions;

	/** Sidebar configuration; false disables the complete inspector panel. Enabled by default. */
	sidebar?: false | MediaControlSidebarOptions;
}
