import { act, renderHook } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { useBreakpoint } from './useBreakpoint';

const setDeviceType = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
	useDispatch: () => ( { setDeviceType } ),
} ) );

jest.mock( '@wordpress/editor', () => ( { store: 'core/editor' } ) );

const mockedUseSelect = useSelect as unknown as jest.Mock;

beforeEach( () => {
	jest.clearAllMocks();
	mockedUseSelect.mockReturnValue( null );
} );

describe( 'useBreakpoint', () => {
	it( 'starts on the base breakpoint and keeps state locally', () => {
		const { result } = renderHook( () => useBreakpoint() );

		expect( result.current[ 0 ] ).toBe( 'desktop' );

		act( () => result.current[ 1 ]( 'mobile' ) );

		expect( result.current[ 0 ] ).toBe( 'mobile' );
		expect( setDeviceType ).not.toHaveBeenCalled();
	} );

	it( 'pushes the selection to the editor when syncToEditor is set', () => {
		const { result } = renderHook( () =>
			useBreakpoint( { syncToEditor: true } )
		);

		act( () => result.current[ 1 ]( 'tablet' ) );

		expect( setDeviceType ).toHaveBeenCalledWith( 'Tablet' );
	} );

	it( 'follows the editor device type when syncFromEditor is set', () => {
		mockedUseSelect.mockReturnValue( 'mobile' );

		const { result } = renderHook( () =>
			useBreakpoint( { syncFromEditor: true } )
		);

		expect( result.current[ 0 ] ).toBe( 'mobile' );
	} );

	it( 'ignores an editor device type outside the breakpoint set', () => {
		mockedUseSelect.mockReturnValue( 'watch' );

		const { result } = renderHook( () =>
			useBreakpoint( { syncFromEditor: true } )
		);

		expect( result.current[ 0 ] ).toBe( 'desktop' );
	} );
} );
