import { buildTypeQuery, mergeTermFilters } from './query.js';
import { mergeResults, toPostDisplay, type PostDisplay } from './records.js';
import type { PickerTaxonomy, PickerType } from './usePickerTypes.js';
import { fromReferences, moveItem, toReferences } from './value.js';

const post = ( id: number, date: string, title = `Post ${ id }` ): PostDisplay => ( {
	id,
	type: 'post',
	title,
	link: `/p/${ id }`,
	date,
} );

describe( 'value conversion', () => {
	it( 'normalizes every stored shape into ordered, unique references', () => {
		expect( toReferences( [ 3, '5', { id: 7, title: 'A' }, 3, 0, 'x', null ] ) ).toEqual( [
			{ id: 3 },
			{ id: 5 },
			{ id: 7, title: 'A' },
		] );
		expect( toReferences( 9 ) ).toEqual( [ { id: 9 } ] );
		expect( toReferences( null ) ).toEqual( [] );
		expect( toReferences( '' ) ).toEqual( [] );
	} );

	it( 'writes ids, picked object fields and single values', () => {
		const references = [
			{ id: 1, type: 'post', title: 'One', link: '/1' },
			{ id: 2, type: 'page', title: 'Two', link: '/2' },
		];

		expect( fromReferences( references, {} ) ).toEqual( [ 1, 2 ] );
		expect(
			fromReferences( references, { valueShape: 'objects', fields: [ 'title' ] } )
		).toEqual( [
			{ id: 1, title: 'One' },
			{ id: 2, title: 'Two' },
		] );
		expect( fromReferences( references, { multiple: false } ) ).toBe( 1 );
		expect( fromReferences( [], { multiple: false } ) ).toBeNull();
		expect(
			fromReferences( references, { valueShape: 'objects', multiple: false } )
		).toEqual( references[ 0 ] );
	} );

	it( 'moves items and ignores out-of-range moves', () => {
		expect( moveItem( [ 'a', 'b', 'c' ], 0, 2 ) ).toEqual( [ 'b', 'c', 'a' ] );
		expect( moveItem( [ 'a', 'b', 'c' ], 2, 0 ) ).toEqual( [ 'c', 'a', 'b' ] );
		const same = [ 'a' ];
		expect( moveItem( same, 0, 3 ) ).toBe( same );
	} );
} );

describe( 'mergeResults', () => {
	it( 'merges per-type pages into one window in server order', () => {
		const posts = [ post( 1, '2026-09-18T10:00:00' ), post( 2, '2026-09-10T10:00:00' ) ];
		const pages = [ { ...post( 3, '2026-09-15T10:00:00' ), type: 'page' } ];

		expect(
			mergeResults( [ posts, pages ], 'newest', 2 ).map( ( item ) => item.id )
		).toEqual( [ 1, 3 ] );
		expect(
			mergeResults( [ posts, pages ], 'oldest', 3 ).map( ( item ) => item.id )
		).toEqual( [ 2, 3, 1 ] );
	} );

	it( 'sorts titles case-insensitively and breaks ties by the higher ID', () => {
		const list = [
			post( 1, '', 'beta' ),
			post( 2, '', 'Alpha' ),
			post( 3, '', 'alpha' ),
		];

		expect(
			mergeResults( [ list ], 'title-asc', 3 ).map( ( item ) => item.id )
		).toEqual( [ 3, 2, 1 ] );
	} );
} );

describe( 'toPostDisplay', () => {
	it( 'prefers the raw title and reads embedded terms and thumbnail', () => {
		expect(
			toPostDisplay( {
				id: 4,
				type: 'post',
				title: { raw: 'Tom & Jerry', rendered: 'Tom &amp; Jerry' },
				link: '/4',
				date: '2026-09-18T10:00:00',
				_embedded: {
					'wp:term': [ [], [ { name: 'Styl &amp; moda' } ] ],
					'wp:featuredmedia': [
						{ source_url: '/full.jpg', media_details: { sizes: { thumbnail: { source_url: '/thumb.jpg' } } } },
					],
				},
			} )
		).toEqual( {
			id: 4,
			type: 'post',
			title: 'Tom & Jerry',
			link: '/4',
			date: '2026-09-18T10:00:00',
			termName: 'Styl & moda',
			thumbnailUrl: '/thumb.jpg',
		} );
	} );
} );

describe( 'term filters and type queries', () => {
	const taxonomies = new Map< string, PickerTaxonomy >( [
		[ 'category', { slug: 'category', name: 'Categories', restBase: 'categories' } ],
	] );
	const postType: PickerType = { slug: 'post', label: 'Post', restBase: 'posts', taxonomies: [ 'category' ] };
	const pageType: PickerType = { slug: 'page', label: 'Page', restBase: 'pages', taxonomies: [] };
	const base = {
		order: 'newest' as const,
		status: [ 'publish' ],
		exclude: [ 12, 3 ],
		taxonomies,
		embedMedia: false,
	};

	it( 'narrows a constrained taxonomy to the intersection, or to nothing', () => {
		expect( mergeTermFilters( { category: [ 1, 2 ] }, { category: [ 2 ] } ) ).toEqual( {
			category: [ 2 ],
		} );
		expect( mergeTermFilters( { category: [ 1 ] }, { category: [ 2 ] } ) ).toBeNull();
		expect( mergeTermFilters( undefined, { category: [] } ) ).toEqual( {} );
	} );

	it( 'maps term filters to the REST base and excludes sorted IDs', () => {
		expect(
			buildTypeQuery( postType, { ...base, search: 'coat', termFilters: { category: [ 5 ] } } )
		).toMatchObject( {
			orderby: 'date',
			order: 'desc',
			search: 'coat',
			status: 'publish',
			exclude: '3,12',
			categories: '5',
			_embed: 'wp:term',
		} );
	} );

	it( 'drops a type lacking a filtered taxonomy', () => {
		expect( buildTypeQuery( pageType, { ...base, termFilters: { category: [ 5 ] } } ) ).toBeNull();
	} );
} );
