import { renderHook } from '@testing-library/react';
import { useResponsiveAttribute } from './useResponsiveAttribute.js';

function setup(
	attributes: Record< string, unknown >,
	breakpoint = 'mobile'
) {
	const setAttributes = jest.fn();
	const { result } = renderHook( () =>
		useResponsiveAttribute( {
			attrName: 'columnGap',
			breakpoint,
			attributes,
			setAttributes,
		} )
	);
	return { result, setAttributes };
}

describe( 'useResponsiveAttribute', () => {
	it( 'reads the base attribute unsuffixed and others suffixed', () => {
		const base = setup( { columnGap: 24 }, 'desktop' );

		expect( base.result.current.attrNameForBreakpoint ).toBe( 'columnGap' );
		expect( base.result.current.value ).toBe( 24 );

		const override = setup( { columnGap: 24, columnGapMobile: 8 } );

		expect( override.result.current.attrNameForBreakpoint ).toBe(
			'columnGapMobile'
		);
		expect( override.result.current.value ).toBe( 8 );
	} );

	it( 'separates own, inherited and resolved values', () => {
		const { result } = setup( { columnGap: 24, columnGapTablet: 16 } );

		expect( result.current.value ).toBeUndefined();
		expect( result.current.inheritedValue ).toBe( 16 );
		expect( result.current.resolvedValue ).toBe( 16 );
		expect( result.current.hasOwnValue ).toBe( false );
	} );

	it( 'keeps a zero override instead of inheriting', () => {
		const { result } = setup( { columnGap: 24, columnGapMobile: 0 } );

		expect( result.current.value ).toBe( 0 );
		expect( result.current.hasOwnValue ).toBe( true );
		expect( result.current.resolvedValue ).toBe( 0 );
		expect( result.current.inheritedValue ).toBe( 24 );
	} );

	it( 'reports which breakpoints carry an override', () => {
		const { result } = setup( { columnGap: 24, columnGapTablet: 16 } );

		expect( result.current.hasValue ).toEqual( {
			desktop: false,
			tablet: true,
			mobile: false,
		} );
	} );

	it( 'writes to the active breakpoint attribute', () => {
		const { result, setAttributes } = setup( { columnGap: 24 } );

		result.current.onChange( 8 );

		expect( setAttributes ).toHaveBeenCalledWith( { columnGapMobile: 8 } );
	} );

	it( 'resets by writing undefined so the block default applies', () => {
		const { result, setAttributes } = setup( {
			columnGap: 24,
			columnGapMobile: 8,
		} );

		result.current.reset();

		expect( setAttributes ).toHaveBeenCalledWith( {
			columnGapMobile: undefined,
		} );
	} );

	it( 'resetAll clears every override but keeps the base value', () => {
		const { result, setAttributes } = setup( {
			columnGap: 24,
			columnGapTablet: 16,
			columnGapMobile: 8,
		} );

		result.current.resetAll();

		expect( setAttributes ).toHaveBeenCalledWith( {
			columnGapTablet: undefined,
			columnGapMobile: undefined,
		} );
		expect( setAttributes.mock.calls[ 0 ][ 0 ] ).not.toHaveProperty(
			'columnGap'
		);
	} );
} );
