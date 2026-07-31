import { render, screen } from '@testing-library/react';
import { getMediaObjectPosition, MediaPreview } from './MediaPreview.js';

describe( 'MediaPreview', () => {
	it( 'renders an accessible image with focal positioning', () => {
		render(
			<MediaPreview
				value={ {
					url: '/photo.jpg',
					type: 'image',
					alt: 'Mountain',
				} }
				focalPoint={ { x: 0.25, y: 0.75 } }
				aspectRatio="16 / 9"
			/>
		);

		const image = screen.getByRole( 'img', { name: 'Mountain' } );
		expect( image.style.aspectRatio ).toBe( '16 / 9' );
		expect( image.style.objectPosition ).toBe( '25% 75%' );
	} );

	it( 'renders video-specific props and clamps unsafe focal coordinates', () => {
		const { container } = render(
			<MediaPreview
				value={ { url: '/clip.mp4', type: 'video' } }
				focalPoint={ { x: -1, y: 2 } }
				videoProps={ { muted: true, loop: true } }
			/>
		);

		const video = container.querySelector( 'video' );
		expect( video ).toHaveAttribute( 'src', '/clip.mp4' );
		expect( video ).toHaveStyle( { objectPosition: '0% 100%' } );
		expect( video ).toHaveAttribute( 'loop' );
	} );

	it( 'uses explicit fallbacks for empty and unsupported media', () => {
		const { rerender } = render(
			<MediaPreview emptyFallback={ <span>No media</span> } />
		);
		expect( screen.getByText( 'No media' ) ).toBeInTheDocument();

		rerender(
			<MediaPreview
				value={ { url: '/document.pdf', type: 'application' } }
				unsupportedFallback={ <span>Unsupported</span> }
			/>
		);
		expect( screen.getByText( 'Unsupported' ) ).toBeInTheDocument();
	} );

	it( 'ignores invalid focal values', () => {
		expect(
			getMediaObjectPosition( { x: Number.NaN, y: 0.5 } )
		).toBeUndefined();
	} );
} );
