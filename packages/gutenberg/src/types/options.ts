/**
 * A single selectable option rendered by a field control.
 */
export interface FieldOption {
	label: string;
	value: string | number;
	disabled?: boolean;
}

/**
 * Describes where a field gets its list of options from. This is intentionally separate
 * from where the value is stored (see `ValueBinding`): `optionsSource !== valueBinding`.
 */
export type OptionsSource =
	| {
			type: 'terms';
			taxonomy: string;
			query?: Record< string, unknown >;
			valueField?: 'id' | 'slug' | 'name';
			labelField?: 'name' | 'slug';
	  }
	| {
			type: 'posts';
			postTypes: string[];
			query?: Record< string, unknown >;
			valueField?: 'id' | 'slug';
			labelField?: 'title' | 'slug';
	  }
	| {
			type: 'users';
			roles?: string[];
			query?: Record< string, unknown >;
			valueField?: 'id' | 'slug' | 'email';
			labelField?: 'name' | 'email';
	  }
	| {
			type: 'postTypes';
			query?: Record< string, unknown >;
	  }
	| {
			type: 'manual';
			options: FieldOption[];
	  };

/**
 * The resolved result of an options source.
 */
export interface OptionsResult {
	options: FieldOption[];
	isLoading: boolean;
	error: unknown;
}
