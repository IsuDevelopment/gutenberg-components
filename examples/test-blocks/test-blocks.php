<?php
/**
 * Plugin Name:       ISUdev Gutenberg — Test Blocks
 * Description:        Example blocks exercising the @isudev/gutenberg component library.
 * Version:           0.1.0
 * Requires at least: 6.6
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
 */
function register_blocks(): void {
	register_block_type( __DIR__ . '/build/demo' );
}

add_action( 'init', __NAMESPACE__ . '\\register_blocks' );
