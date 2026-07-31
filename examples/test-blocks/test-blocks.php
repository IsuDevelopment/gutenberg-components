<?php
/**
 * Plugin Name:       ISUdev Gutenberg — Test Blocks
 * Description:        Example blocks exercising the @isudev/gutenberg component library.
 * Version:           0.1.0
 * Requires at least: 7.0
 * Requires PHP:      8.1
 * Author:            ISUdev
 * License:           MIT
 * Text Domain:       isudev-test-blocks
 *
 * @package IsudevTestBlocks
 */

declare( strict_types = 1 );

namespace Isudev\TestBlocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register example blocks from their compiled metadata.
 *
 * Every directory under build/ is registered automatically. Per-block integration data,
 * such as the icon demo's localized registry, is attached after metadata registration.
 */
function register_blocks(): void {
	foreach ( glob( __DIR__ . '/build/*', GLOB_ONLYDIR ) as $block_dir ) {
		$block_type = register_block_type( $block_dir );

		if ( $block_type && 'isudev/icon-demo' === $block_type->name ) {
			$alert_svg = file_get_contents( __DIR__ . '/assets/alert.svg' );

			wp_localize_script(
				generate_block_asset_handle( $block_type->name, 'editorScript' ),
				'isudevIcons',
				[
					[
						'name'     => 'alert',
						'label'    => __( 'Alert', 'isudev-test-blocks' ),
						'keywords' => [ 'warning', 'notice' ],
						'icon'     => is_string( $alert_svg ) ? $alert_svg : '',
					],
					[
						'name'  => 'arrow-right',
						'label' => __( 'Arrow right', 'isudev-test-blocks' ),
						'icon'  => plugins_url( 'assets/arrow-right.svg', __FILE__ ),
					],
				]
			);
		}
	}
}

add_action( 'init', __NAMESPACE__ . '\\register_blocks' );
