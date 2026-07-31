import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import type { OptionsResult, OptionsSource } from '../../types/options.js';
import { toFieldOption } from './normalizeOptions.js';

type UsersSource = Extract< OptionsSource, { type: 'users' } >;

const EMPTY: OptionsResult = { options: [], isLoading: false, error: null };

/**
 * Resolves users into field options. Pass `null` to disable (no fetch).
 */
export function useUsersOptions( source: UsersSource | null ): OptionsResult {
	const query = source?.query ?? {};
	const roles = source?.roles;

	return useSelect(
		( select ): OptionsResult => {
			if ( ! source ) {
				return EMPTY;
			}

			const store = select( coreStore ) as any;
			const args = [
				'root',
				'user',
				{
					per_page: -1,
					...( roles ? { roles: roles.join( ',' ) } : {} ),
					...query,
				},
			] as const;

			const records: any[] | undefined = store.getEntityRecords( ...args );
			const isLoading = ! store.hasFinishedResolution(
				'getEntityRecords',
				args
			);
			const error =
				store.getResolutionError?.( 'getEntityRecords', args ) ?? null;

			return {
				options: ( records ?? [] ).map( ( user ) =>
					toFieldOption(
						user,
						source.labelField ?? 'name',
						source.valueField ?? 'id'
					)
				),
				isLoading,
				error,
			};
		},
		[ JSON.stringify( roles ?? [] ), JSON.stringify( query ) ]
	);
}
