import type { ValueBinding } from '../../types/bindings.js';
import type {
	PostPickerOptions,
	PostSelectionValue,
} from '../../types/posts.js';

export interface PostSelectorControlProps extends PostPickerOptions {
	/** Controlled selection. Takes precedence over `valueBinding`. */
	value?: PostSelectionValue;

	/** Controlled change handler, called after reorder, removal and modal save. */
	onChange?: ( value: PostSelectionValue ) => void;

	/** Where the selection is read and written when not controlled: `meta` or `custom`. */
	valueBinding?: ValueBinding;

	/** Visible heading above the list. */
	label?: string;

	/** Help text below the list. Defaults to the reorder hint while two or more posts are selected. */
	help?: string;

	/** Disable reordering, removal and the picker. Defaults to false. */
	disabled?: boolean;

	/** Class name added to the wrapper. */
	className?: string;
}
