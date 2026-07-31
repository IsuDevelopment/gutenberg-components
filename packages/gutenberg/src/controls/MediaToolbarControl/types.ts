import type {
	MediaActionsConfig,
	MediaChangeHandler,
	MediaValue,
} from '../../types/index.js';
import type { BlockControlsGroup } from '../BlockLinkControl/index.js';
import type { MediaPickerControlProps } from '../MediaPickerControl/index.js';

export type MediaToolbarPickerProps = Omit<
	MediaPickerControlProps,
	'value' | 'onChange' | 'children'
>;

export interface MediaToolbarControlProps {
	/** Current serializable media value. */
	value?: MediaValue;

	/** Receives normalized selections and the untouched WordPress media object. */
	onChange: MediaChangeHandler;

	/** Optional remove handler. Defaults to `onChange( {} )`. */
	onRemove?: () => void;

	/** Select, replace and remove action visibility. All are enabled by default. */
	actions?: MediaActionsConfig;

	/** Block toolbar group receiving the actions. Defaults to `other`. */
	group?: BlockControlsGroup;

	/** Accessible select label. Defaults to `Select media`. */
	selectLabel?: string;

	/** Accessible replace label. Defaults to `Replace media`. */
	replaceLabel?: string;

	/** Accessible remove label. Defaults to `Remove media`. */
	removeLabel?: string;

	/** Additional class name on the toolbar group. */
	toolbarGroupClassName?: string;

	/** Additional native picker options. */
	pickerProps?: MediaToolbarPickerProps;
}
