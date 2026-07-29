# `@isudev/gutenberg` — Component Library Architecture Plan

> **Biblioteka standalone.** Nie ma żadnych zależności od projektów hostujących,
> paczek agencyjnych ani plików konfiguracyjnych całego projektu. Komponenty w
> `components/` i `controls/` piszemy **od nowa**. Źródła ikon i konfiguracja są
> **wstrzykiwane przez propsy** (np. `IconSelect` dostaje `icons` propem), nigdy z
> globalnego rejestru. Jedyne zależności runtime to `@wordpress/*` (peer deps).
> Zob. decyzja 0001.

## Cel biblioteki

Celem biblioteki jest stworzenie zestawu komponentów, pól, hooków i helperów do pracy z Gutenbergiem, które pozwalają szybko budować bloki i panele edycyjne bez ciągłego przepisywania tej samej logiki.

Biblioteka ma działać w dwóch trybach:

1. **Easy mode** — gotowe komponenty typu `MetaSelectControl`, `TaxonomySelectControl`, `MetaRadioControl`, gdzie użytkownik podaje tylko `metaKey` albo `taxonomy`, a komponent sam czyta i zapisuje wartość.
2. **Advanced / composition mode** — elastyczne komponenty typu `SelectField`, `RadioField`, które pozwalają osobno zdefiniować źródło opcji i miejsce zapisu wartości, np. opcje z taxonomy terms, ale zapis do post meta.

Najważniejsza zasada architektoniczna:

```txt
optionsSource !== valueBinding
```

Czyli:

```txt
optionsSource  → skąd pole bierze opcje
valueBinding   → skąd pole czyta wartość i gdzie ją zapisuje
```

Przykład edge case:

```tsx
<SelectField
	label="Featured tag"
	optionsSource={ {
		type: 'terms',
		taxonomy: 'post_tag',
	} }
	valueBinding={ {
		type: 'meta',
		key: 'featured_tag',
	} }
/>
```

Ten przykład oznacza:

```txt
options: terms z taxonomy post_tag
value: meta featured_tag
save: meta featured_tag
```

---

## Proponowany namespace NPM

Rekomendowana nazwa paczki:

```txt
@isudev/gutenberg
```

Alternatywnie:

```txt
@isu/gutenberg
```

Rekomendacja: użyć `@isudev/gutenberg`, ponieważ jest bardziej unikalne, czytelne i lepiej nadaje się jako vendor namespace.

Docelowo można mieć też inne paczki:

```txt
@isudev/gutenberg
@isudev/wp-utils
@isudev/eslint-config
@isudev/icons
```

Na start jednak najlepiej zrobić jedną paczkę `@isudev/gutenberg` z subpath exports.

---

## Publiczne entrypointy

Rekomendowane publiczne importy:

```txt
@isudev/gutenberg
@isudev/gutenberg/appenders
@isudev/gutenberg/components
@isudev/gutenberg/controls
@isudev/gutenberg/fields
@isudev/gutenberg/meta
@isudev/gutenberg/taxonomy
@isudev/gutenberg/hooks
```

Przykłady:

```tsx
import { AppenderButton } from '@isudev/gutenberg/appenders';
import { ColorPopup, IconSelect } from '@isudev/gutenberg/components';
import { MediaControl, LinkControl } from '@isudev/gutenberg/controls';
import { SelectField, RadioField } from '@isudev/gutenberg/fields';
import { MetaSelectControl } from '@isudev/gutenberg/meta';
import { TaxonomySelectControl } from '@isudev/gutenberg/taxonomy';
```

Nie należy zachęcać użytkowników do importów z głębokich ścieżek typu:

```tsx
import SelectField from '@isudev/gutenberg/dist/fields/SelectField/SelectField';
```

Publiczne API powinno być stabilne i kontrolowane przez `exports` w `package.json`.

---

## Rekomendowana struktura repo

