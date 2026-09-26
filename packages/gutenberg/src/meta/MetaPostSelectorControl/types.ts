import type { PostSelectorControlProps } from '../../controls/PostSelectorControl/types.js';

export interface MetaPostSelectorControlProps
	extends Omit< PostSelectorControlProps, 'value' | 'onChange' | 'valueBinding' > {
	/** Registered post meta key holding the selection. */
	metaKey: string;

	/** Post type whose meta is edited. Defaults to the post type open in the editor. */
	postType?: string;
}
