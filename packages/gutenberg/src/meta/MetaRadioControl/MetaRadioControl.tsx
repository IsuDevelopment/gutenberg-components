import { RadioField } from '../../fields/RadioField/index.js';
import type { MetaRadioControlProps } from './types.js';

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
