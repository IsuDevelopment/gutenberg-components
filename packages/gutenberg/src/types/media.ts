/** Serializable media data suitable for a block attribute. */
export interface MediaValue {
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

/** Receives normalized media and the untouched WordPress selection object. */
export type MediaChangeHandler = (
	value: MediaValue,
	nativeMedia?: unknown
) => void;
