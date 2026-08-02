import type {
	MediaSourcesConfig,
	MediaSourceVisibility,
} from '../../types/index.js';

/** Resolves default-visible media source switches. */
export function resolveMediaSources(
	sources: MediaSourcesConfig = {}
): Required< MediaSourceVisibility > {
	if ( sources === false ) {
		return {
			library: false,
			upload: false,
			url: false,
			featured: false,
			dropZone: false,
		};
	}

	return {
		library: sources.library ?? true,
		upload: sources.upload ?? true,
		url: sources.url ?? true,
		featured: sources.featured ?? true,
		dropZone: sources.dropZone ?? true,
	};
}

/** Creates a browser file-input accept value from Gutenberg media types. */
export function getMediaAccept(
	allowedTypes: string[],
	accept?: string
): string | undefined {
	if ( accept ) {
		return accept;
	}

	const values = allowedTypes.map( ( type ) =>
		type.includes( '/' ) ? type : `${ type }/*`
	);

	return values.length ? values.join( ',' ) : undefined;
}
