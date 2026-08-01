import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
// @ts-expect-error The package does not ship TypeScript declarations for these stable exports.
import { MediaUpload, MediaUploadCheck, store as blockEditorStore } from '@wordpress/block-editor';
import {
	Button,
	DropZone,
	Dropdown,
	FormFileUpload,
	MenuItem,
	NavigableMenu,
	TextControl,
} from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { __, _x } from '@wordpress/i18n';
import {
	media as mediaIcon,
	postFeaturedImage,
	trash,
	upload,
} from '@wordpress/icons';
import {
	hasMediaValue,
	normalizeMediaValue,
} from '../MediaPickerControl/index.js';
import { getMediaAccept, resolveMediaSources } from './media-sources.js';
import type {
	MediaSourceControlProps,
	MediaSourceLabels,
} from './types.js';

type MediaUploadFunction = ( options: {
	allowedTypes?: string[];
	filesList: File[] | FileList;
	onFileChange: ( media: unknown[] ) => void;
	onError?: ( message: string ) => void;
	multiple?: boolean;
} ) => void;

interface FeaturedSelection {
	value?: ReturnType< typeof normalizeMediaValue >;
	native?: unknown;
	resolved: boolean;
}

const noop = () => undefined;

function useCurrentFeaturedMedia( enabled: boolean ): FeaturedSelection {
	return useSelect( ( select ) => {
		if ( ! enabled ) {
			return { resolved: false };
		}

		const editor = select( editorStore ) as {
			getEditedPostAttribute?: ( attribute: string ) => unknown;
		};
		const featuredId = editor.getEditedPostAttribute?.( 'featured_media' );

		if ( typeof featuredId !== 'number' || featuredId <= 0 ) {
			return { resolved: true };
		}

		const core = select( coreStore ) as {
			getEntityRecord?: (
				kind: string,
				name: string,
				id: number
			) => unknown;
			hasFinishedResolution?: (
				selector: string,
				args: [ string, string, number ]
			) => boolean;
		};
		const args: [ string, string, number ] = [
			'postType',
			'attachment',
			featuredId,
		];
		const native = core.getEntityRecord?.( ...args );

		return native
			? { value: normalizeMediaValue( native ), native, resolved: true }
			: {
				resolved:
					core.hasFinishedResolution?.( 'getEntityRecord', args ) ??
					false,
			};
	}, [ enabled ] );
}

function inferUrlMediaType(
	currentType: string | undefined,
	allowedTypes: string[]
): string | undefined {
	if ( currentType && currentType !== 'file' ) {
		return currentType;
	}

	if ( ! allowedTypes.length ) {
		return undefined;
	}

	return allowedTypes[ 0 ].split( '/' )[ 0 ];
}

