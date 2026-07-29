import type { FieldOption, OptionsResult, OptionsSource } from '../types/options';
import { useTermsOptions } from './options/useTermsOptions';
import { usePostsOptions } from './options/usePostsOptions';
import { useUsersOptions } from './options/useUsersOptions';
import { usePostTypesOptions } from './options/usePostTypesOptions';

interface UseOptionsSourceArgs {
	options?: FieldOption[];
	optionsSource?: OptionsSource;
}

const EMPTY: OptionsResult = { options: [], isLoading: false, error: null };

/**
 * Resolves a field's options from static `options` or a dynamic `optionsSource`.
 *
 * All source hooks are called unconditionally (Rules of Hooks); inactive ones receive
 * `null` and short-circuit to an empty result without fetching.
 */
export function useOptionsSource( {
	options,
	optionsSource,
}: UseOptionsSourceArgs ): OptionsResult {
	const terms = useTermsOptions(
		optionsSource?.type === 'terms' ? optionsSource : null
	);
	const posts = usePostsOptions(
		optionsSource?.type === 'posts' ? optionsSource : null
	);
	const users = useUsersOptions(
		optionsSource?.type === 'users' ? optionsSource : null
	);
	const postTypes = usePostTypesOptions(
		optionsSource?.type === 'postTypes' ? optionsSource : null
	);

	if ( options ) {
		return { options, isLoading: false, error: null };
	}

	switch ( optionsSource?.type ) {
		case 'terms':
			return terms;
		case 'posts':
			return posts;
		case 'users':
			return users;
		case 'postTypes':
			return postTypes;
		case 'manual':
			return {
				options: optionsSource.options,
				isLoading: false,
				error: null,
			};
		default:
			return EMPTY;
	}
}
