import { useMemo } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import type { PostPickerLabels } from '../../types/posts.js';

function defaultLabels(): PostPickerLabels {
	return {
		modalTitle: __( 'Select posts' ),
		search: __( 'Search posts' ),
		postType: __( 'Post type' ),
		allTypes: __( 'All types' ),
		/* translators: %s: taxonomy name. */
		allTerms: __( 'All %s' ),
		order: __( 'Order by' ),
		newest: __( 'Newest' ),
		oldest: __( 'Oldest' ),
		titleAsc: __( 'Title A → Z' ),
		titleDesc: __( 'Title Z → A' ),
		/* translators: %d: number of posts. */
		tabAll: __( 'All (%d)' ),
		/* translators: %d: number of selected posts. */
		tabSelected: __( 'Selected (%d)' ),
		/* translators: 1: number of selected posts, 2: maximum. */
		selectedOfMax: __( 'Selected %1$d of %2$d' ),
		/* translators: %d: number of selected posts. */
		selectedCount: __( 'Selected %d' ),
		cancel: __( 'Cancel' ),
		save: __( 'Save selection' ),
		loadMore: __( 'Load more' ),
		noResults: __( 'No posts found.' ),
		noSelection: __( 'Nothing selected yet.' ),
		choose: __( 'Choose posts' ),
		change: __( 'Change selection' ),
		/* translators: %s: post title. */
		remove: __( 'Remove %s' ),
		/* translators: %s: post title. */
		reorder: __( 'Reorder %s' ),
		reorderHelp: __( 'Drag to reorder.' ),
		/* translators: 1: new position, 2: number of items. */
		moved: __( 'Moved to position %1$d of %2$d.' ),
		/* translators: %d: post ID. */
		unavailable: __( 'Unavailable post (#%d)' ),
		error: __( 'The posts could not be loaded.' ),
	};
}

/**
 * Resolves translated defaults merged with consumer overrides.
 */
export function usePostPickerLabels(
	overrides?: Partial< PostPickerLabels >
): PostPickerLabels {
	return useMemo(
		() => ( { ...defaultLabels(), ...overrides } ),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ JSON.stringify( overrides ?? {} ) ]
	);
}

/**
 * `sprintf` for runtime templates. `@wordpress/i18n` types `sprintf` from the literal
 * format string, which a consumer-overridable label never is.
 */
export function formatLabel( template: string, ...args: Array< string | number > ): string {
	return ( sprintf as ( format: string, ...values: unknown[] ) => string )(
		template,
		...args
	);
}
