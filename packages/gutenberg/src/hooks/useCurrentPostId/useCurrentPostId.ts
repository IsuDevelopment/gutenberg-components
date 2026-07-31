import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

/**
 * Returns the ID of the post currently open in the editor, or `undefined`.
 *
 * `core/editor`'s `postId` reducer defaults to `null`, and the selector returns that `null`
 * unchanged. Two empty values would force every consumer to guard against both, so it is
 * normalized to `undefined` here: one absent value, `?? fallback` behaves the same either way.
 */
export function useCurrentPostId(): number | undefined {
	return useSelect( ( select ) => {
		const store = select( editorStore ) as {
			getCurrentPostId?: () => number | null | undefined;
		};

		return store.getCurrentPostId?.() ?? undefined;
	}, [] );
}
