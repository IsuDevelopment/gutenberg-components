import { useId, useMemo, useState } from 'react';
import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useValueBinding } from '../../bindings/useValueBinding.js';
import { SortablePostList } from '../../components/SortablePostList/SortablePostList.js';
import type { SortablePostListItem } from '../../components/SortablePostList/types.js';
import { usePostPickerLabels } from '../../_internal/post-picker/labels.js';
import {
	formatPostDate,
	withDisplays,
} from '../../_internal/post-picker/records.js';
import { usePickerTypes } from '../../_internal/post-picker/usePickerTypes.js';
import { usePostHydration } from '../../_internal/post-picker/usePostHydration.js';
import {
	ALL_FIELDS,
	fromReferences,
	moveItem,
	toReferences,
} from '../../_internal/post-picker/value.js';
import type { PostReference, PostSelectionValue } from '../../types/posts.js';
import { PostPickerControl } from '../PostPickerControl/PostPickerControl.js';
import type { PostSelectorControlProps } from './types.js';

const DEFAULT_STATUS = [ 'publish' ];

/**
 * The all-in-one post selection control: a sortable list of the selected posts, a counter
 * and a button opening the picker modal. Controlled, or bound through `valueBinding`.
 */
export function PostSelectorControl( {
	value: controlledValue,
	onChange: controlledOnChange,
	valueBinding,
	label,
	help,
	disabled = false,
	className,
	...pickerOptions
}: PostSelectorControlProps ) {
	const {
		postTypes,
		query,
		max,
		multiple = true,
		valueShape = 'ids',
		fields = ALL_FIELDS,
		showFeaturedImage = true,
		labels: labelOverrides,
	} = pickerOptions;

	if (
		process.env.NODE_ENV !== 'production' &&
		valueBinding?.type === 'taxonomy'
	) {
		console.warn(
			'PostSelectorControl: a taxonomy binding stores terms, not posts, and is ignored. Use a meta or custom binding.'
		);
	}

	const binding = useValueBinding( {
		valueBinding: valueBinding?.type === 'taxonomy' ? undefined : valueBinding,
		value: controlledValue,
		onChange: controlledOnChange as ( value: unknown ) => void,
	} );

	const labels = usePostPickerLabels( labelOverrides );
	const headingId = useId();
	const [ locale, setLocale ] = useState< string >();

	const valueKey = JSON.stringify( binding.value ?? null );
	const references = useMemo(
		() => toReferences( binding.value ),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ valueKey ]
	);

	const queryKey = JSON.stringify( query?.status ?? null );
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const status = useMemo( () => query?.status ?? DEFAULT_STATUS, [ queryKey ] );

	const { types, isLoading: typesLoading } = usePickerTypes( postTypes, query );
	const typeSlugs = useMemo( () => types.map( ( type ) => type.slug ), [ types ] );
	const { displays, unavailable } = usePostHydration(
		references,
		typeSlugs,
		status,
		showFeaturedImage,
		typesLoading
	);

	const items = references.map( ( reference ): SortablePostListItem => {
		const display = displays.get( reference.id );

		if ( display ) {
			return {
				id: reference.id,
				title: display.title,
				meta: [ display.termName, formatPostDate( display.date, locale ) ]
					.filter( Boolean )
					.join( ' · ' ),
				...( display.thumbnailUrl ? { thumbnailUrl: display.thumbnailUrl } : {} ),
			};
		}

		return {
			id: reference.id,
			title: reference.title ?? '…',
			isUnavailable: unavailable.has( reference.id ),
		};
	} );

	const emit = ( next: PostReference[] ) =>
		binding.onChange(
			fromReferences( withDisplays( next, displays ), {
				valueShape,
				fields,
				multiple,
			} )
		);

	const count = references.length;
	const limit = multiple ? max : 1;
	const helpText = help ?? ( count > 1 && ! disabled ? labels.reorderHelp : undefined );

	return (
		<div
			className={ className }
			role="group"
			aria-labelledby={ label ? headingId : undefined }
			ref={ ( node ) => {
				const lang = node?.ownerDocument.documentElement.lang;
				if ( lang && lang !== locale ) {
					setLocale( lang );
				}
			} }
		>
			{ ( label || limit !== undefined ) && (
				<div
					style={ {
						display: 'flex',
						alignItems: 'baseline',
						gap: 8,
						marginBottom: 12,
					} }
				>
					{ label && (
						<span id={ headingId } style={ { fontWeight: 500 } }>
							{ label }
						</span>
					) }
					<span style={ { color: '#757575' } }>
						{ limit !== undefined ? `${ count } / ${ limit }` : count }
					</span>
				</div>
			) }

			<SortablePostList
				items={ items }
				showThumbnail={ showFeaturedImage }
				disabled={ disabled }
				labels={ labels }
				onMove={
					multiple ? ( from, to ) => emit( moveItem( references, from, to ) ) : undefined
				}
				onRemove={ ( index ) =>
					emit( references.filter( ( _, position ) => position !== index ) )
				}
			/>

			{ helpText && (
				<p style={ { color: '#757575', fontSize: 12, margin: '8px 0 0' } }>
					{ helpText }
				</p>
			) }

			<PostPickerControl
				{ ...pickerOptions }
				value={ binding.value as PostSelectionValue }
				onChange={ binding.onChange }
				disabled={ disabled }
			>
				{ ( { open, hasSelection } ) => (
					<Button
						__next40pxDefaultSize
						variant="secondary"
						icon={ plus }
						onClick={ open }
						disabled={ disabled }
						accessibleWhenDisabled
						style={ {
							width: '100%',
							justifyContent: 'center',
							marginTop: 16,
						} }
					>
						{ hasSelection ? labels.change : labels.choose }
					</Button>
				) }
			</PostPickerControl>
		</div>
	);
}
