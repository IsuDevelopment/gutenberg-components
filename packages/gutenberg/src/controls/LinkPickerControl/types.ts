import type { ReactNode, RefCallback } from 'react';

/** The serializable link value shared by the picker and higher-level link controls. */
export interface LinkValue {
	url?: string;
	title?: string;
	id?: number | string;
	type?: string;
	kind?: string;
	opensInNewTab?: boolean;
	nofollow?: boolean;
	rel?: string;
	[ setting: string ]: unknown;
}

/** One boolean setting displayed in WordPress' link settings drawer. */
export interface LinkSetting {
	id: string;
	title: string;
	help?: ReactNode;
	render?: (
		setting: LinkSetting,
		value: LinkValue,
		onChange: ( value: LinkValue ) => void
	) => ReactNode;
}

/** Query passed to WordPress' link-suggestions endpoint. */
export interface LinkSuggestionsQuery {
	type?: string;
	subtype?: string | string[];
	[ parameter: string ]: unknown;
}

/** Props generated for the consumer-provided picker trigger. */
export interface LinkPickerRenderArgs {
	/** Attach this callback ref to the element that should anchor the popover. */
	anchorRef: RefCallback< HTMLElement >;
	isOpen: boolean;
	hasLink: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
	remove: () => void;
}

export interface LinkPickerControlProps {
	/** Current serializable link value. */
	value?: LinkValue;

	/** Receives a normalized link value after every picker change. */
	onChange: ( value: LinkValue ) => void;

	/** Optional custom unlink handler. By default `onChange( {} )` is called. */
	onRemove?: () => void;

	/** Render prop used to create and anchor any trigger UI. */
	children: ( args: LinkPickerRenderArgs ) => ReactNode;

	/** Controlled popover visibility. Omit to use internal state. */
	isOpen?: boolean;

	/** Initial visibility in uncontrolled mode. */
	defaultOpen?: boolean;

	/** Called whenever the picker asks to open or close. */
	onOpenChange?: ( isOpen: boolean ) => void;

	/** Link settings shown by WordPress. Defaults to new-tab and nofollow toggles. */
	settings?: LinkSetting[];

	/** Limits WordPress link suggestions to a specific entity query. */
	suggestionsQuery?: LinkSuggestionsQuery;

	/** Whether search suggestions are enabled. */
	showSuggestions?: boolean;

	/** Whether suggestions appear before the user types. */
	showInitialSuggestions?: boolean;

	/** Force WordPress' URL editing UI instead of its saved-link preview. */
	forceIsEditingLink?: boolean;

	/** Disallow entering an arbitrary URL directly. */
	noDirectEntry?: boolean;

	/** Hide the fallback URL suggestion. */
	noURLSuggestion?: boolean;

	/** Show WordPress' optional link-title field inside the picker. */
	hasTextControl?: boolean;

	/** Let WordPress lock selected entity links until they are unlinked. */
	handleEntities?: boolean;

	/** Show WordPress' richer preview for selected entities. */
	hasRichPreviews?: boolean;

	/** Placeholder for the picker search input. */
	searchInputPlaceholder?: string;

	/** Placement of the popover relative to the trigger. */
	popoverPlacement?:
		| 'top'
		| 'top-start'
		| 'top-end'
		| 'right'
		| 'right-start'
		| 'right-end'
		| 'bottom'
		| 'bottom-start'
		| 'bottom-end'
		| 'left'
		| 'left-start'
		| 'left-end'
		| 'overlay';

	/** Gap in pixels between the trigger and popover. */
	popoverOffset?: number;

	/** Hide the popover arrow. */
	popoverNoArrow?: boolean;

	/** Extra class name on the popover. */
	popoverClassName?: string;

	/** Popover focus behavior. */
	popoverFocusOnMount?: 'firstElement' | boolean;

	/** Animate the popover when it opens. */
	popoverAnimate?: boolean;

	/** Shift the popover to keep it inside the viewport. */
	popoverShift?: boolean;

	/** Keep tab navigation inside the open popover. */
	popoverConstrainTabbing?: boolean;

	/** Optional content rendered above WordPress' link control. */
	popoverHeader?: ReactNode;

	/** Optional content rendered below WordPress' link control. */
	popoverFooter?: ReactNode;
}

/** Safe anchor attributes derived from a `LinkValue`. */
export interface LinkAttributes {
	href?: string;
	target?: '_blank';
	rel?: string;
}
