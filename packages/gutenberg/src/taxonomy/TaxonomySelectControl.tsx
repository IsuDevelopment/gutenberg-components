import { SelectField } from '../fields/SelectField';
import type { FieldBindingProps } from '../types/fields';

interface TaxonomySelectControlProps
	extends Omit< FieldBindingProps, 'optionsSource' | 'valueBinding' > {
	/** The taxonomy whose terms are both the options and the stored value. */
	taxonomy: string;
	/** REST base override; resolved automatically when omitted. */
	restBase?: string;
}

/**
 * Easy mode: a single-select whose options are taxonomy terms and whose value is stored
 * as the post's terms for that taxonomy.
 */
export function TaxonomySelectControl( {
	taxonomy,
	restBase,
	...props
}: TaxonomySelectControlProps ) {
	return (
		<SelectField
			{ ...props }
			optionsSource={ { type: 'terms', taxonomy } }
			valueBinding={ { type: 'taxonomy', taxonomy, restBase } }
		/>
	);
}
