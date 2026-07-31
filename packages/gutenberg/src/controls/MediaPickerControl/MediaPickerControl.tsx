import type { ReactElement } from 'react';
// @ts-expect-error The package does not ship TypeScript declarations for these stable exports.
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { hasMediaValue, normalizeMediaValue } from './media-value.js';
import type {
	MediaPickerControlProps,
	MediaPickerRenderArgs,
} from './types.js';

/** Low-level render-prop adapter around WordPress' native media modal. */
export function MediaPickerControl( {
	value = {},
	onChange,
	children,
	allowedTypes = [ 'image' ],
	imageSize,
	disabled = false,
	title,
	modalClass,
	onClose,
	fallback = null,
}: MediaPickerControlProps ): ReactElement {
	const hasMedia = hasMediaValue( value );

	return (
		<MediaUploadCheck fallback={ fallback }>
			<MediaUpload
				value={ value.id }
				allowedTypes={ allowedTypes }
				title={ title }
				modalClass={ modalClass }
				onClose={ onClose }
				onSelect={ ( nativeMedia: unknown ) =>
					onChange(
						normalizeMediaValue( nativeMedia, imageSize ),
						nativeMedia
					) }
				render={ ( { open }: { open: () => void } ) => {
					const args: MediaPickerRenderArgs = {
						open: disabled ? () => undefined : open,
						hasMedia,
						disabled,
						action: hasMedia ? 'replace' : 'select',
					};

					return children( args );
				} }
			/>
		</MediaUploadCheck>
	);
}
