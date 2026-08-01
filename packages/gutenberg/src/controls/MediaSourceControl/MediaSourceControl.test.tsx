import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaSourceControl } from './MediaSourceControl.js';
import { getMediaAccept, resolveMediaSources } from './media-sources.js';

const MOCK_MEDIA = {
	id: 42,
	url: '/library.jpg',
	type: 'image',
	alt: 'Library image',
};

const MOCK_FEATURED = {
	id: 7,
	source_url: '/featured.jpg',
	media_type: 'image',
	alt_text: 'Featured image',
};

let mockFeaturedId = 7;

jest.mock( '@wordpress/block-editor', () => ( {
	store: 'block-editor',
	MediaUploadCheck: ( { children }: { children: React.ReactNode } ) => children,
	MediaUpload: ( {
		render,
		onSelect,
	}: {
		render: ( args: { open: () => void } ) => React.ReactNode;
		onSelect: ( media: unknown ) => void;
	} ) => render( { open: () => onSelect( MOCK_MEDIA ) } ),
} ) );

jest.mock( '@wordpress/core-data', () => ( { store: 'core' } ) );
jest.mock( '@wordpress/editor', () => ( { store: 'editor' } ) );
jest.mock( '@wordpress/data', () => ( {
	useSelect: ( callback: ( select: ( store: string ) => unknown ) => unknown ) =>
		callback( ( store ) => {
			if ( store === 'block-editor' ) {
				return {
					getSettings: () => ( {
						mediaUpload: ( {
							onFileChange,
						}: {
							onFileChange: ( media: unknown[] ) => void;
						} ) => onFileChange( [ MOCK_MEDIA ] ),
					} ),
				};
			}
			if ( store === 'editor' ) {
				return { getEditedPostAttribute: () => mockFeaturedId };
			}
			return { getEntityRecord: () => MOCK_FEATURED };
		} ),
} ) );

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		onClick,
		disabled,
		label,
		type,
	}: {
		children?: React.ReactNode;
		onClick?: () => void;
		disabled?: boolean;
		label?: string;
		type?: 'button' | 'submit';
	} ) => (
		<button type={ type } onClick={ onClick } disabled={ disabled } aria-label={ label }>
			{ children ?? label }
		</button>
	),
	DropZone: () => <div data-testid="drop-zone" />,
	Dropdown: ( {
		renderToggle,
		renderContent,
	}: {
		renderToggle: ( args: Record< string, unknown > ) => React.ReactNode;
		renderContent: ( args: Record< string, unknown > ) => React.ReactNode;
	} ) => {
		const ReactModule = jest.requireActual< typeof import('react') >( 'react' );
		const [ isOpen, setIsOpen ] = ReactModule.useState( false );
		const onClose = () => setIsOpen( false );
		const onToggle = () => setIsOpen( ( current ) => ! current );
		return (
			<div>
				{ renderToggle( { isOpen, onToggle, onClose } ) }
				{ isOpen && renderContent( { isOpen, onToggle, onClose } ) }
			</div>
		);
	},
	FormFileUpload: ( {
		render,
		onChange,
	}: {
		render: ( args: { openFileDialog: () => void } ) => React.ReactNode;
		onChange: ( event: unknown ) => void;
	} ) =>
		render( {
			openFileDialog: () =>
				onChange( { currentTarget: { files: [ new File( [ 'x' ], 'x.jpg' ) ] } } ),
		} ),
	MenuItem: ( {
		children,
		onClick,
		disabled,
	}: {
		children: React.ReactNode;
		onClick: () => void;
		disabled?: boolean;
	} ) => (
		<button onClick={ onClick } disabled={ disabled }>
			{ children }
		</button>
	),
	NavigableMenu: ( { children }: { children: React.ReactNode } ) => (
		<div>{ children }</div>
	),
	TextControl: ( {
		label,
		value,
		onChange,
	}: {
		label: string;
		value: string;
		onChange: ( value: string ) => void;
	} ) => (
		<label>
			{ label }
			<input value={ value } onChange={ ( event ) => onChange( event.target.value ) } />
		</label>
	),
} ) );

jest.mock( '@wordpress/icons', () => ( {
	media: 'media',
	postFeaturedImage: 'featured',
	trash: 'trash',
	upload: 'upload',
} ) );