```txt
isudev-gutenberg/
├─ package.json
├─ tsconfig.json
├─ README.md
├─ CHANGELOG.md
├─ src/
│  ├─ index.ts
│  │
│  ├─ appenders/
│  │  ├─ index.ts
│  │  ├─ AppenderButton/
│  │  │  ├─ AppenderButton.tsx
│  │  │  ├─ types.ts
│  │  │  └─ index.ts
│  │  └─ AppenderGrid/
│  │
│  ├─ components/
│  │  ├─ index.ts
│  │  ├─ ColorPopup/
│  │  ├─ IconSelect/
│  │  ├─ SearchableSelect/
│  │  ├─ Skeleton/
│  │  ├─ EmptyState/
│  │  └─ LoadingOverlay/
│  │
│  ├─ controls/
│  │  ├─ index.ts
│  │  ├─ MediaControl/
│  │  ├─ LinkControl/
│  │  ├─ PostTypeControl/
│  │  ├─ UrlPicker/
│  │  └─ InlineUrlPicker/
│  │
│  ├─ fields/
│  │  ├─ index.ts
│  │  ├─ SelectField/
│  │  │  ├─ SelectField.tsx
│  │  │  ├─ types.ts
│  │  │  └─ index.ts
│  │  ├─ RadioField/
│  │  ├─ CheckboxField/
│  │  ├─ TextField/
│  │  ├─ ToggleField/
│  │  ├─ MetaSelectField/
│  │  ├─ MetaRadioField/
│  │  ├─ TaxonomySelectField/
│  │  └─ TaxonomyRadioField/
│  │
│  ├─ meta/
│  │  ├─ index.ts
│  │  ├─ MetaSelectControl.tsx
│  │  ├─ MetaRadioControl.tsx
│  │  ├─ MetaTextControl.tsx
│  │  ├─ MetaToggleControl.tsx
│  │  └─ MetaMediaControl.tsx
│  │
│  ├─ taxonomy/
│  │  ├─ index.ts
│  │  ├─ TaxonomySelectControl.tsx
│  │  ├─ TaxonomyRadioControl.tsx
│  │  └─ TaxonomyCheckboxControl.tsx
│  │
│  ├─ bindings/
│  │  ├─ useFieldBinding.ts
│  │  ├─ useOptionsSource.ts
│  │  ├─ useValueBinding.ts
│  │  ├─ options/
│  │  │  ├─ useTermsOptions.ts
│  │  │  ├─ usePostsOptions.ts
│  │  │  ├─ useUsersOptions.ts
│  │  │  ├─ usePostTypesOptions.ts
│  │  │  ├─ useManualOptions.ts
│  │  │  ├─ useCustomOptions.ts
│  │  │  └─ normalizeOptions.ts
│  │  └─ values/
│  │     ├─ useMetaBinding.ts
│  │     ├─ useTaxonomyBinding.ts
│  │     ├─ useControlledBinding.ts
│  │     ├─ useAttributeBinding.ts
│  │     └─ useCustomBinding.ts
│  │
│  ├─ hooks/
│  │  ├─ index.ts
│  │  ├─ useMeta.ts
│  │  ├─ useTaxonomy.ts
│  │  ├─ useCurrentPostType.ts
│  │  ├─ useCurrentPostId.ts
│  │  ├─ useDebouncedValue.ts
│  │  └─ usePrevious.ts
│  │
│  ├─ utils/
│  │  ├─ index.ts
│  │  ├─ isDefined.ts
│  │  ├─ noop.ts
│  │  ├─ getNestedValue.ts
│  │  ├─ normalizeQueryArgs.ts
│  │  └─ wordpress.ts
│  │
│  ├─ types/
│  │  ├─ fields.ts
│  │  ├─ options.ts
│  │  ├─ bindings.ts
│  │  └─ index.ts
│  │
│  └─ _internal/
│     ├─ constants/
│     ├─ utils/
│     └─ types/
│
├─ examples/
│  ├─ simple-block/
│  ├─ meta-controls/
│  ├─ taxonomy-controls/
│  └─ advanced-bindings/
│
└─ dist/
```

---

## Podział odpowiedzialności

### `components/`

Czyste komponenty UI. Nie powinny wiedzieć nic o Gutenberg meta, taxonomy, post types, `useEntityProp` itd.

Przykłady:

```txt
ColorPopup
IconSelect
SearchableSelect
Skeleton
EmptyState
LoadingOverlay
```

Zasada:

```txt
components = reusable UI building blocks
```

---

### `controls/`

Komponenty stricte edytorskie / Gutenbergowe, ale niekoniecznie automatycznie zbindowane do meta/taxonomy.

Przykłady:

```txt
MediaControl
LinkControl
PostTypeControl
UrlPicker
InlineUrlPicker
```

Zasada:

```txt
controls = Gutenberg/editor controls, often using @wordpress/components or @wordpress/block-editor
```

> **Kolizja nazw:** `LinkControl` istnieje już w `@wordpress/block-editor`. Zmień nazwę
> (np. `LinkPickerControl`) albo jawnie udokumentuj, że opakowuje natywny — inaczej
> import będzie mylący.

---

### `fields/`

Komponenty wyższego poziomu obsługujące:

```txt
optionsSource
valueBinding
value/onChange
loading/error state
```

Przykłady:

```txt
SelectField
RadioField
CheckboxField
TextField
ToggleField
```

Zasada:

```txt
fields = controls + optional data binding + optional dynamic options
```

---

### `meta/`

Gotowe komponenty easy mode dla post meta.

Przykłady:

```txt
MetaSelectControl
MetaRadioControl
MetaTextControl
MetaToggleControl
MetaMediaControl
```

Zasada:

```txt
meta controls = easy wrappers for valueBinding: { type: 'meta' }
```

---

### `taxonomy/`

Gotowe komponenty easy mode dla taxonomy relacji posta.

Przykłady:

```txt
TaxonomySelectControl
TaxonomyRadioControl
TaxonomyCheckboxControl
```

Zasada:

```txt
taxonomy controls = options from terms + value bound to post terms
```

---

### `bindings/`

Centralna logika rozwiązywania opcji i wartości.

To jest najważniejsza warstwa biblioteki.

Nie musi być publiczna na starcie. Może pozostać wewnętrzna.

Zasada:

```txt
bindings = engine behind Field components
```

---

### `hooks/`

Publiczne, przydatne hooki dla zaawansowanych userów.

Przykłady:

```txt
useMeta
useTaxonomy
useCurrentPostType
useCurrentPostId
useDebouncedValue
```

---

### `_internal/`

Rzeczy prywatne, których nie chcesz supportować jako public API.

Nie eksportować z `package.json`.

---

## Najważniejsze API: `optionsSource` i `valueBinding`

### `optionsSource`

