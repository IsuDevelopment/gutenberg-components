import type { ReactElement } from 'react';

/**
 * Wraps a breakpoint icon with a small marker showing that this breakpoint carries an
 * override.
 *
 * The marker is an inline style rather than a stylesheet because v1 of the library ships no
 * CSS, which keeps `sideEffects: false` honest. Tinting uses `color`, not `fill`:
 * `@wordpress/icons` v15 switched to `fill="currentColor"`.
 */
export function IconWithOverrideDot( {
	icon,
}: {
	icon?: ReactElement;
} ): ReactElement {
	return (
		<span
			style={ {
				position: 'relative',
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
			} }
		>
			{ icon }
			<span
				aria-hidden="true"
				style={ {
					position: 'absolute',
					top: 0,
					right: 0,
					width: '6px',
					height: '6px',
					borderRadius: '50%',
					backgroundColor: 'var(--wp-admin-theme-color, #3858e9)',
				} }
			/>
		</span>
	);
}
