import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDropIndex, SortablePostList } from './SortablePostList.js';

const ITEMS = [
	{ id: 1, title: 'First' },
	{ id: 2, title: 'Second' },
	{ id: 3, title: 'Third', isUnavailable: true },
];

describe( 'getDropIndex', () => {
	it( 'accounts for the dragged row leaving its slot', () => {
		expect( getDropIndex( 0, 2, 'after' ) ).toBe( 2 );
		expect( getDropIndex( 0, 2, 'before' ) ).toBe( 1 );
		expect( getDropIndex( 2, 0, 'before' ) ).toBe( 0 );
		expect( getDropIndex( 2, 0, 'after' ) ).toBe( 1 );
	} );
} );

describe( 'SortablePostList', () => {
	it( 'moves a row with the arrow keys on its handle', async () => {
		const user = userEvent.setup();
		const onMove = jest.fn();

		render( <SortablePostList items={ ITEMS } onMove={ onMove } /> );

		screen.getByRole( 'button', { name: 'Reorder Second' } ).focus();
		await user.keyboard( '{ArrowUp}' );
		expect( onMove ).toHaveBeenLastCalledWith( 1, 0 );

		screen.getByRole( 'button', { name: 'Reorder First' } ).focus();
		await user.keyboard( '{ArrowUp}' );
		expect( onMove ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'removes rows, including unavailable ones', async () => {
		const user = userEvent.setup();
		const onRemove = jest.fn();

		render( <SortablePostList items={ ITEMS } onRemove={ onRemove } /> );

		await user.click(
			screen.getByRole( 'button', { name: 'Remove Unavailable post (#3)' } )
		);
		expect( onRemove ).toHaveBeenCalledWith( 2 );
		expect( screen.queryByRole( 'button', { name: /Reorder/ } ) ).toBeNull();
	} );
} );
