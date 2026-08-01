import { render, screen } from '@testing-library/react';
import { MediaSidebarControl } from './MediaSidebarControl.js';

jest.mock( '@wordpress/block-editor', () => ( {
	InspectorControls: ( { children }: { children: React.ReactNode } ) => (
		<aside>{ children }</aside>
	),
	MediaUploadCheck: ( { children }: { children: React.ReactNode } ) => children,
	MediaUpload: ( {
		render,
	}: {
		render: ( args: { open: () => void } ) => React.ReactNode;
	} ) => render( { open: jest.fn() } ),
} ) );

jest.mock( '@wordpress/components', () => ( {
	PanelBody: ( {
		title,
		children,
	}: {
		title: string;
		children: React.ReactNode;
	} ) => (
		<section>
			<h2>{ title }</h2>
			{ children }
		</section>
	),
	Button: ( {
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick: () => void;
	} ) => <button onClick={ onClick }>{ children }</button>,
} ) );

jest.mock( '@wordpress/icons', () => ( { replace: 'replace', trash: 'trash' } ) );

jest.mock( '../MediaSourceControl/index.js', () => ( {
	MediaSourceControl: ( {
		children,
	}: {
		children: ( args: Record< string, unknown > ) => React.ReactNode;
	} ) =>
		children( {
			toggle: jest.fn(),
			disabled: false,
			isOpen: false,
		} ),
} ) );

jest.mock( '../../components/MediaFocalPointControl/index.js', () => ( {
	MediaFocalPointControl: () => <div data-testid="focal-point-control" />,
} ) );

describe( 'MediaSidebarControl', () => {
	it( 'supports media, focal-point and disabled preview modes', () => {
		const commonProps = {
			value: { url: '/photo.jpg', type: 'image', alt: 'Photo' },
			onChange: jest.fn(),
		};
		const { rerender } = render(
			<MediaSidebarControl { ...commonProps } preview="media" />
		);
		expect( screen.getByRole( 'img', { name: 'Photo' } ) ).toBeInTheDocument();

		rerender(
			<MediaSidebarControl
				{ ...commonProps }
				preview="focal-point"
				onFocalPointChange={ jest.fn() }
			/>
		);
		expect( screen.getByTestId( 'focal-point-control' ) ).toBeInTheDocument();

		rerender( <MediaSidebarControl { ...commonProps } preview={ false } /> );
		expect( screen.queryByRole( 'img' ) ).not.toBeInTheDocument();
		expect(
			screen.queryByTestId( 'focal-point-control' )
		).not.toBeInTheDocument();
	} );

	it( 'can hide every sidebar action without hiding its preview', () => {
		render(
			<MediaSidebarControl
				value={ { url: '/photo.jpg', type: 'image', alt: 'Photo' } }
				onChange={ jest.fn() }
				actions={ false }
			/>
		);

		expect( screen.getByRole( 'img', { name: 'Photo' } ) ).toBeInTheDocument();
		expect( screen.queryAllByRole( 'button' ) ).toHaveLength( 0 );
	} );
} );
