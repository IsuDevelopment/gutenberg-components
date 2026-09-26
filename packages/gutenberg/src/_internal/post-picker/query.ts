import type { PostPickerOrder } from '../../types/posts.js';
import { orderArgs } from './records.js';
import type { PickerTaxonomy, PickerType } from './usePickerTypes.js';

/** Term IDs per taxonomy slug. */
export type TermFilters = Record< string, number[] >;

const FIELDS = [ 'id', 'type', 'date', 'title', 'link', '_links', '_embedded' ];

/**
 * Combines hard term constraints with the filters picked in the UI. A taxonomy present in
 * both is narrowed to their intersection; an empty intersection means nothing can match,
 * signalled by `null`.
 */
export function mergeTermFilters(
	constraints: TermFilters = {},
	filters: TermFilters = {}
): TermFilters | null {
	const merged: TermFilters = { ...constraints };

	for ( const [ taxonomy, terms ] of Object.entries( filters ) ) {
		if ( ! terms.length ) {
			continue;
		}

		const constrained = merged[ taxonomy ];
		const next = constrained
			? terms.filter( ( term ) => constrained.includes( term ) )
			: terms;

		if ( ! next.length ) {
			return null;
		}

		merged[ taxonomy ] = next;
	}

	return merged;
}

interface TypeQueryArgs {
	search?: string;
	order: PostPickerOrder;
	status: string[];
	exclude: number[];
	termFilters: TermFilters;
	taxonomies: Map< string, PickerTaxonomy >;
	embedMedia: boolean;
}

/**
 * The page-independent `wp/v2` query for one post type, or `null` when the type cannot
 * match the term filters (it lacks one of the filtered taxonomies).
 */
export function buildTypeQuery(
	type: PickerType,
	{
		search,
		order,
		status,
		exclude,
		termFilters,
		taxonomies,
		embedMedia,
	}: TypeQueryArgs
): Record< string, unknown > | null {
	const query: Record< string, unknown > = {
		...orderArgs( order ),
		status: status.join( ',' ),
		_fields: FIELDS.join( ',' ),
		_embed: embedMedia ? 'wp:term,wp:featuredmedia' : 'wp:term',
	};

	if ( search ) {
		query.search = search;
	}

	if ( exclude.length ) {
		query.exclude = [ ...exclude ].sort( ( a, b ) => a - b ).join( ',' );
	}

	for ( const [ slug, terms ] of Object.entries( termFilters ) ) {
		const taxonomy = taxonomies.get( slug );

		if ( ! taxonomy || ! type.taxonomies.includes( slug ) ) {
			return null;
		}

		query[ taxonomy.restBase ] = terms.join( ',' );
	}

	return query;
}
