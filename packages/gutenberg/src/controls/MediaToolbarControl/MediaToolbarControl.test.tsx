import { forwardRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaToolbarControl } from './MediaToolbarControl.js';

jest.mock( '@wordpress/block-editor', () => ( {
	BlockControls: ( { children }: { children: React.ReactNode } ) => (
		<div data-testid="block-controls">{ children }</div>
	),
	MediaUploadCheck: ( { children }: { children: React.ReactNode } ) => children,
	MediaUpload: ( {
		render,
	}: {
		render: ( args: { open: () => void } ) => React.ReactNode;
	} ) => render( { open: jest.fn() } ),
} ) );

jest.mock( '@wordpress/components', () => ( {
	ToolbarGroup: ( { children }: { children: React.ReactNode } ) => (
		<div>{ children }</div>
	),
	ToolbarButton: forwardRef< HTMLButtonElement, Record< string, unknown > >(
		function ToolbarButton( props, ref ) {
			return (
				<button
					ref={ ref }
					onClick={ props.onClick as () => void }
					aria-label={ props.title as string }
				>
					{ props.title as string }
				</button>
			);
		}
	),
} ) );

jest.mock( '@wordpress/icons', () => ( {
	media: 'media',
	replace: 'replace',
	trash: 'trash',
} ) );

describe( 'MediaToolbarControl', () => {
	it( 'switches select to replace and can hide remove independently', () => {
		const { rerender } = render(
			<MediaToolbarControl value={ {} } onChange={ jest.fn() } />
		);
		expect(
			screen.getByRole( 'button', { name: 'Select media' } )
		).toBeInTheDocument();

		rerender(
			<MediaToolbarControl
				value={ { id: 4, url: '/photo.jpg', type: 'image' } }
				onChange={ jest.fn() }
				actions={ { remove: false } }
			/>
		);
		expect(
			screen.getByRole( 'button', { name: 'Replace media' } )
		).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Remove media' } )
		).not.toBeInTheDocument();
	} );

	it( 'calls custom remove behavior', async () => {
		const user = userEvent.setup();
		const onRemove = jest.fn();
		render(
			<MediaToolbarControl
				value={ { id: 4 } }
				onChange={ jest.fn() }
				onRemove={ onRemove }
			/>
		);

		await user.click(
			screen.getByRole( 'button', { name: 'Remove media' } )
		);
		expect( onRemove ).toHaveBeenCalledTimes( 1 );
	} );
} );
