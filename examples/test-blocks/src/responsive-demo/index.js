import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { ResponsiveControl } from '@isudev/gutenberg/controls';
import {
	DEFAULT_BREAKPOINTS,
	resolveCascade,
} from '@isudev/gutenberg/breakpoints';

import metadata from './block.json';

const LAYOUT_OPTIONS = [
	{ label: __( 'Grid', 'isudev-test-blocks' ), value: 'grid' },
	{ label: __( 'Slider', 'isudev-test-blocks' ), value: 'slider' },
	{ label: __( 'Stack', 'isudev-test-blocks' ), value: 'stack' },
];

/**
 * What a given breakpoint actually resolves to, for display.
 *
 * This goes through the library's own `resolveCascade` rather than hand-rolling a fallback
 * chain, and that is the point worth copying. A `??` chain gets the wrong answer for `''`,
 * and a `||` chain gets the wrong answer for `0` and `false` — a boolean setting written as
 * `false` would silently show the inherited value instead. `resolveCascade` encodes the
 * presence rule once, so every consumer agrees with the controls and with the frontend.
 */
function print( attrName, breakpointId, attributes ) {
	const resolved = resolveCascade(
		attrName,
		DEFAULT_BREAKPOINTS,
		breakpointId,
		attributes
	);

	return resolved === undefined ? '—' : String( resolved );
}

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const blockProps = useBlockProps();

		return (
			<div { ...blockProps }>
				<InspectorControls>
					<PanelBody
						title={ __( 'Responsive demo', 'isudev-test-blocks' ) }
					>
						{ /* Inline switcher: always-visible row of icons. */ }
						<ResponsiveControl
							attrName="columnGap"
							label={ __( 'Column Gap', 'isudev-test-blocks' ) }
							attributes={ attributes }
							setAttributes={ setAttributes }
						>
							{ ( { value, inheritedValue, onChange } ) => (
								<RangeControl
									min={ 0 }
									max={ 100 }
									value={ value }
									placeholder={ inheritedValue }
									onChange={ onChange }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							) }
						</ResponsiveControl>

						{ /* Dropdown switcher, linked to the editor's device preview. */ }
						<ResponsiveControl
							attrName="layout"
							label={ __( 'Layout', 'isudev-test-blocks' ) }
							variant="dropdown"
							syncToEditor
							syncFromEditor
							attributes={ attributes }
							setAttributes={ setAttributes }
						>
							{ ( { value, onChange } ) => (
								<SelectControl
									value={ value ?? '' }
									options={ [
										{ label: '—', value: '' },
										...LAYOUT_OPTIONS,
									] }
									onChange={ onChange }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							) }
						</ResponsiveControl>
					</PanelBody>
				</InspectorControls>

				<p>
					{ __( 'Resolved per breakpoint:', 'isudev-test-blocks' ) }
				</p>
				<ul>
					{ DEFAULT_BREAKPOINTS.map( ( breakpoint ) => (
						<li key={ breakpoint.id }>
							{ `${ breakpoint.id } — gap: ${ print(
								'columnGap',
								breakpoint.id,
								attributes
							) }, layout: ${ print(
								'layout',
								breakpoint.id,
								attributes
							) }` }
						</li>
					) ) }
				</ul>
			</div>
		);
	},

	save() {
		return null;
	},
} );
