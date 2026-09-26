/**
 * Extends the default @wordpress/scripts config with editor plugins that are not blocks.
 * Block entries are still discovered from every block.json under src/.
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	entry: {
		...defaultConfig.entry(),
		'plugins/page-sidebar': './src/plugins/page-sidebar.js',
	},
};
