import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

/**
 * Returns the ID of the post currently open in the editor, or undefined.
 */
export function useCurrentPostId(): number | undefined {
	return useSelect(
		( select ) =>
			( select( editorStore ) as any ).getCurrentPostId() as
				| number
				| undefined,
		[]
	);
}
