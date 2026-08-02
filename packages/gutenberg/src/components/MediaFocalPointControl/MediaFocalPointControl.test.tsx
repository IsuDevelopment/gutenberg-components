import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaFocalPointControl } from './MediaFocalPointControl.js';

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick: () => void;
	} ) => <button onClick={ onClick }>{ children }</button>,
	FocalPointPicker: ( {
		url,
		value,
		onChange,
		label,
	}: {
		url: string;
		value: { x: number; y: number };
		onChange: ( value: { x: number; y: number } ) => void;
		label: string;
	} ) => (
		<button
			data-testid="focal-picker"
			data-url={ url }
			data-value={ `${ value.x },${ value.y }` }
			onClick={ () => onChange( { x: 0.2, y: 0.8 } ) }
		>
			{ label }
		</button>
	),
} ) );

jest.mock( '@wordpress/icons', () => ( { reset: 'reset' } ) );

describe( 'MediaFocalPointControl', () => {
	it( 'edits and resets a supported media focal point', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		render(
			<MediaFocalPointControl
				media={ { url: '/photo.jpg', type: 'image' } }
				value={ { x: 0.4, y: 0.6 } }
				onChange={ onChange }
			/>
		);

		expect( screen.getByTestId( 'focal-picker' ) ).toHaveAttribute(
			'data-value',
			'0.4,0.6'
		);
		await user.click( screen.getByTestId( 'focal-picker' ) );
		expect( onChange ).toHaveBeenCalledWith( { x: 0.2, y: 0.8 } );

		await user.click(
			screen.getByRole( 'button', { name: 'Reset focal point' } )
		);
		expect( onChange ).toHaveBeenLastCalledWith( undefined );
	} );

	it( 'renders nothing for unsupported media', () => {
		render(
			<MediaFocalPointControl
				media={ { url: '/audio.mp3', type: 'audio' } }
				onChange={ jest.fn() }
				emptyFallback={ <span>No focal point</span> }
			/>
		);

		expect( screen.getByText( 'No focal point' ) ).toBeInTheDocument();
	} );
} );
