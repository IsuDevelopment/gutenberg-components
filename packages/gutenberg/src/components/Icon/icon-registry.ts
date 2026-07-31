import type {
	IconChoice,
	IconDefinition,
	IconGraphic,
} from './types.js';

function normalizeDefinition( value: unknown ): IconDefinition | undefined {
	if ( ! value || typeof value !== 'object' ) {
		return undefined;
	}

	const candidate = value as Record< string, unknown >;
	const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
	const icon = candidate.icon as IconGraphic | undefined;

	if (
		! name ||
		( typeof icon === 'string' && ! icon.trim() ) ||
		( typeof icon !== 'string' &&
			typeof icon !== 'function' &&
			( ! icon || typeof icon !== 'object' ) )
	) {
		return undefined;
	}

	const label =
		typeof candidate.label === 'string' && candidate.label.trim()
			? candidate.label.trim()
			: name;
	const keywords = Array.isArray( candidate.keywords )
		? candidate.keywords.filter(
				( keyword ): keyword is string => typeof keyword === 'string'
		  )
		: undefined;

	return { name, label, icon, keywords };
}

function uniqueDefinitions( values: readonly IconDefinition[] ): IconDefinition[] {
	const names = new Set< string >();

	return values.filter( ( icon ) => {
		if ( names.has( icon.name ) ) {
			return false;
		}

		names.add( icon.name );
		return true;
	} );
}

/**
 * Resolve a consumer collection without mutating either input.
 *
 * An omitted override returns all defaults. Once `icons` is supplied it becomes the complete
 * ordered collection: strings select existing names, while objects supply replacements.
 */
export function resolveIcons(
	defaultIcons: readonly IconDefinition[] = [],
	icons?: readonly IconChoice[]
): IconDefinition[] {
	const normalizedDefaults = uniqueDefinitions(
		defaultIcons
			.map( normalizeDefinition )
			.filter( ( icon ): icon is IconDefinition => Boolean( icon ) )
	);

	if ( icons === undefined ) {
		return normalizedDefaults;
	}

	const defaultsByName = new Map(
		normalizedDefaults.map( ( icon ) => [ icon.name, icon ] )
	);
	const seen = new Set< string >();
	const resolved: IconDefinition[] = [];

	for ( const choice of icons ) {
		const icon =
			typeof choice === 'string'
				? defaultsByName.get( choice )
				: normalizeDefinition( choice );

		if ( ! icon || seen.has( icon.name ) ) {
			continue;
		}

		seen.add( icon.name );
		resolved.push( icon );
	}

	return resolved;
}

/** Validate the JSON-compatible array produced by wp_localize_script(). */
export function parseLocalizedIcons( value: unknown ): IconDefinition[] {
	if ( ! Array.isArray( value ) ) {
		return [];
	}

	return value
		.map( ( item ) => {
			if ( ! item || typeof item !== 'object' ) {
				return undefined;
			}

			const candidate = item as Record< string, unknown >;

			// Localized data must remain JSON-compatible. React elements/functions only enter
			// through explicit component props, never through a global object.
			if ( typeof candidate.icon !== 'string' ) {
				return undefined;
			}

			return normalizeDefinition( candidate );
		} )
		.filter( ( icon ): icon is IconDefinition => Boolean( icon ) );
}

/**
 * Read and validate a localized icon array from a global object.
 *
 * This adapter is the only global boundary. Components themselves remain props-only and can
 * therefore render in Gutenberg's iframe, tests and server-side environments.
 */
export function getLocalizedIcons(
	globalName = 'isudevIcons',
	globalObject: unknown = globalThis
): IconDefinition[] {
	if ( ! globalObject || typeof globalObject !== 'object' ) {
		return [];
	}

	return parseLocalizedIcons(
		( globalObject as Record< string, unknown > )[ globalName ]
	);
}
