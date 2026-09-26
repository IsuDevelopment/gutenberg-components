import type {
	PostReference,
	PostSelectionField,
	PostSelectionValue,
} from '../../types/posts.js';

export const ALL_FIELDS: PostSelectionField[] = [ 'title', 'link', 'type' ];

function isPostId( value: unknown ): value is number {
	return typeof value === 'number' && Number.isInteger( value ) && value > 0;
}

function toReference( item: unknown ): PostReference | null {
	if ( isPostId( item ) ) {
		return { id: item };
	}

	if ( typeof item === 'string' && /^\d+$/.test( item ) ) {
		return toReference( Number( item ) );
	}

	if ( item && typeof item === 'object' ) {
		const { id, type, title, link } = item as Record< string, unknown >;
		const numericId = typeof id === 'string' ? Number( id ) : id;

		if ( ! isPostId( numericId ) ) {
			return null;
		}

		return {
			id: numericId,
			...( typeof type === 'string' ? { type } : {} ),
			...( typeof title === 'string' ? { title } : {} ),
			...( typeof link === 'string' ? { link } : {} ),
		};
	}

	return null;
}

/**
 * Normalizes any stored selection — array or single, IDs or objects, or garbage from a
 * mis-registered meta key — into an ordered, de-duplicated list of references.
 */
export function toReferences( value: unknown ): PostReference[] {
	const items = Array.isArray( value ) ? value : [ value ];
	const seen = new Set< number >();
	const references: PostReference[] = [];

	for ( const item of items ) {
		const reference = toReference( item );

		if ( reference && ! seen.has( reference.id ) ) {
			seen.add( reference.id );
			references.push( reference );
		}
	}

	return references;
}

interface FromReferencesOptions {
	valueShape?: 'ids' | 'objects';
	fields?: PostSelectionField[];
	multiple?: boolean;
}

/**
 * Converts references back into the stored shape selected by `valueShape` and `multiple`.
 */
export function fromReferences(
	references: PostReference[],
	{ valueShape = 'ids', fields = ALL_FIELDS, multiple = true }: FromReferencesOptions
): PostSelectionValue {
	if ( valueShape === 'ids' ) {
		const ids = references.map( ( reference ) => reference.id );
		return multiple ? ids : ids[ 0 ] ?? null;
	}

	const objects = references.map( ( reference ) => {
		const object: PostReference = { id: reference.id };

		for ( const field of fields ) {
			if ( reference[ field ] !== undefined ) {
				object[ field ] = reference[ field ];
			}
		}

		return object;
	} );

	return multiple ? objects : objects[ 0 ] ?? null;
}

/**
 * Moves one item, returning a new array. Out-of-range indexes return the input unchanged.
 */
export function moveItem< T >( items: T[], from: number, to: number ): T[] {
	if (
		from === to ||
		from < 0 ||
		to < 0 ||
		from >= items.length ||
		to >= items.length
	) {
		return items;
	}

	const next = [ ...items ];
	const [ item ] = next.splice( from, 1 );
	next.splice( to, 0, item );

	return next;
}
