import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { ResponsiveControl } from '@isudev/gutenberg/controls';

import metadata from './block.json';

const LAYOUT_OPTIONS = [
	{ label: __( 'Grid', 'isudev-test-blocks' ), value: 'grid' },
	{ label: __( 'Slider', 'isudev-test-blocks' ), value: 'slider' },
	{ label: __( 'Stack', 'isudev-test-blocks' ), value: 'stack' },
];

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
					<li>
						{ `desktop — gap: ${
							attributes.columnGap ?? '—'
						}, layout: ${ attributes.layout || '—' }` }
					</li>
					<li>
						{ `tablet — gap: ${
							attributes.columnGapTablet ??
							attributes.columnGap ??
							'—'
						}, layout: ${
							attributes.layoutTablet ||
							attributes.layout ||
							'—'
						}` }
					</li>
					<li>
						{ `mobile — gap: ${
							attributes.columnGapMobile ??
							attributes.columnGapTablet ??
							attributes.columnGap ??
							'—'
						}, layout: ${
							attributes.layoutMobile ||
							attributes.layoutTablet ||
							attributes.layout ||
							'—'
						}` }
					</li>
				</ul>
			</div>
		);
	},

	save() {
		return null;
	},
} );