`optionsSource` odpowiada tylko za pobranie / przygotowanie listy opcji.

Przykładowe typy:

```ts
export type OptionsSource =
	| {
			type: 'terms';
			taxonomy: string;
			query?: Record<string, unknown>;
			valueField?: 'id' | 'slug' | 'name';
			labelField?: 'name' | 'slug';
	  }
	| {
			type: 'posts';
			postTypes: string[];
			query?: Record<string, unknown>;
			valueField?: 'id' | 'slug';
			labelField?: 'title' | 'slug';
	  }
	| {
			type: 'users';
			roles?: string[];
			query?: Record<string, unknown>;
			valueField?: 'id' | 'slug' | 'email';
			labelField?: 'name' | 'email';
	  }
	| {
			type: 'postTypes';
			query?: Record<string, unknown>;
	  }
	| {
			type: 'manual';
			options: FieldOption[];
	  }
	| {
			type: 'custom';
			resolver: () => FieldOption[] | Promise<FieldOption[]>;
	  };
```

Ważne nazewnictwo:

```txt
type: 'posts'     → lista postów z danych post types
type: 'postTypes' → lista typów postów, np. post/page/faq
```

Nie używać `type: 'postType'` dla listy postów, bo to będzie mylące.

> **Uwaga (v1):** `type: 'custom'` z asynchronicznym `resolver` wymaga własnego hooka
> `useCustomOptions` ze stanem + `useEffect` (race conditions / cancel).
> `useOptionsSource` musi mieć wtedy `case 'custom'` — obecny `switch` niżej tego
> **nie obsługuje** i wpada w `default: []`. Jeśli niepotrzebne na start,
> **wywalić `custom` z v1** zamiast zostawiać martwy typ.

> **Wydajność `postTypes`:** źródło `postTypes` musi filtrować `viewable` i wykluczać
> wewnętrzne typy (`attachment`, `wp_block`, `wp_template`, `wp_navigation`…).

---

### `valueBinding`

`valueBinding` odpowiada za odczyt i zapis wartości.

Przykładowe typy:

```ts
export type ValueBinding =
	| {
			type: 'meta';
			key: string;
			postType?: string;
	  }
	| {
			type: 'taxonomy';
			taxonomy: string;
			restBase?: string;
	  }
	| {
			type: 'custom';
			value: unknown;
			onChange: ( value: unknown ) => void;
	  };
```

Na start rekomendacja:

```txt
valueBinding: meta
valueBinding: taxonomy
value/onChange: attributes, custom state, edge cases
```

`attribute` binding można dodać później przez `FieldProvider`.

> **KLUCZOWE — taxonomy to tablica ID.** `useEntityProp` dla taxonomy zwraca/zapisuje
> **tablicę term IDs**, a `SelectField`/`RadioField` (single-select) operują na
> pojedynczej wartości. Bez mapowania `TaxonomySelectControl` **nie zadziała**. Wymagana
> warstwa mapowania w bindingu taxonomy:
>
> ```txt
> read:  value  = terms?.[0]         (single) / terms (multi)
> write: single → onChange(id) → setTerms([id])
> ```
>
> Dla multi-select (np. `CheckboxField`) wartością jest cała tablica. Binding powinien
> znać „arność" pola (single vs multi) — np. przez flagę `multiple` na `valueBinding`
> taxonomy albo dedykowane komponenty.

> **`restBase` rozwiązuj automatycznie.** Nie zrzucaj na usera — pobierz z core-data:
> `select( coreStore ).getTaxonomy( taxonomy )?.rest_base`. Ręczny `restBase` zostaw
> tylko jako override dla nietypowych przypadków.

---

## Controlled mode

Każdy `Field` powinien obsługiwać manualny tryb Reactowy:

```tsx
<SelectField
	label="Layout"
	options={ [
		{ label: 'Grid', value: 'grid' },
		{ label: 'Slider', value: 'slider' },
	] }
	value={ attributes.layout }
	onChange={ ( layout ) => setAttributes( { layout } ) }
/>
```

Zasada:

```txt
Jeżeli podano value albo onChange, komponent działa jako controlled component.
Jeżeli nie podano value/onChange, ale podano valueBinding, komponent sam czyta i zapisuje wartość.
```

Warto dodać dev warning, gdy ktoś poda jednocześnie:

```tsx
<SelectField
	value={ value }
	onChange={ onChange }
	valueBinding={ { type: 'meta', key: 'foo' } }
/>
```

Bo wtedy źródło prawdy jest niejasne.

---

## Przykłady użycia

### 1. Prosty meta select

```tsx
<MetaSelectControl
	label="Layout"
	metaKey="layout"
	options={ [
		{ label: 'Grid', value: 'grid' },
		{ label: 'Slider', value: 'slider' },
	] }
/>
```

W środku to powinno być tylko wrapperem:

```tsx
export function MetaSelectControl( {
	metaKey,
	...props
} ) {
	return (
		<SelectField
			{ ...props }
			valueBinding={ {
				type: 'meta',
				key: metaKey,
			} }
		/>
	);
}
```

---

### 2. Prosty taxonomy select

```tsx
<TaxonomySelectControl
	label="Category"
	taxonomy="category"
/>
```

W środku:

