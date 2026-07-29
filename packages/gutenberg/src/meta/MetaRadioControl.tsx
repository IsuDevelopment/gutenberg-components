import { RadioField } from '../fields/RadioField';
import type { FieldBindingProps } from '../types/fields';

interface MetaRadioControlProps extends Omit< FieldBindingProps, 'valueBinding' > {
	/** The post meta key to read from and write to. */
	metaKey: string;
	/** Optional post type override; defaults to the current post type. */
	postType?: string;
}

/**
 * Easy mode: a radio group bound to a post meta value.
 */
export function MetaRadioControl( {
	metaKey,
	postType,
	...props
}: MetaRadioControlProps ) {
	return (
		<RadioField
			{ ...props }
			valueBinding={ { type: 'meta', key: metaKey, postType } }
		/>
	);
}
