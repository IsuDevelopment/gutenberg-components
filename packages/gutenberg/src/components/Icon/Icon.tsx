import { Icon as WordPressIcon } from '@wordpress/components';
import type { ReactElement } from 'react';
import { resolveIcons } from './icon-registry.js';
import type { IconGraphic, IconProps } from './types.js';

const IMAGE_PROTOCOL = /^(?:https?:|blob:|data:image\/(?:avif|gif|jpeg|png|svg\+xml|webp);)/i;
const BLOCKED_PROTOCOL = /^[\u0000-\u0020]*[a-z][a-z\d+.-]*:/i;
const IMAGE_PATH = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;

function imageSource( graphic: string ): string | undefined {
	const source = graphic.trim();

	if ( source.toLowerCase().startsWith( '<svg' ) ) {
		return `data:image/svg+xml;charset=utf-8,${ encodeURIComponent( source ) }`;
	}

	if ( IMAGE_PROTOCOL.test( source ) || ! BLOCKED_PROTOCOL.test( source ) ) {
		return source;
	}

	return undefined;
}

function isImageGraphic( graphic: string ): boolean {
	const source = graphic.trim();

	return (
		source.toLowerCase().startsWith( '<svg' ) ||
		IMAGE_PROTOCOL.test( source ) ||
		IMAGE_PATH.test( source ) ||
		source.startsWith( '/' ) ||
		source.startsWith( './' ) ||
		source.startsWith( '../' )
	);
}

/** Render one named icon, or nothing when no matching icon is selected. */
export function Icon( {
	name,
	defaultIcons = [],
	icons,
	size = 24,
	label,
	className,
	style,
}: IconProps ): ReactElement | null {
	if ( ! name ) {
		return null;
	}

	const definition = resolveIcons( defaultIcons, icons ).find(
		( icon ) => icon.name === name
	);

	if ( ! definition ) {
		return null;
	}

	const graphic: IconGraphic = definition.icon;
	let renderedIcon: ReactElement | null;

	if ( typeof graphic === 'string' && isImageGraphic( graphic ) ) {
		const source = imageSource( graphic );

		if ( ! source ) {
			return null;
		}

		renderedIcon = (
			<img
				src={ source }
				alt=""
				width={ size }
				height={ size }
				style={ { display: 'block', objectFit: 'contain' } }
			/>
		);
	} else {
		renderedIcon = (
			<WordPressIcon icon={ graphic as never } size={ size } />
		);
	}

	return (
		<span
			className={ className }
			role={ label ? 'img' : undefined }
			aria-label={ label }
			aria-hidden={ label ? undefined : true }
			style={ {
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: size,
				height: size,
				flexShrink: 0,
				...style,
			} }
		>
			{ renderedIcon }
		</span>
	);
}
