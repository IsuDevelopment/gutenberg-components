import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconSelect } from './IconSelect.js';

const ICONS = [
	{ name: 'alert', label: 'Alert', icon: '/alert.svg' },
	{ name: 'calendar', label: 'Calendar', icon: '/calendar.svg' },
];

describe( 'IconSelect', () => {
	it( 'shows no preview before selection and picks from the dropdown grid', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		render(
			<IconSelect
				label="Icon"
				value=""
				onChange={ onChange }
				defaultIcons={ ICONS }
				searchable={ false }
			/>
		);

		const toggle = screen.getByRole( 'button', { name: 'Icon: Select icon' } );
		expect( toggle.querySelector( 'img' ) ).not.toBeInTheDocument();

		await user.click( toggle );
		await user.click( screen.getByRole( 'button', { name: 'Alert' } ) );

		expect( onChange ).toHaveBeenCalledWith( 'alert' );
		expect(
			screen.queryByRole( 'button', { name: 'Alert' } )
		).not.toBeInTheDocument();
	} );

	it( 'keeps the dropdown open when closeOnSelect is disabled', async () => {
		const user = userEvent.setup();

		render(
			<IconSelect
				label="Icon"
				value="alert"
				onChange={ jest.fn() }
				defaultIcons={ ICONS }
				searchable={ false }
				closeOnSelect={ false }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Icon: Alert' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Calendar' } ) );

		expect(
			screen.getByRole( 'button', { name: 'Calendar' } )
		).toBeInTheDocument();
	} );
} );
