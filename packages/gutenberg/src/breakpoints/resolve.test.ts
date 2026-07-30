import { DEFAULT_BREAKPOINTS } from './defaults';
import {
	buildHasValueMap,
	isPresent,
	resolveAttrName,
	resolveCascade,
} from './resolve';

const [ desktop, tablet ] = DEFAULT_BREAKPOINTS;

/**
 * The presence rule is the one thing the whole design rests on, so it is asserted directly
 * rather than only through the cascade. resolveAttrName is not tested on its own — it is
 * string concatenation, and every cascade assertion below exercises it.
 */
describe( 'isPresent', () => {
	it( 'counts 0 and false as values, and undefined/null/empty string as absent', () => {
		expect( isPresent( 0 ) ).toBe( true );
		expect( isPresent( false ) ).toBe( true );
		expect( isPresent( undefined ) ).toBe( false );
		expect( isPresent( null ) ).toBe( false );
		expect( isPresent( '' ) ).toBe( false );
	} );
} );

describe( 'resolveCascade', () => {
	it( 'prefers the own value, then walks back to the base', () => {
		expect(
			resolveCascade( 'columnGap', DEFAULT_BREAKPOINTS, 'mobile', {
				columnGap: 24,
				columnGapMobile: 8,
			} )
		).toBe( 8 );

		expect(
			resolveCascade( 'columnGap', DEFAULT_BREAKPOINTS, 'mobile', {
				columnGap: 24,
				columnGapTablet: 16,
			} )
		).toBe( 16 );

		expect(
			resolveCascade( 'columnGap', DEFAULT_BREAKPOINTS, 'mobile', {
				columnGap: 24,
			} )
		).toBe( 24 );
	} );

	it( 'does not fall through a zero override', () => {
		expect(
			resolveCascade( 'columnGap', DEFAULT_BREAKPOINTS, 'mobile', {
				columnGap: 24,
				columnGapMobile: 0,
			} )
		).toBe( 0 );
	} );

	it( 'skips the active breakpoint when asked, for placeholder values', () => {
		expect(
			resolveCascade(
				'columnGap',
				DEFAULT_BREAKPOINTS,
				'mobile',
				{ columnGap: 24, columnGapMobile: 8 },
				{ skipActive: true }
			)
		).toBe( 24 );
	} );
} );

describe( 'buildHasValueMap', () => {
	it( 'marks only non-base breakpoints that carry an override', () => {
		expect( resolveAttrName( 'columnGap', desktop ) ).toBe( 'columnGap' );
		expect( resolveAttrName( 'columnGap', tablet ) ).toBe(
			'columnGapTablet'
		);

		expect(
			buildHasValueMap( 'columnGap', DEFAULT_BREAKPOINTS, {
				columnGap: 24,
				columnGapTablet: 0,
				columnGapMobile: '',
			} )
		).toEqual( { desktop: false, tablet: true, mobile: false } );
	} );
} );
