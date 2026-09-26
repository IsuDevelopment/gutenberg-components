import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useState,
	type CSSProperties,
	type ReactNode,
} from 'react';
import {
	Button,
	Modal,
	Notice,
	SearchControl,
	SelectControl,
	Spinner,
	TabPanel,
} from '@wordpress/components';
import { useCurrentPostId } from '../../hooks/useCurrentPostId/index.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue/index.js';
import { useTermsOptions } from '../../bindings/options/useTermsOptions.js';
import {
	formatLabel,
	usePostPickerLabels,
} from '../../_internal/post-picker/labels.js';
import {
	buildTypeQuery,
	mergeTermFilters,
} from '../../_internal/post-picker/query.js';
import {
	decodeEntities,
	formatPostDate,
	withDisplays,
	type PostDisplay,
} from '../../_internal/post-picker/records.js';
import {
	usePickerTypes,
	type PickerTaxonomy,
} from '../../_internal/post-picker/usePickerTypes.js';
import { usePostHydration } from '../../_internal/post-picker/usePostHydration.js';
import { usePostResults } from '../../_internal/post-picker/usePostResults.js';
import {
	ALL_FIELDS,
	fromReferences,
	toReferences,
} from '../../_internal/post-picker/value.js';
import type {
	PostPickerLabels,
	PostPickerOrder,
	PostReference,
} from '../../types/posts.js';
import type { PostPickerModalProps } from './types.js';

const DEFAULT_STATUS = [ 'publish' ];

const FILTERS_STYLE: CSSProperties = {
	display: 'flex',
	flexWrap: 'wrap',
	gap: 12,
	alignItems: 'flex-end',
	marginBottom: 8,
};

const LIST_STYLE: CSSProperties = {
	margin: 0,
	padding: 0,
	listStyle: 'none',
	minHeight: 240,
	borderTop: '1px solid #e0e0e0',
};

const THUMBNAIL_STYLE: CSSProperties = {
	flex: '0 0 56px',
	width: 56,
	height: 56,
	borderRadius: 2,
	background: '#f0f0f0',
	objectFit: 'cover',
};

const MUTED_STYLE: CSSProperties = { color: '#757575', fontSize: 13 };

interface TaxonomyFilterProps {
	taxonomy: PickerTaxonomy;
	value: number | undefined;
	onChange: ( value: number | undefined ) => void;
	allowedTerms?: number[];
	labels: PostPickerLabels;
}

function TaxonomyFilter( {
	taxonomy,
	value,
	onChange,
	allowedTerms,
	labels,
}: TaxonomyFilterProps ) {
	const { options } = useTermsOptions( {
		type: 'terms',
		taxonomy: taxonomy.slug,
		query: allowedTerms ? { include: allowedTerms.join( ',' ) } : undefined,
	} );

	return (
		<div style={ { flex: '1 1 160px' } }>
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ taxonomy.name }
				hideLabelFromVision
				value={ value ? String( value ) : '' }
				options={ [
					{
						label:
							taxonomy.allItems ?? formatLabel( labels.allTerms, taxonomy.name ),
						value: '',
					},
					...options.map( ( option ) => ( {
						label: decodeEntities( option.label ),
						value: String( option.value ),
					} ) ),
				] }
				onChange={ ( next: string ) =>
					onChange( next ? Number( next ) : undefined )
				}
			/>
		</div>
	);
}

interface PostRowProps {
	inputId: string;
	inputName: string;
	inputType: 'checkbox' | 'radio';
	checked: boolean;
	disabled: boolean;
	onToggle: () => void;
	title: string;
	meta?: string;
	date?: string;
	thumbnail?: ReactNode;
}

function PostRow( {
	inputId,
	inputName,
	inputType,
	checked,
	disabled,
	onToggle,
	title,
	meta,
	date,
	thumbnail,
}: PostRowProps ) {
	return (
		<li
			style={ {
				borderBottom: '1px solid #f0f0f0',
				background: checked ? '#f6f7fb' : undefined,
			} }
		>
			<label
				htmlFor={ inputId }
				style={ {
					display: 'flex',
					alignItems: 'center',
					gap: 16,
					padding: '12px 16px',
					cursor: disabled ? 'not-allowed' : 'pointer',
					opacity: disabled ? 0.5 : 1,
				} }
			>
				<input
					id={ inputId }
					name={ inputName }
					type={ inputType }
					checked={ checked }
					disabled={ disabled }
					onChange={ onToggle }
					style={ { margin: 0 } }
				/>
				{ thumbnail }
				<span style={ { flex: '1 1 auto', minWidth: 0 } }>
					<span style={ { display: 'block', fontWeight: 500 } }>{ title }</span>
					{ meta && <span style={ { ...MUTED_STYLE, display: 'block' } }>{ meta }</span> }
				</span>
				{ date && <span style={ { ...MUTED_STYLE, flex: '0 0 auto' } }>{ date }</span> }
			</label>
		</li>
	);
}

