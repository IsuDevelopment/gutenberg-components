import { useMemo, useRef } from 'react';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import type { PostReference } from '../../types/posts.js';
import { toPostDisplay, type PostDisplay } from './records.js';

const FIELDS = 'id,type,date,title,link,_links,_embedded';
const MAX_INCLUDE = 100;

export interface PostHydration {
	displays: Map< number, PostDisplay >;
	/** IDs that resolved to nothing once every request finished. */
	unavailable: Set< number >;
	isLoading: boolean;
}

/**
 * Resolves display rows for stored references.
 *
 * References carrying a `type` are fetched from that type alone. Bare IDs do not say which
 * type they belong to, so they are looked up in every candidate type with `include` — one
 * cached request per type, not one per post.
 */
export function usePostHydration(
	references: PostReference[],
	candidateTypes: string[],
	status: string[],
	embedMedia: boolean,
	typesLoading = false
): PostHydration {
	const requests = useMemo( () => {
		const idsByType = new Map< string, Set< number > >();
		const add = ( type: string, id: number ) => {
			if ( ! idsByType.has( type ) ) {
				idsByType.set( type, new Set() );
			}
			idsByType.get( type )!.add( id );
		};

		for ( const reference of references ) {
			if ( reference.type ) {
				add( reference.type, reference.id );
			} else {
				candidateTypes.forEach( ( type ) => add( type, reference.id ) );
			}
		}

		return [ ...idsByType.entries() ].map( ( [ type, ids ] ) => ( {
			type,
			query: {
				include: [ ...ids ]
					.sort( ( a, b ) => a - b )
					.slice( 0, MAX_INCLUDE )
					.join( ',' ),
				per_page: MAX_INCLUDE,
				status: status.join( ',' ),
				_fields: FIELDS,
				_embed: embedMedia ? 'wp:term,wp:featuredmedia' : 'wp:term',
			},
		} ) );
	}, [ references, candidateTypes, status, embedMedia ] );

	const key = JSON.stringify( requests );
	const previous = useRef< any[] >( [] );

	const { records, isLoading } = useSelect(
		( select ) => {
			const store = select( coreStore ) as any;
			const collected: any[] = [];
			let loading = false;

			for ( const { type, query } of requests ) {
				const args = [ 'postType', type, query ] as const;
				collected.push( ...( store.getEntityRecords( ...args ) ?? [] ) );

				if ( ! store.hasFinishedResolution( 'getEntityRecords', args ) ) {
					loading = true;
				}
			}

			const unchanged =
				collected.length === previous.current.length &&
				collected.every( ( record, index ) => record === previous.current[ index ] );

			if ( ! unchanged ) {
				previous.current = collected;
			}

			return { records: previous.current, isLoading: loading };
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ key ]
	);

	return useMemo( () => {
		const displays = new Map< number, PostDisplay >();

		for ( const record of records ) {
			displays.set( record.id, toPostDisplay( record ) );
		}

		const loading = isLoading || typesLoading;
		const unavailable = new Set< number >(
			loading
				? []
				: references
						.map( ( reference ) => reference.id )
						.filter( ( id ) => ! displays.has( id ) )
		);

		return { displays, unavailable, isLoading: loading };
	}, [ records, isLoading, typesLoading, references ] );
}