/** Native-style media sources for placeholders and replacement dropdowns. */
export function MediaSourceControl( {
	value = {},
	onChange,
	onRemove,
	sources,
	variant = 'dropdown',
	allowedTypes = [ 'image' ],
	accept,
	imageSize,
	disabled = false,
	featuredMedia,
	onFilesUpload,
	onError,
	title,
	modalClass,
	onClose,
	fallback = null,
	labels: labelOverrides,
	children,
}: MediaSourceControlProps ): ReactElement | null {
	const visibleSources = resolveMediaSources( sources );
	const labels: MediaSourceLabels = {
		select: __( 'Add media' ),
		replace: __( 'Replace' ),
		library:
			variant === 'buttons'
				? __( 'Media Library' )
				: __( 'Open Media Library' ),
		upload: _x( 'Upload', 'verb' ),
		url: __( 'Insert from URL' ),
		featured: __( 'Use featured image' ),
		remove: __( 'Reset' ),
		currentUrl: __( 'Current media URL:' ),
		applyUrl: __( 'Apply' ),
		...labelOverrides,
	};
	const hasMedia = hasMediaValue( value );
	const automaticFeatured = useCurrentFeaturedMedia(
		visibleSources.featured && featuredMedia === undefined
	);
	const resolvedFeatured: FeaturedSelection =
		featuredMedia === undefined
			? automaticFeatured
			: featuredMedia
				? { value: featuredMedia, resolved: true }
				: { resolved: true };
	const [ url, setUrl ] = useState( value.url ?? '' );
	const openMediaLibrary = useRef< () => void >( noop );
	const openFileUpload = useRef< () => void >( noop );
	const closeDropdown = useRef< () => void >( noop );
	const needsUploader =
		visibleSources.upload ||
		( variant === 'buttons' && visibleSources.dropZone );
	const settings = useSelect( ( select ) => {
		if ( ! needsUploader ) {
			return undefined;
		}

		const store = select( blockEditorStore ) as {
			getSettings?: () => { mediaUpload?: MediaUploadFunction };
		};
		return store.getSettings?.();
	}, [ needsUploader ] );

	useEffect( () => {
		setUrl( value.url ?? '' );
	}, [ value.url ] );

	useEffect( () => {
		if (
			value.source === 'featured' &&
			resolvedFeatured.resolved &&
			! resolvedFeatured.value?.url &&
			( value.id || value.url )
		) {
			onChange( { source: 'featured' } );
			return;
		}

		if (
			value.source === 'featured' &&
			resolvedFeatured.value?.url &&
			( resolvedFeatured.value.id !== value.id ||
				resolvedFeatured.value.url !== value.url )
		) {
			onChange(
				{ ...resolvedFeatured.value, source: 'featured' },
				resolvedFeatured.native
			);
		}
	}, [
		onChange,
		resolvedFeatured.native,
		resolvedFeatured.resolved,
		resolvedFeatured.value,
		value.id,
		value.source,
		value.url,
	] );

	const selectAttachment = ( nativeMedia: unknown ) => {
		closeDropdown.current();
		onChange(
			{ ...normalizeMediaValue( nativeMedia, imageSize ), source: 'attachment' },
			nativeMedia
		);
	};

	const uploadFiles = ( files: File[] | FileList | null ) => {
		if ( disabled || ! files?.length || ! settings?.mediaUpload ) {
			return;
		}

		onFilesUpload?.( files );
		settings.mediaUpload( {
			allowedTypes,
			filesList: files,
			multiple: false,
			onFileChange: ( media ) => {
				if ( media[ 0 ] ) {
					selectAttachment( media[ 0 ] );
				}
			},
			onError,
		} );
	};

	const selectUrl = ( event: FormEvent ) => {
		event.preventDefault();
		const nextUrl = url.trim();
		if ( ! nextUrl || disabled ) {
			return;
		}

		closeDropdown.current();
		onChange( {
			url: nextUrl,
			type: inferUrlMediaType( value.type, allowedTypes ),
			source: 'url',
		} );
	};

	const selectFeatured = () => {
		if ( disabled || ! resolvedFeatured.value?.url ) {
			return;
		}

		closeDropdown.current();
		onChange(
			{ ...resolvedFeatured.value, source: 'featured' },
			resolvedFeatured.native
		);
	};

	const libraryUpload = visibleSources.library ? (
		<MediaUpload
			value={ value.id }
			allowedTypes={ allowedTypes }
			title={ title }
			modalClass={ modalClass }
			onClose={ onClose }
			onSelect={ selectAttachment }
			render={ ( { open }: { open: () => void } ) => {
				openMediaLibrary.current = open;
				return null;
			} }
		/>
	) : null;

	const fileUpload = visibleSources.upload ? (
		<FormFileUpload
			accept={ getMediaAccept( allowedTypes, accept ) }
			multiple={ false }
			onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
				uploadFiles( event.currentTarget.files ) }
			render={ ( { openFileDialog } ) => {
				openFileUpload.current = openFileDialog;
				return null;
			} }
		/>
	) : null;

	const urlForm = visibleSources.url ? (
		<form onSubmit={ selectUrl } style={ { padding: 12, minWidth: 280 } }>
			<TextControl
				label={ labels.currentUrl }
				value={ url }
				placeholder={ __( 'Paste or type URL' ) }
				onChange={ setUrl }
				disabled={ disabled }
				type="text"
			/>
			<Button
				type="submit"
				variant="primary"
				disabled={ disabled || ! url.trim() }
			>
				{ labels.applyUrl }
			</Button>
		</form>
	) : null;

	if ( variant === 'buttons' ) {
		const mediaActions = (
			<MediaUploadCheck fallback={ fallback }>
				{ visibleSources.dropZone && ! disabled && settings?.mediaUpload && (
					<DropZone onFilesDrop={ uploadFiles } />
				) }
				{ visibleSources.upload && (
					<FormFileUpload
						accept={ getMediaAccept( allowedTypes, accept ) }
						multiple={ false }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							uploadFiles( event.currentTarget.files ) }
						render={ ( { openFileDialog } ) => (
							<Button
								className="block-editor-media-placeholder__button block-editor-media-placeholder__upload-button"
								variant="primary"
								disabled={ disabled || ! settings?.mediaUpload }
								onClick={ openFileDialog }
							>
								{ labels.upload }
							</Button>
						) }
					/>
				) }
				{ visibleSources.library && (
					<MediaUpload
						value={ value.id }
						allowedTypes={ allowedTypes }
						title={ title }
						modalClass={ modalClass }
						onClose={ onClose }
						onSelect={ selectAttachment }
						render={ ( { open }: { open: () => void } ) => (
							<Button
								className="block-editor-media-placeholder__button"
								variant="secondary"
								disabled={ disabled }
								onClick={ open }
							>
								{ labels.library }
							</Button>
						) }
					/>
				) }
			</MediaUploadCheck>
		);

		return (
			<>
				{ mediaActions }
				{ visibleSources.url && (
					<Dropdown
						popoverProps={ { placement: 'bottom-start' } }
						renderToggle={ ( { isOpen, onToggle } ) => (
							<Button
								className="block-editor-media-placeholder__button"
								variant="secondary"
								isPressed={ isOpen }
								disabled={ disabled }
								onClick={ onToggle }
							>
								{ labels.url }
							</Button>
						) }
						renderContent={ ( { onClose } ) => {
							closeDropdown.current = onClose;
							return urlForm;
						} }
					/>
				) }
				{ visibleSources.featured && (
					<Button
						className="block-editor-media-placeholder__button"
						variant="secondary"
						disabled={ disabled || ! resolvedFeatured.value?.url }
						onClick={ selectFeatured }
					>
						{ labels.featured }
					</Button>
				) }
			</>
		);
	}

	const hasDropdownContent =
		visibleSources.library ||
		visibleSources.upload ||
		visibleSources.url ||
		visibleSources.featured ||
		Boolean( hasMedia && onRemove );

	if ( ! hasDropdownContent ) {
		return null;
	}

	return (
		<>
			<Dropdown
				popoverProps={ { placement: 'bottom-start' } }
				contentClassName="block-editor-media-replace-flow__options"
				renderToggle={ ( { isOpen, onToggle } ) => {
					const args = {
						isOpen,
						toggle: disabled ? noop : onToggle,
						disabled,
						hasMedia,
						label: hasMedia ? labels.replace : labels.select,
					};

					return children ? (
						children( args )
					) : (
						<Button
							variant="secondary"
							disabled={ disabled }
							isPressed={ isOpen }
							onClick={ onToggle }
						>
							{ args.label }
						</Button>
					);
				} }
				renderContent={ ( { onClose } ) => {
					closeDropdown.current = onClose;
					return (
						<>
							<NavigableMenu className="block-editor-media-replace-flow__media-upload-menu">
								<MediaUploadCheck fallback={ fallback }>
									{ visibleSources.library && (
										<MenuItem
											icon={ mediaIcon }
											disabled={ disabled }
											onClick={ openMediaLibrary.current }
										>
											{ labels.library }
										</MenuItem>
									) }
									{ visibleSources.upload && (
										<MenuItem
											icon={ upload }
											disabled={ disabled || ! settings?.mediaUpload }
											onClick={ openFileUpload.current }
										>
											{ labels.upload }
										</MenuItem>
									) }
								</MediaUploadCheck>
								{ visibleSources.featured && (
									<MenuItem
										icon={ postFeaturedImage }
										disabled={ disabled || ! resolvedFeatured.value?.url }
										onClick={ selectFeatured }
									>
										{ labels.featured }
									</MenuItem>
								) }
								{ hasMedia && onRemove && (
									<MenuItem
										icon={ trash }
										disabled={ disabled }
										onClick={ () => {
											onRemove();
											onClose();
										} }
									>
										{ labels.remove }
									</MenuItem>
								) }
							</NavigableMenu>
							{ visibleSources.url && (
								<div style={ { borderTop: '1px solid #ddd' } }>
									{ urlForm }
								</div>
							) }
						</>
					);
				} }
			/>
			<MediaUploadCheck>
				{ libraryUpload }
				{ fileUpload }
			</MediaUploadCheck>
		</>
	);
}
