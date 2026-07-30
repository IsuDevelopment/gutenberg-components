import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_BREAKPOINTS } from '../../breakpoints';
import { BreakpointSwitcher } from './BreakpointSwitcher';

describe( 'BreakpointSwitcher', () => {
	it( 'renders nothing with fewer than two breakpoints', () => {
		const { container } = render(
			<BreakpointSwitcher
				value="desktop"
				onChange={ jest.fn() }
				breakpoints={ [
					{ id: 'desktop', label: 'Desktop', isBase: true },
				] }
			/>
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'offers every breakpoint and reports the chosen one', async () => {
		const onChange = jest.fn();
		render(
			<BreakpointSwitcher
				value="desktop"
				onChange={ onChange }
				label="Breakpoint"
			/>
		);

		DEFAULT_BREAKPOINTS.forEach( ( breakpoint ) => {
			expect(
				screen.getByRole( 'radio', {
					name: new RegExp( breakpoint.label, 'i' ),
				} )
			).toBeInTheDocument();
		} );

		await userEvent.click(
			screen.getByRole( 'radio', { name: /tablet/i } )
		);

		expect( onChange ).toHaveBeenCalledWith( 'tablet' );
	} );

	it( 'marks overridden breakpoints in the accessible name, never the base', () => {
		render(
			<BreakpointSwitcher
				value="desktop"
				onChange={ jest.fn() }
				label="Breakpoint"
				hasValue={ { desktop: true, tablet: true, mobile: false } }
			/>
		);

		expect(
			screen.getByRole( 'radio', { name: /tablet \(modified\)/i } )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'radio', { name: /^desktop$/i } )
		).toBeInTheDocument();
	} );

	it( 'opens a menu and selects in the dropdown variant', async () => {
		const onChange = jest.fn();
		render(
			<BreakpointSwitcher
				value="desktop"
				onChange={ onChange }
				variant="dropdown"
				label="Breakpoint"
			/>
		);

		await userEvent.click(
			screen.getByRole( 'button', { name: /breakpoint/i } )
		);
		await userEvent.click(
			screen.getByRole( 'menuitem', { name: /mobile/i } )
		);

		expect( onChange ).toHaveBeenCalledWith( 'mobile' );
	} );

} );
