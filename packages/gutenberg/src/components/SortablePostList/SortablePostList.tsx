import {
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type DragEvent,
	type KeyboardEvent,
} from 'react';
import { Button, VisuallyHidden } from '@wordpress/components';
import { closeSmall, dragHandle } from '@wordpress/icons';
import {
	formatLabel,
	usePostPickerLabels,
} from '../../_internal/post-picker/labels.js';
import type { SortablePostListProps } from './types.js';

type DropPosition = 'before' | 'after';

const LIST_STYLE: CSSProperties = {
	margin: 0,
	padding: 0,
	listStyle: 'none',
	border: '1px solid #ddd',
	borderRadius: 2,
};

const THUMBNAIL_STYLE: CSSProperties = {
	flex: '0 0 48px',
	width: 48,
	height: 48,
	borderRadius: 2,
	background: '#f0f0f0',
	objectFit: 'cover',
};

const TITLE_STYLE: CSSProperties = {
	display: '-webkit-box',
	WebkitLineClamp: 2,
	WebkitBoxOrient: 'vertical',
	overflow: 'hidden',
	fontWeight: 500,
	lineHeight: 1.4,
	wordBreak: 'break-word',
};

const META_STYLE: CSSProperties = {
	color: '#757575',
	fontSize: 12,
	lineHeight: 1.4,
	marginTop: 2,
};

/**
 * Resolves the final index of a drop onto `target`, accounting for the dragged row
 * leaving its old slot.
 */
export function getDropIndex(
	from: number,
	target: number,
	position: DropPosition
): number {
	const insertAt = position === 'after' ? target + 1 : target;
	return from < insertAt ? insertAt - 1 : insertAt;
}

/**
 * An ordered list of posts with drag-and-drop and keyboard reordering and optional removal.
 * Pure UI: it never fetches, it only reports moves and removals.
 */
export function SortablePostList( {
	items,
	onMove,
	onRemove,
	showThumbnail = true,
	disabled = false,
	labels: labelOverrides,
	className,
}: SortablePostListProps ) {
	const labels = usePostPickerLabels( labelOverrides );
	const [ dragIndex, setDragIndex ] = useState< number | null >( null );
	const [ dropTarget, setDropTarget ] = useState< {
		index: number;
		position: DropPosition;
	} | null >( null );
	const [ announcement, setAnnouncement ] = useState( '' );
	const [ focusId, setFocusId ] = useState< number | null >( null );
	const handles = useRef( new Map< number, HTMLButtonElement >() );

	const canMove = !! onMove && ! disabled && items.length > 1;

	// Moving a row re-inserts its DOM node, which can drop focus; put it back on the handle.
	useEffect( () => {
		if ( focusId !== null ) {
			handles.current.get( focusId )?.focus();
			setFocusId( null );
		}
	}, [ focusId, items ] );

	const move = ( from: number, to: number ) => {
		if ( ! onMove || from === to || to < 0 || to >= items.length ) {
			return;
		}

		onMove( from, to );
		setAnnouncement( formatLabel( labels.moved, to + 1, items.length ) );
	};

	const onHandleKeyDown = ( event: KeyboardEvent, index: number ) => {
		if ( event.key === 'ArrowUp' || event.key === 'ArrowDown' ) {
			event.preventDefault();
			const to = event.key === 'ArrowUp' ? index - 1 : index + 1;

			if ( to >= 0 && to < items.length ) {
				setFocusId( items[ index ].id );
				move( index, to );
			}
		}
	};

	const onDragOver = ( event: DragEvent< HTMLLIElement >, index: number ) => {
		if ( dragIndex === null ) {
			return;
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';

		const rect = event.currentTarget.getBoundingClientRect();
		const position: DropPosition =
			event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';

		if ( dropTarget?.index !== index || dropTarget.position !== position ) {
			setDropTarget( { index, position } );
		}
	};

	const onDrop = ( event: DragEvent< HTMLLIElement > ) => {
		event.preventDefault();

		if ( dragIndex !== null && dropTarget ) {
			move(
				dragIndex,
				getDropIndex( dragIndex, dropTarget.index, dropTarget.position )
			);
		}

		setDragIndex( null );
		setDropTarget( null );
	};

	if ( ! items.length ) {
		return null;
	}

	return (
		<>
			<ul className={ className } style={ LIST_STYLE }>
				{ items.map( ( item, index ) => {
					const title = item.isUnavailable
						? formatLabel( labels.unavailable, item.id )
						: item.title;
					const isDropTarget = dropTarget?.index === index && dragIndex !== index;

					return (
						<li
							key={ item.id }
							draggable={ canMove }
							onDragStart={ ( event ) => {
								setDragIndex( index );
								event.dataTransfer.effectAllowed = 'move';
								event.dataTransfer.setData( 'text/plain', String( item.id ) );
							} }
							onDragOver={ ( event ) => onDragOver( event, index ) }
							onDrop={ onDrop }
							onDragEnd={ () => {
								setDragIndex( null );
								setDropTarget( null );
							} }
							style={ {
								display: 'flex',
								alignItems: 'center',
								gap: 12,
								padding: '12px 8px',
								background: '#fff',
								borderTop: index > 0 ? '1px solid #eee' : undefined,
								opacity: dragIndex === index ? 0.4 : 1,
								boxShadow: isDropTarget
									? `inset 0 ${
											dropTarget.position === 'before' ? 2 : -2
									  }px 0 var(--wp-admin-theme-color, #3858e9)`
									: undefined,
							} }
						>
							{ canMove && (
								<Button
									ref={ ( node: HTMLButtonElement | null ) => {
										if ( node ) {
											handles.current.set( item.id, node );
										} else {
											handles.current.delete( item.id );
										}
									} }
									icon={ dragHandle }
									label={ formatLabel( labels.reorder, title ) }
									size="small"
									onKeyDown={ ( event: KeyboardEvent ) =>
										onHandleKeyDown( event, index )
									}
									style={ { cursor: 'grab', flex: '0 0 auto' } }
								/>
							) }
							{ showThumbnail &&
								( item.thumbnailUrl ? (
									<img src={ item.thumbnailUrl } alt="" style={ THUMBNAIL_STYLE } />
								) : (
									<span aria-hidden="true" style={ THUMBNAIL_STYLE } />
								) ) }
							<div style={ { flex: '1 1 auto', minWidth: 0 } }>
								<div
									style={ {
										...TITLE_STYLE,
										...( item.isUnavailable ? { color: '#757575' } : {} ),
									} }
								>
									{ title }
								</div>
								{ item.meta && ! item.isUnavailable && (
									<div style={ META_STYLE }>{ item.meta }</div>
								) }
							</div>
							{ onRemove && (
								<Button
									icon={ closeSmall }
									label={ formatLabel( labels.remove, title ) }
									size="small"
									disabled={ disabled }
									accessibleWhenDisabled
									onClick={ () => onRemove( index ) }
									style={ { flex: '0 0 auto' } }
								/>
							) }
						</li>
					);
				} ) }
			</ul>
			<VisuallyHidden aria-live="polite">{ announcement }</VisuallyHidden>
		</>
	);
}