/**
 * A modal for searching, filtering and selecting posts across one or more post types.
 * Edits a draft; `onChange` fires only on "Save selection".
 */
export function PostPickerModal( {
	value,
	onChange,
	onClose,
	postTypes,
	taxonomies: allowedTaxonomies,
	query,
	excludeCurrentPost = true,
	max,
	multiple = true,
	valueShape = 'ids',
	fields = ALL_FIELDS,
	showFeaturedImage = true,
	perPage = 20,
	labels: labelOverrides,
	className,
}: PostPickerModalProps ) {
	const labels = usePostPickerLabels( labelOverrides );
	const instanceId = useId();
	const currentPostId = useCurrentPostId();
	const limit = multiple ? max : 1;

	const queryKey = JSON.stringify( query ?? {} );
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const status = useMemo( () => query?.status ?? DEFAULT_STATUS, [ queryKey ] );
	const exclude = useMemo(
		() => [
			...( query?.exclude ?? [] ),
			...( excludeCurrentPost && currentPostId ? [ currentPostId ] : [] ),
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ queryKey, excludeCurrentPost, currentPostId ]
	);

	const { types, taxonomies, isLoading: typesLoading } = usePickerTypes(
		postTypes,
		query
	);
	const typeSlugs = useMemo( () => types.map( ( type ) => type.slug ), [ types ] );
	const typeLabels = useMemo(
		() => new Map( types.map( ( type ) => [ type.slug, type.label ] ) ),
		[ types ]
	);

	// The draft starts from the stored value and is only written back on Save.
	const [ initialReferences ] = useState( () => toReferences( value ) );
	const [ draft, setDraft ] = useState< PostReference[] >( initialReferences );
	const [ seen, setSeen ] = useState( () => new Map< number, PostDisplay >() );

	const [ search, setSearch ] = useState( '' );
	const debouncedSearch = useDebouncedValue( search, 300 );
	const [ typeFilter, setTypeFilter ] = useState( '' );
	const [ termFilter, setTermFilter ] = useState< Record< string, number > >( {} );
	const [ order, setOrder ] = useState< PostPickerOrder >( 'newest' );
	const [ pages, setPages ] = useState( 1 );
	const [ locale, setLocale ] = useState< string >();
	const [ scrollPadding, setScrollPadding ] = useState( 0 );

	const activeType =
		types.find( ( type ) => type.slug === typeFilter ) ??
		( types.length === 1 ? types[ 0 ] : undefined );
	const activeTypes = activeType ? [ activeType ] : types;

	const filterTaxonomies = activeType
		? activeType.taxonomies
				.filter(
					( slug ) => ! allowedTaxonomies || allowedTaxonomies.includes( slug )
				)
				.map( ( slug ) => taxonomies.get( slug ) )
				.filter( ( taxonomy ): taxonomy is PickerTaxonomy => !! taxonomy )
		: [];

	const typeQueries = useMemo( () => {
		const uiFilters = Object.fromEntries(
			Object.entries( termFilter ).map( ( [ slug, term ] ) => [ slug, [ term ] ] )
		);
		const termFilters = mergeTermFilters( query?.taxonomies, uiFilters );

		if ( ! termFilters ) {
			return [];
		}

		return activeTypes.flatMap( ( type ) => {
			const typeQuery = buildTypeQuery( type, {
				search: debouncedSearch.trim(),
				order,
				status,
				exclude,
				termFilters,
				taxonomies,
				embedMedia: showFeaturedImage,
			} );

			return typeQuery ? [ { type: type.slug, query: typeQuery } ] : [];
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		activeTypes.map( ( type ) => type.slug ).join( ',' ),
		termFilter,
		queryKey,
		debouncedSearch,
		order,
		status,
		exclude,
		taxonomies,
		showFeaturedImage,
	] );

	useEffect( () => setPages( 1 ), [ typeQueries ] );

	const results = usePostResults(
		typeQueries,
		pages,
		perPage,
		order,
		! typesLoading
	);
	const hydration = usePostHydration(
		initialReferences,
		typeSlugs,
		status,
		showFeaturedImage,
		typesLoading
	);

	const displayFor = useCallback(
		( id: number ) =>
			seen.get( id ) ??
			results.items.find( ( display ) => display.id === id ) ??
			hydration.displays.get( id ),
		[ seen, results.items, hydration.displays ]
	);

	const selectedIds = useMemo(
		() => new Set( draft.map( ( reference ) => reference.id ) ),
		[ draft ]
	);
	const isFull = limit !== undefined && multiple && draft.length >= limit;

	const toggle = ( display: PostDisplay | PostReference ) => {
		if ( 'date' in display ) {
			setSeen( ( previous ) => new Map( previous ).set( display.id, display ) );
		}

		setDraft( ( previous ) => {
			if ( previous.some( ( reference ) => reference.id === display.id ) ) {
				return previous.filter( ( reference ) => reference.id !== display.id );
			}

			const reference: PostReference = {
				id: display.id,
				...( display.type ? { type: display.type } : {} ),
			};

			if ( ! multiple ) {
				return [ reference ];
			}

			return limit !== undefined && previous.length >= limit
				? previous
				: [ ...previous, reference ];
		} );
	};

	const save = () => {
		const displays = new Map( hydration.displays );
		results.items.forEach( ( display ) => displays.set( display.id, display ) );
		seen.forEach( ( display, id ) => displays.set( id, display ) );

		const byId = new Map(
			initialReferences.map( ( reference ) => [ reference.id, reference ] )
		);
		const references = withDisplays(
			draft.map( ( reference ) => byId.get( reference.id ) ?? reference ),
			displays
		);

		onChange( fromReferences( references, { valueShape, fields, multiple } ) );
		onClose();
	};

	const metaFor = ( display: PostDisplay ) =>
		[ typeLabels.get( display.type ) ?? display.type, display.termName ]
			.filter( Boolean )
			.join( ' · ' );

	const thumbnailFor = ( display?: PostDisplay ) => {
		if ( ! showFeaturedImage ) {
			return undefined;
		}

		return display?.thumbnailUrl ? (
			<img src={ display.thumbnailUrl } alt="" style={ THUMBNAIL_STYLE } />
		) : (
			<span aria-hidden="true" style={ THUMBNAIL_STYLE } />
		);
	};

	const renderRow = ( id: number, display?: PostDisplay, reference?: PostReference ) => {
		const checked = selectedIds.has( id );

		return (
			<PostRow
				key={ id }
				inputId={ `${ instanceId }-post-${ id }` }
				inputName={ `${ instanceId }-posts` }
				inputType={ multiple ? 'checkbox' : 'radio' }
				checked={ checked }
				disabled={ ! checked && isFull }
				onToggle={ () => toggle( display ?? reference ?? { id } ) }
				title={
					display?.title ||
					reference?.title ||
					formatLabel( labels.unavailable, id )
				}
				meta={ display ? metaFor( display ) : undefined }
				date={ display ? formatPostDate( display.date, locale ) : undefined }
				thumbnail={ thumbnailFor( display ) }
			/>
		);
	};

	const renderAll = () => {
		if ( results.error ) {
			return (
				<Notice status="error" isDismissible={ false }>
					{ labels.error }
				</Notice>
			);
		}

		if ( ! results.items.length ) {
			return results.isLoading || typesLoading ? (
				<div style={ { padding: 24, textAlign: 'center' } }>
					<Spinner />
				</div>
			) : (
				<p style={ { ...MUTED_STYLE, padding: '24px 16px' } }>
					{ labels.noResults }
				</p>
			);
		}

		return (
			<>
				<ul style={ LIST_STYLE }>
					{ results.items.map( ( display ) => renderRow( display.id, display ) ) }
				</ul>
				{ ( results.hasMore || results.isLoading ) && (
					<div style={ { padding: 12, textAlign: 'center' } }>
						{ results.isLoading ? (
							<Spinner />
						) : (
							<Button variant="secondary" onClick={ () => setPages( pages + 1 ) }>
								{ labels.loadMore }
							</Button>
						) }
					</div>
				) }
			</>
		);
	};

	const renderSelected = () =>
		draft.length ? (
			<ul style={ LIST_STYLE }>
				{ draft.map( ( reference ) =>
					renderRow( reference.id, displayFor( reference.id ), reference )
				) }
			</ul>
		) : (
			<p style={ { ...MUTED_STYLE, padding: '24px 16px' } }>
				{ labels.noSelection }
			</p>
		);

	return (
		<Modal
			title={ labels.modalTitle }
			onRequestClose={ onClose }
			size="large"
			className={ className }
		>
			<div
				ref={ ( node ) => {
					const lang = node?.ownerDocument.documentElement.lang;
					if ( lang && lang !== locale ) {
						setLocale( lang );
					}

					// A sticky footer stops at the scroll container's padding edge, leaving
					// scrolled rows visible below it. Read the modal's bottom padding so the
					// footer can be pulled down over it.
					const container = node?.closest( '.components-modal__content' );
					const view = node?.ownerDocument.defaultView;
					if ( container && view ) {
						const padding =
							parseFloat( view.getComputedStyle( container ).paddingBottom ) || 0;
						if ( padding !== scrollPadding ) {
							setScrollPadding( padding );
						}
					}
				} }
			>
				<div style={ FILTERS_STYLE }>
					<div style={ { flex: '2 1 220px' } }>
						<SearchControl
							__nextHasNoMarginBottom
							label={ labels.search }
							placeholder={ labels.search }
							value={ search }
							onChange={ ( next: string ) => setSearch( next ) }
						/>
					</div>
					{ types.length > 1 && (
						<div style={ { flex: '1 1 160px' } }>
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={ labels.postType }
								hideLabelFromVision
								value={ typeFilter }
								options={ [
									{ label: labels.allTypes, value: '' },
									...types.map( ( type ) => ( {
										label: type.label,
										value: type.slug,
									} ) ),
								] }
								onChange={ ( next: string ) => {
									setTypeFilter( next );
									setTermFilter( {} );
								} }
							/>
						</div>
					) }
					{ filterTaxonomies.map( ( taxonomy ) => (
						<TaxonomyFilter
							key={ taxonomy.slug }
							taxonomy={ taxonomy }
							value={ termFilter[ taxonomy.slug ] }
							allowedTerms={ query?.taxonomies?.[ taxonomy.slug ] }
							labels={ labels }
							onChange={ ( term ) =>
								setTermFilter( ( previous ) => {
									const next = { ...previous };
									if ( term ) {
										next[ taxonomy.slug ] = term;
									} else {
										delete next[ taxonomy.slug ];
									}
									return next;
								} )
							}
						/>
					) ) }
					<div style={ { flex: '1 1 140px' } }>
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ labels.order }
							hideLabelFromVision
							value={ order }
							options={ [
								{ label: labels.newest, value: 'newest' },
								{ label: labels.oldest, value: 'oldest' },
								{ label: labels.titleAsc, value: 'title-asc' },
								{ label: labels.titleDesc, value: 'title-desc' },
							] }
							onChange={ ( next: string ) => setOrder( next as PostPickerOrder ) }
						/>
					</div>
				</div>

				<TabPanel
					tabs={ [
						{
							name: 'all',
							title: formatLabel( labels.tabAll, results.total ?? results.items.length ),
						},
						{
							name: 'selected',
							title: formatLabel( labels.tabSelected, draft.length ),
						},
					] }
				>
					{ ( tab: { name: string } ) =>
						tab.name === 'selected' ? renderSelected() : renderAll()
					}
				</TabPanel>

				<div
					style={ {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 12,
						borderTop: '1px solid #e0e0e0',
						paddingTop: 16,
						paddingBottom: 16,
						marginTop: 8,
						// One scroll container (the modal): the footer sticks to its bottom edge so
						// Save stays reachable however long the list grows.
						position: 'sticky',
						bottom: -scrollPadding,
						zIndex: 1,
						background: '#fff',
					} }
				>
					<span style={ MUTED_STYLE }>
						{ limit !== undefined && multiple
							? formatLabel( labels.selectedOfMax, draft.length, limit )
							: formatLabel( labels.selectedCount, draft.length ) }
					</span>
					<div style={ { display: 'flex', gap: 8 } }>
						<Button variant="tertiary" onClick={ onClose }>
							{ labels.cancel }
						</Button>
						<Button variant="primary" onClick={ save }>
							{ labels.save }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
