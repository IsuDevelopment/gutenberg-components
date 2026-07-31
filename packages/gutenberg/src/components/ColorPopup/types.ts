export interface ColorPopupColor {
	/** CSS color value, e.g. `#111111`. */
	color: string;

	/** Palette entry name, empty for a custom color. */
	name: string;

	/** Palette entry slug, empty for a custom color. */
	slug: string;

	/** Present only when `enableAlpha` is set. */
	alpha?: number;
}

export interface ColorPopupProps {
	/** Text next to the color swatch on the toggle button. */
	label: string;

	/** Currently selected color or slug. Empty string for no selection. */
	value: string;

	/** Called with the full resolved color object, never a bare string. */
	onChange: ( color: ColorPopupColor ) => void;

	/** Palette offered in the popup. No palette is read from anywhere else — see decision 0001. */
	colors?: Array< { color: string; name: string; slug: string } >;

	/** Adds an opacity slider to the popup. */
	enableAlpha?: boolean;

	/** Current alpha, 0–1. Only meaningful when `enableAlpha` is set. */
	alpha?: number;

	/** Heading shown inside the popup, above the palette. */
	popupLabel?: string;

	/** Shows a button that resets the value to empty. */
	clearable?: boolean;

	/** Extra class name on the toggle button. */
	className?: string;
}
