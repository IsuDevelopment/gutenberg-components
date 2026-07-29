/**
 * Describes where a field reads and writes its value. Separate from `OptionsSource`.
 */
export type ValueBinding =
	| {
			type: 'meta';
			key: string;
			postType?: string;
	  }
	| {
			type: 'taxonomy';
			taxonomy: string;
			/**
			 * REST base of the taxonomy. Resolved automatically from the taxonomy when
			 * omitted; provide only to override.
			 */
			restBase?: string;
			/**
			 * When true the value is the full array of term IDs; otherwise the field is
			 * single-select and the value maps to/from a one-element array.
			 */
			multiple?: boolean;
	  }
	| {
			type: 'custom';
			value: unknown;
			onChange: ( value: unknown ) => void;
	  };

/**
 * The resolved result of a value binding.
 */
export interface ValueResult< T = unknown > {
	value: T;
	onChange: ( value: T ) => void;
	isLoading: boolean;
	error: unknown;
}
