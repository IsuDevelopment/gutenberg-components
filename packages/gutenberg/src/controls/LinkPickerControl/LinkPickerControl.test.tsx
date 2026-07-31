import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkPickerControl } from './LinkPickerControl.js';
import { getLinkAttributes, normalizeLinkValue } from './link-value.js';

jest.mock( '@wordpress/block-editor', () => ( {
	LinkControl: ( {
		onChange,
		onRemove,
		value,
		showInitialSuggestions,
		forceIsEditingLink,
		hasRichPreviews,
	}: {
		onChange: ( value: Record< string, unknown > ) => void;
		onRemove: () => void;
		value: Record< string, unknown > | null;
		showInitialSuggestions: boolean;
		forceIsEditingLink?: boolean;
		hasRichPreviews: boolean;
	} ) => (
		<div
			data-testid="wordpress-link-control"
			data-value={ value === null ? 'null' : 'object' }
			data-show-initial-suggestions={ String( showInitialSuggestions ) }
			data-force-is-editing={ String( forceIsEditingLink ) }
			data-rich-previews={ String( hasRichPreviews ) }
		>
			<button
				type="button"
				onClick={ () =>
					onChange( {
						url: ' https://example.com/docs ',
						opensInNewTab: true,
						nofollow: true,
					} )
				}
			>
				Select link
			</button>
			<button type="button" onClick={ onRemove }>
				Remove link
			</button>
		</div>
	),
} ) );

jest.mock( '@wordpress/components', () => ( {
	Popover: ( {
		children,
		onClose,
		animate,
		shift,
		constrainTabbing,
	}: {
		children: React.ReactNode;
		onClose: () => void;
		animate: boolean;
		shift: boolean;
		constrainTabbing: boolean;
	} ) => (
		<div
			data-testid="popover"
			data-animate={ String( animate ) }
			data-shift={ String( shift ) }
			data-constrain-tabbing={ String( constrainTabbing ) }
		>
			{ children }
			<button type="button" onClick={ onClose }>
				Close picker
			</button>
		</div>
	),
} ) );

describe( 'link value helpers', () => {
	it( 'preserves custom rel values and manages security and nofollow tokens', () => {
		expect(
			normalizeLinkValue( {
				url: ' https://example.com ',
				opensInNewTab: true,
				nofollow: true,
				rel: 'ugc sponsored ugc',
			} )
		).toEqual( {
			url: 'https://example.com',
			opensInNewTab: true,
			nofollow: true,
			rel: 'ugc sponsored noopener noreferrer nofollow',
		} );
	} );

	it( 'removes only picker-managed rel values when settings are disabled', () => {
		expect(
			normalizeLinkValue( {
				rel: 'noopener noreferrer nofollow sponsored',
				opensInNewTab: false,
				nofollow: false,
			} ).rel
		).toBe( 'sponsored' );
	} );

	it( 'builds safe anchor attributes and rejects executable URL protocols', () => {
		expect(
			getLinkAttributes( {
				url: 'https://example.com',
				opensInNewTab: true,
			} )
		).toEqual( {
			href: 'https://example.com',
			target: '_blank',
			rel: 'noopener noreferrer',
		} );

		expect(
			getLinkAttributes( { url: ' javascript:alert(1) ' } )
		).toEqual( {} );
		expect(
			getLinkAttributes( { url: 'java\tscript:\nalert(1)' } )
		).toEqual( {} );
	} );
} );

describe( 'LinkPickerControl', () => {
	it( 'anchors to consumer UI, opens, normalizes changes and closes', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();
		const onOpenChange = jest.fn();

		render(
			<LinkPickerControl
				value={ { rel: 'ugc' } }
				onChange={ onChange }
				onOpenChange={ onOpenChange }
			>
				{ ( { anchorRef, open } ) => (
					<button ref={ anchorRef } type="button" onClick={ open }>
						Edit card link
					</button>
				) }
			</LinkPickerControl>
		);

		await user.click( screen.getByRole( 'button', { name: 'Edit card link' } ) );

		const linkControl = screen.getByTestId( 'wordpress-link-control' );
		expect( linkControl ).toHaveAttribute( 'data-value', 'null' );
		expect( linkControl ).toHaveAttribute(
			'data-show-initial-suggestions',
			'true'
		);
		expect( linkControl ).toHaveAttribute( 'data-force-is-editing', 'true' );
		expect( linkControl ).toHaveAttribute( 'data-rich-previews', 'true' );
		expect( screen.getByTestId( 'popover' ) ).toHaveAttribute(
			'data-animate',
			'false'
		);
		expect( onOpenChange ).toHaveBeenLastCalledWith( true );

		await user.click( screen.getByRole( 'button', { name: 'Select link' } ) );

		expect( onChange ).toHaveBeenCalledWith( {
			rel: 'ugc noopener noreferrer nofollow',
			url: 'https://example.com/docs',
			opensInNewTab: true,
			nofollow: true,
		} );

		await user.click( screen.getByRole( 'button', { name: 'Close picker' } ) );
		expect( screen.queryByTestId( 'popover' ) ).not.toBeInTheDocument();
		expect( onOpenChange ).toHaveBeenLastCalledWith( false );
	} );

	it( 'resets the value when no custom remove handler is provided', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		render(
			<LinkPickerControl
				defaultOpen
				value={ { url: 'https://example.com' } }
				onChange={ onChange }
			>
				{ ( { anchorRef } ) => <span ref={ anchorRef }>Anchor</span> }
			</LinkPickerControl>
		);

		await user.click( screen.getByRole( 'button', { name: 'Remove link' } ) );

		expect( onChange ).toHaveBeenCalledWith( {} );
		expect( screen.queryByTestId( 'popover' ) ).not.toBeInTheDocument();
	} );
} );
