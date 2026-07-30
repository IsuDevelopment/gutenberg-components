import { SelectField } from '../../fields/SelectField/index.js';
import type { MetaSelectControlProps } from './types.js';

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
