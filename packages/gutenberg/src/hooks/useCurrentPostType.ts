import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

/**
 * Returns the post type of the post currently open in the editor, or undefined.
 */
export function useCurrentPostType(): string | undefined {
	return useSelect(
		( select ) =>
			( select( editorStore ) as any ).getCurrentPostType() as
				| string
				| undefined,
		[]
	);
}
