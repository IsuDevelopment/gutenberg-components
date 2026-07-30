import { SelectControl } from '@wordpress/components';
import { useFieldBinding } from '../../bindings/useFieldBinding.js';
import type { FieldBindingProps } from '../../types/fields.js';

/**
 * A select field that composes an options source and a value binding.
 *
 * - Provide `options` or `optionsSource` for the choices.
 * - Provide `valueBinding` (meta/taxonomy/custom) or controlled `value`/`onChange`.
 */
export function SelectField( props: FieldBindingProps ) {
	const { value, onChange, options, isLoading, error, controlProps } =
		useFieldBinding( props );

	if ( isLoading ) {
		return ( props.loadingComponent as JSX.Element ) ?? null;
	}

	if ( error ) {
		return ( props.errorComponent as JSX.Element ) ?? null;
	}

	return (
		<SelectControl
			{ ...( controlProps as any ) }
			value={ value as string }
			options={ options }
			onChange={ onChange }
		/>
	);
}
