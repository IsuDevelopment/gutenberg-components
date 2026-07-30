import {
	useCallback,
	useState,
	type MouseEvent,
	type ReactElement,
} from 'react';
// @ts-expect-error The package does not ship TypeScript declarations for this stable export.
import { BlockControls, RichText } from '@wordpress/block-editor';
import { Icon, ToolbarButton, ToolbarGroup, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { caution, link as linkIcon } from '@wordpress/icons';
import {
	getLinkAttributes,
	LinkPickerControl,
} from '../LinkPickerControl/index.js';
import type { LinkValue } from '../LinkPickerControl/index.js';
import type { LinkTextProps } from './types.js';

/** Editable link text with a WordPress link picker attached to the text itself. */
export function LinkText( {
	text = '',
	onTextChange,
	link = {},
	onLinkChange,
	onLinkRemove,
	placeholder = __( 'Link text…' ),
	className,
	ariaLabel,
	allowedFormats = [],
	disableLineBreaks = true,
	showIncompleteWarning = true,
	incompleteWarningText = __( 'Link text or URL is missing' ),
	warningSuffix,
	pickerProps,
	richTextProps,
	showToolbarButton = true,
	toolbarLabel = __( 'Link' ),
}: LinkTextProps ): ReactElement {
	const [ focusPickerOnOpen, setFocusPickerOnOpen ] = useState<
		'firstElement' | false
	>( false );
	const attributes = getLinkAttributes( link );
	const isIncomplete = ! text.trim() || ! attributes.href;
	const pickerValue: LinkValue = { ...link, title: text };

	const handleLinkChange = useCallback(
		( nextLink: LinkValue ) => {
			onLinkChange( nextLink );

			if ( nextLink.title !== undefined && nextLink.title !== text ) {
				onTextChange( nextLink.title );
			}
		},
		[ onLinkChange, onTextChange, text ]
	);

	return (
		<LinkPickerControl
			{ ...pickerProps }
			value={ pickerValue }
			onChange={ handleLinkChange }
			onRemove={ onLinkRemove }
			hasTextControl={ pickerProps?.hasTextControl ?? true }
			hasRichPreviews={ pickerProps?.hasRichPreviews ?? true }
			showInitialSuggestions={ pickerProps?.showInitialSuggestions ?? true }
			popoverPlacement={ pickerProps?.popoverPlacement ?? 'bottom' }
			popoverFocusOnMount={
				pickerProps?.popoverFocusOnMount ?? focusPickerOnOpen
			}
		>
			{ ( { anchorRef, open, isOpen } ) => (
				<>
					{ showToolbarButton && (
						<BlockControls group="inline">
							<ToolbarGroup>
								<ToolbarButton
									icon={ linkIcon }
									title={ toolbarLabel }
									isActive={ Boolean( attributes.href ) || isOpen }
									aria-haspopup="dialog"
									aria-expanded={ isOpen }
									onClick={ () => {
										setFocusPickerOnOpen( 'firstElement' );
										open();
									} }
								/>
							</ToolbarGroup>
						</BlockControls>
					) }

					<RichText
						{ ...richTextProps }
						tagName="a"
						ref={ anchorRef }
						className={ className }
						value={ text }
						onChange={ onTextChange }
						placeholder={ placeholder }
						aria-label={ ariaLabel || text || __( 'Link text' ) }
						allowedFormats={ allowedFormats }
						disableLineBreaks={ disableLineBreaks }
						href={ attributes.href }
						target={ attributes.target }
						rel={ attributes.rel }
						onClick={ ( event: MouseEvent< HTMLElement > ) => {
							if ( ! attributes.href ) {
								return;
							}

							event.preventDefault();
							setFocusPickerOnOpen( false );
							open();
						} }
					/>

					{ showIncompleteWarning && isIncomplete && (
						<Tooltip text={ incompleteWarningText }>
							<span
								role="img"
								aria-label={ incompleteWarningText }
								style={ {
									display: 'inline-flex',
									alignItems: 'center',
									marginInlineStart: 4,
								} }
							>
								<Icon icon={ caution } size={ 18 } />
								{ warningSuffix }
							</span>
						</Tooltip>
					) }
				</>
			) }
		</LinkPickerControl>
	);
}
