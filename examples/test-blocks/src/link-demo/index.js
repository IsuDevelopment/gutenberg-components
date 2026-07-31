import { registerBlockType } from '@wordpress/blocks';
import { RichText, useBlockProps } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { link as linkIcon, linkOff } from '@wordpress/icons';

import {
	BlockLinkControl,
	getLinkAttributes,
	LinkPickerControl,
	LinkText,
} from '@isudev/gutenberg/controls';

import metadata from './block.json';

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { cardTitle, cardLink, linkText, textLink } = attributes;
		const blockProps = useBlockProps();

		return (
			<div { ...blockProps }>
				<BlockLinkControl
					value={ cardLink }
					onChange={ ( nextCardLink ) =>
						setAttributes( { cardLink: nextCardLink } )
					}
					addLabel={ __( 'Link card', 'isudev-test-blocks' ) }
					editLabel={ __( 'Edit card link', 'isudev-test-blocks' ) }
				/>

				<LinkPickerControl
					value={ cardLink }
					onChange={ ( nextCardLink ) =>
						setAttributes( { cardLink: nextCardLink } )
					}
				>
					{ ( { anchorRef, open, remove, hasLink } ) => (
						<div ref={ anchorRef }>
							<RichText
								tagName="h3"
								allowedFormats={[]}
								value={ cardTitle }
								onChange={ ( nextCardTitle ) =>
									setAttributes( { cardTitle: nextCardTitle } )
								}
								placeholder={ __( 'Card title', 'isudev-test-blocks' ) }
							/>
							<Button icon={ linkIcon } onClick={ open }>
								{ hasLink
									? __( 'Edit card link', 'isudev-test-blocks' )
									: __( 'Add card link', 'isudev-test-blocks' ) }
							</Button>
							{ hasLink && (
								<Button icon={ linkOff } onClick={ remove }>
									{ __( 'Unlink card', 'isudev-test-blocks' ) }
								</Button>
							) }
						</div>
					) }
				</LinkPickerControl>

				<p>{ __( 'Editable text link:', 'isudev-test-blocks' ) }</p>
				<LinkText
					text={ linkText }
					link={ textLink }
					onTextChange={ ( nextLinkText ) =>
						setAttributes( { linkText: nextLinkText } )
					}
					onLinkChange={ ( nextTextLink ) =>
						setAttributes( { textLink: nextTextLink } )
					}
				/>
			</div>
		);
	},

	save( { attributes } ) {
		const { cardTitle, cardLink, linkText, textLink } = attributes;
		const blockProps = useBlockProps.save();

		return (
			<div { ...blockProps }>
				<a { ...getLinkAttributes( cardLink ) }>
					<RichText.Content tagName="h3" value={ cardTitle } />
				</a>
				<p>
					<a { ...getLinkAttributes( textLink ) }>
						<RichText.Content tagName="span" value={ linkText } />
					</a>
				</p>
			</div>
		);
	},
} );
