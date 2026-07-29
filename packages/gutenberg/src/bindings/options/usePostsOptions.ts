import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import type { FieldOption, OptionsResult, OptionsSource } from '../../types/options';
import { toFieldOption } from './normalizeOptions';

type PostsSource = Extract< OptionsSource, { type: 'posts' } >;

const EMPTY: OptionsResult = { options: [], isLoading: false, error: null };

/**
 * Resolves posts across one or more post types into field options.
 * Pass `null` to disable (no fetch).
 *
 * Note: uses `per_page: -1`. For large datasets, add a searchable mode (debounced
 * `search` query) rather than fetching everything.
 */
export function usePostsOptions( source: PostsSource | null ): OptionsResult {
	const query = source?.query ?? {};

	return useSelect(
		( select ): OptionsResult => {
			if ( ! source ) {
				return EMPTY;
			}

			const store = select( coreStore ) as any;
			const options: FieldOption[] = [];
			let isLoading = false;
			let error: unknown = null;

			for ( const postType of source.postTypes ) {
				const args = [
					'postType',
					postType,
					{ per_page: -1, ...query },
				] as const;

				const records: any[] | undefined =
					store.getEntityRecords( ...args );

				if ( ! store.hasFinishedResolution( 'getEntityRecords', args ) ) {
					isLoading = true;
				}
				const resolutionError = store.getResolutionError?.(
					'getEntityRecords',
					args
				);
				if ( resolutionError ) {
					error = resolutionError;
				}

				( records ?? [] ).forEach( ( post ) =>
					options.push(
						toFieldOption(
							post,
							source.labelField ?? 'title',
							source.valueField ?? 'id'
						)
					)
				);
			}

			return { options, isLoading, error };
		},
		[ JSON.stringify( source?.postTypes ?? [] ), JSON.stringify( query ) ]
	);
}
