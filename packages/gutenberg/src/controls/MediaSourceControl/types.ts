import type { ReactElement, ReactNode } from 'react';
import type {
	MediaChangeHandler,
	MediaSourcesConfig,
	MediaValue,
} from '../../types/index.js';

export type MediaSourceControlVariant = 'buttons' | 'dropdown';

export interface MediaSourceLabels {
	select: string;
	replace: string;
	library: string;
	upload: string;
	url: string;
	featured: string;
	remove: string;
	currentUrl: string;
	applyUrl: string;
}

export interface MediaSourceToggleArgs {
	/** Whether the dropdown is open. */
	isOpen: boolean;

	/** Opens or closes the source dropdown. No-op while disabled. */
	toggle: () => void;

	/** Whether all source interaction is disabled. */
	disabled: boolean;

	/** Whether the controlled value currently contains media. */
	hasMedia: boolean;

	/** State-dependent label content. */
	label: string;
}

export interface MediaSourceControlProps {
	/** Current serializable media value. */
	value?: MediaValue;

	/** Receives attachment, URL and featured-image selections. */
	onChange: MediaChangeHandler;

	/** Enables the reset/remove menu item for an existing value. */
	onRemove?: () => void;

	/** Individually enables media sources; all sources are enabled by default. */
	sources?: MediaSourcesConfig;

	/** Inline native-style buttons or a replacement dropdown. Defaults to dropdown. */
	variant?: MediaSourceControlVariant;

	/** WordPress media types or MIME types allowed for library/upload. Defaults to image. */
	allowedTypes?: string[];

	/** Native file-input accept value. Inferred from allowedTypes when omitted. */
	accept?: string;

	/** Preferred WordPress image rendition. Falls back to selected/full URL. */
	imageSize?: string;

	/** Disables every source interaction. Defaults to false. */
	disabled?: boolean;

	/**
	 * Overrides the current post's automatically resolved featured image. Pass null to mark
	 * it unavailable.
	 */
	featuredMedia?: MediaValue | null;

	/** Called before direct files are handed to WordPress' uploader. */
	onFilesUpload?: ( files: File[] | FileList ) => void;

	/** Receives an upload error message from WordPress. */
	onError?: ( message: string ) => void;

	/** Native media modal title. */
	title?: string;

	/** Native media modal class name. */
	modalClass?: string;

	/** Called whenever the native media modal closes. */
	onClose?: () => void;

	/** Rendered in place of permission-gated library/upload actions. Defaults to null. */
	fallback?: ReactNode;

	/** Overrides individual translated labels. */
	labels?: Partial< MediaSourceLabels >;

	/** Custom dropdown toggle. Ignored by the buttons variant. */
	children?: ( args: MediaSourceToggleArgs ) => ReactElement | null;
}
