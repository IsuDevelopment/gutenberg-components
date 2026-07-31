import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import type { OptionsResult, OptionsSource } from '../../types/options.js';
import { toFieldOption } from './normalizeOptions.js';

type TermsSource = Extract< OptionsSource, { type: 'terms' } >;

const EMPTY: OptionsResult = { options: [], isLoading: false, error: null };

/**
 * Resolves taxonomy terms into field options. Pass `null` to disable (no fetch).
 */
export function useTermsOptions( source: TermsSource | null ): OptionsResult {
	const query = source?.query ?? {};

	return useSelect(
		( select ): OptionsResult => {
			if ( ! source ) {
				return EMPTY;
			}

			const store = select( coreStore ) as any;
			const args = [
				'taxonomy',
				source.taxonomy,
				{ per_page: -1, ...query },
			] as const;

			const records: any[] | undefined = store.getEntityRecords( ...args );
			const isLoading = ! store.hasFinishedResolution(
				'getEntityRecords',
				args
			);
			const error =
				store.getResolutionError?.( 'getEntityRecords', args ) ?? null;

			return {
				options: ( records ?? [] ).map( ( term ) =>
					toFieldOption(
						term,
						source.labelField ?? 'name',
						source.valueField ?? 'id'
					)
				),
				isLoading,
				error,
			};
		},
		[ source?.taxonomy, JSON.stringify( query ) ]
	);
}
