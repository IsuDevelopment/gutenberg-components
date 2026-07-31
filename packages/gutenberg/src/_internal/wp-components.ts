/**
 * The only module allowed to import `__experimental*` or `__unstable*` symbols from
 * `@wordpress/components`.
 *
 * `ToggleGroupControl` is still exported behind the `__experimental` prefix on Gutenberg
 * trunk — it was NOT stabilized in WP 7.0 (verified 2026-07-30). A published library
 * importing an experimental symbol can break on a WordPress minor, so every such import is
 * funnelled through here and re-exported under a stable local name. When WordPress renames
 * one, this file is the only edit. See decision 0004.
 */
export {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
