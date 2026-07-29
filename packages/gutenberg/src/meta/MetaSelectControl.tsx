import { SelectField } from '../fields/SelectField';
import type { FieldBindingProps } from '../types/fields';

interface MetaSelectControlProps extends Omit< FieldBindingProps, 'valueBinding' > {
	/** The post meta key to read from and write to. */
	metaKey: string;
	/** Optional post type override; defaults to the current post type. */
	postType?: string;
}

/**
 * Easy mode: a select bound to a post meta value.
 */
export function MetaSelectControl( {
	metaKey,
	postType,
	...props
}: MetaSelectControlProps ) {
	return (
		<SelectField
			{ ...props }
			valueBinding={ { type: 'meta', key: metaKey, postType } }
		/>
	);
}
