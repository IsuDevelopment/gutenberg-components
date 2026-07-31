import type { ReactElement } from 'react';
import type { MediaFocalPoint } from '../../types/index.js';
import type { MediaPreviewProps } from './types.js';

/** Converts normalized focal coordinates to a safe CSS object-position value. */
export function getMediaObjectPosition(
	focalPoint?: MediaFocalPoint
): string | undefined {
	if (
		! focalPoint ||
		! Number.isFinite( focalPoint.x ) ||
		! Number.isFinite( focalPoint.y )
	) {
		return undefined;
	}

	const x = Math.min( 1, Math.max( 0, focalPoint.x ) ) * 100;
	const y = Math.min( 1, Math.max( 0, focalPoint.y ) ) * 100;

	return `${ x }% ${ y }%`;
}

/** Renders a serializable image or video value without reading editor stores. */
export function MediaPreview( {
	value = {},
	focalPoint,
	aspectRatio,
	objectFit = 'cover',
	width = '100%',
	height,
	style,
	className,
	imageProps,
	videoProps,
	emptyFallback = null,
	unsupportedFallback = null,
}: MediaPreviewProps ): ReactElement | null {
	if ( ! value.url ) {
		return <>{ emptyFallback }</>;
	}

	const mediaStyle = {
		display: 'block',
		aspectRatio,
		objectFit,
		objectPosition: getMediaObjectPosition( focalPoint ),
		width,
		height,
		...style,
	};

	if ( value.type === 'image' ) {
		return (
			<img
				{ ...imageProps }
				className={ className }
				style={ mediaStyle }
				src={ value.url }
				alt={ value.alt ?? '' }
			/>
		);
	}

	if ( value.type === 'video' ) {
		return (
			<video
				controls
				{ ...videoProps }
				className={ className }
				style={ mediaStyle }
				src={ value.url }
			/>
		);
	}

	return <>{ unsupportedFallback }</>;
}
