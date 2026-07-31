import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconPicker } from './IconPicker.js';

const ICONS = [
	{
		name: 'alert',
		label: 'Alert',
		icon: '/alert.svg',
		keywords: [ 'warning', 'notice' ],
	},
	{ name: 'arrow-right', label: 'Arrow right', icon: '/arrow.svg' },
	{ name: 'calendar', label: 'Calendar', icon: '/calendar.svg' },
];

describe( 'IconPicker', () => {
	it( 'filters by label, name and keywords and emits the selected name', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		render(
			<IconPicker
				label="Choose an icon"
				defaultIcons={ ICONS }
				value=""
				onChange={ onChange }
			/>
		);

		expect( screen.getByRole( 'button', { name: 'Alert' } ) ).toBeInTheDocument();
		await user.type( screen.getByRole( 'searchbox', { name: 'Search icons' } ), 'warn' );

		expect( screen.getByRole( 'button', { name: 'Alert' } ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Arrow right' } )
		).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Alert' } ) );
		expect( onChange ).toHaveBeenCalledWith( 'alert' );
	} );

	it( 'uses a name list as the complete visible subset', () => {
		render(
			<IconPicker
				defaultIcons={ ICONS }
				icons={ [ 'calendar', 'missing' ] }
				onChange={ jest.fn() }
				searchable={ false }
			/>
		);

		expect(
			screen.getByRole( 'button', { name: 'Calendar' } )
		).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Alert' } )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
	} );

	it( 'clears an existing selection and reports empty results', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		render(
			<IconPicker
				defaultIcons={ ICONS }
				value="alert"
				onChange={ onChange }
				noResultsMessage="Nothing matches"
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Clear icon' } ) );
		expect( onChange ).toHaveBeenCalledWith( '' );

		await user.type( screen.getByRole( 'searchbox' ), 'not-present' );
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Nothing matches' );
	} );
} );
