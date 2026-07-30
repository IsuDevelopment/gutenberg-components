import type { ValueBinding, ValueResult } from '../../types/bindings.js';
import { noop } from '../../utils/noop.js';

type CustomBinding = Extract< ValueBinding, { type: 'custom' } >;

/**
 * A value binding that carries its own value and change handler. Pass `null` to disable.
 */
export function useCustomBinding( binding: CustomBinding | null ): ValueResult {
	if ( ! binding ) {
		return { value: undefined, onChange: noop, isLoading: false, error: null };
	}

	return {
		value: binding.value,
		onChange: binding.onChange,
		isLoading: false,
		error: null,
	};
}
