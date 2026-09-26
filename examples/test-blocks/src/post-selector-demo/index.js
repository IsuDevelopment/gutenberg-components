import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Button, Notice, PanelBody } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import {
	PostPickerControl,
	PostSelectorControl,
} from '@isudev/gutenberg/controls';

import metadata from './block.json';

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { pickedPosts, featuredPost, relatedPosts } = attributes;

		return (
			<div { ...useBlockProps() }>
				<InspectorControls>
					<PanelBody title={ __( 'Related posts', 'isudev-test-blocks' ) }>
						<PostSelectorControl
							label={ __( 'Related posts', 'isudev-test-blocks' ) }
							value={ relatedPosts }
							onChange={ ( next ) => setAttributes( { relatedPosts: next } ) }
							postTypes={ [ 'post', 'page' ] }
							taxonomies={ [ 'category' ] }
							max={ 6 }
							valueShape="objects"
						/>
					</PanelBody>
				</InspectorControls>

				<h2>{ __( 'Custom trigger — any post type, IDs', 'isudev-test-blocks' ) }</h2>
				<Notice status="info" isDismissible={ false }>
					{ __(
						'PostPickerControl with a consumer-rendered button. Stores an array of IDs in a block attribute, max 4.',
						'isudev-test-blocks'
					) }
				</Notice>
				<PostPickerControl
					value={ pickedPosts }
					onChange={ ( next ) => setAttributes( { pickedPosts: next } ) }
					max={ 4 }
				>
					{ ( { open, count } ) => (
						<Button variant="primary" onClick={ open }>
							{ count
								? sprintf(
										/* translators: %d: number of posts. */
										__( 'Custom trigger: %d selected', 'isudev-test-blocks' ),
										count
								  )
								: __( 'Custom trigger: pick posts', 'isudev-test-blocks' ) }
						</Button>
					) }
				</PostPickerControl>

				<hr />
				<h2>{ __( 'Single selection — posts only, object', 'isudev-test-blocks' ) }</h2>
				<PostPickerControl
					value={ featuredPost ?? null }
					onChange={ ( next ) =>
						setAttributes( { featuredPost: next ?? undefined } )
					}
					postTypes={ [ 'post' ] }
					multiple={ false }
					valueShape="objects"
					showFeaturedImage={ false }
					labels={ { modalTitle: __( 'Choose a featured post', 'isudev-test-blocks' ) } }
				>
					{ ( { open, hasSelection } ) => (
						<p>
							{ hasSelection ? (
								<a href={ featuredPost.link } onClick={ ( event ) => event.preventDefault() }>
									{ featuredPost.title }
								</a>
							) : (
								__( 'No featured post.', 'isudev-test-blocks' )
							) }{ ' ' }
							<Button variant="secondary" size="compact" onClick={ open }>
								{ hasSelection
									? __( 'Replace', 'isudev-test-blocks' )
									: __( 'Choose', 'isudev-test-blocks' ) }
							</Button>
						</p>
					) }
				</PostPickerControl>

				<hr />
				<h2>{ __( 'Stored attributes', 'isudev-test-blocks' ) }</h2>
				<p>
					{ __(
						'The sidebar "Related posts" panel writes relatedPosts (objects, post + page, category filter, max 6).',
						'isudev-test-blocks'
					) }
				</p>
				<pre style={ { whiteSpace: 'pre-wrap', fontSize: 12 } }>
					{ JSON.stringify( { pickedPosts, featuredPost, relatedPosts }, null, 2 ) }
				</pre>
			</div>
		);
	},

	save: () => null,
} );
