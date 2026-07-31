import type { CSSProperties } from 'react';
import type { IconCollectionProps } from '../Icon/index.js';

export interface IconSelectProps extends IconCollectionProps {
	/** Selected icon name. Empty string means no selection. */
	value?: string;

	/** Called with an icon name, or an empty string when the selection is cleared. */
	onChange: ( name: string ) => void;

	/** Visible label and accessible name of the select button. */
	label: string;

	/** Text shown while no icon is selected. */
	placeholder?: string;

	/** Optional heading displayed above the picker grid. */
	pickerLabel?: string;

	/** Show the icon search field. */
	searchable?: boolean;

	/** Accessible label for the search field. */
	searchLabel?: string;

	/** Placeholder displayed in the search field. */
	searchPlaceholder?: string;

	/** Message displayed when the collection or search result is empty. */
	noResultsMessage?: string;

	/** Number of picker grid columns. */
	columns?: number;

	/** Rendered icon size in pixels. */
	iconSize?: number;

	/** Show a button that clears the current selection. */
	clearable?: boolean;

	/** Label for the clear-selection button. */
	clearLabel?: string;

	/** Close the popover immediately after selection or clearing. */
	closeOnSelect?: boolean;

	/** Popover placement relative to the select button. */
	popoverPlacement?:
		| 'top'
		| 'top-start'
		| 'top-end'
		| 'bottom'
		| 'bottom-start'
		| 'bottom-end'
		| 'left'
		| 'left-start'
		| 'left-end'
		| 'right'
		| 'right-start'
		| 'right-end';

	/** Extra class name on the select button. */
	className?: string;

	/** Extra class name on the picker. */
	pickerClassName?: string;

	/** Inline styles on the select button. */
	style?: CSSProperties;
}
