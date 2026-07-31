import { render, screen } from '@testing-library/react';
import { Icon } from './Icon.js';
import {
	getLocalizedIcons,
	parseLocalizedIcons,
	resolveIcons,
} from './icon-registry.js';

const ALERT_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2 2 22h20Z"/></svg>';

describe( 'icon registry', () => {
	it( 'validates localized JSON and falls back from label to name', () => {
		expect(
			parseLocalizedIcons( [
				{ name: 'alert', icon: ALERT_SVG },
				{ name: 'image', label: 'Image icon', icon: '/image.svg' },
				{ name: '', icon: '/missing-name.svg' },
				{ name: 'invalid', icon: null },
			] )
		).toEqual( [
			{ name: 'alert', label: 'alert', icon: ALERT_SVG, keywords: undefined },
			{
				name: 'image',
				label: 'Image icon',
				icon: '/image.svg',
				keywords: undefined,
			},
		] );
	} );

	it( 'reads a configurable localized global without coupling components to window', () => {
		expect(
			getLocalizedIcons( 'customIcons', {
				customIcons: [ { name: 'alert', icon: '/alert.svg' } ],
			} )
		).toEqual( [
			{
				name: 'alert',
				label: 'alert',
				icon: '/alert.svg',
				keywords: undefined,
			},
		] );
	} );

	it( 'uses name lists as an ordered subset and definitions as complete overrides', () => {
		const defaults = [
			{ name: 'alert', label: 'Alert', icon: '/alert.svg' },
			{ name: 'arrow', label: 'Arrow', icon: '/arrow.svg' },
		];

		expect( resolveIcons( defaults, [ 'arrow', 'missing', 'alert' ] ) ).toEqual( [
			{ ...defaults[ 1 ], keywords: undefined },
			{ ...defaults[ 0 ], keywords: undefined },
		] );
		expect(
			resolveIcons( defaults, [
				{ name: 'custom', label: 'Custom', icon: '/custom.svg' },
			] )
		).toEqual( [
			{ name: 'custom', label: 'Custom', icon: '/custom.svg', keywords: undefined },
		] );
	} );
} );

describe( 'Icon', () => {
	it( 'renders nothing when no icon is selected or the name is unknown', () => {
		const { container, rerender } = render(
			<Icon defaultIcons={ [ { name: 'alert', icon: ALERT_SVG } ] } />
		);

		expect( container ).toBeEmptyDOMElement();

		rerender(
			<Icon
				name="unknown"
				defaultIcons={ [ { name: 'alert', icon: ALERT_SVG } ] }
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders serialized SVG as an image without injecting raw markup', () => {
		render(
			<Icon
				name="alert"
				label="Alert"
				size={ 32 }
				defaultIcons={ [ { name: 'alert', icon: ALERT_SVG } ] }
			/>
		);

		const icon = screen.getByRole( 'img', { name: 'Alert' } );
		const image = icon.querySelector( 'img' );

		expect( image ).toHaveAttribute( 'width', '32' );
		expect( image?.getAttribute( 'src' ) ).toMatch(
			/^data:image\/svg\+xml;charset=utf-8,/
		);
		expect( icon.querySelector( 'script' ) ).not.toBeInTheDocument();
	} );

	it( 'renders absolute and relative image links through img', () => {
		const { rerender } = render(
			<Icon
				name="remote"
				defaultIcons={ [
					{ name: 'remote', icon: 'https://example.com/icon.svg' },
				] }
			/>
		);

		expect( document.querySelector( 'img' ) ).toHaveAttribute(
			'src',
			'https://example.com/icon.svg'
		);

		rerender(
			<Icon
				name="relative"
				defaultIcons={ [ { name: 'relative', icon: 'assets/icon.svg' } ] }
			/>
		);
		expect( document.querySelector( 'img' ) ).toHaveAttribute(
			'src',
			'assets/icon.svg'
		);
	} );
} );
