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
 * Every directory under build/ holding a block.json is registered automatically. Per-block integration data,
 * such as the icon demo's localized registry, is attached after metadata registration.
 */
function register_blocks(): void {
	foreach ( glob( __DIR__ . '/build/*/block.json' ) as $block_json ) {
		$block_type = register_block_type( dirname( $block_json ) );

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

/**
 * Register the page meta used by the post selector sidebar demo.
 *
 * `isudev_related_posts` stores an ordered array of post IDs; `isudev_related_content`
 * stores `{ id, type, title, link }` snapshots. Both schemas must match what the control
 * writes, or the REST save rejects the meta.
 */
function register_post_selector_meta(): void {
	$auth_callback = static fn(): bool => current_user_can( 'edit_pages' );

	register_post_meta(
		'page',
		'isudev_related_posts',
		[
			'type'          => 'array',
			'single'        => true,
			'default'       => [],
			'auth_callback' => $auth_callback,
			'show_in_rest'  => [
				'schema' => [
					'type'  => 'array',
					'items' => [ 'type' => 'integer' ],
				],
			],
		]
	);

	register_post_meta(
		'page',
		'isudev_related_content',
		[
			'type'          => 'array',
			'single'        => true,
			'default'       => [],
			'auth_callback' => $auth_callback,
			'show_in_rest'  => [
				'schema' => [
					'type'  => 'array',
					'items' => [
						'type'                 => 'object',
						'additionalProperties' => false,
						'properties'           => [
							'id'    => [ 'type' => 'integer' ],
							'type'  => [ 'type' => 'string' ],
							'title' => [ 'type' => 'string' ],
							'link'  => [ 'type' => 'string' ],
						],
					],
				],
			],
		]
	);
}

add_action( 'init', __NAMESPACE__ . '\\register_post_selector_meta' );

/**
 * Enqueue the page sidebar demo (a document settings panel, not a block).
 */
function enqueue_page_sidebar(): void {
	$asset_file = __DIR__ . '/build/plugins/page-sidebar.asset.php';

	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;

	wp_enqueue_script(
		'isudev-test-blocks-page-sidebar',
		plugins_url( 'build/plugins/page-sidebar.js', __FILE__ ),
		$asset['dependencies'],
		$asset['version'],
		true
	);
}

add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\enqueue_page_sidebar' );
