import { act, renderHook } from '@testing-library/react';
import { useBreakpoint } from './useBreakpoint.js';

const setDeviceType = jest.fn();
let editorDeviceTypeFromStore: string | undefined;

jest.mock( '@wordpress/data', () => ( {
	// Invoke the real mapSelect callback so the hook's own read-path logic
	// (including the lowercase transform) is exercised rather than bypassed.
	useSelect: ( mapSelect: ( select: unknown ) => unknown ) =>
		mapSelect( () => ( {
			getDeviceType: () => editorDeviceTypeFromStore,
		} ) ),
	useDispatch: () => ( { setDeviceType } ),
} ) );

jest.mock( '@wordpress/editor', () => ( { store: 'core/editor' } ) );

beforeEach( () => {
	jest.clearAllMocks();
	editorDeviceTypeFromStore = undefined;
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
		editorDeviceTypeFromStore = 'Mobile';

		const { result } = renderHook( () =>
			useBreakpoint( { syncFromEditor: true } )
		);

		expect( result.current[ 0 ] ).toBe( 'mobile' );
	} );

	it( 'ignores an editor device type outside the breakpoint set', () => {
		editorDeviceTypeFromStore = 'Watch';

		const { result } = renderHook( () =>
			useBreakpoint( { syncFromEditor: true } )
		);

		expect( result.current[ 0 ] ).toBe( 'desktop' );
	} );
} );
