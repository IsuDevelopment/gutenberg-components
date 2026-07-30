import type { FieldBindingProps, FieldBindingResult } from '../types/fields.js';
import { useOptionsSource } from './useOptionsSource.js';
import { useValueBinding } from './useValueBinding.js';

/**
 * The engine behind every field. Resolves options and value from props and returns a
 * ready-to-spread result. See `optionsSource !== valueBinding` in AGENTS.md.
 */
export function useFieldBinding(
	props: FieldBindingProps
): FieldBindingResult {
	const {
		options,
		optionsSource,
		valueBinding,
		value: controlledValue,
		onChange: controlledOnChange,
		onValueChange,
		// Pulled out so they are not forwarded to the underlying control.
		loadingComponent: _loadingComponent,
		errorComponent: _errorComponent,
		...controlProps
	} = props;

	if (
		process.env.NODE_ENV !== 'production' &&
		valueBinding &&
		( controlledValue !== undefined || controlledOnChange !== undefined )
	) {
		// eslint-disable-next-line no-console
		console.warn(
			'[@isudev/gutenberg] Both `valueBinding` and controlled `value`/`onChange` were provided. ' +
				'The controlled props win and `valueBinding` is ignored.'
		);
	}

	const optionsResult = useOptionsSource( { options, optionsSource } );

	const valueResult = useValueBinding( {
		valueBinding,
		value: controlledValue,
		onChange: controlledOnChange,
	} );

	const onChange = ( nextValue: unknown ): void => {
		valueResult.onChange( nextValue );
		onValueChange?.( nextValue );
	};

	return {
		value: valueResult.value,
		onChange,
		options: optionsResult.options,
		isLoading: optionsResult.isLoading || valueResult.isLoading,
		error: optionsResult.error ?? valueResult.error,
		controlProps,
	};
}
