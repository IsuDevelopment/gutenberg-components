import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaCanvasControl } from './MediaCanvasControl.js';

jest.mock( '@wordpress/block-editor', () => ( {
	MediaUploadCheck: ( { children }: { children: React.ReactNode } ) => children,
	MediaUpload: ( {
		render,
	}: {
		render: ( args: { open: () => void } ) => React.ReactNode;
	} ) => render( { open: jest.fn() } ),
} ) );

describe( 'MediaCanvasControl', () => {
	it( 'renders a selectable placeholder without media', () => {
		render( <MediaCanvasControl value={ {} } onChange={ jest.fn() } /> );

		expect(
			screen.getByRole( 'button', { name: 'Select media' } )
		).toBeInTheDocument();
		expect( screen.getByText( 'Media' ) ).toBeInTheDocument();
	} );

	it( 'shows preview actions and supports independent action visibility', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		render(
			<MediaCanvasControl
				value={ { url: '/photo.jpg', type: 'image', alt: 'Photo' } }
				onChange={ onChange }
				actions={ { replace: false } }
			/>
		);

		expect( screen.getByRole( 'img', { name: 'Photo' } ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Replace media' } )
		).not.toBeInTheDocument();

		await user.click(
			screen.getByRole( 'button', { name: 'Remove media' } )
		);
		expect( onChange ).toHaveBeenCalledWith( {} );
	} );
} );
