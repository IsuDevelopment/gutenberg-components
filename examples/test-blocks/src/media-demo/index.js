import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { Button, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import {
	MediaFocalPointControl,
	MediaPreview,
} from '@isudev/gutenberg/components';
import {
	MediaCanvasControl,
	MediaControl,
	MediaPickerControl,
	MediaSidebarControl,
	MediaToolbarControl,
} from '@isudev/gutenberg/controls';

import metadata from './block.json';

const ALLOWED_TYPES = [ 'image', 'video' ];

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { media, focalPoint, standaloneMedia, standaloneFocalPoint } =
			attributes;

		return (
			<div { ...useBlockProps() }>
				<h2>{ __( 'Composed MediaControl', 'isudev-test-blocks' ) }</h2>
				<Notice status="info" isDismissible={ false }>
					{ __(
						'Test selection, replacement and removal on the canvas, toolbar and sidebar. The sidebar uses the optional focal-point preview.',
						'isudev-test-blocks'
					) }
				</Notice>
				<MediaControl
					value={ media }
					onChange={ ( nextMedia ) =>
						setAttributes( { media: nextMedia } )
					}
					focalPoint={ focalPoint }
					onFocalPointChange={ ( nextFocalPoint ) =>
						setAttributes( { focalPoint: nextFocalPoint } )
					}
					allowedTypes={ ALLOWED_TYPES }
					resetFocalPointOnChange
					canvas={ {
						previewProps: { aspectRatio: '16 / 9' },
					} }
					toolbar={ {
						selectLabel: __( 'Select demo media', 'isudev-test-blocks' ),
						replaceLabel: __( 'Replace demo media', 'isudev-test-blocks' ),
					} }
					sidebar={ {
						title: __( 'Composed media', 'isudev-test-blocks' ),
						preview: 'focal-point',
					} }
				/>

				<hr />
				<h2>{ __( 'Independent submodules', 'isudev-test-blocks' ) }</h2>
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'This section intentionally repeats surfaces. It verifies direct use and feature switches without MediaControl.',
						'isudev-test-blocks'
					) }
				</Notice>

				<MediaPickerControl
					value={ standaloneMedia }
					onChange={ ( nextMedia ) =>
						setAttributes( { standaloneMedia: nextMedia } )
					}
					allowedTypes={ ALLOWED_TYPES }
				>
					{ ( { open, action } ) => (
						<Button variant="primary" onClick={ open }>
							{ action === 'replace'
								? __( 'Custom trigger: edit media', 'isudev-test-blocks' )
								: __( 'Custom trigger: select media', 'isudev-test-blocks' ) }
						</Button>
					) }
				</MediaPickerControl>

				<div style={ { marginTop: 16, maxWidth: 640 } }>
					<MediaPreview
						value={ standaloneMedia }
						focalPoint={ standaloneFocalPoint }
						aspectRatio="4 / 3"
						emptyFallback={ <p>{ __( 'No standalone preview yet.', 'isudev-test-blocks' ) }</p> }
					/>
				</div>

				<MediaFocalPointControl
					media={ standaloneMedia }
					value={ standaloneFocalPoint }
					onChange={ ( nextFocalPoint ) =>
						setAttributes( { standaloneFocalPoint: nextFocalPoint } )
					}
					emptyFallback={ <p>{ __( 'Select image or video to test focal point.', 'isudev-test-blocks' ) }</p> }
				/>

				<MediaCanvasControl
					value={ standaloneMedia }
					onChange={ ( nextMedia ) =>
						setAttributes( { standaloneMedia: nextMedia } )
					}
					actions={ { remove: false } }
					pickerProps={ { allowedTypes: ALLOWED_TYPES } }
					placeholderLabel={ __( 'Standalone canvas', 'isudev-test-blocks' ) }
				/>

				<MediaToolbarControl
					value={ standaloneMedia }
					onChange={ ( nextMedia ) =>
						setAttributes( { standaloneMedia: nextMedia } )
					}
					actions={ { remove: false } }
					pickerProps={ { allowedTypes: ALLOWED_TYPES } }
					selectLabel={ __( 'Standalone toolbar select', 'isudev-test-blocks' ) }
					replaceLabel={ __( 'Standalone toolbar replace', 'isudev-test-blocks' ) }
				/>

				<MediaSidebarControl
					value={ standaloneMedia }
					onChange={ ( nextMedia ) =>
						setAttributes( { standaloneMedia: nextMedia } )
					}
					preview={ false }
					actions={ { replace: false } }
					pickerProps={ { allowedTypes: ALLOWED_TYPES } }
					title={ __( 'Standalone media — no preview', 'isudev-test-blocks' ) }
				/>
			</div>
		);
	},

	save( { attributes } ) {
		return (
			<div { ...useBlockProps.save() }>
				<MediaPreview
					value={ attributes.media }
					focalPoint={ attributes.focalPoint }
					aspectRatio="16 / 9"
				/>
				<MediaPreview
					value={ attributes.standaloneMedia }
					focalPoint={ attributes.standaloneFocalPoint }
					aspectRatio="4 / 3"
				/>
			</div>
		);
	},
} );
