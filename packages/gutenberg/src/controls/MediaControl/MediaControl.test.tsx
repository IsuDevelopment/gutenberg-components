import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaControl } from './MediaControl.js';

jest.mock( '../MediaCanvasControl/index.js', () => ( {
	MediaCanvasControl: ( {
		onChange,
	}: {
		onChange: ( value: { id: number; url: string; type: string } ) => void;
	} ) => (
		<button
			onClick={ () =>
				onChange( { id: 2, url: '/next.jpg', type: 'image' } )
			}
		>
			Canvas change
		</button>
	),
} ) );

jest.mock( '../MediaToolbarControl/index.js', () => ( {
	MediaToolbarControl: ( { onRemove }: { onRemove: () => void } ) => (
		<button onClick={ onRemove }>Toolbar remove</button>
	),
} ) );

jest.mock( '../MediaSidebarControl/index.js', () => ( {
	MediaSidebarControl: () => <div>Sidebar</div>,
} ) );

describe( 'MediaControl', () => {
	it( 'allows every composed location to be disabled', () => {
		const { container } = render(
			<MediaControl
				onChange={ jest.fn() }
				canvas={ false }
				toolbar={ false }
				sidebar={ false }
			/>
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'coordinates media changes and optional focal-point reset', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		const onFocalPointChange = jest.fn();

		render(
			<MediaControl
				value={ { id: 1, url: '/old.jpg', type: 'image' } }
				onChange={ onChange }
				focalPoint={ { x: 0.2, y: 0.8 } }
				onFocalPointChange={ onFocalPointChange }
				resetFocalPointOnChange
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Canvas change' } ) );
		expect( onFocalPointChange ).toHaveBeenCalledWith( undefined );
		expect( onChange ).toHaveBeenCalledWith(
			{ id: 2, url: '/next.jpg', type: 'image' },
			undefined
		);
	} );

	it( 'uses one shared custom remove handler', async () => {
		const user = userEvent.setup();
		const onRemove = jest.fn();
		render( <MediaControl onChange={ jest.fn() } onRemove={ onRemove } /> );

		await user.click(
			screen.getByRole( 'button', { name: 'Toolbar remove' } )
		);
		expect( onRemove ).toHaveBeenCalledTimes( 1 );
	} );
} );
