import { RadioControl } from '@wordpress/components';
import { useFieldBinding } from '../../bindings/useFieldBinding';
import type { FieldBindingProps } from '../../types/fields';

/**
 * A radio field that composes an options source and a value binding.
 *
 * `RadioControl` uses `selected` rather than `value`.
 */
export function RadioField( props: FieldBindingProps ) {
	const { value, onChange, options, isLoading, error, controlProps } =
		useFieldBinding( props );

	if ( isLoading ) {
		return ( props.loadingComponent as JSX.Element ) ?? null;
	}

	if ( error ) {
		return ( props.errorComponent as JSX.Element ) ?? null;
	}

	return (
		<RadioControl
			{ ...( controlProps as any ) }
			selected={ value as string }
			options={ options as any }
			onChange={ onChange }
		/>
	);
}
