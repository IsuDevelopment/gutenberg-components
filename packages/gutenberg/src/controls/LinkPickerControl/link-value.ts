import type { LinkAttributes, LinkValue } from './types.js';

const MANAGED_REL_TOKENS = [ 'noopener', 'noreferrer' ] as const;
const UNSAFE_URL_PROTOCOL = /^(?:javascript|data|vbscript):/i;

function relTokens( rel?: string ): Set< string > {
	return new Set( rel?.trim().split( /\s+/ ).filter( Boolean ) ?? [] );
}

/**
 * Canonicalizes the settings managed by the picker while preserving custom `rel` tokens.
 */
export function normalizeLinkValue( value: LinkValue = {} ): LinkValue {
	const tokens = relTokens( value.rel );
	const opensInNewTab = Boolean( value.opensInNewTab );
	const nofollow = value.nofollow ?? tokens.has( 'nofollow' );

	for ( const token of MANAGED_REL_TOKENS ) {
		if ( opensInNewTab ) {
			tokens.add( token );
		} else {
			tokens.delete( token );
		}
	}

	if ( nofollow ) {
		tokens.add( 'nofollow' );
	} else {
		tokens.delete( 'nofollow' );
	}

	const url = value.url?.trim();

	return {
		...value,
		url: url || undefined,
		opensInNewTab,
		nofollow,
		rel: [ ...tokens ].join( ' ' ) || undefined,
	};
}

/**
 * Maps a stored link value to attributes that can be spread onto an anchor.
 *
 * This is a client-side guard, not a replacement for `esc_url()` in dynamic PHP renders.
 */
export function getLinkAttributes( value: LinkValue = {} ): LinkAttributes {
	const normalized = normalizeLinkValue( value );
	const href = normalized.url;
	const protocolProbe = href?.replace( /[\u0000-\u0020\u007f]/g, '' );

	if ( ! href || ! protocolProbe || UNSAFE_URL_PROTOCOL.test( protocolProbe ) ) {
		return {};
	}

	return {
		href,
		...( normalized.opensInNewTab ? { target: '_blank' as const } : {} ),
		...( normalized.rel ? { rel: normalized.rel } : {} ),
	};
}
