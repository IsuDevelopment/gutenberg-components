import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { SelectField } from '@isudev/gutenberg/fields';
import { TaxonomySelectControl } from '@isudev/gutenberg/taxonomy';

import metadata from './block.json';

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { layout, postType, taxonomySelected } = attributes;
		const blockProps = useBlockProps();

		return (
			<div { ...blockProps }>
				<InspectorControls>
					<PanelBody title={ __( 'Demo controls', 'isudev-test-blocks' ) }>
						{ /* Controlled mode: static options bound to a block attribute. */ }
						<SelectField
							label={ __( 'Layout', 'isudev-test-blocks' ) }
							options={ [
								{ label: 'Grid', value: 'grid' },
								{ label: 'Slider', value: 'slider' },
							] }
							value={ layout }
							onChange={ ( next ) =>
								setAttributes( { layout: next } )
							}
						/>

						{ /* Dynamic options: post types fetched from core-data. */ }
						<SelectField
							label={ __( 'Post type', 'isudev-test-blocks' ) }
							optionsSource={ { type: 'postTypes' } }
							value={ postType }
							onChange={ ( next ) =>
								setAttributes( { postType: next } )
							}
						/>

						<TaxonomySelectControl
							label={ __( 'Taxonomy', 'isudev-test-blocks' ) }
							taxonomy={ 'category' }
						/>

					</PanelBody>
				</InspectorControls>

				<p>
					{ __( 'ISUdev demo block', 'isudev-test-blocks' ) }
					{ ' — ' }
					{ __( 'layout', 'isudev-test-blocks' ) }: <strong>{ layout }</strong>
					{ ', ' }
					{ __( 'taxonomy', 'isudev-test-blocks' ) }: <strong>{ taxonomySelected || '—' }</strong>{ ', ' }
					{ __( 'post type', 'isudev-test-blocks' ) }:{ ' ' }
					<strong>{ postType || '—' }</strong>
				</p>
			</div>
		);
	},

	save( { attributes } ) {
		const blockProps = useBlockProps.save();
		return (
			<p { ...blockProps }>
				Layout: { attributes.layout }; post type:{ ' ' }
				{ attributes.postType || '—' }
			</p>
		);
	},
} );
