import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';

/**
 * Returns the post type of the post currently open in the editor, or `undefined`.
 *
 * `core/editor`'s `postType` reducer defaults to `null`, and the selector returns that `null`
 * unchanged. Two empty values would force every consumer to guard against both, so it is
 * normalized to `undefined` here: one absent value, `?? fallback` behaves the same either way.
 *
 * In the site editor this is the entity being edited, e.g. `'wp_template'` — not `undefined`.
 */
export function useCurrentPostType(): string | undefined {
	return useSelect( ( select ) => {
		const store = select( editorStore ) as {
			getCurrentPostType?: () => string | null | undefined;
		};

		return store.getCurrentPostType?.() ?? undefined;
	}, [] );
}
