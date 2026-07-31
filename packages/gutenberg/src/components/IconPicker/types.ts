import type { CSSProperties } from 'react';
import type { IconCollectionProps } from '../Icon/index.js';

export interface IconPickerProps extends IconCollectionProps {
	/** Selected icon name. Empty string means no selection. */
	value?: string;

	/** Called with an icon name, or an empty string when the selection is cleared. */
	onChange: ( name: string ) => void;

	/** Optional heading for the picker. */
	label?: string;

	/** Show the icon search field. */
	searchable?: boolean;

	/** Accessible label for the search field. */
	searchLabel?: string;

	/** Placeholder displayed in the search field. */
	searchPlaceholder?: string;

	/** Message displayed when the collection or search result is empty. */
	noResultsMessage?: string;

	/** Number of grid columns. */
	columns?: number;

	/** Rendered icon size in pixels. */
	iconSize?: number;

	/** Show a button that clears the current selection. */
	clearable?: boolean;

	/** Label for the clear-selection button. */
	clearLabel?: string;

	/** Extra class name on the picker wrapper. */
	className?: string;

	/** Inline styles on the picker wrapper. */
	style?: CSSProperties;
}
