import type { ReactNode } from 'react';
import type { FieldOption, OptionsSource } from './options.js';
import type { ValueBinding } from './bindings.js';

/**
 * Props shared by every field. Any extra props are forwarded to the underlying
 * WordPress control (`controlProps`).
 */
export interface FieldBindingProps {
	/** Static options; takes precedence over `optionsSource`. */
	options?: FieldOption[];
	/** Dynamic options source (terms, posts, users, postTypes, manual). */
	optionsSource?: OptionsSource;
	/** Where the value is read from and written to. */
	valueBinding?: ValueBinding;
	/** Controlled value; when provided the field is controlled and ignores `valueBinding`. */
	value?: unknown;
	/** Controlled change handler; presence also marks the field as controlled. */
	onChange?: ( value: unknown ) => void;
	/** Fired after the resolved onChange runs, regardless of binding mode. */
	onValueChange?: ( value: unknown ) => void;
	/** Rendered while options/value are resolving. */
	loadingComponent?: ReactNode;
	/** Rendered when resolving fails. */
	errorComponent?: ReactNode;
	// Remaining props are passed through to the control.
	[ key: string ]: unknown;
}

/**
 * The value returned by `useFieldBinding`, ready to spread onto a control.
 */
export interface FieldBindingResult {
	value: unknown;
	onChange: ( value: unknown ) => void;
	options: FieldOption[];
	isLoading: boolean;
	error: unknown;
	controlProps: Record< string, unknown >;
}