```tsx
export function TaxonomySelectControl( {
	taxonomy,
	...props
} ) {
	return (
		<SelectField
			{ ...props }
			optionsSource={ {
				type: 'terms',
				taxonomy,
			} }
			valueBinding={ {
				type: 'taxonomy',
				taxonomy,
			} }
		/>
	);
}
```

---

### 3. Terms jako opcje, meta jako storage

```tsx
<SelectField
	label="Featured tag"
	optionsSource={ {
		type: 'terms',
		taxonomy: 'post_tag',
		valueField: 'id',
		labelField: 'name',
	} }
	valueBinding={ {
		type: 'meta',
		key: 'featured_tag',
	} }
/>
```

---

### 4. Posts jako opcje, meta jako storage

```tsx
<SelectField
	label="Featured relation"
	optionsSource={ {
		type: 'posts',
		postTypes: [ 'post', 'faq' ],
		valueField: 'id',
		labelField: 'title',
	} }
	valueBinding={ {
		type: 'meta',
		key: 'featured_post_related',
	} }
/>
```

---

### 5. Terms jako opcje, zapis ręczny do block attributes

```tsx
<SelectField
	label="Featured tag"
	optionsSource={ {
		type: 'terms',
		taxonomy: 'post_tag',
	} }
	value={ attributes.featuredTag }
	onChange={ ( featuredTag ) => setAttributes( { featuredTag } ) }
/>
```

---

### 6. Post types jako opcje, zapis ręczny do block attributes

```tsx
<SelectField
	label="Post type"
	optionsSource={ {
		type: 'postTypes',
	} }
	value={ attributes.postType }
	onChange={ ( postType ) => setAttributes( { postType } ) }
/>
```

---

### 7. RadioField z terms i meta

```tsx
<RadioField
	label="Featured category"
	optionsSource={ {
		type: 'terms',
		taxonomy: 'category',
	} }
	valueBinding={ {
		type: 'meta',
		key: 'featured_category',
	} }
/>
```

---

## Główna implementacja: `useFieldBinding`

Każdy `Field` powinien używać jednego wspólnego hooka:

```tsx
const {
	value,
	onChange,
	options,
	isLoading,
	error,
	controlProps,
} = useFieldBinding( props );
```

Ten hook powinien:

1. Wyciągnąć `options`, `optionsSource`, `value`, `onChange`, `valueBinding`, `onValueChange` z propsów.
2. Rozwiązać opcje przez `useOptionsSource`.
3. Rozwiązać wartość przez `useValueBinding`.
4. Zbudować finalny `onChange`.
5. Zwrócić gotowe dane dla komponentu.

Przykład:

```tsx
export function useFieldBinding( props ) {
	const {
		options,
		optionsSource,
		valueBinding,
		value: controlledValue,
		onChange: controlledOnChange,
		onValueChange,
		...controlProps
	} = props;

	const optionsResult = useOptionsSource( {
		options,
		optionsSource,
	} );

	const valueResult = useValueBinding( {
		valueBinding,
		value: controlledValue,
		onChange: controlledOnChange,
	} );

	const handleChange = ( nextValue ) => {
		valueResult.onChange( nextValue );
		onValueChange?.( nextValue );
	};

	return {
		value: valueResult.value,
		onChange: handleChange,
		options: optionsResult.options,
		isLoading: optionsResult.isLoading || valueResult.isLoading,
		error: optionsResult.error || valueResult.error,
		controlProps,
	};
}
```

---

## `useOptionsSource`

`useOptionsSource` powinien rozwiązywać tylko opcje.

Ważne: nie wywoływać hooków warunkowo w `switch`. Zamiast tego wszystkie wewnętrzne hooki powinny być wywoływane zawsze, ale z `null`, jeśli nie są aktywne.

```tsx
export function useOptionsSource( args ) {
	const terms = useTermsOptions(
		args.optionsSource?.type === 'terms' ? args.optionsSource : null
	);

	const posts = usePostsOptions(
		args.optionsSource?.type === 'posts' ? args.optionsSource : null
	);

	const users = useUsersOptions(
		args.optionsSource?.type === 'users' ? args.optionsSource : null
	);

	const postTypes = usePostTypesOptions(
		args.optionsSource?.type === 'postTypes' ? args.optionsSource : null
	);

	if ( args.options ) {
		return {
			options: args.options,
			isLoading: false,
			error: null,
		};
	}

	switch ( args.optionsSource?.type ) {
		case 'terms':
			return terms;

		case 'posts':
			return posts;

		case 'users':
			return users;

		case 'postTypes':
			return postTypes;

		case 'manual':
			return {
				options: args.optionsSource.options,
				isLoading: false,
				error: null,
			};

		default:
			return {
				options: [],
				isLoading: false,
				error: null,
			};
	}
}
```

---

## `useValueBinding`

`useValueBinding` powinien rozwiązywać tylko aktualną wartość i zapis.

```tsx
export function useValueBinding( {
	valueBinding,
	value,
	onChange,
} ) {
	const meta = useMetaBinding(
		valueBinding?.type === 'meta' ? valueBinding : null
	);

	const taxonomy = useTaxonomyBinding(
		valueBinding?.type === 'taxonomy' ? valueBinding : null
	);

	const custom = useCustomBinding(
		valueBinding?.type === 'custom' ? valueBinding : null
	);

	const isControlled = value !== undefined || onChange !== undefined;

	if ( isControlled ) {
		return {
			value,
			onChange: onChange ?? noop,
			isLoading: false,
			error: null,
		};
	}

	switch ( valueBinding?.type ) {
		case 'meta':
			return meta;

		case 'taxonomy':
			return taxonomy;

		case 'custom':
			return custom;

		default:
			return {
				value: undefined,
				onChange: noop,
				isLoading: false,
				error: null,
			};
	}
}
```

