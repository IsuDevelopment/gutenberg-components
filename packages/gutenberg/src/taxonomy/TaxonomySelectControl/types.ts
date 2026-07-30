import type { FieldBindingProps } from '../../types/fields.js';

export interface TaxonomySelectControlProps
	extends Omit< FieldBindingProps, 'optionsSource' | 'valueBinding' > {
	/** The taxonomy whose terms are both the options and the stored value. */
	taxonomy: string;
	/** REST base override; resolved automatically when omitted. */
	restBase?: string;
}
