import type {
	MediaActionsConfig,
	MediaActionVisibility,
	MediaValue,
} from '../../types/index.js';

function isRecord( value: unknown ): value is Record< string, unknown > {
	return Boolean( value ) && typeof value === 'object' && ! Array.isArray( value );
}

function stringValue( value: unknown ): string | undefined {
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numberValue( value: unknown ): number | undefined {
	return typeof value === 'number' && Number.isFinite( value )
		? value
		: undefined;
}

function inferMediaType(
	type: string | undefined,
	mime: string | undefined
): string | undefined {
	if ( type && type !== 'file' ) {
		return type;
	}

	return mime?.includes( '/' ) ? mime.split( '/' )[ 0 ] : type;
}

/** Converts a native WordPress selection into a small serializable media value. */
export function normalizeMediaValue(
	media: unknown,
	imageSize?: string
): MediaValue {
	if ( ! isRecord( media ) ) {
		return {};
	}

	const sizes = isRecord( media.sizes ) ? media.sizes : undefined;
	const rendition =
		imageSize && sizes && isRecord( sizes[ imageSize ] )
			? sizes[ imageSize ]
			: undefined;
	const mime = stringValue( media.mime_type ) ?? stringValue( media.mime );
	const type = inferMediaType(
		stringValue( media.media_type ) ?? stringValue( media.type ),
		mime
	);

	return {
		source: 'attachment',
		id: numberValue( media.id ),
		url:
			stringValue( rendition?.url ) ??
			stringValue( media.source_url ) ??
			stringValue( media.url ),
		type,
		mime,
		alt: stringValue( media.alt_text ) ?? stringValue( media.alt ),
		width: numberValue( rendition?.width ) ?? numberValue( media.width ),
		height: numberValue( rendition?.height ) ?? numberValue( media.height ),
	};
}

/** True when a media value identifies or directly references media. */
export function hasMediaValue( value: MediaValue = {} ): boolean {
	return Boolean( value.id || value.url );
}

/** Resolves default-visible select, replace and remove actions. */
export function resolveMediaActions(
	actions: MediaActionsConfig = {}
): Required< MediaActionVisibility > {
	if ( actions === false ) {
		return { select: false, replace: false, remove: false };
	}

	return {
		select: actions.select ?? true,
		replace: actions.replace ?? true,
		remove: actions.remove ?? true,
	};
}