---

## `useMetaBinding`

Pseudo-implementacja:

```tsx
import { useEntityProp } from '@wordpress/core-data';
import { useCurrentPostType } from '../../hooks/useCurrentPostType';
import { noop } from '../../utils/noop';

export function useMetaBinding( binding ) {
	const currentPostType = useCurrentPostType();
	const postType = binding?.postType ?? currentPostType;

	const [ meta, setMeta ] = useEntityProp(
		'postType',
		postType,
		'meta'
	);

	if ( ! binding ) {
		return {
			value: undefined,
			onChange: noop,
			isLoading: false,
			error: null,
		};
	}

	const value = meta?.[ binding.key ];

	const setValue = ( nextValue ) => {
		setMeta( {
			...meta,
			[ binding.key ]: nextValue,
		} );
	};

	return {
		value,
		onChange: setValue,
		isLoading: false,
		error: null,
	};
}
```

---

## `useTaxonomyBinding`

Pseudo-implementacja:

```tsx
import { useEntityProp } from '@wordpress/core-data';
import { useCurrentPostType } from '../../hooks/useCurrentPostType';
import { noop } from '../../utils/noop';

export function useTaxonomyBinding( binding ) {
	const currentPostType = useCurrentPostType();
	const taxonomyProp = binding?.restBase ?? binding?.taxonomy;

	const [ terms, setTerms ] = useEntityProp(
		'postType',
		currentPostType,
		taxonomyProp || ''
	);

	if ( ! binding ) {
		return {
			value: undefined,
			onChange: noop,
			isLoading: false,
			error: null,
		};
	}

	return {
		value: terms,
		onChange: setTerms,
		isLoading: false,
		error: null,
	};
}
```

Uwaga: `restBase` rozwiązuj automatycznie przez `getTaxonomy( taxonomy )?.rest_base`; ręczne `restBase` w `valueBinding` zostaw jako override.

```tsx
valueBinding={ {
	type: 'taxonomy',
	taxonomy: 'project_category',
	restBase: 'project_category',
} }
```

---

## `useTermsOptions`

Pseudo-implementacja:

```tsx
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

export function useTermsOptions( source ) {
	const taxonomy = source?.taxonomy;
	const query = source?.query ?? {};

	const terms = useSelect(
		( select ) => {
			if ( ! taxonomy ) {
				return null;
			}

			return select( coreStore ).getEntityRecords(
				'taxonomy',
				taxonomy,
				{
					per_page: -1,
					...query,
				}
			);
		},
		[ taxonomy, JSON.stringify( query ) ]
	);

	if ( ! source ) {
		return {
			options: [],
			isLoading: false,
			error: null,
		};
	}

	if ( terms === null ) {
		return {
			options: [],
			isLoading: true,
			error: null,
		};
	}

	return {
		options: terms.map( ( term ) => ( {
			label: term[ source.labelField ?? 'name' ],
			value: term[ source.valueField ?? 'id' ],
		} ) ),
		isLoading: false,
		error: null,
	};
}
```

> **Loading/error rób poprawnie — nie na `=== null`.** Powyższa heurystyka (`terms === null`)
> zawodzi: pusta lista to też brak wyniku, a `undefined` bywa stanem przejściowym.
> W `useSelect` wyciągaj status z resolvera:
>
> ```tsx
> const { options, isLoading, error } = useSelect( ( select ) => {
>     const args = [ 'taxonomy', taxonomy, { per_page: -1, ...query } ];
>     const store = select( coreStore );
>     return {
>         records:  store.getEntityRecords( ...args ),
>         isLoading: ! store.hasFinishedResolution( 'getEntityRecords', args ),
>         error:     store.getResolutionError?.( 'getEntityRecords', args ) ?? null,
>     };
> }, [ taxonomy, JSON.stringify( query ) ] );
> ```
>
> To samo dotyczy `useMetaBinding`/`useTaxonomyBinding` — dziś ich `isLoading` jest
> zawsze `false` (nieprawda przed rozwiązaniem encji). Bez tego sekcja loading/error
> to atrapa.

---

## Jak budować Field components

Nie trzeba używać HOC. Lepszy wzorzec to prosty komponent, który używa `useFieldBinding`.

### `SelectField`

```tsx
import { SelectControl } from '@wordpress/components';
import { useFieldBinding } from '../../bindings/useFieldBinding';

export function SelectField( props ) {
	const {
		value,
		onChange,
		options,
		isLoading,
		error,
		controlProps,
	} = useFieldBinding( props );

	if ( isLoading ) {
		return props.loadingComponent ?? null;
	}

	if ( error ) {
		return props.errorComponent ?? null;
	}

	return (
		<SelectControl
			{ ...controlProps }
			value={ value }
			options={ options }
			onChange={ onChange }
		/>
	);
}
```

---

### `RadioField`

`RadioControl` z `@wordpress/components` używa `selected`, nie `value`.

