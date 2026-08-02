import type {
	CSSProperties,
	ImgHTMLAttributes,
	ReactNode,
	VideoHTMLAttributes,
} from 'react';
import type { MediaFocalPoint, MediaValue } from '../../types/index.js';

export interface MediaPreviewProps {
	/** Serializable media value to render. */
	value?: MediaValue;

	/** Focal point mapped to CSS `object-position`. */
	focalPoint?: MediaFocalPoint;

	/** CSS aspect ratio of the preview frame. */
	aspectRatio?: CSSProperties['aspectRatio'];

	/** CSS object-fit mode. Defaults to `cover`. */
	objectFit?: CSSProperties['objectFit'];

	/** CSS width. Defaults to `100%`. */
	width?: CSSProperties['width'];

	/** CSS height. */
	height?: CSSProperties['height'];

	/** Additional style applied to the rendered image or video. */
	style?: CSSProperties;

	/** Additional class name applied to the rendered media element. */
	className?: string;

	/** Props forwarded only when an image is rendered. */
	imageProps?: Omit< ImgHTMLAttributes< HTMLImageElement >, 'src' | 'alt' >;

	/** Props forwarded only when a video is rendered. */
	videoProps?: Omit< VideoHTMLAttributes< HTMLVideoElement >, 'src' >;

	/** Rendered when the media value has no URL. Defaults to null. */
	emptyFallback?: ReactNode;

	/** Rendered when the media type is not image or video. Defaults to null. */
	unsupportedFallback?: ReactNode;
}
