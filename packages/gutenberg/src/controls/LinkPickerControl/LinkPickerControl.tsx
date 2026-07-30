import { useCallback, useMemo, useState, type ReactElement } from 'react';
// @ts-expect-error The package does not ship TypeScript declarations for this stable export.
import { LinkControl as WordPressLinkControl } from '@wordpress/block-editor';
import { Popover } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { normalizeLinkValue } from './link-value.js';
import type {
	LinkPickerControlProps,
	LinkSetting,
	LinkValue,
} from './types.js';

/**
 * A controlled WordPress link picker that can be anchored to any consumer-rendered element.
 */
export function LinkPickerControl( {
	value = {},
	onChange,
	onRemove,
	children,
	isOpen: controlledIsOpen,
	defaultOpen = false,
	onOpenChange,
	settings,
	suggestionsQuery,
	showSuggestions = true,
	showInitialSuggestions = true,
	forceIsEditingLink,
	noDirectEntry = false,
	noURLSuggestion = false,
	hasTextControl = false,
	handleEntities = false,
	hasRichPreviews = true,
	searchInputPlaceholder,
	popoverPlacement = 'bottom-start',
	popoverOffset = 8,
	popoverNoArrow = false,
	popoverClassName,
	popoverFocusOnMount = 'firstElement',
	popoverAnimate = false,
	popoverShift = true,
	popoverConstrainTabbing = true,
	popoverHeader,
	popoverFooter,
}: LinkPickerControlProps ): ReactElement {
	const [ internalIsOpen, setInternalIsOpen ] = useState( defaultOpen );
	const [ anchor, setAnchor ] = useState< HTMLElement | null >( null );
	const isOpen = controlledIsOpen ?? internalIsOpen;

	const resolvedSettings = useMemo< LinkSetting[] >(
		() =>
			settings ?? [
				{
					id: 'opensInNewTab',
					title: __( 'Open in new tab' ),
				},
				{
					id: 'nofollow',
					title: __( 'Mark as nofollow' ),
				},
			],
		[ settings ]
	);

	const setIsOpen = useCallback(
		( nextIsOpen: boolean ) => {
			if ( controlledIsOpen === undefined ) {
				setInternalIsOpen( nextIsOpen );
			}

			onOpenChange?.( nextIsOpen );
		},
		[ controlledIsOpen, onOpenChange ]
	);

	const open = useCallback( () => setIsOpen( true ), [ setIsOpen ] );
	const close = useCallback( () => setIsOpen( false ), [ setIsOpen ] );
	const toggle = useCallback( () => setIsOpen( ! isOpen ), [ isOpen, setIsOpen ] );

	const remove = useCallback( () => {
		if ( onRemove ) {
			onRemove();
		} else {
			onChange( {} );
		}

		close();
	}, [ close, onChange, onRemove ] );

	const handleChange = useCallback(
		( nextValue: LinkValue ) => {
			onChange(
				normalizeLinkValue( {
					...value,
					...nextValue,
				} )
			);
		},
		[ onChange, value ]
	);

	const normalizedValue = useMemo(
		() => normalizeLinkValue( value ),
		[ value ]
	);
	const hasLink = Boolean( normalizedValue.url );
	const hasDraftValue = Boolean(
		value.title ||
			value.id !== undefined ||
			value.type ||
			value.kind
	);

	return (
		<>
			{ children( {
				anchorRef: setAnchor,
				isOpen,
				hasLink,
				open,
				close,
				toggle,
				remove,
			} ) }

			{ isOpen && anchor && (
				<Popover
					anchor={ anchor }
					placement={ popoverPlacement }
					offset={ popoverOffset }
					noArrow={ popoverNoArrow }
					className={ popoverClassName }
					focusOnMount={ popoverFocusOnMount }
					animate={ popoverAnimate }
					shift={ popoverShift }
					constrainTabbing={ popoverConstrainTabbing }
					onClose={ close }
				>
					{ popoverHeader }
					<WordPressLinkControl
						value={
							hasLink || hasDraftValue ? normalizedValue : null
						}
						onChange={ handleChange }
						onRemove={ remove }
						onCancel={ close }
						settings={ resolvedSettings }
						suggestionsQuery={ suggestionsQuery }
						showSuggestions={ showSuggestions }
						showInitialSuggestions={ showInitialSuggestions }
						forceIsEditingLink={
							forceIsEditingLink ?? ( hasLink ? undefined : true )
						}
						noDirectEntry={ noDirectEntry }
						noURLSuggestion={ noURLSuggestion }
						hasTextControl={ hasTextControl }
						handleEntities={ handleEntities }
						hasRichPreviews={ hasRichPreviews }
						searchInputPlaceholder={ searchInputPlaceholder }
					/>
					{ popoverFooter }
				</Popover>
			) }
		</>
	);
}