```tsx
import { RadioControl } from '@wordpress/components';
import { useFieldBinding } from '../../bindings/useFieldBinding';

export function RadioField( props ) {
	const {
		value,
		onChange,
		options,
		isLoading,
		error,
		controlProps,
	} = useFieldBinding( props );

	if ( isLoading ) {
		return props.loadingComponent ?? null;
	}

	if ( error ) {
		return props.errorComponent ?? null;
	}

	return (
		<RadioControl
			{ ...controlProps }
			selected={ value }
			options={ options }
			onChange={ onChange }
		/>
	);
}
```

---

## Opcjonalny factory pattern

Jeżeli kilka fieldów będzie powtarzać ten sam schemat, można zrobić factory:

```tsx
export function createField( BaseControl, mapProps ) {
	return function Field( props ) {
		const binding = useFieldBinding( props );

		if ( binding.isLoading ) {
			return props.loadingComponent ?? null;
		}

		if ( binding.error ) {
			return props.errorComponent ?? null;
		}

		const mappedProps = mapProps( {
			props: binding.controlProps,
			value: binding.value,
			onChange: binding.onChange,
			options: binding.options,
		} );

		return <BaseControl { ...mappedProps } />;
	};
}
```

`SelectField`:

```tsx
export const SelectField = createField(
	SelectControl,
	( { props, value, onChange, options } ) => ( {
		...props,
		value,
		onChange,
		options,
	} )
);
```

`RadioField`:

```tsx
export const RadioField = createField(
	RadioControl,
	( { props, value, onChange, options } ) => ( {
		...props,
		selected: value,
		onChange,
		options,
	} )
);
```

Rekomendacja: na start można pisać komponenty ręcznie. Factory dodać, kiedy realnie powtórzenia zaczną przeszkadzać.

---

## Czy używać HOC?

Nie trzeba.

Aktualny pomysł typu:

```tsx
const RadioField = withExtraBindings( ( props ) => {
	return <RadioControl { ...props } />;
} );
```

jest możliwy, ale nie jest konieczny.

Lepszy układ:

```txt
Field component
  ↓
useFieldBinding
  ↓
useOptionsSource + useValueBinding
  ↓
native WordPress control
```

Jeżeli HOC ma zostać, powinien być tylko cienką warstwą nad `useFieldBinding`, a nie miejscem, gdzie ręcznie robi się `setMetaValue`, `setTaxonomyValue` itd.

Nie robić osobnych HOC:

```txt
withMeta
withUsers
withPostTypes
withTaxonomy
```

Zamiast tego:

```txt
useMetaBinding
useTaxonomyBinding
useTermsOptions
usePostsOptions
useUsersOptions
usePostTypesOptions
```

Powód:

```txt
users/posts/postTypes/terms = options sources
meta/taxonomy/custom = value bindings
```

---

## Easy wrappers

### Meta wrappers

```tsx
export function MetaSelectControl( {
	metaKey,
	...props
} ) {
	return (
		<SelectField
			{ ...props }
			valueBinding={ {
				type: 'meta',
				key: metaKey,
			} }
		/>
	);
}
```

```tsx
export function MetaRadioControl( {
	metaKey,
	...props
} ) {
	return (
		<RadioField
			{ ...props }
			valueBinding={ {
				type: 'meta',
				key: metaKey,
			} }
		/>
	);
}
```

---

### Taxonomy wrappers

```tsx
export function TaxonomySelectControl( {
	taxonomy,
	...props
} ) {
	return (
		<SelectField
			{ ...props }
			optionsSource={ {
				type: 'terms',
				taxonomy,
			} }
			valueBinding={ {
				type: 'taxonomy',
				taxonomy,
			} }
		/>
	);
}
```

```tsx
export function TaxonomyRadioControl( {
	taxonomy,
	...props
} ) {
	return (
		<RadioField
			{ ...props }
			optionsSource={ {
				type: 'terms',
				taxonomy,
			} }
			valueBinding={ {
				type: 'taxonomy',
				taxonomy,
			} }
		/>
	);
}
```

---

## Recommended public docs wording

### Choosing the right component

```md
Use `MetaSelectControl` when the value should be read from and saved to post meta.

Use `TaxonomySelectControl` when the options should come from taxonomy terms and the selected value should be saved as post terms.

Use `SelectField` when the list of options and the value storage are different concepts.

Use `value` and `onChange` when you want to handle the value manually.
```

### Examples

```tsx
// Easy mode: meta.
<MetaSelectControl
	label="Layout"
	metaKey="layout"
	options={ layoutOptions }
/>
```

```tsx
// Easy mode: taxonomy.
<TaxonomySelectControl
	label="Category"
	taxonomy="category"
/>
```

```tsx
// Advanced mode: terms as options, meta as storage.
<SelectField
	label="Featured tag"
	optionsSource={ {
		type: 'terms',
		taxonomy: 'post_tag',
	} }
	valueBinding={ {
		type: 'meta',
		key: 'featured_tag',
	} }
/>
```

```tsx
// Controlled mode: custom storage.
<SelectField
	label="Featured tag"
	optionsSource={ {
		type: 'terms',
		taxonomy: 'post_tag',
	} }
	value={ attributes.featuredTag }
	onChange={ ( featuredTag ) => setAttributes( { featuredTag } ) }
/>
```

---

## Package exports

Przykładowy `package.json`:

