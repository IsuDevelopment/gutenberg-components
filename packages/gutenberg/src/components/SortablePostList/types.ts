import type { PostPickerLabels } from '../../types/posts.js';

/**
 * One row of a `SortablePostList`, already resolved for display.
 */
export interface SortablePostListItem {
	id: number;
	title: string;
	/** Secondary line, e.g. "Styling · 18 Sep 2026". */
	meta?: string;
	thumbnailUrl?: string;
	/** Renders the row as a post that no longer resolves; it can still be removed. */
	isUnavailable?: boolean;
}

export interface SortablePostListProps {
	/** Rows in their current order. */
	items: SortablePostListItem[];

	/** Called with the source and target index after a drop or keyboard move. Omit to disable reordering. */
	onMove?: ( from: number, to: number ) => void;

	/** Called with the index of the removed row. Omit to hide remove buttons. */
	onRemove?: ( index: number ) => void;

	/** Show the thumbnail box. Defaults to true. */
	showThumbnail?: boolean;

	/** Disable reordering and removal. Defaults to false. */
	disabled?: boolean;

	/** Overrides the list's strings. */
	labels?: Partial<
		Pick< PostPickerLabels, 'remove' | 'reorder' | 'moved' | 'unavailable' >
	>;

	/** Class name added to the list element. */
	className?: string;
}
