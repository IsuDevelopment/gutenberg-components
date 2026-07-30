import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ResponsiveControl } from './ResponsiveControl.js';

jest.mock( '@wordpress/data', () => ( {
	useSelect: () => null,
	useDispatch: () => ( { setDeviceType: jest.fn() } ),
} ) );

jest.mock( '@wordpress/editor', () => ( { store: 'core/editor' } ) );

function Harness( {
	attributes,
	setAttributes = jest.fn(),
}: {
	attributes: Record< string, unknown >;
	setAttributes?: ( next: Record< string, unknown > ) => void;
} ) {
	return (
		<ResponsiveControl
			attrName="columnGap"
			label="Column Gap"
			attributes={ attributes }
			setAttributes={ setAttributes }
		>
			{ ( { value, inheritedValue, onChange } ) => (
				<input
					aria-label="Column Gap value"
					value={ value === undefined ? '' : String( value ) }
					placeholder={
						inheritedValue === undefined
							? ''
							: String( inheritedValue )
					}
					onChange={ ( event ) => onChange( event.target.value ) }
				/>
			) }
		</ResponsiveControl>
	);
}

describe( 'ResponsiveControl', () => {
	it( 'swaps which attribute the child edits when the breakpoint changes', async () => {
		const setAttributes = jest.fn();
		render(
			<Harness
				attributes={ { columnGap: 24 } }
				setAttributes={ setAttributes }
			/>
		);

		// Starts on the base breakpoint, showing its value.
		expect( screen.getByText( 'Column Gap' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Column Gap value' ) ).toHaveValue(
			'24'
		);

		await userEvent.click(
			screen.getByRole( 'radio', { name: /mobile/i } )
		);

		const input = screen.getByLabelText( 'Column Gap value' );
		expect( input ).toHaveValue( '' );
		expect( input ).toHaveAttribute( 'placeholder', '24' );

		await userEvent.type( input, '8' );

		expect( setAttributes ).toHaveBeenCalledWith( { columnGapMobile: '8' } );
	} );

	it( 'offers a reset only when the active breakpoint has an override', async () => {
		const setAttributes = jest.fn();
		render(
			<Harness
				attributes={ { columnGap: 24, columnGapMobile: 8 } }
				setAttributes={ setAttributes }
			/>
		);

		expect(
			screen.queryByRole( 'button', { name: /reset/i } )
		).not.toBeInTheDocument();

		await userEvent.click(
			screen.getByRole( 'radio', { name: /mobile/i } )
		);
		await userEvent.click(
			screen.getByRole( 'button', { name: /reset/i } )
		);

		expect( setAttributes ).toHaveBeenCalledWith( {
			columnGapMobile: undefined,
		} );
	} );
} );