```json
{
	"name": "@isudev/gutenberg",
	"version": "0.1.0",
	"type": "module",
	"sideEffects": [
		"**/*.scss",
		"**/*.css"
	],
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"import": "./dist/index.js"
		},
		"./appenders": {
			"types": "./dist/appenders/index.d.ts",
			"import": "./dist/appenders/index.js"
		},
		"./components": {
			"types": "./dist/components/index.d.ts",
			"import": "./dist/components/index.js"
		},
		"./controls": {
			"types": "./dist/controls/index.d.ts",
			"import": "./dist/controls/index.js"
		},
		"./fields": {
			"types": "./dist/fields/index.d.ts",
			"import": "./dist/fields/index.js"
		},
		"./meta": {
			"types": "./dist/meta/index.d.ts",
			"import": "./dist/meta/index.js"
		},
		"./taxonomy": {
			"types": "./dist/taxonomy/index.d.ts",
			"import": "./dist/taxonomy/index.js"
		},
		"./hooks": {
			"types": "./dist/hooks/index.d.ts",
			"import": "./dist/hooks/index.js"
		}
	},
	"peerDependencies": {
		"@wordpress/block-editor": "*",
		"@wordpress/components": "*",
		"@wordpress/core-data": "*",
		"@wordpress/data": "*",
		"@wordpress/editor": "*",
		"@wordpress/element": "*",
		"@wordpress/i18n": "*"
	}
}
```

> **Do rozstrzygnięcia przy buildzie:**
> - **Bundler:** rekomendacja `tsup` (esbuild) z `preserveModules` — struktura `src/`
>   mapuje się 1:1 na subpath `exports`; generuje też `.d.ts`.
> - **JSX:** zdecydować `@wordpress/element` (standard WP) vs `react/jsx-runtime`.
>   W ekosystemie WP zwykle `@wordpress/element` (jest w peer deps).
> - **CSS:** zdefiniować strategię — czy komponenty w ogóle mają style, i jak konsument
>   je ładuje (`dist/style.css` per-entry vs jeden plik). `sideEffects` już to zakłada.
> - **i18n:** wewnętrzne stringi (EmptyState itd.) przez `@wordpress/i18n`.

---

## Naming rules

### Komponenty

Używać PascalCase:

```txt
ColorPopup
IconSelect
SelectField
RadioField
MetaSelectControl
TaxonomySelectControl
```

Nie używać:

```txt
colorPopup
select_field
meta_select
```

---

### Hooks

Używać camelCase z `use`:

```txt
useFieldBinding
useOptionsSource
useValueBinding
useMetaBinding
useTermsOptions
```

---

### Źródła opcji

```txt
terms
posts
users
postTypes
manual
custom
```

---

### Bindingi wartości

```txt
meta
taxonomy
custom
```

Potem możliwe:

```txt
attribute
entity
store
```

---

## Attribute binding — decyzja na później

Na start rekomendacja: obsługiwać attributes przez controlled mode.

```tsx
<SelectField
	label="Layout"
	options={ layoutOptions }
	value={ attributes.layout }
	onChange={ ( layout ) => setAttributes( { layout } ) }
/>
```

Później można dodać `FieldProvider`:

```tsx
<FieldProvider
	attributes={ attributes }
	setAttributes={ setAttributes }
>
	<SelectField
		label="Layout"
		options={ layoutOptions }
		valueBinding={ {
			type: 'attribute',
			key: 'layout',
		} }
	/>
</FieldProvider>
```

Ale nie dodawać tego na start, jeśli nie jest konieczne.

---

## Loading i error states

Każdy `Field` powinien obsługiwać:

```tsx
loadingComponent
errorComponent
isLoading
error
```

Minimalnie:

```tsx
if ( isLoading ) {
	return props.loadingComponent ?? null;
}

if ( error ) {
	return props.errorComponent ?? null;
}
```

Później można dodać globalne defaulty:

```txt
<FieldConfigProvider>
```

ale nie jest to konieczne na start.

---

## Checklist: plan działania

### Etap 1 — fundament paczki

- [ ] Utworzyć paczkę `@isudev/gutenberg`.
- [ ] Skonfigurować TypeScript.
- [ ] Wybrać bundler (rekomendacja: `tsup` + `preserveModules`) i skonfigurować build do `dist/`.
- [ ] Zdecydować JSX runtime (`@wordpress/element` vs `react/jsx-runtime`).
- [ ] Ustalić strategię CSS (czy są style i jak konsument je ładuje).
- [ ] Dodać `exports` w `package.json`.
- [ ] Dodać `peerDependencies` dla `@wordpress/*`.
- [ ] Dodać podstawowe entrypointy:
  - [ ] `src/index.ts`
  - [ ] `src/components/index.ts`
  - [ ] `src/controls/index.ts`
  - [ ] `src/fields/index.ts`
  - [ ] `src/meta/index.ts`
  - [ ] `src/taxonomy/index.ts`
  - [ ] `src/hooks/index.ts`

---

### Etap 2 — typy

- [ ] Dodać `FieldOption`.
- [ ] Dodać `OptionsSource`.
- [ ] Dodać `ValueBinding`.
- [ ] Dodać bazowe propsy dla fieldów.
- [ ] Dodać typy dla `SelectField`, `RadioField`.

---

### Etap 3 — binding engine

