import type {
	PostPickerOptions,
	PostSelectionValue,
} from '../../types/posts.js';

export interface PostPickerModalProps extends PostPickerOptions {
	/** Selection the modal starts from. Any stored shape is accepted. */
	value?: PostSelectionValue;

	/** Called once with the new selection when "Save selection" is pressed. */
	onChange: ( value: PostSelectionValue ) => void;

	/** Called on Save, Cancel, Escape or overlay click. */
	onClose: () => void;

	/** Class name added to the modal. */
	className?: string;
}
