import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostPickerModal } from './PostPickerModal.js';

const DISPLAYS = [ 1, 2, 3 ].map( ( id ) => ( {
	id,
	type: 'post',
	title: `Post ${ id }`,
	link: `/p/${ id }`,
	date: '2026-09-18T10:00:00',
} ) );

jest.mock( '../../hooks/useCurrentPostId/index.js', () => ( {
	useCurrentPostId: () => undefined,
} ) );
jest.mock( '../../bindings/options/useTermsOptions.js', () => ( {
	useTermsOptions: () => ( { options: [], isLoading: false, error: null } ),
} ) );
jest.mock( '../../_internal/post-picker/usePickerTypes.js', () => {
	const types = [ { slug: 'post', label: 'Post', restBase: 'posts', taxonomies: [] } ];
	const taxonomies = new Map();
	return {
		usePickerTypes: () => ( { types, taxonomies, isLoading: false } ),
	};
} );
jest.mock( '../../_internal/post-picker/usePostResults.js', () => ( {
	usePostResults: () => ( {
		items: DISPLAYS,
		total: 3,
		hasMore: false,
		isLoading: false,
		error: null,
	} ),
} ) );
jest.mock( '../../_internal/post-picker/usePostHydration.js', () => {
	const displays = new Map();
	const unavailable = new Set();
	return {
		usePostHydration: () => ( { displays, unavailable, isLoading: false } ),
	};
} );

describe( 'PostPickerModal', () => {
	it( 'emits the draft once on save, in selection order', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		const onClose = jest.fn();

		render(
			<PostPickerModal
				value={ [ 2 ] }
				onChange={ onChange }
				onClose={ onClose }
				valueShape="objects"
				fields={ [ 'title' ] }
			/>
		);

		await user.click( screen.getByLabelText( /Post 1/ ) );
		await user.click( screen.getByRole( 'button', { name: 'Save selection' } ) );

		expect( onChange ).toHaveBeenCalledTimes( 1 );
		expect( onChange ).toHaveBeenCalledWith( [
			{ id: 2, title: 'Post 2' },
			{ id: 1, title: 'Post 1' },
		] );
		expect( onClose ).toHaveBeenCalled();
	} );

	it( 'discards the draft on cancel', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		const onClose = jest.fn();

		render( <PostPickerModal onChange={ onChange } onClose={ onClose } /> );

		await user.click( screen.getByLabelText( /Post 1/ ) );
		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( onChange ).not.toHaveBeenCalled();
		expect( onClose ).toHaveBeenCalled();
	} );

	it( 'disables unchecked rows once max is reached', async () => {
		const user = userEvent.setup();

		render(
			<PostPickerModal value={ [ 1 ] } max={ 2 } onChange={ jest.fn() } onClose={ jest.fn() } />
		);

		expect( screen.getByLabelText( /Post 3/ ) ).toBeEnabled();
		await user.click( screen.getByLabelText( /Post 2/ ) );
		expect( screen.getByLabelText( /Post 3/ ) ).toBeDisabled();
		expect( screen.getByLabelText( /Post 1/ ) ).toBeEnabled();
		expect( screen.getByText( 'Selected 2 of 2' ) ).toBeInTheDocument();
	} );

	it( 'replaces the selection in single mode', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		render(
			<PostPickerModal value={ 1 } multiple={ false } onChange={ onChange } onClose={ jest.fn() } />
		);

		await user.click( screen.getByLabelText( /Post 3/ ) );
		await user.click( screen.getByRole( 'button', { name: 'Save selection' } ) );

		expect( onChange ).toHaveBeenCalledWith( 3 );
	} );
} );
