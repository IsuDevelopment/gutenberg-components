import { DEFAULT_BREAKPOINTS } from './defaults';
import { validateBreakpoints } from './validate';

describe( 'validateBreakpoints', () => {
	it( 'accepts the default set', () => {
		expect( validateBreakpoints( DEFAULT_BREAKPOINTS ) ).toEqual( [] );
	} );

	it( 'reports each way a set can be unusable', () => {
		expect(
			validateBreakpoints( [
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B', suffix: 'B' },
			] )
		).toContainEqual( expect.stringContaining( 'exactly one' ) );

		expect(
			validateBreakpoints( [
				{ id: 'a', label: 'A', isBase: true },
				{ id: 'b', label: 'B' },
			] )
		).toContainEqual( expect.stringContaining( 'no suffix' ) );

		expect(
			validateBreakpoints( [
				{ id: 'a', label: 'A', isBase: true },
				{ id: 'a', label: 'A2', suffix: 'X' },
			] )
		).toContainEqual( expect.stringContaining( 'duplicate id' ) );

		expect(
			validateBreakpoints( [
				{ id: 'a', label: 'A', isBase: true },
				{ id: 'b', label: 'B', suffix: 'X' },
				{ id: 'c', label: 'C', suffix: 'X' },
			] )
		).toContainEqual( expect.stringContaining( 'duplicate suffix' ) );
	} );
} );
