import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useEntityProp } from '@wordpress/core-data';
import type { ValueBinding, ValueResult } from '../../types/bindings';
import { useCurrentPostType } from '../../hooks/useCurrentPostType';
import { noop } from '../../utils/noop';

type TaxonomyBinding = Extract< ValueBinding, { type: 'taxonomy' } >;

/**
 * Reads and writes a post's taxonomy terms.
 *
 * Under the hood the value is an **array of term IDs** (the entity prop keyed by the
 * taxonomy's REST base). For single-select fields (`multiple` is falsy) the value maps
 * to/from a one-element array; for multi-select the full array is used. The REST base is
 * resolved automatically from the taxonomy unless `restBase` is provided.
 *
 * Pass `null` to disable.
 */
export function useTaxonomyBinding(
	binding: TaxonomyBinding | null
): ValueResult {
	const currentPostType = useCurrentPostType();

	const restBase = useSelect(
		( select ): string | null => {
			if ( ! binding ) {
				return null;
			}
			if ( binding.restBase ) {
				return binding.restBase;
			}
			const taxonomy = ( select( coreStore ) as any ).getTaxonomy(
				binding.taxonomy
			);
			return taxonomy?.rest_base ?? binding.taxonomy;
		},
		[ binding?.taxonomy, binding?.restBase ]
	);

	const [ terms, setTerms ] = useEntityProp(
		'postType',
		currentPostType ?? '',
		restBase ?? ''
	) as unknown as [ unknown, ( value: unknown ) => void ];

	if ( ! binding ) {
		return { value: undefined, onChange: noop, isLoading: false, error: null };
	}

	const multiple = binding.multiple ?? false;
	const asArray: Array< string | number > = Array.isArray( terms )
		? ( terms as Array< string | number > )
		: [];

	const value = multiple ? asArray : asArray[ 0 ];

	const onChange = ( next: unknown ): void => {
		if ( multiple ) {
			setTerms( Array.isArray( next ) ? next : [] );
			return;
		}
		setTerms( next == null || next === '' ? [] : [ next ] );
	};

	return {
		value,
		onChange,
		isLoading: ! restBase,
		error: null,
	};
}
