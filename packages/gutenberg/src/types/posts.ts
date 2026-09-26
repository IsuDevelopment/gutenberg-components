/**
 * Snapshot fields that can be stored next to a post ID when `valueShape` is `'objects'`.
 */
export type PostSelectionField = 'title' | 'link' | 'type';

/**
 * One selected post in the `'objects'` value shape. Only `id` is guaranteed; the other
 * fields are present when listed in `fields`.
 */
export interface PostReference {
	id: number;
	/** Post type slug. */
	type?: string;
	/** Rendered title, HTML entities decoded. */
	title?: string;
	/** Permalink. */
	link?: string;
}

/**
 * The stored selection. The shape follows `valueShape` and `multiple`:
 *
 * - `'ids'` + multiple → `number[]`
 * - `'objects'` + multiple → `PostReference[]`
 * - single (`multiple: false`) → `number | PostReference | null`
 */
export type PostSelectionValue =
	| number[]
	| PostReference[]
	| number
	| PostReference
	| null;

/**
 * Hard constraints applied to every picker request. Never shown in the UI.
 */
export interface PostPickerQuery {
	/** Post statuses to list. Defaults to `['publish']`. */
	status?: string[];

	/**
	 * Term IDs per taxonomy slug, e.g. `{ category: [ 5 ] }`. Post types that do not have a
	 * constrained taxonomy are left out entirely — they cannot match.
	 */
	taxonomies?: Record< string, number[] >;

	/** Post IDs that can never be listed. */
	exclude?: number[];
}

/**
 * Sort order offered in the picker.
 */
export type PostPickerOrder = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

/**
 * Every translatable string of the post picker suite. `%s`/`%d` placeholders are filled
 * with `sprintf`.
 */
export interface PostPickerLabels {
	/** Modal title. */
	modalTitle: string;
	/** Search field label and placeholder. */
	search: string;
	/** Post type filter label. */
	postType: string;
	/** Post type option that lists every allowed type. */
	allTypes: string;
	/** Fallback taxonomy filter "all" option; `%s` is the taxonomy name. */
	allTerms: string;
	/** Sort field label. */
	order: string;
	newest: string;
	oldest: string;
	titleAsc: string;
	titleDesc: string;
	/** `%d` is the total number of matching posts. */
	tabAll: string;
	/** `%d` is the number of selected posts. */
	tabSelected: string;
	/** Footer counter with a maximum: `%1$d` selected, `%2$d` maximum. */
	selectedOfMax: string;
	/** Footer counter without a maximum: `%d` selected. */
	selectedCount: string;
	cancel: string;
	save: string;
	loadMore: string;
	noResults: string;
	noSelection: string;
	/** Trigger label while nothing is selected. */
	choose: string;
	/** Trigger label once something is selected. */
	change: string;
	/** Remove button label; `%s` is the post title. */
	remove: string;
	/** Drag handle label; `%s` is the post title. */
	reorder: string;
	/** Help text below a sortable list. */
	reorderHelp: string;
	/** Live-region announcement: `%1$d` new position, `%2$d` list length. */
	moved: string;
	/** Title shown for a post that no longer resolves; `%d` is its ID. */
	unavailable: string;
	/** Shown when a request fails. */
	error: string;
}

/**
 * Picker configuration shared by `PostPickerModal`, `PostPickerControl`,
 * `PostSelectorControl` and `MetaPostSelectorControl`.
 */
export interface PostPickerOptions {
	/** Allowed post type slugs. Defaults to every viewable REST-enabled type. */
	postTypes?: string[];

	/** Taxonomy slugs offered as filters once one post type is chosen. Defaults to all of that type's visible taxonomies. */
	taxonomies?: string[];

	/** Hard constraints applied to every request. */
	query?: PostPickerQuery;

	/** Leave the post being edited out of the results. Defaults to true. */
	excludeCurrentPost?: boolean;

	/** Maximum number of selected posts. Ignored when `multiple` is false. */
	max?: number;

	/** Allow more than one post. Defaults to true. */
	multiple?: boolean;

	/** Stored value shape. Defaults to `'ids'`. */
	valueShape?: 'ids' | 'objects';

	/** Snapshot fields stored with `valueShape: 'objects'`. Defaults to all three. */
	fields?: PostSelectionField[];

	/** Show featured image thumbnails. Defaults to true. */
	showFeaturedImage?: boolean;

	/** Posts per page and per post type. Defaults to 20. */
	perPage?: number;

	/** Overrides individual strings. */
	labels?: Partial< PostPickerLabels >;
}
