import type { ReactNode } from 'react';
import type { MediaFocalPoint, MediaValue } from '../../types/index.js';

export interface MediaFocalPointControlProps {
	/** Image or video displayed by the focal-point picker. */
	media?: MediaValue;

	/** Controlled focal point. An undefined value uses the center. */
	value?: MediaFocalPoint;

	/** Receives focal-point changes; undefined means reset to the center. */
	onChange: ( value: MediaFocalPoint | undefined ) => void;

	/** Visible picker label. Defaults to `Focal point`. */
	label?: string;

	/** Optional help text below the picker. */
	help?: string;

	/** Hide the label visually while keeping it accessible. Defaults to false. */
	hideLabelFromVision?: boolean;

	/** Autoplay a video inside the picker. Defaults to true in WordPress. */
	autoPlay?: boolean;

	/** Show a reset button while a custom point exists. Defaults to true. */
	showReset?: boolean;

	/** Reset button label. Defaults to `Reset focal point`. */
	resetLabel?: string;

	/** Rendered when there is no supported media URL. Defaults to null. */
	emptyFallback?: ReactNode;
}
