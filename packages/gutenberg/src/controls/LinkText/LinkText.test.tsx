import { forwardRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkText } from './LinkText.js';

jest.mock( '@wordpress/block-editor', () => ( {
	BlockControls: ( { children }: { children: React.ReactNode } ) => (
		<div data-testid="block-controls">{ children }</div>
	),
	LinkControl: ( {
		onChange,
		value,
		showInitialSuggestions,
		forceIsEditingLink,
		hasTextControl,
		hasRichPreviews,
	}: {
		onChange: ( value: Record< string, unknown > ) => void;
		value: Record< string, unknown > | null;
		showInitialSuggestions: boolean;
		forceIsEditingLink?: boolean;
		hasTextControl: boolean;
		hasRichPreviews: boolean;
	} ) => (
		<button
			type="button"
			data-testid="wordpress-link-control"
			data-value={ JSON.stringify( value ) }
			data-show-initial-suggestions={ String( showInitialSuggestions ) }
			data-force-is-editing={ String( forceIsEditingLink ) }
			data-text-control={ String( hasTextControl ) }
			data-rich-previews={ String( hasRichPreviews ) }
			onClick={ () =>
				onChange( {
					url: 'https://example.com/about',
					title: 'About us',
					opensInNewTab: false,
				} )
			}
		>
			Choose about page
		</button>
	),
	RichText: forwardRef< HTMLElement, Record< string, unknown > >(
		function MockRichText( props, ref ) {
			const {
				value,
				onChange,
				onClick,
				className,
				...attributes
			} = props;

			return (
				<>
					<a
						ref={ ref as React.Ref< HTMLAnchorElement > }
						tabIndex={ 0 }
						contentEditable
						suppressContentEditableWarning
						className={ className as string }
						href={ attributes.href as string | undefined }
						target={ attributes.target as string | undefined }
						rel={ attributes.rel as string | undefined }
						aria-label={ attributes[ 'aria-label' ] as string }
						onClick={ onClick as React.MouseEventHandler< HTMLAnchorElement > }
					>
						{ value as string }
					</a>
					<button
						type="button"
						onClick={ () => ( onChange as ( text: string ) => void )( 'Edited' ) }
					>
						Edit text
					</button>
				</>
			);
		}
	),
} ) );

jest.mock( '@wordpress/components', () => ( {
	Popover: ( {
		children,
		focusOnMount,
	}: {
		children: React.ReactNode;
		focusOnMount: 'firstElement' | boolean;
	} ) => (
		<div
			data-testid="popover"
			data-focus-on-mount={ String( focusOnMount ) }
		>
			{ children }
		</div>
	),
	Icon: () => <span data-testid="warning-icon" />,
	Tooltip: ( { children }: { children: React.ReactNode } ) => children,
	ToolbarButton: ( {
		title,
		onClick,
	}: {
		title: string;
		onClick: () => void;
	} ) => (
		<button type="button" onClick={ onClick }>
			{ title }
		</button>
	),
	ToolbarGroup: ( { children }: { children: React.ReactNode } ) => children,
} ) );

jest.mock( '@wordpress/icons', () => ( {
	caution: 'caution',
	link: 'link',
} ) );

describe( 'LinkText', () => {
	it( 'keeps unlinked text editable and opens the native picker from the toolbar', async () => {
		const user = userEvent.setup();
		const onLinkChange = jest.fn();
		const onTextChange = jest.fn();

		render(
			<LinkText
				text=""
				link={ {} }
				onTextChange={ onTextChange }
				onLinkChange={ onLinkChange }
			/>
		);

		expect( screen.getByTestId( 'warning-icon' ) ).toBeInTheDocument();

		const editableLink = screen.getByLabelText( 'Link text' );
		await user.click( editableLink );

		expect( editableLink ).toHaveFocus();
		expect( screen.queryByTestId( 'popover' ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Edit text' } ) );
		expect( onTextChange ).toHaveBeenCalledWith( 'Edited' );

		await user.click( screen.getByRole( 'button', { name: 'Link' } ) );
		expect( screen.getByTestId( 'popover' ) ).toHaveAttribute(
			'data-focus-on-mount',
			'firstElement'
		);
		const nativeControl = screen.getByTestId( 'wordpress-link-control' );
		expect( nativeControl ).toHaveAttribute( 'data-value', 'null' );
		expect( nativeControl ).toHaveAttribute(
			'data-show-initial-suggestions',
			'true'
		);
		expect( nativeControl ).toHaveAttribute( 'data-force-is-editing', 'true' );
		expect( nativeControl ).toHaveAttribute( 'data-text-control', 'true' );
		expect( nativeControl ).toHaveAttribute( 'data-rich-previews', 'true' );

		await user.click(
			screen.getByRole( 'button', { name: 'Choose about page' } )
		);

		expect( onLinkChange ).toHaveBeenCalledWith( {
			url: 'https://example.com/about',
			title: 'About us',
			opensInNewTab: false,
			nofollow: false,
			rel: undefined,
		} );
		expect( onTextChange ).toHaveBeenCalledWith( 'About us' );
	} );

	it( 'passes existing editable text as a native link-control draft', async () => {
		const user = userEvent.setup();

		render(
			<LinkText
				text="Draft label"
				link={ {} }
				onTextChange={ jest.fn() }
				onLinkChange={ jest.fn() }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Link' } ) );

		const value = JSON.parse(
			screen.getByTestId( 'wordpress-link-control' ).getAttribute( 'data-value' ) ??
				'null'
		);
		expect( value ).toMatchObject( { title: 'Draft label' } );
	} );

	it( 'updates RichText when the native text control changes the title', async () => {
		const user = userEvent.setup();
		const onTextChange = jest.fn();

		render(
			<LinkText
				text="Old label"
				link={ { url: 'https://example.com/old' } }
				onTextChange={ onTextChange }
				onLinkChange={ jest.fn() }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Link' } ) );
		await user.click(
			screen.getByRole( 'button', { name: 'Choose about page' } )
		);

		expect( onTextChange ).toHaveBeenCalledWith( 'About us' );
	} );

	it( 'renders complete link attributes and forwards text edits', async () => {
		const user = userEvent.setup();
		const onTextChange = jest.fn();

		render(
			<LinkText
				text="Documentation"
				link={ {
					url: 'https://example.com/docs',
					opensInNewTab: true,
				} }
				onTextChange={ onTextChange }
				onLinkChange={ jest.fn() }
			/>
		);

		const link = screen.getByRole( 'link', { name: 'Documentation' } );
		expect( link ).toHaveAttribute( 'href', 'https://example.com/docs' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		expect( screen.queryByTestId( 'warning-icon' ) ).not.toBeInTheDocument();

		await user.click( link );
		expect( link ).toHaveFocus();
		expect( screen.getByTestId( 'popover' ) ).toHaveAttribute(
			'data-focus-on-mount',
			'false'
		);

		await user.click( screen.getByRole( 'button', { name: 'Edit text' } ) );
		expect( onTextChange ).toHaveBeenCalledWith( 'Edited' );
	} );
} );
