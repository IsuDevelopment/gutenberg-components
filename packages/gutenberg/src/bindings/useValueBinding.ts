import type { ValueBinding, ValueResult } from '../types/bindings.js';
import { useMetaBinding } from './values/useMetaBinding.js';
import { useTaxonomyBinding } from './values/useTaxonomyBinding.js';
import { useCustomBinding } from './values/useCustomBinding.js';
import { noop } from '../utils/noop.js';

interface UseValueBindingArgs {
	valueBinding?: ValueBinding;
	value?: unknown;
	onChange?: ( value: unknown ) => void;
}

/**
 * Resolves a field's value and change handler.
 *
 * If controlled props (`value`/`onChange`) are present the field is controlled and the
 * `valueBinding` is ignored. Otherwise the value is read/written through the binding.
 * All binding hooks are called unconditionally; inactive ones receive `null`.
 */
export function useValueBinding( {
	valueBinding,
	value,
	onChange,
}: UseValueBindingArgs ): ValueResult {
	const meta = useMetaBinding(
		valueBinding?.type === 'meta' ? valueBinding : null
	);
	const taxonomy = useTaxonomyBinding(
		valueBinding?.type === 'taxonomy' ? valueBinding : null
	);
	const custom = useCustomBinding(
		valueBinding?.type === 'custom' ? valueBinding : null
	);

	const isControlled = value !== undefined || onChange !== undefined;

	if ( isControlled ) {
		return {
			value,
			onChange: onChange ?? noop,
			isLoading: false,
			error: null,
		};
	}

	switch ( valueBinding?.type ) {
		case 'meta':
			return meta;
		case 'taxonomy':
			return taxonomy;
		case 'custom':
			return custom;
		default:
			return {
				value: undefined,
				onChange: noop,
				isLoading: false,
				error: null,
			};
	}
}
