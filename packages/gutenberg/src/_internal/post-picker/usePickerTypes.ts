import { useEffect, useMemo } from 'react';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import type { PostPickerQuery } from '../../types/posts.js';

export interface PickerTaxonomy {
	slug: string;
	name: string;
	restBase: string;
	allItems?: string;
}

export interface PickerType {
	slug: string;
	label: string;
	restBase: string;
	/** Slugs of the type's visible, REST-enabled taxonomies. */
	taxonomies: string[];
}

export interface PickerTypesResult {
	types: PickerType[];
	taxonomies: Map< string, PickerTaxonomy >;
	isLoading: boolean;
}

const EXCLUDED_TYPES = new Set( [ 'attachment' ] );

/**
 * Resolves the allowed post types and their taxonomies from core-data.
 *
 * Without `postTypes` every viewable REST-enabled type except attachments is allowed.
 * Types lacking a taxonomy named in `query.taxonomies` are dropped: a hard term constraint
 * can never match them.
 */
export function usePickerTypes(
	postTypes: string[] | undefined,
	query: PostPickerQuery | undefined
): PickerTypesResult {
	const { postTypeRecords, taxonomyRecords, isLoading } = useSelect(
		( select ) => {
			const store = select( coreStore ) as any;
			const typeArgs = [ { per_page: -1 } ] as const;
			const taxonomyArgs = [ { per_page: -1 } ] as const;

			return {
				postTypeRecords: ( store.getPostTypes( ...typeArgs ) ??
					null ) as any[] | null,
				taxonomyRecords: ( store.getTaxonomies( ...taxonomyArgs ) ??
					null ) as any[] | null,
				isLoading:
					! store.hasFinishedResolution( 'getPostTypes', typeArgs ) ||
					! store.hasFinishedResolution( 'getTaxonomies', taxonomyArgs ),
			};
		},
		[]
	);

	const postTypesKey = postTypes?.join( ',' );
	const constrainedKey = Object.keys( query?.taxonomies ?? {} ).join( ',' );

	const result = useMemo( () => {
		const taxonomies = new Map< string, PickerTaxonomy >();

		for ( const record of taxonomyRecords ?? [] ) {
			if ( ! record?.rest_base || record?.visibility?.show_ui === false ) {
				continue;
			}

			taxonomies.set( record.slug, {
				slug: record.slug,
				name: record.name,
				restBase: record.rest_base,
				...( record.labels?.all_items
					? { allItems: record.labels.all_items }
					: {} ),
			} );
		}

		const available = new Map< string, PickerType >();

		for ( const record of postTypeRecords ?? [] ) {
			if (
				! record?.rest_base ||
				! record?.viewable ||
				EXCLUDED_TYPES.has( record.slug )
			) {
				continue;
			}

			available.set( record.slug, {
				slug: record.slug,
				label: record.labels?.singular_name ?? record.name,
				restBase: record.rest_base,
				taxonomies: ( record.taxonomies ?? [] ).filter( ( slug: string ) =>
					taxonomies.has( slug )
				),
			} );
		}

		const requested = postTypes ?? [ ...available.keys() ];
		const constrained = constrainedKey ? constrainedKey.split( ',' ) : [];
		const missing = requested.filter( ( slug ) => ! available.has( slug ) );

		const types = requested
			.map( ( slug ) => available.get( slug ) )
			.filter( ( type ): type is PickerType => !! type )
			.filter( ( type ) =>
				constrained.every( ( taxonomy ) =>
					type.taxonomies.includes( taxonomy )
				)
			);

		return { types, taxonomies, missing };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ postTypeRecords, taxonomyRecords, postTypesKey, constrainedKey ] );

	const missingKey = result.missing.join( ',' );

	useEffect( () => {
		if (
			process.env.NODE_ENV !== 'production' &&
			! isLoading &&
			postTypeRecords &&
			missingKey
		) {
			console.warn(
				`Post picker: post types "${ missingKey }" are unknown, not viewable or not REST-enabled and were ignored.`
			);
		}
	}, [ isLoading, postTypeRecords, missingKey ] );

	return {
		types: result.types,
		taxonomies: result.taxonomies,
		isLoading,
	};
}
