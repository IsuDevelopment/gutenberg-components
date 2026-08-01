/** Origin of a selected media value. */
export type MediaSource = 'attachment' | 'url' | 'featured';

/** Serializable media data suitable for a block attribute. */
export interface MediaValue {
	/** How the media was selected. */
	source?: MediaSource;

	/** WordPress attachment ID. */
	id?: number;

	/** Selected media URL, including the requested image rendition when applicable. */
	url?: string;

	/** Broad media type such as `image` or `video`. */
	type?: string;

	/** MIME type such as `image/jpeg`. */
	mime?: string;

	/** Alternative text used by image previews. */
	alt?: string;

	/** Selected rendition width in pixels. */
	width?: number;

	/** Selected rendition height in pixels. */
	height?: number;
}

/** Focal point coordinates normalized to the inclusive 0–1 range. */
export interface MediaFocalPoint {
	x: number;
	y: number;
}

/** Visibility of the state-dependent actions rendered by a media surface. */
export interface MediaActionVisibility {
	/** Show the select action while no media exists. Defaults to true. */
	select?: boolean;

	/** Show the replace/edit action while media exists. Defaults to true. */
	replace?: boolean;

	/** Show the remove action while media exists. Defaults to true. */
	remove?: boolean;
}

/** `false` hides every action; an object overrides individual default-visible actions. */
export type MediaActionsConfig = false | MediaActionVisibility;

/** Visibility of media selection sources. */
export interface MediaSourceVisibility {
	/** Show the WordPress media library. Defaults to true. */
	library?: boolean;

	/** Show direct file upload. Defaults to true. */
	upload?: boolean;

	/** Show direct URL input. Defaults to true. */
	url?: boolean;

	/** Show the current post's featured image when one exists. Defaults to true. */
	featured?: boolean;

	/** Accept drag-and-drop uploads in the button/placeholder variant. Defaults to true. */
	dropZone?: boolean;
}

/** `false` hides every source; an object overrides individual default-visible sources. */
export type MediaSourcesConfig = false | MediaSourceVisibility;

/** Receives normalized media and the untouched WordPress selection object. */
export type MediaChangeHandler = (
	value: MediaValue,
	nativeMedia?: unknown
) => void;
