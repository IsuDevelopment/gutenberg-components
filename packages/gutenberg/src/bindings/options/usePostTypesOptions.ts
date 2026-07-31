import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import type { OptionsResult, OptionsSource } from '../../types/options.js';

type PostTypesSource = Extract< OptionsSource, { type: 'postTypes' } >;

const EMPTY: OptionsResult = { options: [], isLoading: false, error: null };

/**
 * Internal/non-content post types that should never appear as options.
 */
const EXCLUDED = [
	'attachment',
	'wp_block',
	'wp_template',
	'wp_template_part',
	'wp_navigation',
	'wp_font_family',
	'wp_font_face',
];

/**
 * Resolves viewable, public post types into field options
 * (value = slug, label = singular name). Pass `null` to disable.
 */
export function usePostTypesOptions(
	source: PostTypesSource | null
): OptionsResult {
	const query = source?.query ?? {};

	return useSelect(
		( select ): OptionsResult => {
			if ( ! source ) {
				return EMPTY;
			}

			const store = select( coreStore ) as any;
			const args = [ { per_page: -1, ...query } ] as const;

			const types: any[] | undefined = store.getPostTypes( ...args );
			const isLoading = ! store.hasFinishedResolution(
				'getPostTypes',
				args
			);
			const error =
				store.getResolutionError?.( 'getPostTypes', args ) ?? null;

			return {
				options: ( types ?? [] )
					.filter(
						( type ) =>
							type.viewable && ! EXCLUDED.includes( type.slug )
					)
					.map( ( type ) => ( {
						label: type.labels?.singular_name ?? type.name,
						value: type.slug,
					} ) ),
				isLoading,
				error,
			};
		},
		[ JSON.stringify( query ) ]
	);
}
