import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaPickerControl } from './MediaPickerControl.js';
import {
	hasMediaValue,
	normalizeMediaValue,
	resolveMediaActions,
} from './media-value.js';

const NATIVE_MEDIA = {
	id: 42,
	url: '/full.jpg',
	type: 'image',
	mime: 'image/jpeg',
	alt: 'Original alt',
	width: 1600,
	height: 900,
	sizes: {
		medium: { url: '/medium.jpg', width: 640, height: 360 },
	},
};

jest.mock( '@wordpress/block-editor', () => ( {
	MediaUploadCheck: ( { children }: { children: React.ReactNode } ) => children,
	MediaUpload: ( {
		render,
		onSelect,
	}: {
		render: ( args: { open: () => void } ) => React.ReactNode;
		onSelect: ( media: unknown ) => void;
	} ) => render( { open: () => onSelect( NATIVE_MEDIA ) } ),
} ) );

describe( 'MediaPickerControl', () => {
	it( 'opens the native picker and emits a normalized requested rendition', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		render(
			<MediaPickerControl
				value={ {} }
				onChange={ onChange }
				imageSize="medium"
			>
				{ ( { open, action } ) => (
					<button onClick={ open }>{ action }</button>
				) }
			</MediaPickerControl>
		);

		await user.click( screen.getByRole( 'button', { name: 'select' } ) );
		expect( onChange ).toHaveBeenCalledWith(
			{
				id: 42,
				url: '/medium.jpg',
				type: 'image',
				mime: 'image/jpeg',
				alt: 'Original alt',
				width: 640,
				height: 360,
			},
			NATIVE_MEDIA
		);
	} );

	it( 'exposes replacement state and makes open a no-op while disabled', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		render(
			<MediaPickerControl
				value={ { id: 5 } }
				onChange={ onChange }
				disabled
			>
				{ ( { open, action, disabled } ) => (
					<button onClick={ open } disabled={ false } data-disabled={ disabled }>
						{ action }
					</button>
				) }
			</MediaPickerControl>
		);

		await user.click( screen.getByRole( 'button', { name: 'replace' } ) );
		expect( onChange ).not.toHaveBeenCalled();
	} );
} );

describe( 'media value helpers', () => {
	it( 'normalizes REST-shaped media and infers broad type from MIME', () => {
		expect(
			normalizeMediaValue( {
				id: 7,
				source_url: ' /clip.mp4 ',
				mime_type: 'video/mp4',
				type: 'file',
			} )
		).toMatchObject( { id: 7, url: '/clip.mp4', type: 'video' } );
	} );

	it( 'resolves media presence and partial action overrides', () => {
		expect( hasMediaValue( { url: '/photo.jpg' } ) ).toBe( true );
		expect( hasMediaValue( {} ) ).toBe( false );
		expect( resolveMediaActions( { remove: false } ) ).toEqual( {
			select: true,
			replace: true,
			remove: false,
		} );
		expect( resolveMediaActions( false ) ).toEqual( {
			select: false,
			replace: false,
			remove: false,
		} );
	} );
} );
