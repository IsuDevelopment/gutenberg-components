/**
 * Page sidebar demo: MetaPostSelectorControl bound to two post meta keys registered in
 * test-blocks.php. Only rendered while editing a page.
 */
import { useSelect } from '@wordpress/data';
import { PluginDocumentSettingPanel, store as editorStore } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';

import { MetaPostSelectorControl } from '@isudev/gutenberg/meta';

function PageSidebar() {
	const postType = useSelect(
		( select ) => select( editorStore ).getCurrentPostType(),
		[]
	);

	if ( postType !== 'page' ) {
		return null;
	}

	return (
		<>
			<PluginDocumentSettingPanel
				name="isudev-related-posts"
				title={ __( 'Related posts', 'isudev-test-blocks' ) }
			>
				<MetaPostSelectorControl
					metaKey="isudev_related_posts"
					postTypes={ [ 'post' ] }
					taxonomies={ [ 'category' ] }
					max={ 6 }
				/>
			</PluginDocumentSettingPanel>
			<PluginDocumentSettingPanel
				name="isudev-related-content"
				title={ __( 'Related content (all types)', 'isudev-test-blocks' ) }
			>
				<MetaPostSelectorControl
					metaKey="isudev_related_content"
					valueShape="objects"
					fields={ [ 'title', 'link', 'type' ] }
					showFeaturedImage={ false }
				/>
			</PluginDocumentSettingPanel>
		</>
	);
}

registerPlugin( 'isudev-post-selector-page-sidebar', { render: PageSidebar } );