describe( 'MediaSourceControl', () => {
	beforeEach( () => {
		mockFeaturedId = 7;
	} );

	it( 'renders native image sources and lets each one be disabled', () => {
		const { rerender } = render(
			<MediaSourceControl variant="buttons" onChange={ jest.fn() } />
		);

		expect( screen.getByRole( 'button', { name: 'Upload' } ) ).toBeInTheDocument();
		expect(
			screen.getByRole( 'button', { name: 'Media Library' } )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'button', { name: 'Insert from URL' } )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'button', { name: 'Use featured image' } )
		).toBeInTheDocument();
		expect( screen.getByTestId( 'drop-zone' ) ).toBeInTheDocument();

		rerender(
			<MediaSourceControl
				variant="buttons"
				onChange={ jest.fn() }
				sources={ {
					upload: false,
					url: false,
					featured: false,
					dropZone: false,
				} }
			/>
		);

		expect( screen.queryByRole( 'button', { name: 'Upload' } ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'drop-zone' ) ).not.toBeInTheDocument();
		expect(
			screen.getByRole( 'button', { name: 'Media Library' } )
		).toBeInTheDocument();
	} );

	it( 'normalizes library, URL and featured selections with their source', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		render(
			<MediaSourceControl
				value={ {} }
				onChange={ onChange }
				sources={ { upload: false } }
			/>
		);
		await user.click( screen.getByRole( 'button', { name: 'Add media' } ) );

		await user.click(
			screen.getByRole( 'button', { name: 'Open Media Library' } )
		);
		expect( onChange ).toHaveBeenLastCalledWith(
			expect.objectContaining( { id: 42, source: 'attachment' } ),
			MOCK_MEDIA
		);

		await user.click( screen.getByRole( 'button', { name: 'Add media' } ) );
		await user.clear( screen.getByRole( 'textbox', { name: 'Current media URL:' } ) );
		await user.type(
			screen.getByRole( 'textbox', { name: 'Current media URL:' } ),
			'/remote.jpg'
		);
		await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );
		expect( onChange ).toHaveBeenLastCalledWith( {
			url: '/remote.jpg',
			type: 'image',
			source: 'url',
		} );

		await user.click( screen.getByRole( 'button', { name: 'Add media' } ) );
		await user.click(
			screen.getByRole( 'button', { name: 'Use featured image' } )
		);
		expect( onChange ).toHaveBeenLastCalledWith(
			expect.objectContaining( { id: 7, source: 'featured' } ),
			MOCK_FEATURED
		);
	} );

	it( 'keeps reset independent from source visibility', async () => {
		const user = userEvent.setup();
		const onRemove = jest.fn();
		render(
			<MediaSourceControl
				value={ { id: 2, url: '/old.jpg', type: 'image' } }
				onChange={ jest.fn() }
				onRemove={ onRemove }
				sources={ false }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Replace' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Reset' } ) );
		expect( onRemove ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'synchronizes a stored featured source with the current post', () => {
		const onChange = jest.fn();
		render(
			<MediaSourceControl
				value={ {
					id: 3,
					url: '/previous-featured.jpg',
					type: 'image',
					source: 'featured',
				} }
				onChange={ onChange }
			/>
		);

		expect( onChange ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: 7,
				url: '/featured.jpg',
				source: 'featured',
			} ),
			MOCK_FEATURED
		);
	} );

	it( 'keeps featured mode when the post featured image is removed', () => {
		mockFeaturedId = 0;
		const onChange = jest.fn();
		render(
			<MediaSourceControl
				value={ {
					id: 7,
					url: '/featured.jpg',
					type: 'image',
					source: 'featured',
				} }
				onChange={ onChange }
			/>
		);

		expect( onChange ).toHaveBeenCalledWith( { source: 'featured' } );
	} );
} );

describe( 'media source helpers', () => {
	it( 'resolves source switches and file accept values', () => {
		expect( resolveMediaSources( { upload: false } ) ).toEqual( {
			library: true,
			upload: false,
			url: true,
			featured: true,
			dropZone: true,
		} );
		expect( getMediaAccept( [ 'image', 'video/mp4' ] ) ).toBe(
			'image/*,video/mp4'
		);
	} );
} );