- [ ] Dodać `useFieldBinding`.
- [ ] Dodać `useOptionsSource`.
- [ ] Dodać `useValueBinding`.
- [ ] Dodać `useMetaBinding` (z realnym `isLoading` przez `hasFinishedResolution`).
- [ ] Dodać `useTaxonomyBinding` (auto `rest_base` + mapowanie single↔array term IDs).
- [ ] Dodać `useControlledBinding` albo obsłużyć controlled mode bez osobnego hooka.
- [ ] Dodać `noop` helper.
- [ ] Dodać dev warning dla konfliktu `value/onChange` + `valueBinding`.

---

### Etap 4 — options sources

- [ ] Dodać `useTermsOptions`.
- [ ] Dodać `usePostsOptions`.
- [ ] Dodać `useUsersOptions`.
- [ ] Dodać `usePostTypesOptions`.
- [ ] Dodać `normalizeOptions`.
- [ ] Dodać support dla `valueField` i `labelField`.
- [ ] Dodać support dla `query`.

---

### Etap 5 — pierwsze fieldy

- [ ] Dodać `SelectField`.
- [ ] Dodać `RadioField`.
- [ ] Dodać `TextField`.
- [ ] Dodać `ToggleField`.
- [ ] Dodać `CheckboxField`, jeśli potrzebne.

---

### Etap 6 — easy wrappers

- [ ] Dodać `MetaSelectControl`.
- [ ] Dodać `MetaRadioControl`.
- [ ] Dodać `MetaTextControl`.
- [ ] Dodać `MetaToggleControl`.
- [ ] Dodać `TaxonomySelectControl`.
- [ ] Dodać `TaxonomyRadioControl`.
- [ ] Dodać `TaxonomyCheckboxControl`.

---

### Etap 6.5 — testy (nie pomijać)

- [ ] Skonfigurować Jest + `@testing-library/react`, mock `@wordpress/data` i `core-data`.
- [ ] Testy `useFieldBinding`: controlled vs bound, priorytet propsów.
- [ ] Testy `useOptionsSource` per typ (`terms`/`posts`/`users`/`postTypes`/`manual`).
- [ ] Testy `useValueBinding`: meta read/write, taxonomy single↔array.
- [ ] Test dev warning dla konfliktu `value/onChange` + `valueBinding`.

---

### Etap 7 — components i controls

> **Standalone:** komponenty poniżej piszemy **od nowa**, bez importów z jakiegokolwiek
> projektu hostującego i bez globalnej konfiguracji. Ikony i konfig wstrzykiwane
> propsami. `LinkControl` → rozważyć rename (kolizja z `@wordpress/block-editor`).

- [ ] Napisać komponenty do `components/` (od zera, konfiguracja przez propsy):
  - [ ] `ColorPopup`
  - [ ] `IconSelect`
  - [ ] `SearchableSelect`
  - [ ] preloadery jako `Skeleton`, `LoadingOverlay` albo `EmptyState`
- [ ] Napisać kontrolki do `controls/` (od zera, konfiguracja przez propsy):
  - [ ] `MediaControl`
  - [ ] `LinkControl` (rozważyć rename, np. `LinkPickerControl`)
  - [ ] `PostTypeControl`
  - [ ] `InlineUrlPicker`

---

### Etap 8 — appenders

- [ ] Dodać `AppenderButton`.
- [ ] Dodać `AppenderGrid` albo `AppenderCard`, jeśli potrzebne.
- [ ] Ustalić API appenders osobno od zwykłych buttonów.

---

### Etap 9 — dokumentacja

- [ ] README z podstawowym opisem.
- [ ] Sekcja “Choosing the right component”.
- [ ] Sekcja “Easy mode”.
- [ ] Sekcja “Advanced bindings”.
- [ ] Sekcja “Controlled mode”.
- [ ] Sekcja “Options sources”.
- [ ] Sekcja “Value bindings”.
- [ ] Przykłady:
  - [ ] meta select
  - [ ] taxonomy select
  - [ ] terms → meta
  - [ ] posts → meta
  - [ ] terms → attributes
  - [ ] custom options

---

### Etap 10 — przykładowe bloki

- [ ] `examples/simple-block`
- [ ] `examples/meta-controls`
- [ ] `examples/taxonomy-controls`
- [ ] `examples/advanced-bindings`

---

## Docelowy mental model

```txt
Easy API:

MetaSelectControl
TaxonomySelectControl
MetaRadioControl
TaxonomyRadioControl

Advanced API:

SelectField
RadioField
TextField
ToggleField

Core engine:

useFieldBinding
useOptionsSource
useValueBinding

Options sources:

terms
posts
users
postTypes
manual
custom

Value bindings:

meta
taxonomy
custom
controlled value/onChange
```

---

## Finalna rekomendacja

Nie budować osobnych komponentów dla każdej kombinacji:

```txt
TermsMetaSelectControl
PostsMetaSelectControl
UsersMetaSelectControl
TermsAttributeSelectControl
PostsAttributeSelectControl
```

Zamiast tego:

```tsx
<SelectField
	optionsSource={ ... }
	valueBinding={ ... }
/>
```

plus easy wrappers:

```tsx
<MetaSelectControl />
<TaxonomySelectControl />
```

Cała biblioteka powinna być oparta o jedną zasadę:

```txt
proste rzeczy są proste,
ale edge-case'y nie wymagają hackowania komponentów
```
