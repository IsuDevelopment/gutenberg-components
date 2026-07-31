import { registerBlockType } from '@wordpress/blocks';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import {
	getLocalizedIcons,
	Icon,
	IconPicker,
	IconSelect,
} from '@isudev/gutenberg/components';

import metadata from './block.json';

const DEFAULT_ICONS = getLocalizedIcons();

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const { iconName } = attributes;
		const selectedIcon = DEFAULT_ICONS.find( ( icon ) => icon.name === iconName );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Icon settings', 'isudev-test-blocks' ) }>
						<IconSelect
							label={ __( 'Icon', 'isudev-test-blocks' ) }
							defaultIcons={ DEFAULT_ICONS }
							value={ iconName }
							onChange={ ( nextIconName ) =>
								setAttributes( { iconName: nextIconName } )
							}
						/>
					</PanelBody>
				</InspectorControls>

				<div { ...useBlockProps() }>
					<Icon
						name={ iconName }
						defaultIcons={ DEFAULT_ICONS }
						label={ selectedIcon?.label }
						size={ 40 }
					/>
					<IconPicker
						label={ __( 'Choose an icon', 'isudev-test-blocks' ) }
						defaultIcons={ DEFAULT_ICONS }
						icons={ [ 'alert', 'arrow-right' ] }
						value={ iconName }
						onChange={ ( nextIconName ) =>
							setAttributes( { iconName: nextIconName } )
						}
						searchable={ false }
						columns={ 2 }
					/>
				</div>
			</>
		);
	},

	save( { attributes } ) {
		const selectedIcon = DEFAULT_ICONS.find(
			( icon ) => icon.name === attributes.iconName
		);

		return (
			<div { ...useBlockProps.save() }>
				<Icon
					name={ attributes.iconName }
					defaultIcons={ DEFAULT_ICONS }
					label={ selectedIcon?.label }
					size={ 40 }
				/>
			</div>
		);
	},
} );
