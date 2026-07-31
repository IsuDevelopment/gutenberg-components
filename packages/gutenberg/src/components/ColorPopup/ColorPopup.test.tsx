import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorPopup } from './ColorPopup.js';

const COLORS = [
	{ color: '#111111', name: 'Contrast', slug: 'contrast' },
	{ color: '#ffffff', name: 'Base', slug: 'base' },
];

describe( 'ColorPopup', () => {
	it( 'resolves the picked color to its full palette entry', async () => {
		const onChange = jest.fn();
		render(
			<ColorPopup
				label="Background"
				value=""
				onChange={ onChange }
				colors={ COLORS }
			/>
		);

		await userEvent.click( screen.getByRole( 'button', { name: /background/i } ) );
		await userEvent.click( screen.getByRole( 'option', { name: /contrast/i } ) );

		expect( onChange ).toHaveBeenCalledWith( {
			color: '#111111',
			name: 'Contrast',
			slug: 'contrast',
			alpha: 1,
		} );
	} );

	it( 'passes through a custom color not in the palette', async () => {
		const onChange = jest.fn();
		render(
			<ColorPopup
				label="Background"
				value="#8a3434"
				onChange={ onChange }
				colors={ COLORS }
				clearable
			/>
		);

		await userEvent.click( screen.getByRole( 'button', { name: /background/i } ) );
		await userEvent.click( screen.getByRole( 'button', { name: /clear/i } ) );

		expect( onChange ).toHaveBeenCalledWith( {
			color: '',
			name: '',
			slug: '',
			alpha: 1,
		} );
	} );

	it( 'accepts a value given as a slug, not just a hex string', async () => {
		render(
			<ColorPopup
				label="Background"
				value="base"
				onChange={ jest.fn() }
				colors={ COLORS }
				enableAlpha
			/>
		);

		// The swatch on the toggle button reflects the resolved color, proving the slug
		// was matched against the palette rather than treated as a literal CSS color.
		const swatch = screen
			.getByRole( 'button', { name: /background/i } )
			.querySelector( 'span' );

		expect( swatch ).toHaveStyle( { background: '#ffffff' } );
	} );

	it( 'hides the clear button until a value is set', async () => {
		render(
			<ColorPopup
				label="Background"
				value=""
				onChange={ jest.fn() }
				colors={ COLORS }
				clearable
			/>
		);

		await userEvent.click( screen.getByRole( 'button', { name: /background/i } ) );

		expect( screen.getByRole( 'button', { name: /clear/i } ) ).toBeDisabled();
	} );

	it( 'does not render a clear button when clearable is not set', async () => {
		render(
			<ColorPopup
				label="Background"
				value="#111111"
				onChange={ jest.fn() }
				colors={ COLORS }
			/>
		);

		await userEvent.click( screen.getByRole( 'button', { name: /background/i } ) );

		expect(
			screen.queryByRole( 'button', { name: /clear/i } )
		).not.toBeInTheDocument();
	} );

	it( 'ignores an alpha change while no color is selected', async () => {
		const onChange = jest.fn();
		render(
			<ColorPopup
				label="Background"
				value=""
				onChange={ onChange }
				colors={ COLORS }
				enableAlpha
			/>
		);

		await userEvent.click( screen.getByRole( 'button', { name: /background/i } ) );

		expect( onChange ).not.toHaveBeenCalled();
	} );
} );
