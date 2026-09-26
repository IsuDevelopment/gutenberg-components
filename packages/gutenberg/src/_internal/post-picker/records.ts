import type { PostPickerOrder, PostReference } from '../../types/posts.js';

/**
 * Everything the picker needs to render one post row, derived from a REST record.
 */
export interface PostDisplay {
	id: number;
	type: string;
	title: string;
	link: string;
	/** Local post date as returned by REST (`YYYY-MM-DDTHH:mm:ss`). */
	date: string;
	/** First assigned term name, if any. */
	termName?: string;
	/** Thumbnail URL of the featured image, when embedded. */
	thumbnailUrl?: string;
}

const NAMED_ENTITIES: Record< string, string > = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	hellip: '…',
	ndash: '–',
	mdash: '—',
};

/**
 * Decodes the HTML entities WordPress puts in rendered titles. Only used when the raw title
 * is unavailable (view context); never produces markup.
 */
export function decodeEntities( text: string ): string {
	return text.replace(
		/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
		( match, entity: string ) => {
			if ( entity[ 0 ] === '#' ) {
				const code =
					entity[ 1 ].toLowerCase() === 'x'
						? parseInt( entity.slice( 2 ), 16 )
						: parseInt( entity.slice( 1 ), 10 );

				return Number.isFinite( code ) ? String.fromCodePoint( code ) : match;
			}

			return NAMED_ENTITIES[ entity.toLowerCase() ] ?? match;
		}
	);
}

/**
 * Maps a `wp/v2` post record (optionally with `_embedded` terms and featured media) to a
 * display row.
 */
export function toPostDisplay( record: any ): PostDisplay {
	const title =
		typeof record?.title?.raw === 'string'
			? record.title.raw
			: decodeEntities( record?.title?.rendered ?? '' );

	const terms: any[][] = record?._embedded?.[ 'wp:term' ] ?? [];
	const firstTerm = terms.find(
		( group ) => Array.isArray( group ) && group.length > 0
	)?.[ 0 ];

	const media = record?._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ];
	const thumbnailUrl: string | undefined =
		media?.media_details?.sizes?.thumbnail?.source_url ??
		media?.source_url ??
		undefined;

	return {
		id: record.id,
		type: record.type,
		title: title.trim(),
		link: record.link ?? '',
		date: record.date ?? '',
		...( firstTerm?.name ? { termName: decodeEntities( firstTerm.name ) } : {} ),
		...( thumbnailUrl ? { thumbnailUrl } : {} ),
	};
}

/**
 * Refreshes stored snapshots with live data wherever a display row is known.
 */
export function withDisplays(
	references: PostReference[],
	displays: Map< number, PostDisplay >
): PostReference[] {
	return references.map( ( reference ) => {
		const display = displays.get( reference.id );

		return display
			? {
					id: reference.id,
					type: display.type,
					title: display.title,
					link: display.link,
			  }
			: reference;
	} );
}

/**
 * REST `orderby`/`order` for a picker sort option.
 */
export function orderArgs( order: PostPickerOrder ): {
	orderby: 'date' | 'title';
	order: 'asc' | 'desc';
} {
	switch ( order ) {
		case 'oldest':
			return { orderby: 'date', order: 'asc' };
		case 'title-asc':
			return { orderby: 'title', order: 'asc' };
		case 'title-desc':
			return { orderby: 'title', order: 'desc' };
		default:
			return { orderby: 'date', order: 'desc' };
	}
}

/**
 * Client-side comparator matching the server order, so results fetched per post type can
 * be merged into one list. Ties fall back to the higher ID first.
 */
export function comparePosts( order: PostPickerOrder ) {
	const { orderby, order: direction } = orderArgs( order );
	const sign = direction === 'asc' ? 1 : -1;

	return ( a: PostDisplay, b: PostDisplay ): number => {
		const primary =
			orderby === 'date'
				? a.date.localeCompare( b.date )
				: a.title.localeCompare( b.title, undefined, {
						sensitivity: 'base',
				  } );

		return primary !== 0 ? primary * sign : b.id - a.id;
	};
}

/**
 * Merges per-type result lists into one sorted list of at most `limit` rows.
 *
 * Correct as long as every list holds at least its own top `limit` rows (or all of its
 * rows): any row in the global top `limit` is then necessarily in its own type's top
 * `limit`, so nothing outside the fetched pages can belong in the merged window.
 */
export function mergeResults(
	lists: PostDisplay[][],
	order: PostPickerOrder,
	limit: number
): PostDisplay[] {
	return lists.flat().sort( comparePosts( order ) ).slice( 0, limit );
}

/**
 * Formats a REST local date for display, e.g. "18 Sep 2026".
 */
export function formatPostDate( date: string, locale?: string ): string {
	if ( ! date ) {
		return '';
	}

	const parsed = new Date( date );

	if ( Number.isNaN( parsed.getTime() ) ) {
		return '';
	}

	try {
		return new Intl.DateTimeFormat( locale || undefined, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		} ).format( parsed );
	} catch {
		return parsed.toLocaleDateString();
	}
}
