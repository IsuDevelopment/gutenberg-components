import type { CSSProperties } from 'react';
import type { IconType } from '@wordpress/components';

/** A renderable icon graphic: a WordPress icon, image URL, Dashicon name or SVG markup. */
export type IconGraphic = IconType | string;

/** One named icon available to Icon, IconPicker and IconSelect. */
export interface IconDefinition {
	/** Stable value stored by the consumer. */
	name: string;

	/** Human-readable label. Falls back to name. */
	label?: string;

	/** WordPress icon value, image URL, Dashicon name or serialized SVG. */
	icon: IconGraphic;

	/** Additional case-insensitive search terms. */
	keywords?: readonly string[];
}

/** A complete custom definition or a name resolved from defaultIcons. */
export type IconChoice = IconDefinition | string;

/** Shared collection input used by all icon components. */
export interface IconCollectionProps {
	/** Base registry, commonly returned by getLocalizedIcons(). */
	defaultIcons?: readonly IconDefinition[];

	/** Ordered overrides. Names select from defaultIcons; definitions replace the defaults. */
	icons?: readonly IconChoice[];
}

export interface IconProps extends IconCollectionProps {
	/** Selected icon name. Nothing is rendered for an empty or unknown name. */
	name?: string;

	/** Rendered icon size in pixels. */
	size?: number;

	/** Accessible label. Omit for a decorative icon. */
	label?: string;

	/** Extra class name on the icon wrapper. */
	className?: string;

	/** Inline styles on the icon wrapper. */
	style?: CSSProperties;
}
