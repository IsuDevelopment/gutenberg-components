import { SelectField } from '../../fields/SelectField/index.js';
import type { TaxonomySelectControlProps } from './types.js';

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
