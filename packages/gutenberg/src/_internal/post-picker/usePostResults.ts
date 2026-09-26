import { useMemo, useRef } from 'react';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import type { PostPickerOrder } from '../../types/posts.js';
import { mergeResults, toPostDisplay, type PostDisplay } from './records.js';

const NO_LISTS: any[][] = [];

export interface TypeQuery {
	type: string;
	query: Record< string, unknown >;
}

export interface PostResults {
	items: PostDisplay[];
	/** Sum of matching posts across types, `null` until known. */
	total: number | null;
	hasMore: boolean;
	isLoading: boolean;
	error: unknown;
}

/**
 * Fetches `pages` pages per post type and merges them into one sorted window of
 * `pages * perPage` rows.
 *
 * A type's next page is only requested once its previous page came back full, so no request
 * ever asks for a page past the end (which WordPress answers with a 400).
 */
export function usePostResults(
	typeQueries: TypeQuery[],
	pages: number,
	perPage: number,
	order: PostPickerOrder,
	enabled = true
): PostResults {
	const key = JSON.stringify( typeQueries );
	const previousLists = useRef< any[][] >( [] );

	const { lists, total, isLoading, error } = useSelect(
		( select ) => {
			const store = select( coreStore ) as any;
			const collected: any[][] = [];
			let sum: number | null = 0;
			let loading = false;
			let failure: unknown = null;

			if ( ! enabled ) {
				return { lists: NO_LISTS, total: null, isLoading: false, error: null };
			}

			for ( const { type, query } of typeQueries ) {
				const records: any[] = [];

				for ( let page = 1; page <= pages; page++ ) {
					const args = [
						'postType',
						type,
						{ ...query, page, per_page: perPage },
					] as const;
					const pageRecords: any[] | null = store.getEntityRecords( ...args );

					if ( ! store.hasFinishedResolution( 'getEntityRecords', args ) ) {
						loading = true;
					}

					const resolutionError = store.getResolutionError?.(
						'getEntityRecords',
						args
					);
					if ( resolutionError ) {
						failure = resolutionError;
					}

					if ( page === 1 ) {
						const typeTotal: number | null =
							store.getEntityRecordsTotalItems?.( ...args ) ?? null;
						sum = sum === null || typeTotal === null ? null : sum + typeTotal;
					}

					records.push( ...( pageRecords ?? [] ) );

					if ( ! pageRecords || pageRecords.length < perPage ) {
						break;
					}
				}

				collected.push( records );
			}

			// Hand back the previous lists when every record is the same object, so
			// `useSelect` sees an unchanged value and does not re-render for nothing.
			const unchanged =
				collected.length === previousLists.current.length &&
				collected.every(
					( records, index ) =>
						records.length === previousLists.current[ index ].length &&
						records.every(
							( record, position ) =>
								record === previousLists.current[ index ][ position ]
						)
				);

			if ( ! unchanged ) {
				previousLists.current = collected;
			}

			return {
				lists: previousLists.current,
				total: loading && sum === 0 ? null : sum,
				isLoading: loading,
				error: failure,
			};
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ key, pages, perPage, enabled ]
	);

	const limit = pages * perPage;

	const items = useMemo(
		() =>
			mergeResults(
				lists.map( ( records ) => records.map( toPostDisplay ) ),
				order,
				limit
			),
		[ lists, order, limit ]
	);

	const fetched = lists.reduce( ( count, records ) => count + records.length, 0 );

	return {
		items,
		total,
		hasMore: total !== null ? total > limit : fetched > limit,
		isLoading,
		error,
	};
}
