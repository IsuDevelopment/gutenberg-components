import { PostSelectorControl } from '../../controls/PostSelectorControl/PostSelectorControl.js';
import type { MetaPostSelectorControlProps } from './types.js';

/**
 * Easy mode: a post selector bound to a post meta value.
 */
export function MetaPostSelectorControl( {
	metaKey,
	postType,
	...props
}: MetaPostSelectorControlProps ) {
	return (
		<PostSelectorControl
			{ ...props }
			valueBinding={ { type: 'meta', key: metaKey, postType } }
		/>
	);
}
