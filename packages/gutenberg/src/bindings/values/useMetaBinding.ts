import { useEntityProp } from '@wordpress/core-data';
import type { ValueBinding, ValueResult } from '../../types/bindings.js';
import { useCurrentPostType } from '../../hooks/useCurrentPostType/index.js';
import { noop } from '../../utils/noop.js';

type MetaBinding = Extract< ValueBinding, { type: 'meta' } >;

/**
 * Reads and writes a single post meta value. Pass `null` to disable.
 */
export function useMetaBinding( binding: MetaBinding | null ): ValueResult {
	const currentPostType = useCurrentPostType();
	const postType = binding?.postType ?? currentPostType;

	const [ meta, setMeta ] = useEntityProp(
		'postType',
		postType ?? '',
		'meta'
	) as unknown as [
		Record< string, unknown > | undefined,
		( value: unknown ) => void,
	];

	if ( ! binding ) {
		return { value: undefined, onChange: noop, isLoading: false, error: null };
	}

	const value = meta?.[ binding.key ];

	const onChange = ( next: unknown ): void => {
		setMeta( { ...( meta ?? {} ), [ binding.key ]: next } );
	};

	return {
		value,
		onChange,
		isLoading: postType == null,
		error: null,
	};
}
