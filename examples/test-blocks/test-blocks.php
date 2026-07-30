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
 * Every directory under build/ is registered, so adding an example block is a matter of
 * adding a src/ directory — there is nothing to list here.
 */
function register_blocks(): void {
	foreach ( glob( __DIR__ . '/build/*', GLOB_ONLYDIR ) as $block_dir ) {
		register_block_type( $block_dir );
	}
}

add_action( 'init', __NAMESPACE__ . '\\register_blocks' );
