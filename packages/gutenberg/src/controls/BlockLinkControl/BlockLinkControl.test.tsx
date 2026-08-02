import { forwardRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockLinkControl } from './BlockLinkControl.js';

jest.mock( '@wordpress/block-editor', () => ( {
	BlockControls: ( {
		children,
		group,
	}: {
		children: React.ReactNode;
		group: string;
	} ) => <div data-block-controls-group={ group }>{ children }</div>,
	LinkControl: ( {
		onChange,
		hasTextControl,
	}: {
		onChange: ( value: Record< string, unknown > ) => void;
		hasTextControl: boolean;
	} ) => (
		<button
			type="button"
			data-testid="wordpress-link-control"
			data-text-control={ String( hasTextControl ) }
			onClick={ () =>
				onChange( {
					url: ' https://example.com ',
					title: 'Example page',
					opensInNewTab: true,
				} )
			}
		>
			Choose link
		</button>
	),
} ) );

jest.mock( '@wordpress/components', () => ( {
	Popover: ( { children }: { children: React.ReactNode } ) => (
		<div data-testid="popover">{ children }</div>
	),
	ToolbarGroup: ( {
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	} ) => <div className={ className }>{ children }</div>,
	ToolbarButton: forwardRef< HTMLButtonElement, Record< string, unknown > >(
		function MockToolbarButton( props, ref ) {
			const iconName =
				typeof props.icon === 'string'
					? props.icon
					: typeof props.icon === 'function'
						? props.icon.name
						: 'element';

			return (
				<button
					ref={ ref }
					type="button"
					aria-label={ props.title as string }
					aria-pressed={ props.isActive as boolean }
					data-icon={ iconName }
					disabled={ props.disabled as boolean }
					onClick={ props.onClick as React.MouseEventHandler< HTMLButtonElement > }
				>
					{ props.title as string }
				</button>
			);
		}
	),
} ) );

jest.mock( '@wordpress/icons', () => ( {
	link: 'link',
	linkOff: 'linkOff',
} ) );

describe( 'BlockLinkControl', () => {
	it( 'injects an add action into BlockControls and opens the native picker', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		const { container } = render(
			<BlockLinkControl
				value={ {} }
				onChange={ onChange }
				group="inline"
			/>
		);

		expect(
			container.querySelector( '[data-block-controls-group="inline"]' )
		).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Unlink' } )
		).not.toBeInTheDocument();
		const addButton = screen.getByRole( 'button', {
				name: 'Add link',
				pressed: false,
			} );
		expect( addButton ).toHaveAttribute( 'data-icon', 'link' );

		await user.click( screen.getByRole( 'button', { name: 'Add link' } ) );
		expect(
			screen.getByRole( 'button', {
				name: 'Add link',
				pressed: true,
			} )
		).toBeInTheDocument();
		expect( screen.getByTestId( 'popover' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'wordpress-link-control' ) ).toHaveAttribute(
			'data-text-control',
			'true'
		);

		await user.click( screen.getByRole( 'button', { name: 'Choose link' } ) );
		expect( onChange ).toHaveBeenCalledWith( {
			url: 'https://example.com',
			title: 'Example page',
			opensInNewTab: true,
			nofollow: false,
			rel: 'noopener noreferrer',
		} );
	} );

	it( 'hides the separate unlink action by default', () => {
		render(
			<BlockLinkControl
				value={ { url: 'https://example.com' } }
				onChange={ jest.fn() }
			/>
		);

		const editButton = screen.getByRole( 'button', {
				name: 'Edit link',
				pressed: false,
			} );
		expect( editButton ).toHaveAttribute( 'data-icon', 'EditLinkIcon' );
		expect(
			screen.queryByRole( 'button', { name: 'Unlink' } )
		).not.toBeInTheDocument();
	} );

	it( 'marks an existing-link action active only while its picker is open', async () => {
		const user = userEvent.setup();

		render(
			<BlockLinkControl
				value={ { url: 'https://example.com' } }
				onChange={ jest.fn() }
			/>
		);

		await user.click(
			screen.getByRole( 'button', {
				name: 'Edit link',
				pressed: false,
			} )
		);

		expect(
			screen.getByRole( 'button', {
				name: 'Edit link',
				pressed: true,
			} )
		).toHaveAttribute( 'data-icon', 'EditLinkIcon' );
		expect( screen.getByTestId( 'popover' ) ).toBeInTheDocument();
	} );

	it( 'shows the unlink action when explicitly enabled', async () => {
		const user = userEvent.setup();
		const onChange = jest.fn();

		render(
			<BlockLinkControl
				value={ { url: 'https://example.com' } }
				onChange={ onChange }
				showUnlinkButton
			/>
		);

		expect(
			screen.getByRole( 'button', { name: 'Edit link' } )
		).toBeInTheDocument();
		await user.click( screen.getByRole( 'button', { name: 'Unlink' } ) );

		expect( onChange ).toHaveBeenCalledWith( {} );
	} );

	it( 'allows the native text field to be disabled', async () => {
		const user = userEvent.setup();

		render(
			<BlockLinkControl
				value={ {} }
				onChange={ jest.fn() }
				pickerProps={ { hasTextControl: false } }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Add link' } ) );
		expect( screen.getByTestId( 'wordpress-link-control' ) ).toHaveAttribute(
			'data-text-control',
			'false'
		);
	} );
} );
