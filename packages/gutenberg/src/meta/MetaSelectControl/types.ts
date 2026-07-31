import type { FieldBindingProps } from '../../types/fields.js';

export interface MetaSelectControlProps
	extends Omit< FieldBindingProps, 'valueBinding' > {
	/** The post meta key to read from and write to. */
	metaKey: string;
	/** Optional post type override; defaults to the current post type. */
	postType?: string;
}
