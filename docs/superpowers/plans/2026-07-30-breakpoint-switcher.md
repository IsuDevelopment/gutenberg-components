# BreakpointSwitcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first real `components/` + `controls/` + `hooks/` units of `@isudev/gutenberg` — a breakpoint switcher with inline and dropdown variants, plus the responsive-attribute plumbing behind it.

**Architecture:** A shared kernel (`src/breakpoints/`) holds pure functions for attribute-name resolution, cascade lookup and validation. Two hooks build on it: `useBreakpoint` (selection state, optional editor-viewport sync) and `useResponsiveAttribute` (reads/writes suffixed block attributes). `BreakpointSwitcher` is a pure controlled component over `@wordpress/components` primitives. `ResponsiveControl` composes all three behind a render prop.

**Tech Stack:** TypeScript 5.6, tsup (esbuild), Jest + @swc/jest + @testing-library/react, `@wordpress/*` at the `wp-7.0` dist-tag, React 18.

## Global Constraints

- **English only** — all code, comments, JSDoc, docs, commit messages, identifiers.
- **Never commit absolute local paths.** No `/Users/...`, no home directories, no machine or local-site names. Use `$PWD`, `$HOME`, a `<placeholder>`, or an env var.
- **Runtime dependencies are `@wordpress/*` only**, declared as peer dependencies. Anything else requires a new ADR in `.agents/decisions/`.
- **No host-project coupling.** Configuration is injected via props, never read from a global registry (decision 0001).
- **Tabs for indentation**, single quotes, spaces inside JSX braces — match existing files such as `packages/gutenberg/src/fields/SelectField/SelectField.tsx`.
- **`components/` must not import from `@wordpress/data`, `@wordpress/core-data` or `@wordpress/editor`**, and must not touch block attributes. Store access belongs in `hooks/`, attribute access in `hooks/` and `controls/`.
- **No `document` / `window` globals.** The post editor is iframed. Reach DOM via `element.ownerDocument` through `useRefEffect` from `@wordpress/compose` if ever needed.
- **All `__experimental*` / `__unstable*` imports from `@wordpress/components` go through `src/_internal/wp-components.ts`** and nowhere else.
- **`@wordpress/*` dev versions are pinned to the `wp-7.0` dist-tag** (verified 2026-07-30): `components@32.2.1`, `block-editor@15.13.2`, `core-data@7.40.2`, `data@10.40.1`, `editor@14.40.2`, `element@6.40.1`, `i18n@6.13.1`, `icons@11.7.1`, `compose@7.40.1`, `scripts@31.5.1`.
- **Development stays on React 18** (`@wordpress/element@6.40.1` depends on `react@^18.3.0`). The *published* `peerDependencies.react` is `^18.0.0 || ^19.0.0`.
- **A value is present when it is not `undefined`, not `null` and not `''`.** `0` and `false` are values. This rule is encoded once, in `isPresent()`, and never re-inlined.
- Every public component, control and hook ships a colocated `README.md` following the contract in spec §11.
- Run `npm run typecheck` and `npm test` before every commit. Both must pass.

**Testing discipline — read this before writing any test.**

Test the rules this design actually hinges on: the presence rule (`0` and `false` are
values), cascade resolution, which attribute a breakpoint writes to, and the state
transitions in `useBreakpoint`. That is where defects would be silent and expensive.

Do **not** write:

- tests whose subject is another test, or steps that break something to prove a test can fail;
- tests for string concatenation, prop pass-through, or "renders without crashing";
- a test per assertion when one test can carry three related assertions about one behavior.

**When asserting on markup produced by `@wordpress/components`, do not guess.** The ARIA
roles below (`radio`, `menuitem`) are this plan's best guess at what `ToggleGroupControl` and
`DropdownMenu` render in version 32.2.1. Before fixing a failing query, render the component
in the test and print the DOM (`screen.debug()`), then write the query to match what is
actually there. Never reshape the component to satisfy a guessed role — that is how a wrong
test turns into wrong code.

If a test is fighting you twice in a row, delete it and cover the behavior in the Task 10
manual editor checks instead. A brittle test is worse than a documented manual check.

**Environment note:** esbuild's native binary cannot exec inside the agent sandbox (error -88). Run `npm install`, `npm run build` and `npm run verify:package` in a normal terminal. `npm test` (swc) and `npm run typecheck` are fine in-sandbox.

**Reference:** the approved design is `docs/superpowers/specs/2026-07-30-breakpoint-switcher-design.md`. Read §5–§8 before starting Task 4.

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `packages/gutenberg/src/breakpoints/types.ts` | `Breakpoint` interface |
| `packages/gutenberg/src/breakpoints/defaults.ts` | `DEFAULT_BREAKPOINTS` |
| `packages/gutenberg/src/breakpoints/resolve.ts` | `isPresent`, `resolveAttrName`, `resolveCascade`, `buildHasValueMap` |
| `packages/gutenberg/src/breakpoints/validate.ts` | `validateBreakpoints`, `useValidatedBreakpoints` |
| `packages/gutenberg/src/breakpoints/index.ts` | barrel |
| `packages/gutenberg/src/breakpoints/resolve.test.ts` | cascade + presence tests |
| `packages/gutenberg/src/breakpoints/validate.test.ts` | validation tests |
| `packages/gutenberg/src/hooks/useResponsiveAttribute.ts` | attribute read/write per breakpoint |
| `packages/gutenberg/src/hooks/useResponsiveAttribute.test.ts` | |
| `packages/gutenberg/src/hooks/useBreakpoint.ts` | selection state + optional editor sync |
| `packages/gutenberg/src/hooks/useBreakpoint.test.ts` | |
| `packages/gutenberg/src/_internal/wp-components.ts` | sole home of `__experimental*` imports |
| `packages/gutenberg/src/components/BreakpointSwitcher/types.ts` | props interface |
| `packages/gutenberg/src/components/BreakpointSwitcher/IconWithOverrideDot.tsx` | icon + override marker |
| `packages/gutenberg/src/components/BreakpointSwitcher/InlineSwitcher.tsx` | inline variant |
| `packages/gutenberg/src/components/BreakpointSwitcher/DropdownSwitcher.tsx` | dropdown variant |
| `packages/gutenberg/src/components/BreakpointSwitcher/BreakpointSwitcher.tsx` | variant dispatch + guards |
| `packages/gutenberg/src/components/BreakpointSwitcher/index.ts` | barrel |
| `packages/gutenberg/src/components/BreakpointSwitcher/README.md` | docs (spec §11 contract) |
| `packages/gutenberg/src/components/BreakpointSwitcher/BreakpointSwitcher.test.tsx` | |
| `packages/gutenberg/src/controls/ResponsiveControl/types.ts` | props interface |
| `packages/gutenberg/src/controls/ResponsiveControl/ResponsiveControl.tsx` | wrapper |
| `packages/gutenberg/src/controls/ResponsiveControl/index.ts` | barrel |
| `packages/gutenberg/src/controls/ResponsiveControl/README.md` | docs |
| `packages/gutenberg/src/controls/ResponsiveControl/ResponsiveControl.test.tsx` | |
| `packages/gutenberg/src/hooks/README.md` | docs for both hooks |
| `packages/gutenberg/jest.config.mjs` | Jest config |
| `packages/gutenberg/tests/setup.ts` | jest-dom setup |
| `packages/gutenberg/tests/readme-props-drift.test.ts` | README ↔ types drift guard |
| `packages/gutenberg/tests/helpers/props-from-interface.ts` | TS-AST prop extraction |
| `examples/test-blocks/src/responsive-demo/block.json` | demo block metadata |
| `examples/test-blocks/src/responsive-demo/index.js` | demo block |
| `.agents/decisions/0003-breakpoint-model.md` | ADR: base + suffix + cascade |
| `.agents/decisions/0004-experimental-wp-components.md` | ADR: isolating `__experimental*` |

**Modified:**

| Path | Change |
|---|---|
| `packages/gutenberg/package.json` | wp-7.0 devDeps, peer ranges, `@wordpress/icons` peer, wildcard exports, test + verify scripts |
| `packages/gutenberg/tsup.config.ts` | discovered entries; stop externalizing bundled WP packages |
| `packages/gutenberg/src/components/index.ts` | export `BreakpointSwitcher` |
| `packages/gutenberg/src/controls/index.ts` | export `ResponsiveControl` |
| `packages/gutenberg/src/hooks/index.ts` | export both hooks |
| `packages/gutenberg/src/index.ts` | re-export breakpoints kernel |
| `examples/test-blocks/package.json` | `@wordpress/scripts@31.5.1` |
| `examples/test-blocks/test-blocks.php` | register the second block |
| `.agents/status.md` | progress + next steps |
| `.agents/instructions/local-development.md` | drop the stale two-places-per-export note |

---

## Task 1: WP 7.0 toolchain upgrade and dependency correctness

**Files:**
- Modify: `packages/gutenberg/package.json`
- Modify: `examples/test-blocks/package.json`
- Modify: `packages/gutenberg/tsup.config.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a toolchain every later task compiles against; `@wordpress/icons` importable as a peer dependency.

- [ ] **Step 1: Pin library devDependencies to the `wp-7.0` dist-tag**

In `packages/gutenberg/package.json`, replace the `devDependencies` block with:

```json
	"devDependencies": {
		"@types/react": "^18.3.27",
		"@wordpress/block-editor": "15.13.2",
		"@wordpress/components": "32.2.1",
		"@wordpress/compose": "7.40.1",
		"@wordpress/core-data": "7.40.2",
		"@wordpress/data": "10.40.1",
		"@wordpress/editor": "14.40.2",
		"@wordpress/element": "6.40.1",
		"@wordpress/i18n": "6.13.1",
		"@wordpress/icons": "11.7.1",
		"react": "^18.3.1",
		"react-dom": "^18.3.1",
		"tsup": "^8.3.0",
		"typescript": "^5.6.0"
	}
```

Exact versions, not carets, for `@wordpress/*` — the `wp-7.0` line is a moving target and we want a reproducible typecheck.

- [ ] **Step 2: Widen peer ranges and add the icons peer**

Replace the `peerDependencies` block with:

```json
	"peerDependencies": {
		"@wordpress/block-editor": ">=15.0.0",
		"@wordpress/components": ">=32.0.0",
		"@wordpress/compose": ">=7.0.0",
		"@wordpress/core-data": ">=7.0.0",
		"@wordpress/data": ">=10.0.0",
		"@wordpress/editor": ">=14.0.0",
		"@wordpress/element": ">=6.0.0",
		"@wordpress/i18n": ">=6.0.0",
		"@wordpress/icons": ">=11.0.0",
		"react": "^18.0.0 || ^19.0.0"
	}
```

`@wordpress/icons` is new here and is the point of this step — see Step 4.

- [ ] **Step 3: Bump the example plugin's build tooling**

In `examples/test-blocks/package.json`, set `"@wordpress/scripts": "31.5.1"` in `devDependencies`.

- [ ] **Step 4: Stop externalizing the three bundled WordPress packages**

`DependencyExtractionWebpackPlugin` deliberately does **not** externalize a set of packages for which WordPress registers no script global. As of DEWP 6.50.0 (`lib/util.js`) that set is `admin-ui`, `dataviews`, `fields`, `grid`, `icons`, `interface`, `style-runtime`, `ui`, `undo-manager` and `views` — note `style-runtime`, not `style-engine`, which *is* externalized normally. Of these, this library imports only `@wordpress/icons`. Keeping them external in *our* build is correct (the consumer's build bundles them, which is why Step 2 adds the peer), but the regex must be explicit so the reason is recorded.

In `packages/gutenberg/tsup.config.ts`, replace the `external` line with:

```ts
	/**
	 * WordPress exposes most @wordpress/* packages as script globals, and
	 * DependencyExtractionWebpackPlugin maps bare imports onto them. A handful are NOT
	 * exposed that way and are meant to be bundled by the consumer's build — as of DEWP
	 * 6.50.0: admin-ui, dataviews, fields, grid, icons, interface, style-runtime, ui,
	 * undo-manager, views. We keep those as bare imports too, so the consumer bundles a
	 * single copy rather than us inlining one per entry point. Any package from that list
	 * we actually import must be declared a peer dependency — today only @wordpress/icons.
	 */
	external: [ /^@wordpress\//, 'react', 'react-dom', 'react/jsx-runtime' ],
```

- [ ] **Step 5: Install and verify**

Run, in a normal terminal (not the agent sandbox):

```bash
npm install
npm run typecheck --workspace=packages/gutenberg
```

Expected: install completes with no `ERESOLVE`, typecheck passes. If npm reports a peer conflict on `react`, do **not** reach for `--legacy-peer-deps` — it means a `@wordpress/*` version was mistyped, since the whole `wp-7.0` line wants `react@^18.3.0`.

- [ ] **Step 6: Commit**

```bash
git add packages/gutenberg/package.json packages/gutenberg/tsup.config.ts examples/test-blocks/package.json package-lock.json
git commit -m "build: pin @wordpress/* to the wp-7.0 line and declare the icons peer

The toolchain sat on @wordpress/components 28.13.0 (~WP 6.6/6.7) while the target
runtime is WP 7.0, whose dist-tag resolves to 32.2.1 — four minor lines of drift
across exactly the components the next feature uses.

Development stays on React 18 because @wordpress/element@6.40.1 depends on
react@^18.3.0; the published peer range is widened to ^18 || ^19 so consumers are
not blocked when WordPress moves.

Also documents why @wordpress/icons stays a bare import: DependencyExtractionWebpackPlugin
does not externalize it, so the consumer's build bundles it and we declare it a peer."
```

---

## Task 2: Jest harness

**Files:**
- Create: `packages/gutenberg/jest.config.mjs`
- Create: `packages/gutenberg/tests/setup.ts`
- Modify: `packages/gutenberg/package.json`

**Interfaces:**
- Consumes: Task 1's toolchain.
- Produces: `npm test` actually runs tests. Later tasks assume `describe`/`it`/`expect`, `@testing-library/react`'s `render`/`screen`/`renderHook`, and `@testing-library/jest-dom` matchers are available.

Right now `"test"` is `echo "TODO: add Jest..." && exit 0`, so a green result means nothing. This task makes it mean something.

- [ ] **Step 1: Add test devDependencies**

Add to `packages/gutenberg/package.json` `devDependencies`:

```json
		"@swc/core": "^1.7.0",
		"@swc/jest": "^0.2.39",
		"@testing-library/dom": "^10.4.0",
		"@testing-library/jest-dom": "^6.5.0",
		"@testing-library/react": "^16.0.1",
		"jest": "^29.7.0",
		"jest-environment-jsdom": "^29.7.0"
```

Then run `npm install` in a normal terminal.

- [ ] **Step 2: Write the Jest config**

Create `packages/gutenberg/jest.config.mjs`:

```js
/**
 * Jest runs against TypeScript sources via @swc/jest — no Babel config, and fast enough
 * that the whole suite stays in the edit loop. JSX uses the automatic runtime with
 * react as the import source, matching tsconfig.base.json and decision 0002.
 */
export default {
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: [ '<rootDir>/tests/setup.ts' ],
	testMatch: [ '<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx', '<rootDir>/tests/**/*.test.ts' ],
	transform: {
		'^.+\\.(t|j)sx?$': [
			'@swc/jest',
			{
				jsc: {
					parser: { syntax: 'typescript', tsx: true },
					transform: { react: { runtime: 'automatic', importSource: 'react' } },
					target: 'es2021',
				},
			},
		],
	},
};
```

- [ ] **Step 3: Write the setup file**

Create `packages/gutenberg/tests/setup.ts`:

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Replace the fake test script**

In `packages/gutenberg/package.json` `scripts`, replace the `test` entry:

```json
		"test": "jest",
		"test:watch": "jest --watch",
```

- [ ] **Step 5: Verify the config loads**

Run: `npx jest --showConfig --config jest.config.mjs` from `packages/gutenberg`
Expected: prints resolved config with `testEnvironment: 'jsdom'` and the swc transform, and exits 0.

No smoke test is added. The harness is proven by Task 4's tests, which are the first real
ones; a permanent test asserting that Jest works is a test about a test.

- [ ] **Step 6: Commit**

```bash
git add packages/gutenberg/jest.config.mjs packages/gutenberg/tests/setup.ts packages/gutenberg/package.json package-lock.json
git commit -m "test: add the Jest harness that stage 6.5 deferred

The test script was 'echo TODO && exit 0', so a passing run proved nothing. Jest now runs
TypeScript and TSX through @swc/jest with the automatic JSX runtime, in jsdom, with jest-dom
matchers."
```

---

## Task 3: Packaging — discovered entries, wildcard exports, verify:package

**Files:**
- Modify: `packages/gutenberg/tsup.config.ts`
- Modify: `packages/gutenberg/package.json`
- Modify: `.agents/instructions/local-development.md`

**Interfaces:**
- Consumes: Task 1.
- Produces: any new `<category>/<Name>/index.ts` becomes a build entry and an importable subpath with no config edits. Later tasks rely on this — they add folders and never touch `tsup.config.ts` or `exports`.

Today a new subpath needs edits in two places, as `local-development.md` itself warns, and the workspace symlink cannot reveal a mistake because it resolves the whole package directory.

- [ ] **Step 1: Replace the hand-listed entries with filesystem discovery**

Rewrite `packages/gutenberg/tsup.config.ts`:

```ts
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'tsup';

const SRC = path.resolve( __dirname, 'src' );

/**
 * Every `index.ts` under src/ becomes a build entry, so dist/ mirrors src/ and the
 * wildcard `exports` in package.json resolve without enumerating anything. Adding a
 * component is therefore a matter of creating a folder — there is no second place to
 * forget. `_internal/` is skipped: it is private and is pulled in as a shared chunk by
 * whichever entries import it.
 */
function findEntries( root: string ): Record< string, string > {
	const entries: Record< string, string > = {};

	const walk = ( dir: string ): void => {
		for ( const dirent of readdirSync( dir, { withFileTypes: true } ) ) {
			const full = path.join( dir, dirent.name );

			if ( dirent.isDirectory() ) {
				if ( dirent.name !== '_internal' ) {
					walk( full );
				}
				continue;
			}

			if ( dirent.name === 'index.ts' || dirent.name === 'index.tsx' ) {
				const key = path
					.relative( root, full )
					.replace( /\\/g, '/' )
					.replace( /\.tsx?$/, '' );
				entries[ key ] = full;
			}
		}
	};

	walk( root );
	return entries;
}

export default defineConfig( {
	entry: findEntries( SRC ),
	format: [ 'esm' ],
	dts: true,
	clean: true,
	sourcemap: true,
	treeshake: true,
	/**
	 * WordPress exposes most @wordpress/* packages as script globals, and
	 * DependencyExtractionWebpackPlugin maps bare imports onto them. A handful are NOT
	 * exposed that way and are meant to be bundled by the consumer's build — as of DEWP
	 * 6.50.0: admin-ui, dataviews, fields, grid, icons, interface, style-runtime, ui,
	 * undo-manager, views. We keep those as bare imports too, so the consumer bundles a
	 * single copy rather than us inlining one per entry point. Any package from that list
	 * we actually import must be declared a peer dependency — today only @wordpress/icons.
	 */
	external: [ /^@wordpress\//, 'react', 'react-dom', 'react/jsx-runtime' ],
	esbuildOptions( options ) {
		options.jsx = 'automatic';
	},
} );
```

- [ ] **Step 2: Add wildcard subpath exports**

In `packages/gutenberg/package.json`, keep every existing barrel key and add three wildcards plus the new breakpoints barrel. The full `exports` object becomes:

```json
	"exports": {
		".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
		"./appenders": { "types": "./dist/appenders/index.d.ts", "import": "./dist/appenders/index.js" },
		"./breakpoints": { "types": "./dist/breakpoints/index.d.ts", "import": "./dist/breakpoints/index.js" },
		"./components": { "types": "./dist/components/index.d.ts", "import": "./dist/components/index.js" },
		"./components/*": { "types": "./dist/components/*/index.d.ts", "import": "./dist/components/*/index.js" },
		"./controls": { "types": "./dist/controls/index.d.ts", "import": "./dist/controls/index.js" },
		"./controls/*": { "types": "./dist/controls/*/index.d.ts", "import": "./dist/controls/*/index.js" },
		"./fields": { "types": "./dist/fields/index.d.ts", "import": "./dist/fields/index.js" },
		"./fields/*": { "types": "./dist/fields/*/index.d.ts", "import": "./dist/fields/*/index.js" },
		"./meta": { "types": "./dist/meta/index.d.ts", "import": "./dist/meta/index.js" },
		"./taxonomy": { "types": "./dist/taxonomy/index.d.ts", "import": "./dist/taxonomy/index.js" },
		"./hooks": { "types": "./dist/hooks/index.d.ts", "import": "./dist/hooks/index.js" }
	},
```

Wildcards cover only the three categories that use the folder-with-`index.ts` convention. `hooks/` holds flat files with no per-hook folder, so it keeps its barrel only — do not add `./hooks/*`, it would resolve to `dist/hooks/<name>/index.js`, which does not exist.

- [ ] **Step 3: Add the packaging verification script**

Add to `packages/gutenberg/devDependencies`:

```json
		"@arethetypeswrong/cli": "^0.18.5",
		"publint": "^0.3.22"
```

Add to `packages/gutenberg/scripts`:

```json
		"verify:package": "npm run build && publint --strict && attw --pack . --profile esm-only",
```

`publint` checks the package fields; `attw` checks that types resolve for every declared subpath. The `esm-only` profile matches `"type": "module"` with no CJS output. Run `npm install` afterwards.

- [ ] **Step 4: Build and verify the package**

Run, in a normal terminal:

```bash
npm run build --workspace=packages/gutenberg
npm run verify:package --workspace=packages/gutenberg
```

Expected: `dist/` mirrors `src/` — `index.js`, `components/index.js`, `controls/index.js`,
`fields/index.js`, `fields/SelectField/index.js`, `fields/RadioField/index.js`,
`hooks/index.js`, `meta/index.js`, `taxonomy/index.js`, `appenders/index.js`,
`bindings/index.js`, `types/index.js`, `utils/index.js`, each with a matching `.d.ts`. The
presence of `fields/SelectField/index.js` is the thing to confirm: it proves the per-folder
convention the wildcards depend on actually produces a separate entry.

**`verify:package` is expected to FAIL at this point, with exactly six errors.** Three
export targets do not exist yet: `./breakpoints` (Task 4 creates `src/breakpoints/`), and the
`./components/*` and `./controls/*` wildcards (no folder under those categories uses the
per-folder convention until Tasks 7 and 8). `./fields/*` already passes, which is the proof
that the wildcard mechanism itself is correct.

This is a pre-publish gate reporting, accurately, that a half-built package is not
publishable. Do **not** delete the export keys, stub the directories, or drop `--strict` to
get a green run — the errors disappear on their own as Tasks 4, 7 and 8 land, and Task 10
step 6 is where `verify:package` must come back clean. Record the exact output in your report.

(An earlier draft of this plan expected a clean run here. That was a sequencing error in the
plan, corrected after Task 3 surfaced it.)

- [ ] **Step 5: Correct the stale note in the development instructions**

In `.agents/instructions/local-development.md`, replace the final bullet:

```markdown
- Subpath exports are discovered from the filesystem. A new `components/<Name>/index.ts`
  (or `controls/`, `fields/`) is automatically both a build entry and an importable
  subpath — there is nothing to register in `tsup.config.ts` or `package.json`.
- Run `npm run verify:package` before publishing. The workspace symlink resolves the whole
  package directory, so a broken `files` or `exports` field is invisible locally and would
  surface only for the first consumer installing from npm.
```

- [ ] **Step 6: Commit**

```bash
git add packages/gutenberg/tsup.config.ts packages/gutenberg/package.json .agents/instructions/local-development.md package-lock.json
git commit -m "build: discover entries from the filesystem and add wildcard subpath exports

Adding a subpath used to mean editing tsup.config.ts and package.json exports, and the
workspace symlink hides a mistake in either because it resolves the whole package
directory — so an exports typo would first surface for a consumer installing from npm,
which is the worst place for it given per-subpath imports are this package's promise.

Entries are now every index.ts under src/, and components/controls/fields expose wildcard
subpaths alongside their barrels. Adds verify:package (publint + attw) as the pre-publish
gate that actually exercises the packed tarball."
```

---

## Task 4: Breakpoint kernel

**Files:**
- Create: `packages/gutenberg/src/breakpoints/types.ts`
- Create: `packages/gutenberg/src/breakpoints/defaults.ts`
- Create: `packages/gutenberg/src/breakpoints/resolve.ts`
- Create: `packages/gutenberg/src/breakpoints/validate.ts`
- Create: `packages/gutenberg/src/breakpoints/index.ts`
- Create: `packages/gutenberg/src/breakpoints/resolve.test.ts`
- Create: `packages/gutenberg/src/breakpoints/validate.test.ts`
- Create: `.agents/decisions/0003-breakpoint-model.md`
- Modify: `packages/gutenberg/src/index.ts`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces, all imported by later tasks from `../breakpoints`:
  - `interface Breakpoint { id: string; label: string; icon?: ReactElement; isBase?: boolean; suffix?: string }`
  - `DEFAULT_BREAKPOINTS: Breakpoint[]`
  - `isPresent( raw: unknown ): boolean`
  - `resolveAttrName( attrName: string, breakpoint: Breakpoint ): string`
  - `resolveCascade( attrName: string, breakpoints: Breakpoint[], activeId: string, attributes: Record<string, unknown>, options?: { skipActive?: boolean } ): unknown`
  - `buildHasValueMap( attrName: string, breakpoints: Breakpoint[], attributes: Record<string, unknown> ): Record<string, boolean>`
  - `validateBreakpoints( breakpoints: Breakpoint[] ): string[]`
  - `useValidatedBreakpoints( breakpoints?: Breakpoint[] ): Breakpoint[]`

- [ ] **Step 1: Write the failing tests for resolution**

Create `packages/gutenberg/src/breakpoints/resolve.test.ts`:

```ts
import { DEFAULT_BREAKPOINTS } from './defaults';
import {
	buildHasValueMap,
	isPresent,
	resolveAttrName,
	resolveCascade,
} from './resolve';

const [ desktop, tablet ] = DEFAULT_BREAKPOINTS;

/**
 * The presence rule is the one thing the whole design rests on, so it is asserted directly
 * rather than only through the cascade. resolveAttrName is not tested on its own — it is
 * string concatenation, and every cascade assertion below exercises it.
 */
describe( 'isPresent', () => {
	it( 'counts 0 and false as values, and undefined/null/empty string as absent', () => {
		expect( isPresent( 0 ) ).toBe( true );
		expect( isPresent( false ) ).toBe( true );
		expect( isPresent( undefined ) ).toBe( false );
		expect( isPresent( null ) ).toBe( false );
		expect( isPresent( '' ) ).toBe( false );
	} );
} );

describe( 'resolveCascade', () => {
	it( 'prefers the own value, then walks back to the base', () => {
		expect(
			resolveCascade( 'columnGap', DEFAULT_BREAKPOINTS, 'mobile', {
				columnGap: 24,
				columnGapMobile: 8,
			} )
		).toBe( 8 );

		expect(
			resolveCascade( 'columnGap', DEFAULT_BREAKPOINTS, 'mobile', {
				columnGap: 24,
				columnGapTablet: 16,
			} )
		).toBe( 16 );

		expect(
			resolveCascade( 'columnGap', DEFAULT_BREAKPOINTS, 'mobile', {
				columnGap: 24,
			} )
		).toBe( 24 );
	} );

	it( 'does not fall through a zero override', () => {
		expect(
			resolveCascade( 'columnGap', DEFAULT_BREAKPOINTS, 'mobile', {
				columnGap: 24,
				columnGapMobile: 0,
			} )
		).toBe( 0 );
	} );

	it( 'skips the active breakpoint when asked, for placeholder values', () => {
		expect(
			resolveCascade(
				'columnGap',
				DEFAULT_BREAKPOINTS,
				'mobile',
				{ columnGap: 24, columnGapMobile: 8 },
				{ skipActive: true }
			)
		).toBe( 24 );
	} );
} );

describe( 'buildHasValueMap', () => {
	it( 'marks only non-base breakpoints that carry an override', () => {
		expect( resolveAttrName( 'columnGap', desktop ) ).toBe( 'columnGap' );
		expect( resolveAttrName( 'columnGap', tablet ) ).toBe(
			'columnGapTablet'
		);

		expect(
			buildHasValueMap( 'columnGap', DEFAULT_BREAKPOINTS, {
				columnGap: 24,
				columnGapTablet: 0,
				columnGapMobile: '',
			} )
		).toEqual( { desktop: false, tablet: true, mobile: false } );
	} );
} );
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test --workspace=packages/gutenberg -- resolve`
Expected: FAIL — cannot resolve `./defaults` and `./resolve`.

- [ ] **Step 3: Write the types**

Create `packages/gutenberg/src/breakpoints/types.ts`:

```ts
import type { ReactElement } from 'react';

/**
 * One breakpoint in a responsive set.
 *
 * Exactly one breakpoint in a set is the **base**: its attribute carries no suffix, and it
 * is the value every other breakpoint ultimately falls back to. There is deliberately no
 * separate "default" pseudo-breakpoint — the base *is* the default.
 */
export interface Breakpoint {
	/** Stable identifier, used as the switcher's value. */
	id: string;

	/** Human-readable label, shown in the dropdown and as the accessible name. */
	label: string;

	/**
	 * Icon element, e.g. from `@wordpress/icons`. Imported `ReactElement` rather than the
	 * global `JSX.Element`, which React 19's types remove.
	 */
	icon?: ReactElement;

	/** Marks the base breakpoint, whose attribute name carries no suffix. */
	isBase?: boolean;

	/** Attribute-name suffix for non-base breakpoints, e.g. `'Tablet'`. */
	suffix?: string;
}
```

- [ ] **Step 4: Write the default set**

Create `packages/gutenberg/src/breakpoints/defaults.ts`:

```ts
import { desktop, mobile, tablet } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import type { Breakpoint } from './types';

/**
 * The conventional desktop-first set. Desktop is the base, so `columnGap` holds the
 * desktop value while `columnGapTablet` and `columnGapMobile` hold overrides — matching
 * the `max-width` media queries this ordering implies.
 *
 * Cascade order is array order: mobile falls back to tablet, then desktop.
 */
export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
	{ id: 'desktop', label: __( 'Desktop' ), icon: desktop, isBase: true },
	{ id: 'tablet', label: __( 'Tablet' ), icon: tablet, suffix: 'Tablet' },
	{ id: 'mobile', label: __( 'Mobile' ), icon: mobile, suffix: 'Mobile' },
];
```

- [ ] **Step 5: Write the resolution functions**

Create `packages/gutenberg/src/breakpoints/resolve.ts`:

```ts
import type { Breakpoint } from './types';

/**
 * Whether an attribute value counts as set.
 *
 * `0` and `false` are values — `columnGap: 0` is a legitimate setting and must not fall
 * through to an inherited value. This is the single place the rule is encoded.
 */
export function isPresent( raw: unknown ): boolean {
	return raw !== undefined && raw !== null && raw !== '';
}

/** The attribute name holding a given breakpoint's value. */
export function resolveAttrName(
	attrName: string,
	breakpoint: Breakpoint
): string {
	return breakpoint.isBase
		? attrName
		: `${ attrName }${ breakpoint.suffix ?? '' }`;
}

/**
 * Walks backwards from the active breakpoint to the base, returning the first value that
 * is present. With `skipActive`, the active breakpoint's own value is ignored — that is
 * the value a control should show as its placeholder.
 */
export function resolveCascade(
	attrName: string,
	breakpoints: Breakpoint[],
	activeId: string,
	attributes: Record< string, unknown >,
	options: { skipActive?: boolean } = {}
): unknown {
	const activeIndex = breakpoints.findIndex(
		( breakpoint ) => breakpoint.id === activeId
	);

	if ( activeIndex === -1 ) {
		return undefined;
	}

	const start = options.skipActive ? activeIndex - 1 : activeIndex;

	for ( let index = start; index >= 0; index-- ) {
		const raw =
			attributes[ resolveAttrName( attrName, breakpoints[ index ] ) ];

		if ( isPresent( raw ) ) {
			return raw;
		}
	}

	return undefined;
}

/**
 * Which breakpoints carry an override, for the switcher's indicator.
 *
 * The base is always `false`: it is not an override, it is the value being overridden.
 */
export function buildHasValueMap(
	attrName: string,
	breakpoints: Breakpoint[],
	attributes: Record< string, unknown >
): Record< string, boolean > {
	const map: Record< string, boolean > = {};

	for ( const breakpoint of breakpoints ) {
		map[ breakpoint.id ] =
			! breakpoint.isBase &&
			isPresent( attributes[ resolveAttrName( attrName, breakpoint ) ] );
	}

	return map;
}
```

- [ ] **Step 6: Run the resolution tests**

Run: `npm test --workspace=packages/gutenberg -- resolve`
Expected: PASS. This is also the first real run of the harness from Task 2 — if it fails to
even load, the problem is the Jest config, not this code.

- [ ] **Step 7: Write the failing validation tests**

Create `packages/gutenberg/src/breakpoints/validate.test.ts`:

```ts
import { DEFAULT_BREAKPOINTS } from './defaults';
import { validateBreakpoints } from './validate';

describe( 'validateBreakpoints', () => {
	it( 'accepts the default set', () => {
		expect( validateBreakpoints( DEFAULT_BREAKPOINTS ) ).toEqual( [] );
	} );

	it( 'reports each way a set can be unusable', () => {
		expect(
			validateBreakpoints( [
				{ id: 'a', label: 'A' },
				{ id: 'b', label: 'B', suffix: 'B' },
			] )
		).toContainEqual( expect.stringContaining( 'exactly one' ) );

		expect(
			validateBreakpoints( [
				{ id: 'a', label: 'A', isBase: true },
				{ id: 'b', label: 'B' },
			] )
		).toContainEqual( expect.stringContaining( 'no suffix' ) );

		expect(
			validateBreakpoints( [
				{ id: 'a', label: 'A', isBase: true },
				{ id: 'a', label: 'A2', suffix: 'X' },
			] )
		).toContainEqual( expect.stringContaining( 'duplicate id' ) );

		expect(
			validateBreakpoints( [
				{ id: 'a', label: 'A', isBase: true },
				{ id: 'b', label: 'B', suffix: 'X' },
				{ id: 'c', label: 'C', suffix: 'X' },
			] )
		).toContainEqual( expect.stringContaining( 'duplicate suffix' ) );
	} );
} );
```

- [ ] **Step 8: Run to verify it fails**

Run: `npm test --workspace=packages/gutenberg -- validate`
Expected: FAIL — cannot resolve `./validate`.

- [ ] **Step 9: Write the validation module**

Create `packages/gutenberg/src/breakpoints/validate.ts`:

```ts
import { DEFAULT_BREAKPOINTS } from './defaults';
import type { Breakpoint } from './types';

/**
 * Returns a list of problems with a breakpoint set; empty means valid.
 *
 * Pure and exported so it can be unit-tested without rendering anything.
 */
export function validateBreakpoints( breakpoints: Breakpoint[] ): string[] {
	const errors: string[] = [];
	const bases = breakpoints.filter( ( breakpoint ) => breakpoint.isBase );

	if ( bases.length !== 1 ) {
		errors.push(
			`exactly one breakpoint must set isBase: true (found ${ bases.length })`
		);
	}

	const seenIds = new Set< string >();
	const seenSuffixes = new Set< string >();

	for ( const breakpoint of breakpoints ) {
		if ( seenIds.has( breakpoint.id ) ) {
			errors.push( `duplicate id "${ breakpoint.id }"` );
		}
		seenIds.add( breakpoint.id );

		if ( breakpoint.isBase ) {
			continue;
		}

		if ( ! breakpoint.suffix ) {
			errors.push( `breakpoint "${ breakpoint.id }" has no suffix` );
			continue;
		}

		if ( seenSuffixes.has( breakpoint.suffix ) ) {
			errors.push( `duplicate suffix "${ breakpoint.suffix }"` );
		}
		seenSuffixes.add( breakpoint.suffix );
	}

	return errors;
}

const warned = new Set< string >();

/**
 * Validates a caller-supplied set in development and falls back to the default set when it
 * is unusable. Warns once per distinct problem so a re-rendering editor does not flood the
 * console.
 */
export function useValidatedBreakpoints(
	breakpoints?: Breakpoint[]
): Breakpoint[] {
	if ( ! breakpoints ) {
		return DEFAULT_BREAKPOINTS;
	}

	const errors = validateBreakpoints( breakpoints );

	if ( errors.length === 0 ) {
		return breakpoints;
	}

	if ( process.env.NODE_ENV !== 'production' ) {
		const message = errors.join( '; ' );

		if ( ! warned.has( message ) ) {
			warned.add( message );
			// eslint-disable-next-line no-console
			console.warn(
				`[@isudev/gutenberg] Invalid breakpoints: ${ message }. Falling back to DEFAULT_BREAKPOINTS.`
			);
		}
	}

	return DEFAULT_BREAKPOINTS;
}
```

Note: `useValidatedBreakpoints` calls no React hooks, so it is safe to call before any early return.

- [ ] **Step 10: Write the barrel and re-export from the package root**

Create `packages/gutenberg/src/breakpoints/index.ts`:

```ts
export { DEFAULT_BREAKPOINTS } from './defaults';
export {
	buildHasValueMap,
	isPresent,
	resolveAttrName,
	resolveCascade,
} from './resolve';
export { useValidatedBreakpoints, validateBreakpoints } from './validate';
export type { Breakpoint } from './types';
```

Add to `packages/gutenberg/src/index.ts`:

```ts
export * from './breakpoints';
```

- [ ] **Step 11: Run the full suite and typecheck**

Run: `npm test --workspace=packages/gutenberg && npm run typecheck --workspace=packages/gutenberg`
Expected: both PASS.

- [ ] **Step 12: Record the ADR**

Create `.agents/decisions/0003-breakpoint-model.md`:

```markdown
# 0003 — Breakpoint model: base attribute plus suffixed overrides

- Status: accepted
- Date: 2026-07-30

## Context

Responsive block settings need a place to store one value per breakpoint. Two shapes were
studied in existing plugins: a nested object per attribute, and a base attribute plus
suffixed siblings. One studied implementation additionally offers a `default`
pseudo-device alongside `desktop`, which stores to the unsuffixed attribute.

## Decision

A breakpoint set is an ordered array. Exactly one breakpoint is the **base**; its value
lives in the unsuffixed attribute. Every other breakpoint declares a `suffix`, and its
value lives in `attrName + suffix` — `columnGap`, `columnGapTablet`, `columnGapMobile`.

There is **no** `default` pseudo-breakpoint. The base is the default.

Reading walks backwards through array order to the base and returns the first value that
is present, where present means not `undefined`, not `null` and not `''` — so `0` and
`false` are values.

## Consequences

- Attributes stay flat, so `block.json` defaults and block deprecations keep working.
- Adding a breakpoint is additive: a new suffix, no migration of existing attributes.
- A `default` option cannot be reintroduced without making two names mean overlapping
  things, which is why it was rejected.
- Cascade direction is coupled to array order, so a set listed out of order cascades
  wrongly. `validateBreakpoints` cannot catch that; it is documented in the README instead.
```

- [ ] **Step 13: Commit**

```bash
git add packages/gutenberg/src/breakpoints packages/gutenberg/src/index.ts .agents/decisions/0003-breakpoint-model.md
git commit -m "feat(breakpoints): add the breakpoint kernel

Pure functions for attribute-name resolution, cascade lookup and set validation, with the
default desktop/tablet/mobile set. Desktop is the base and carries no attribute suffix;
there is no 'default' pseudo-breakpoint, because it would make two names mean overlapping
things.

The presence rule lives in exactly one function: 0 and false are values, so a zero
override does not fall through to an inherited value. Records ADR 0003."
```

---

## Task 5: `useResponsiveAttribute`

**Files:**
- Create: `packages/gutenberg/src/hooks/useResponsiveAttribute.ts`
- Create: `packages/gutenberg/src/hooks/useResponsiveAttribute.test.ts`
- Modify: `packages/gutenberg/src/hooks/index.ts`

**Interfaces:**
- Consumes: the kernel from Task 4.
- Produces:
  ```ts
  interface UseResponsiveAttributeArgs {
      attrName: string;
      breakpoint: string;
      attributes: Record< string, unknown >;
      setAttributes: ( next: Record< string, unknown > ) => void;
      breakpoints?: Breakpoint[];
  }
  interface UseResponsiveAttributeResult {
      value: unknown;
      inheritedValue: unknown;
      resolvedValue: unknown;
      hasOwnValue: boolean;
      hasValue: Record< string, boolean >;
      attrNameForBreakpoint: string;
      onChange: ( next: unknown ) => void;
      reset: () => void;
      resetAll: () => void;
  }
  function useResponsiveAttribute( args: UseResponsiveAttributeArgs ): UseResponsiveAttributeResult;
  ```

This hook takes `attributes` and `setAttributes` as arguments rather than reading a store, so it needs no mocking at all.

- [ ] **Step 1: Write the failing tests**

Create `packages/gutenberg/src/hooks/useResponsiveAttribute.test.ts`:

```ts
import { renderHook } from '@testing-library/react';
import { useResponsiveAttribute } from './useResponsiveAttribute';

function setup(
	attributes: Record< string, unknown >,
	breakpoint = 'mobile'
) {
	const setAttributes = jest.fn();
	const { result } = renderHook( () =>
		useResponsiveAttribute( {
			attrName: 'columnGap',
			breakpoint,
			attributes,
			setAttributes,
		} )
	);
	return { result, setAttributes };
}

describe( 'useResponsiveAttribute', () => {
	it( 'reads the base attribute unsuffixed and others suffixed', () => {
		const base = setup( { columnGap: 24 }, 'desktop' );

		expect( base.result.current.attrNameForBreakpoint ).toBe( 'columnGap' );
		expect( base.result.current.value ).toBe( 24 );

		const override = setup( { columnGap: 24, columnGapMobile: 8 } );

		expect( override.result.current.attrNameForBreakpoint ).toBe(
			'columnGapMobile'
		);
		expect( override.result.current.value ).toBe( 8 );
	} );

	it( 'separates own, inherited and resolved values', () => {
		const { result } = setup( { columnGap: 24, columnGapTablet: 16 } );

		expect( result.current.value ).toBeUndefined();
		expect( result.current.inheritedValue ).toBe( 16 );
		expect( result.current.resolvedValue ).toBe( 16 );
		expect( result.current.hasOwnValue ).toBe( false );
	} );

	it( 'keeps a zero override instead of inheriting', () => {
		const { result } = setup( { columnGap: 24, columnGapMobile: 0 } );

		expect( result.current.value ).toBe( 0 );
		expect( result.current.hasOwnValue ).toBe( true );
		expect( result.current.resolvedValue ).toBe( 0 );
		expect( result.current.inheritedValue ).toBe( 24 );
	} );

	it( 'reports which breakpoints carry an override', () => {
		const { result } = setup( { columnGap: 24, columnGapTablet: 16 } );

		expect( result.current.hasValue ).toEqual( {
			desktop: false,
			tablet: true,
			mobile: false,
		} );
	} );

	it( 'writes to the active breakpoint attribute', () => {
		const { result, setAttributes } = setup( { columnGap: 24 } );

		result.current.onChange( 8 );

		expect( setAttributes ).toHaveBeenCalledWith( { columnGapMobile: 8 } );
	} );

	it( 'resets by writing undefined so the block default applies', () => {
		const { result, setAttributes } = setup( {
			columnGap: 24,
			columnGapMobile: 8,
		} );

		result.current.reset();

		expect( setAttributes ).toHaveBeenCalledWith( {
			columnGapMobile: undefined,
		} );
	} );

	it( 'resetAll clears every override but keeps the base value', () => {
		const { result, setAttributes } = setup( {
			columnGap: 24,
			columnGapTablet: 16,
			columnGapMobile: 8,
		} );

		result.current.resetAll();

		expect( setAttributes ).toHaveBeenCalledWith( {
			columnGapTablet: undefined,
			columnGapMobile: undefined,
		} );
		expect( setAttributes.mock.calls[ 0 ][ 0 ] ).not.toHaveProperty(
			'columnGap'
		);
	} );
} );
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test --workspace=packages/gutenberg -- useResponsiveAttribute`
Expected: FAIL — cannot resolve `./useResponsiveAttribute`.

- [ ] **Step 3: Implement the hook**

Create `packages/gutenberg/src/hooks/useResponsiveAttribute.ts`:

```ts
import { useCallback, useMemo } from 'react';
import type { Breakpoint } from '../breakpoints';
import {
	buildHasValueMap,
	isPresent,
	resolveAttrName,
	resolveCascade,
	useValidatedBreakpoints,
} from '../breakpoints';

export interface UseResponsiveAttributeArgs {
	/** Base attribute name, e.g. `'columnGap'`. */
	attrName: string;

	/** Currently selected breakpoint id. */
	breakpoint: string;

	/** The block's attributes. */
	attributes: Record< string, unknown >;

	/** The block's `setAttributes`. */
	setAttributes: ( next: Record< string, unknown > ) => void;

	/** Breakpoint set; defaults to `DEFAULT_BREAKPOINTS`. */
	breakpoints?: Breakpoint[];
}

export interface UseResponsiveAttributeResult {
	/** Value set on the active breakpoint; `undefined` when it has no override. */
	value: unknown;

	/** Value inherited from ancestor breakpoints, ignoring the active one. */
	inheritedValue: unknown;

	/** `value` when set, otherwise `inheritedValue` — what the frontend would render. */
	resolvedValue: unknown;

	/** Whether the active breakpoint has its own value. */
	hasOwnValue: boolean;

	/** Per-breakpoint override flags, for the switcher's indicator. */
	hasValue: Record< string, boolean >;

	/** The attribute name currently being read and written. */
	attrNameForBreakpoint: string;

	/** Writes the active breakpoint's attribute. */
	onChange: ( next: unknown ) => void;

	/** Clears the active breakpoint's attribute. */
	reset: () => void;

	/** Clears every non-base breakpoint's attribute, keeping the base value. */
	resetAll: () => void;
}

/**
 * Reads and writes one logical setting across a breakpoint set.
 *
 * Takes `attributes` and `setAttributes` directly rather than reaching into a store, which
 * keeps it usable outside a block context and trivially testable.
 */
export function useResponsiveAttribute(
	args: UseResponsiveAttributeArgs
): UseResponsiveAttributeResult {
	const { attrName, breakpoint, attributes, setAttributes } = args;
	const breakpoints = useValidatedBreakpoints( args.breakpoints );

	const active = useMemo( () => {
		return (
			breakpoints.find( ( item ) => item.id === breakpoint ) ??
			breakpoints.find( ( item ) => item.isBase ) ??
			breakpoints[ 0 ]
		);
	}, [ breakpoints, breakpoint ] );

	const attrNameForBreakpoint = resolveAttrName( attrName, active );
	const raw = attributes[ attrNameForBreakpoint ];
	const hasOwnValue = isPresent( raw );

	const inheritedValue = resolveCascade(
		attrName,
		breakpoints,
		active.id,
		attributes,
		{ skipActive: true }
	);

	const hasValue = useMemo(
		() => buildHasValueMap( attrName, breakpoints, attributes ),
		[ attrName, breakpoints, attributes ]
	);

	const onChange = useCallback(
		( next: unknown ) => {
			setAttributes( { [ attrNameForBreakpoint ]: next } );
		},
		[ setAttributes, attrNameForBreakpoint ]
	);

	const reset = useCallback( () => {
		setAttributes( { [ attrNameForBreakpoint ]: undefined } );
	}, [ setAttributes, attrNameForBreakpoint ] );

	const resetAll = useCallback( () => {
		const patch: Record< string, unknown > = {};

		for ( const item of breakpoints ) {
			if ( ! item.isBase ) {
				patch[ resolveAttrName( attrName, item ) ] = undefined;
			}
		}

		setAttributes( patch );
	}, [ setAttributes, breakpoints, attrName ] );

	return {
		value: hasOwnValue ? raw : undefined,
		inheritedValue,
		resolvedValue: hasOwnValue ? raw : inheritedValue,
		hasOwnValue,
		hasValue,
		attrNameForBreakpoint,
		onChange,
		reset,
		resetAll,
	};
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test --workspace=packages/gutenberg -- useResponsiveAttribute`
Expected: PASS.

- [ ] **Step 5: Export from the hooks barrel**

Add to `packages/gutenberg/src/hooks/index.ts`:

```ts
export { useResponsiveAttribute } from './useResponsiveAttribute';
export type {
	UseResponsiveAttributeArgs,
	UseResponsiveAttributeResult,
} from './useResponsiveAttribute';
```

- [ ] **Step 6: Typecheck and commit**

```bash
npm run typecheck --workspace=packages/gutenberg
git add packages/gutenberg/src/hooks/useResponsiveAttribute.ts packages/gutenberg/src/hooks/useResponsiveAttribute.test.ts packages/gutenberg/src/hooks/index.ts
git commit -m "feat(hooks): add useResponsiveAttribute

Reads and writes one logical setting across a breakpoint set, exposing own, inherited and
resolved values as three separate fields so a control can bind its value to the override
while showing the inherited value as a placeholder. Without that separation an author
cannot tell whether an override exists.

Takes attributes/setAttributes as arguments instead of reaching into a store, so it needs
no mocking to test and works outside a block context."
```

---

## Task 6: `useBreakpoint`

**Files:**
- Create: `packages/gutenberg/src/hooks/useBreakpoint.ts`
- Create: `packages/gutenberg/src/hooks/useBreakpoint.test.ts`
- Modify: `packages/gutenberg/src/hooks/index.ts`

**Interfaces:**
- Consumes: the kernel from Task 4.
- Produces:
  ```ts
  interface UseBreakpointOptions {
      initial?: string;
      breakpoints?: Breakpoint[];
      syncToEditor?: boolean;
      syncFromEditor?: boolean;
  }
  function useBreakpoint( options?: UseBreakpointOptions ): readonly [ string, ( id: string ) => void ];
  ```

Editor-viewport sync lives here, not on the switcher, so `components/` stays free of store access. `core/editor`'s `getDeviceType`/`setDeviceType` are the current API (verified against Gutenberg trunk docs, 2026-07-30) and use capitalized values such as `'Tablet'`.

- [ ] **Step 1: Write the failing tests**

Create `packages/gutenberg/src/hooks/useBreakpoint.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { useBreakpoint } from './useBreakpoint';

const setDeviceType = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
	useDispatch: () => ( { setDeviceType } ),
} ) );

jest.mock( '@wordpress/editor', () => ( { store: 'core/editor' } ) );

const mockedUseSelect = useSelect as unknown as jest.Mock;

beforeEach( () => {
	jest.clearAllMocks();
	mockedUseSelect.mockReturnValue( null );
} );

describe( 'useBreakpoint', () => {
	it( 'starts on the base breakpoint and keeps state locally', () => {
		const { result } = renderHook( () => useBreakpoint() );

		expect( result.current[ 0 ] ).toBe( 'desktop' );

		act( () => result.current[ 1 ]( 'mobile' ) );

		expect( result.current[ 0 ] ).toBe( 'mobile' );
		expect( setDeviceType ).not.toHaveBeenCalled();
	} );

	it( 'pushes the selection to the editor when syncToEditor is set', () => {
		const { result } = renderHook( () =>
			useBreakpoint( { syncToEditor: true } )
		);

		act( () => result.current[ 1 ]( 'tablet' ) );

		expect( setDeviceType ).toHaveBeenCalledWith( 'Tablet' );
	} );

	it( 'follows the editor device type when syncFromEditor is set', () => {
		mockedUseSelect.mockReturnValue( 'mobile' );

		const { result } = renderHook( () =>
			useBreakpoint( { syncFromEditor: true } )
		);

		expect( result.current[ 0 ] ).toBe( 'mobile' );
	} );

	it( 'ignores an editor device type outside the breakpoint set', () => {
		mockedUseSelect.mockReturnValue( 'watch' );

		const { result } = renderHook( () =>
			useBreakpoint( { syncFromEditor: true } )
		);

		expect( result.current[ 0 ] ).toBe( 'desktop' );
	} );
} );
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test --workspace=packages/gutenberg -- useBreakpoint`
Expected: FAIL — cannot resolve `./useBreakpoint`.

- [ ] **Step 3: Implement the hook**

Create `packages/gutenberg/src/hooks/useBreakpoint.ts`:

```ts
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import type { Breakpoint } from '../breakpoints';
import { useValidatedBreakpoints } from '../breakpoints';

export interface UseBreakpointOptions {
	/** Breakpoint selected on first render; defaults to the base breakpoint. */
	initial?: string;

	/** Breakpoint set; defaults to `DEFAULT_BREAKPOINTS`. */
	breakpoints?: Breakpoint[];

	/** Push the selection to the editor's device preview. */
	syncToEditor?: boolean;

	/** Follow the editor's device preview. */
	syncFromEditor?: boolean;
}

function capitalize( value: string ): string {
	return value.charAt( 0 ).toUpperCase() + value.slice( 1 );
}

/**
 * Owns the selected breakpoint, with optional two-way sync to the editor's device preview.
 *
 * Sync is opt-in per direction and off by default: editing a mobile value while looking at
 * the desktop canvas is a legitimate thing to want, so nothing is forced.
 *
 * This hook, not `BreakpointSwitcher`, is where store access lives — components must stay
 * free of it.
 */
export function useBreakpoint(
	options: UseBreakpointOptions = {}
): readonly [ string, ( id: string ) => void ] {
	const { syncToEditor = false, syncFromEditor = false } = options;
	const breakpoints = useValidatedBreakpoints( options.breakpoints );
	const base =
		breakpoints.find( ( item ) => item.isBase ) ?? breakpoints[ 0 ];

	const [ selected, setSelected ] = useState(
		options.initial ?? base.id
	);

	const editorDeviceType = useSelect(
		( select ) => {
			if ( ! syncFromEditor ) {
				return null;
			}

			const store = select( editorStore ) as {
				getDeviceType?: () => string | undefined;
			};

			return store.getDeviceType?.()?.toLowerCase() ?? null;
		},
		[ syncFromEditor ]
	);

	const { setDeviceType } = useDispatch( editorStore ) as {
		setDeviceType: ( deviceType: string ) => void;
	};

	useEffect( () => {
		if ( ! syncFromEditor || ! editorDeviceType ) {
			return;
		}

		if ( editorDeviceType === selected ) {
			return;
		}

		if ( breakpoints.some( ( item ) => item.id === editorDeviceType ) ) {
			setSelected( editorDeviceType );
		}
	}, [ syncFromEditor, editorDeviceType, selected, breakpoints ] );

	const setBreakpoint = useCallback(
		( id: string ) => {
			setSelected( id );

			if ( syncToEditor ) {
				setDeviceType( capitalize( id ) );
			}
		},
		[ syncToEditor, setDeviceType ]
	);

	return [ selected, setBreakpoint ] as const;
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test --workspace=packages/gutenberg -- useBreakpoint`
Expected: PASS.

- [ ] **Step 5: Export from the hooks barrel**

Add to `packages/gutenberg/src/hooks/index.ts`:

```ts
export { useBreakpoint } from './useBreakpoint';
export type { UseBreakpointOptions } from './useBreakpoint';
```

- [ ] **Step 6: Typecheck and commit**

```bash
npm run typecheck --workspace=packages/gutenberg
git add packages/gutenberg/src/hooks/useBreakpoint.ts packages/gutenberg/src/hooks/useBreakpoint.test.ts packages/gutenberg/src/hooks/index.ts
git commit -m "feat(hooks): add useBreakpoint with opt-in editor viewport sync

Owns the selected breakpoint. Sync with the editor's device preview is opt-in per
direction via two booleans rather than a bitmask, because editing a mobile value while
looking at the desktop canvas is a legitimate thing to want.

Store access lives here rather than in the switcher so components/ stays free of
@wordpress/data, which also makes the switcher testable without mocks."
```

---

## Task 7: `BreakpointSwitcher`

**Files:**
- Create: `packages/gutenberg/src/_internal/wp-components.ts`
- Create: `packages/gutenberg/src/components/BreakpointSwitcher/types.ts`
- Create: `packages/gutenberg/src/components/BreakpointSwitcher/IconWithOverrideDot.tsx`
- Create: `packages/gutenberg/src/components/BreakpointSwitcher/InlineSwitcher.tsx`
- Create: `packages/gutenberg/src/components/BreakpointSwitcher/DropdownSwitcher.tsx`
- Create: `packages/gutenberg/src/components/BreakpointSwitcher/BreakpointSwitcher.tsx`
- Create: `packages/gutenberg/src/components/BreakpointSwitcher/index.ts`
- Create: `packages/gutenberg/src/components/BreakpointSwitcher/README.md`
- Create: `packages/gutenberg/src/components/BreakpointSwitcher/BreakpointSwitcher.test.tsx`
- Create: `.agents/decisions/0004-experimental-wp-components.md`
- Modify: `packages/gutenberg/src/components/index.ts`

**Interfaces:**
- Consumes: `Breakpoint`, `DEFAULT_BREAKPOINTS`, `useValidatedBreakpoints` from `../../breakpoints`.
- Produces:
  ```ts
  interface BreakpointSwitcherProps {
      value: string;
      onChange: ( id: string ) => void;
      variant?: 'inline' | 'dropdown';
      breakpoints?: Breakpoint[];
      hasValue?: Record< string, boolean >;
      label?: string;
      hideLabelFromVision?: boolean;
      className?: string;
  }
  function BreakpointSwitcher( props: BreakpointSwitcherProps ): ReactElement | null;
  ```

- [ ] **Step 1: Write the failing tests**

Create `packages/gutenberg/src/components/BreakpointSwitcher/BreakpointSwitcher.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_BREAKPOINTS } from '../../breakpoints';
import { BreakpointSwitcher } from './BreakpointSwitcher';

describe( 'BreakpointSwitcher', () => {
	it( 'renders nothing with fewer than two breakpoints', () => {
		const { container } = render(
			<BreakpointSwitcher
				value="desktop"
				onChange={ jest.fn() }
				breakpoints={ [
					{ id: 'desktop', label: 'Desktop', isBase: true },
				] }
			/>
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'offers every breakpoint and reports the chosen one', async () => {
		const onChange = jest.fn();
		render(
			<BreakpointSwitcher
				value="desktop"
				onChange={ onChange }
				label="Breakpoint"
			/>
		);

		DEFAULT_BREAKPOINTS.forEach( ( breakpoint ) => {
			expect(
				screen.getByRole( 'radio', {
					name: new RegExp( breakpoint.label, 'i' ),
				} )
			).toBeInTheDocument();
		} );

		await userEvent.click(
			screen.getByRole( 'radio', { name: /tablet/i } )
		);

		expect( onChange ).toHaveBeenCalledWith( 'tablet' );
	} );

	it( 'marks overridden breakpoints in the accessible name, never the base', () => {
		render(
			<BreakpointSwitcher
				value="desktop"
				onChange={ jest.fn() }
				label="Breakpoint"
				hasValue={ { desktop: true, tablet: true, mobile: false } }
			/>
		);

		expect(
			screen.getByRole( 'radio', { name: /tablet \(modified\)/i } )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'radio', { name: /^desktop$/i } )
		).toBeInTheDocument();
	} );

	it( 'opens a menu and selects in the dropdown variant', async () => {
		const onChange = jest.fn();
		render(
			<BreakpointSwitcher
				value="desktop"
				onChange={ onChange }
				variant="dropdown"
				label="Breakpoint"
			/>
		);

		await userEvent.click(
			screen.getByRole( 'button', { name: /breakpoint/i } )
		);
		await userEvent.click(
			screen.getByRole( 'menuitem', { name: /mobile/i } )
		);

		expect( onChange ).toHaveBeenCalledWith( 'mobile' );
	} );

} );
```

The invalid-breakpoints fallback is deliberately **not** tested here. `validateBreakpoints`
is already covered directly in Task 4, and asserting on it through a `console.warn` spy plus
rendered output would be a brittle test of a dev-time ergonomic rather than of behavior
anyone ships.

Add `"@testing-library/user-event": "^14.5.2"` to `packages/gutenberg/devDependencies` and run `npm install`.

- [ ] **Step 2: Run to verify it fails**

Run: `npm test --workspace=packages/gutenberg -- BreakpointSwitcher`
Expected: FAIL — cannot resolve `./BreakpointSwitcher`.

- [ ] **Step 3: Create the experimental-import boundary**

Create `packages/gutenberg/src/_internal/wp-components.ts`:

```ts
/**
 * The only module allowed to import `__experimental*` or `__unstable*` symbols from
 * `@wordpress/components`.
 *
 * `ToggleGroupControl` is still exported behind the `__experimental` prefix on Gutenberg
 * trunk — it was NOT stabilized in WP 7.0 (verified 2026-07-30). A published library
 * importing an experimental symbol can break on a WordPress minor, so every such import is
 * funnelled through here and re-exported under a stable local name. When WordPress renames
 * one, this file is the only edit. See decision 0004.
 */
export {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from '@wordpress/components';
```

- [ ] **Step 4: Write the props interface**

Create `packages/gutenberg/src/components/BreakpointSwitcher/types.ts`:

```ts
import type { Breakpoint } from '../../breakpoints';

export interface BreakpointSwitcherProps {
	/** Currently selected breakpoint id. */
	value: string;

	/** Called with the newly selected breakpoint id. */
	onChange: ( id: string ) => void;

	/** Layout: a always-visible row, or a button that opens a menu. */
	variant?: 'inline' | 'dropdown';

	/** Breakpoint set; defaults to `DEFAULT_BREAKPOINTS`. */
	breakpoints?: Breakpoint[];

	/** Which breakpoints carry an override, keyed by id. Drives the indicator. */
	hasValue?: Record< string, boolean >;

	/** Accessible name for the group or dropdown toggle. */
	label?: string;

	/** Show the label to screen readers only. */
	hideLabelFromVision?: boolean;

	/** Extra class name on the root element. */
	className?: string;
}
```

- [ ] **Step 5: Write the override-dot icon wrapper**

Create `packages/gutenberg/src/components/BreakpointSwitcher/IconWithOverrideDot.tsx`:

```tsx
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
```

- [ ] **Step 6: Write a shared label helper and the inline variant**

Create `packages/gutenberg/src/components/BreakpointSwitcher/InlineSwitcher.tsx`:

```tsx
import type { ReactElement } from 'react';
import { sprintf, __ } from '@wordpress/i18n';
import type { Breakpoint } from '../../breakpoints';
import {
	ToggleGroupControl,
	ToggleGroupControlOptionIcon,
} from '../../_internal/wp-components';
import { IconWithOverrideDot } from './IconWithOverrideDot';

/**
 * Accessible name for one option. The base breakpoint never gains the "modified" suffix:
 * it is not an override, it is the value being overridden.
 */
export function optionLabel(
	breakpoint: Breakpoint,
	hasValue: Record< string, boolean >
): string {
	return ! breakpoint.isBase && hasValue[ breakpoint.id ]
		? sprintf(
				/* translators: %s: breakpoint label, e.g. Tablet. */
				__( '%s (modified)' ),
				breakpoint.label
		  )
		: breakpoint.label;
}

export function InlineSwitcher( {
	value,
	onChange,
	breakpoints,
	hasValue,
	label,
	hideLabelFromVision,
	className,
}: {
	value: string;
	onChange: ( id: string ) => void;
	breakpoints: Breakpoint[];
	hasValue: Record< string, boolean >;
	label: string;
	hideLabelFromVision?: boolean;
	className?: string;
} ): ReactElement {
	return (
		<ToggleGroupControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			className={ className }
			label={ label }
			hideLabelFromVision={ hideLabelFromVision }
			value={ value }
			onChange={ ( next?: string | number ) => {
				if ( next !== undefined ) {
					onChange( String( next ) );
				}
			} }
		>
			{ breakpoints.map( ( breakpoint ) => (
				<ToggleGroupControlOptionIcon
					key={ breakpoint.id }
					value={ breakpoint.id }
					label={ optionLabel( breakpoint, hasValue ) }
					icon={
						! breakpoint.isBase && hasValue[ breakpoint.id ] ? (
							<IconWithOverrideDot icon={ breakpoint.icon } />
						) : (
							breakpoint.icon
						)
					}
				/>
			) ) }
		</ToggleGroupControl>
	);
}
```

- [ ] **Step 7: Write the dropdown variant**

Create `packages/gutenberg/src/components/BreakpointSwitcher/DropdownSwitcher.tsx`:

```tsx
import type { ReactElement } from 'react';
import { DropdownMenu } from '@wordpress/components';
import type { Breakpoint } from '../../breakpoints';
import { optionLabel } from './InlineSwitcher';

/**
 * `DropdownMenu` is used rather than a hand-positioned overlay because its popover is
 * already iframe-aware and handles outside-click, focus return and Escape. The post editor
 * is iframed in WP 7.1 with no fallback, and a hand-rolled listener bound to the top-level
 * document would silently stop working there.
 */
export function DropdownSwitcher( {
	value,
	onChange,
	breakpoints,
	hasValue,
	label,
	className,
}: {
	value: string;
	onChange: ( id: string ) => void;
	breakpoints: Breakpoint[];
	hasValue: Record< string, boolean >;
	label: string;
	className?: string;
} ): ReactElement {
	const active =
		breakpoints.find( ( breakpoint ) => breakpoint.id === value ) ??
		breakpoints[ 0 ];

	return (
		<DropdownMenu
			className={ className }
			icon={ active.icon }
			label={ label }
			toggleProps={ { size: 'compact' } }
			controls={ breakpoints.map( ( breakpoint ) => ( {
				title: optionLabel( breakpoint, hasValue ),
				icon: breakpoint.icon,
				isActive: breakpoint.id === value,
				onClick: () => onChange( breakpoint.id ),
			} ) ) }
		/>
	);
}
```

- [ ] **Step 8: Write the dispatching component**

Create `packages/gutenberg/src/components/BreakpointSwitcher/BreakpointSwitcher.tsx`:

```tsx
import type { ReactElement } from 'react';
import { __ } from '@wordpress/i18n';
import { useValidatedBreakpoints } from '../../breakpoints';
import { DropdownSwitcher } from './DropdownSwitcher';
import { InlineSwitcher } from './InlineSwitcher';
import type { BreakpointSwitcherProps } from './types';

/**
 * Switches which breakpoint a responsive setting is being edited for.
 *
 * A pure controlled component: it holds no state, reads no store and knows nothing about
 * block attributes. Pair it with `useBreakpoint` for selection state and
 * `useResponsiveAttribute` for values, or use `ResponsiveControl`, which wires all three.
 */
export function BreakpointSwitcher(
	props: BreakpointSwitcherProps
): ReactElement | null {
	const {
		value,
		onChange,
		variant = 'inline',
		hasValue = {},
		label = __( 'Breakpoint' ),
		hideLabelFromVision,
		className,
	} = props;

	const breakpoints = useValidatedBreakpoints( props.breakpoints );

	// A switcher with one option is noise, not a control.
	if ( breakpoints.length < 2 ) {
		return null;
	}

	if ( variant === 'dropdown' ) {
		return (
			<DropdownSwitcher
				value={ value }
				onChange={ onChange }
				breakpoints={ breakpoints }
				hasValue={ hasValue }
				label={ label }
				className={ className }
			/>
		);
	}

	return (
		<InlineSwitcher
			value={ value }
			onChange={ onChange }
			breakpoints={ breakpoints }
			hasValue={ hasValue }
			label={ label }
			hideLabelFromVision={ hideLabelFromVision }
			className={ className }
		/>
	);
}
```

Note the early return sits *after* `useValidatedBreakpoints`, which calls no hooks, so hook order stays stable.

- [ ] **Step 9: Write the barrel and export from the category barrel**

Create `packages/gutenberg/src/components/BreakpointSwitcher/index.ts`:

```ts
export { BreakpointSwitcher } from './BreakpointSwitcher';
export type { BreakpointSwitcherProps } from './types';
```

Replace the contents of `packages/gutenberg/src/components/index.ts`:

```ts
// Pure UI building blocks (no knowledge of meta/taxonomy/post types or editor stores).
// TODO(stage 7): ColorPopup, IconSelect, SearchableSelect, Skeleton, EmptyState,
// LoadingOverlay — written from scratch, config injected via props (decision 0001).
export { BreakpointSwitcher } from './BreakpointSwitcher';
export type { BreakpointSwitcherProps } from './BreakpointSwitcher';
```

- [ ] **Step 10: Run the tests**

Run: `npm test --workspace=packages/gutenberg -- BreakpointSwitcher`
Expected: PASS.

`radio` and `menuitem` are this plan's guesses at what `ToggleGroupControl` and
`DropdownMenu` render in 32.2.1. If a query fails, add `screen.debug()` to see the real
markup and fix the **query**. Do not reshape the component to satisfy a guessed role.

- [ ] **Step 11: Write the README**

Create `packages/gutenberg/src/components/BreakpointSwitcher/README.md`:

```markdown
---
name: BreakpointSwitcher
entrypoint: "@isudev/gutenberg/components"
kind: component
status: stable
since: 0.2.0
---

## Summary

Switches which breakpoint a responsive setting is being edited for, as an always-visible row
of icons or a compact dropdown.

## When to use / When not to use

Use it when a block setting needs a different value per breakpoint and you want the author
to see which breakpoints carry an override.

Do not use it to preview the site at a device size — that is the editor's own device
preview. `useBreakpoint`'s `syncToEditor` connects the two if you want them linked.

Do not reach for this component alone if you also need the values: `ResponsiveControl` wires
the switcher, the selection state and the attribute plumbing together.

## Import

```js
import { BreakpointSwitcher } from '@isudev/gutenberg/components';
// or, skipping the barrel:
import { BreakpointSwitcher } from '@isudev/gutenberg/components/BreakpointSwitcher';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `value` | `string` | — | Yes | Currently selected breakpoint id. |
| `onChange` | `( id: string ) => void` | — | Yes | Called with the newly selected breakpoint id. |
| `variant` | `'inline' \| 'dropdown'` | `'inline'` | No | Always-visible row, or a button that opens a menu. |
| `breakpoints` | `Breakpoint[]` | `DEFAULT_BREAKPOINTS` | No | The breakpoint set to offer. |
| `hasValue` | `Record<string, boolean>` | `{}` | No | Which breakpoints carry an override, keyed by id. Drives the indicator. |
| `label` | `string` | `'Breakpoint'` | No | Accessible name for the group or dropdown toggle. |
| `hideLabelFromVision` | `boolean` | `false` | No | Show the label to screen readers only. Inline variant only. |
| `className` | `string` | `undefined` | No | Extra class name on the root element. |

## Examples

### Standalone, controlled

```jsx
const [ breakpoint, setBreakpoint ] = useState( 'desktop' );

<BreakpointSwitcher value={ breakpoint } onChange={ setBreakpoint } />
```

### Compact dropdown with override indicators

```jsx
<BreakpointSwitcher
	variant="dropdown"
	value={ breakpoint }
	onChange={ setBreakpoint }
	hasValue={ { desktop: false, tablet: true, mobile: false } }
/>
```

### A custom breakpoint set

```jsx
import { DEFAULT_BREAKPOINTS } from '@isudev/gutenberg/breakpoints';
import { desktop } from '@wordpress/icons';

const BREAKPOINTS = [
	...DEFAULT_BREAKPOINTS,
	{ id: 'wide', label: 'Wide', icon: desktop, suffix: 'Wide' },
];

<BreakpointSwitcher
	value={ breakpoint }
	onChange={ setBreakpoint }
	breakpoints={ BREAKPOINTS }
/>
```

## Behavior

- Renders `null` when fewer than two breakpoints are configured — a one-option switcher is
  noise.
- Fully controlled. It holds no state, reads no store, and knows nothing about block
  attributes.
- The inline variant is built on `ToggleGroupControl`, so arrow keys move between options
  and focus is managed for you. The dropdown variant is built on `DropdownMenu`, which
  handles outside-click, focus return and `Escape`.
- An overridden breakpoint gains `(modified)` in its accessible name and a dot on its icon.
  The base breakpoint never shows the indicator: it is not an override, it is the value
  being overridden.
- An invalid `breakpoints` set warns once in development and falls back to
  `DEFAULT_BREAKPOINTS`.

## Styling

Ships no stylesheet. Both variants inherit editor chrome from `@wordpress/components`. The
override dot is an inline style using `var(--wp-admin-theme-color, #3858e9)`.

Tint icons with the CSS `color` property, not `fill` — `@wordpress/icons` v15 switched to
`fill="currentColor"`.

## Gotchas

- Cascade direction follows the **order** of the `breakpoints` array, and nothing validates
  that the order is sensible. List them from base outwards, widest to narrowest for a
  desktop-first set.
- `hasValue` is not computed here. Pass the map from `useResponsiveAttribute`, or the
  indicator will never appear.
- `hideLabelFromVision` affects the inline variant only; the dropdown's label is always the
  toggle's accessible name and is never rendered as text.

## Related

- [`useBreakpoint`](../../hooks/README.md) — selection state and editor sync.
- [`useResponsiveAttribute`](../../hooks/README.md) — per-breakpoint values.
- [`ResponsiveControl`](../../controls/ResponsiveControl/README.md) — all three wired up.
```

- [ ] **Step 12: Record the ADR**

Create `.agents/decisions/0004-experimental-wp-components.md`:

```markdown
# 0004 — Isolate `__experimental*` imports from `@wordpress/components`

- Status: accepted
- Date: 2026-07-30

## Context

`ToggleGroupControl` and `ToggleGroupControlOptionIcon` are the right primitives for an
icon-segmented control: they carry editor styling, keyboard navigation and focus management.
Both are still exported behind the `__experimental` prefix on Gutenberg trunk — they were
not stabilized in WP 7.0 (verified 2026-07-30).

A library published to npm that imports an experimental symbol can break when WordPress
renames or removes it, and the breakage lands on consumers rather than on us.

## Decision

Use them, but confine every `__experimental*` and `__unstable*` import from
`@wordpress/components` to `src/_internal/wp-components.ts`, which re-exports them under
stable local names. No other module may import an experimental symbol directly.

## Consequences

- A WordPress rename is a one-line change in one file instead of a search across components.
- `_internal/` is not exported from `package.json`, so the experimental surface never
  becomes part of our public API.
- Reimplementing these controls from scratch was rejected: it would mean owning keyboard
  navigation, focus management and editor styling for no functional gain.
- A future review should re-check whether these symbols have stabilized and drop the alias.
```

- [ ] **Step 13: Typecheck, test, commit**

```bash
npm run typecheck --workspace=packages/gutenberg
npm test --workspace=packages/gutenberg
git add packages/gutenberg/src/_internal packages/gutenberg/src/components .agents/decisions/0004-experimental-wp-components.md packages/gutenberg/package.json package-lock.json
git commit -m "feat(components): add BreakpointSwitcher with inline and dropdown variants

A pure controlled component holding no state and reading no store. Inline is built on
ToggleGroupControl and dropdown on DropdownMenu, so keyboard navigation, focus management
and iframe-aware popovers come from @wordpress/components rather than being hand-rolled --
which matters because the post editor is iframed unconditionally in WP 7.1 and a listener
bound to the top-level document would silently stop working there.

Overridden breakpoints are marked in both the accessible name and the icon; the base never
is, because it is the value being overridden rather than an override.

ToggleGroupControl is still __experimental on trunk, so every experimental import is
funnelled through _internal/wp-components.ts. Records ADRs 0003 and 0004."
```

---

## Task 8: `ResponsiveControl`

**Files:**
- Create: `packages/gutenberg/src/controls/ResponsiveControl/types.ts`
- Create: `packages/gutenberg/src/controls/ResponsiveControl/ResponsiveControl.tsx`
- Create: `packages/gutenberg/src/controls/ResponsiveControl/index.ts`
- Create: `packages/gutenberg/src/controls/ResponsiveControl/README.md`
- Create: `packages/gutenberg/src/controls/ResponsiveControl/ResponsiveControl.test.tsx`
- Create: `packages/gutenberg/src/hooks/README.md`
- Modify: `packages/gutenberg/src/controls/index.ts`

**Interfaces:**
- Consumes: `BreakpointSwitcher` (Task 7), `useBreakpoint` (Task 6), `useResponsiveAttribute` (Task 5).
- Produces:
  ```ts
  interface ResponsiveControlRenderArgs extends UseResponsiveAttributeResult {
      breakpoint: string;
  }
  interface ResponsiveControlProps {
      attrName: string;
      attributes: Record< string, unknown >;
      setAttributes: ( next: Record< string, unknown > ) => void;
      children: ( args: ResponsiveControlRenderArgs ) => ReactNode;
      label?: string;
      variant?: 'inline' | 'dropdown';
      breakpoints?: Breakpoint[];
      syncToEditor?: boolean;
      syncFromEditor?: boolean;
      showReset?: boolean;
      className?: string;
  }
  ```

- [ ] **Step 1: Write the failing tests**

Create `packages/gutenberg/src/controls/ResponsiveControl/ResponsiveControl.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResponsiveControl } from './ResponsiveControl';

jest.mock( '@wordpress/data', () => ( {
	useSelect: () => null,
	useDispatch: () => ( { setDeviceType: jest.fn() } ),
} ) );

jest.mock( '@wordpress/editor', () => ( { store: 'core/editor' } ) );

function Harness( {
	attributes,
	setAttributes = jest.fn(),
}: {
	attributes: Record< string, unknown >;
	setAttributes?: ( next: Record< string, unknown > ) => void;
} ) {
	return (
		<ResponsiveControl
			attrName="columnGap"
			label="Column Gap"
			attributes={ attributes }
			setAttributes={ setAttributes }
		>
			{ ( { value, inheritedValue, onChange } ) => (
				<input
					aria-label="Column Gap value"
					value={ value === undefined ? '' : String( value ) }
					placeholder={
						inheritedValue === undefined
							? ''
							: String( inheritedValue )
					}
					onChange={ ( event ) => onChange( event.target.value ) }
				/>
			) }
		</ResponsiveControl>
	);
}

describe( 'ResponsiveControl', () => {
	it( 'swaps which attribute the child edits when the breakpoint changes', async () => {
		const setAttributes = jest.fn();
		render(
			<Harness
				attributes={ { columnGap: 24 } }
				setAttributes={ setAttributes }
			/>
		);

		// Starts on the base breakpoint, showing its value.
		expect( screen.getByText( 'Column Gap' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Column Gap value' ) ).toHaveValue(
			'24'
		);

		await userEvent.click(
			screen.getByRole( 'radio', { name: /mobile/i } )
		);

		const input = screen.getByLabelText( 'Column Gap value' );
		expect( input ).toHaveValue( '' );
		expect( input ).toHaveAttribute( 'placeholder', '24' );

		await userEvent.type( input, '8' );

		expect( setAttributes ).toHaveBeenCalledWith( { columnGapMobile: '8' } );
	} );

	it( 'offers a reset only when the active breakpoint has an override', async () => {
		const setAttributes = jest.fn();
		render(
			<Harness
				attributes={ { columnGap: 24, columnGapMobile: 8 } }
				setAttributes={ setAttributes }
			/>
		);

		expect(
			screen.queryByRole( 'button', { name: /reset/i } )
		).not.toBeInTheDocument();

		await userEvent.click(
			screen.getByRole( 'radio', { name: /mobile/i } )
		);
		await userEvent.click(
			screen.getByRole( 'button', { name: /reset/i } )
		);

		expect( setAttributes ).toHaveBeenCalledWith( {
			columnGapMobile: undefined,
		} );
	} );
} );
```

The first reset assertion is deliberate: on `desktop` the base has a value but it is not an
override, so no reset must appear.

- [ ] **Step 2: Run to verify it fails**

Run: `npm test --workspace=packages/gutenberg -- ResponsiveControl`
Expected: FAIL — cannot resolve `./ResponsiveControl`.

- [ ] **Step 3: Write the props interface**

Create `packages/gutenberg/src/controls/ResponsiveControl/types.ts`:

```ts
import type { ReactNode } from 'react';
import type { Breakpoint } from '../../breakpoints';
import type { UseResponsiveAttributeResult } from '../../hooks/useResponsiveAttribute';

export interface ResponsiveControlRenderArgs
	extends UseResponsiveAttributeResult {
	/** The breakpoint currently being edited. */
	breakpoint: string;
}

export interface ResponsiveControlProps {
	/** Base attribute name, e.g. `'columnGap'`. */
	attrName: string;

	/** The block's attributes. */
	attributes: Record< string, unknown >;

	/** The block's `setAttributes`. */
	setAttributes: ( next: Record< string, unknown > ) => void;

	/** Renders the actual control with resolved values. */
	children: ( args: ResponsiveControlRenderArgs ) => ReactNode;

	/** Visible label shown beside the switcher. */
	label?: string;

	/** Switcher layout. */
	variant?: 'inline' | 'dropdown';

	/** Breakpoint set; defaults to `DEFAULT_BREAKPOINTS`. */
	breakpoints?: Breakpoint[];

	/** Push breakpoint changes to the editor's device preview. */
	syncToEditor?: boolean;

	/** Follow the editor's device preview. */
	syncFromEditor?: boolean;

	/** Show a reset button when the active breakpoint has an override. */
	showReset?: boolean;

	/** Extra class name on the root element. */
	className?: string;
}
```

- [ ] **Step 4: Implement the control**

Create `packages/gutenberg/src/controls/ResponsiveControl/ResponsiveControl.tsx`:

```tsx
import type { ReactElement } from 'react';
import { BaseControl, Button, Flex, FlexItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { BreakpointSwitcher } from '../../components/BreakpointSwitcher';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useResponsiveAttribute } from '../../hooks/useResponsiveAttribute';
import type { ResponsiveControlProps } from './types';

/**
 * Makes any control responsive.
 *
 * Owns the breakpoint selection, resolves the value for that breakpoint, and hands both to
 * a render prop. A render prop rather than `cloneElement` because the value prop is not
 * named consistently across `@wordpress/components` — `SelectControl` uses `value`,
 * `RadioControl` uses `selected`, `ToggleControl` uses `checked` — so cloning would have to
 * guess. Explicit wiring is also type-safe.
 */
export function ResponsiveControl(
	props: ResponsiveControlProps
): ReactElement {
	const {
		attrName,
		attributes,
		setAttributes,
		children,
		label,
		variant = 'inline',
		breakpoints,
		syncToEditor,
		syncFromEditor,
		showReset = true,
		className,
	} = props;

	const [ breakpoint, setBreakpoint ] = useBreakpoint( {
		breakpoints,
		syncToEditor,
		syncFromEditor,
	} );

	const responsive = useResponsiveAttribute( {
		attrName,
		breakpoint,
		attributes,
		setAttributes,
		breakpoints,
	} );

	return (
		<div className={ className }>
			<Flex justify="space-between" align="center" gap={ 2 }>
				<FlexItem>
					{ label && (
						<BaseControl.VisualLabel>
							{ label }
						</BaseControl.VisualLabel>
					) }
				</FlexItem>
				<FlexItem>
					<BreakpointSwitcher
						variant={ variant }
						value={ breakpoint }
						onChange={ setBreakpoint }
						breakpoints={ breakpoints }
						hasValue={ responsive.hasValue }
						label={ __( 'Breakpoint' ) }
						hideLabelFromVision
					/>
				</FlexItem>
			</Flex>

			{ children( { ...responsive, breakpoint } ) }

			{ showReset && responsive.hasOwnValue && (
				<Button
					size="small"
					variant="tertiary"
					onClick={ responsive.reset }
				>
					{ __( 'Reset' ) }
				</Button>
			) }
		</div>
	);
}
```

- [ ] **Step 5: Write the barrel and export from the category barrel**

Create `packages/gutenberg/src/controls/ResponsiveControl/index.ts`:

```ts
export { ResponsiveControl } from './ResponsiveControl';
export type {
	ResponsiveControlProps,
	ResponsiveControlRenderArgs,
} from './types';
```

Replace the contents of `packages/gutenberg/src/controls/index.ts`:

```ts
// Editor/Gutenberg controls, not necessarily bound to meta/taxonomy.
// TODO(stage 7): MediaControl, LinkPickerControl (renamed to avoid collision with
// @wordpress/block-editor LinkControl), PostTypeControl, UrlPicker, InlineUrlPicker.
export { ResponsiveControl } from './ResponsiveControl';
export type {
	ResponsiveControlProps,
	ResponsiveControlRenderArgs,
} from './ResponsiveControl';
```

- [ ] **Step 6: Run the tests**

Run: `npm test --workspace=packages/gutenberg -- ResponsiveControl`
Expected: PASS.

- [ ] **Step 7: Write the ResponsiveControl README**

Create `packages/gutenberg/src/controls/ResponsiveControl/README.md`:

```markdown
---
name: ResponsiveControl
entrypoint: "@isudev/gutenberg/controls"
kind: control
status: stable
since: 0.2.0
---

## Summary

Makes any control responsive: renders a label and a breakpoint switcher, then hands the
resolved per-breakpoint value to a render prop.

## When to use / When not to use

Use it whenever a block setting should differ per breakpoint. It is the shortest path from a
plain `RangeControl` to a responsive one.

Do not use it if you need the switcher somewhere other than beside the control — compose
`useBreakpoint`, `useResponsiveAttribute` and `BreakpointSwitcher` yourself instead.

Do not use it for values that are not stored on block attributes; the hooks are the lower
level building block for post meta or custom stores.

## Import

```js
import { ResponsiveControl } from '@isudev/gutenberg/controls';
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `attrName` | `string` | — | Yes | Base attribute name, e.g. `'columnGap'`. |
| `attributes` | `Record<string, unknown>` | — | Yes | The block's attributes. |
| `setAttributes` | `( next: Record<string, unknown> ) => void` | — | Yes | The block's `setAttributes`. |
| `children` | `( args: ResponsiveControlRenderArgs ) => ReactNode` | — | Yes | Renders the control with resolved values. |
| `label` | `string` | `undefined` | No | Visible label shown beside the switcher. |
| `variant` | `'inline' \| 'dropdown'` | `'inline'` | No | Switcher layout. |
| `breakpoints` | `Breakpoint[]` | `DEFAULT_BREAKPOINTS` | No | The breakpoint set to offer. |
| `syncToEditor` | `boolean` | `false` | No | Push breakpoint changes to the editor's device preview. |
| `syncFromEditor` | `boolean` | `false` | No | Follow the editor's device preview. |
| `showReset` | `boolean` | `true` | No | Show a reset button when the active breakpoint has an override. |
| `className` | `string` | `undefined` | No | Extra class name on the root element. |

## Examples

### A responsive range

```jsx
<ResponsiveControl
	attrName="columnGap"
	label={ __( 'Column Gap' ) }
	attributes={ attributes }
	setAttributes={ setAttributes }
>
	{ ( { value, inheritedValue, onChange } ) => (
		<RangeControl
			value={ value }
			placeholder={ inheritedValue }
			onChange={ onChange }
			__next40pxDefaultSize
		/>
	) }
</ResponsiveControl>
```

### Compact switcher, linked to the editor preview

```jsx
<ResponsiveControl
	attrName="layout"
	label={ __( 'Layout' ) }
	variant="dropdown"
	syncToEditor
	attributes={ attributes }
	setAttributes={ setAttributes }
>
	{ ( { value, onChange } ) => (
		<SelectControl
			value={ value ?? '' }
			options={ LAYOUT_OPTIONS }
			onChange={ onChange }
			__next40pxDefaultSize
		/>
	) }
</ResponsiveControl>
```

### Rendering what the frontend would use

```jsx
{ ( { resolvedValue } ) => <p>{ `Applied: ${ resolvedValue }` }</p> }
```

## Behavior

- The base breakpoint's value lives in `attrName`; others live in `attrName + suffix`, so
  `columnGap`, `columnGapTablet`, `columnGapMobile`.
- `value` is the active breakpoint's own value and is `undefined` when it has none.
  `inheritedValue` is what it would fall back to — bind it to `placeholder`. `resolvedValue`
  is what actually applies.
- Reset writes `undefined`, so the attribute returns to its `block.json` default and
  disappears from serialized markup.
- The reset button never appears on the base breakpoint: its value is not an override.
- Editor sync is off unless you opt in, per direction.

## Styling

Ships no stylesheet. Layout uses `Flex` from `@wordpress/components`; pass `className` to
position the whole row.

## Gotchas

- `children` is a function, not an element. Passing an element renders nothing useful.
- Numeric controls: `0` is a real value and will *not* fall back to an inherited value. This
  is deliberate.
- Attributes must be declared in `block.json` for every breakpoint you offer —
  `columnGapTablet` and `columnGapMobile` do not spring into existence.

## Related

- [`BreakpointSwitcher`](../../components/BreakpointSwitcher/README.md) — the switcher alone.
- [`useResponsiveAttribute`, `useBreakpoint`](../../hooks/README.md) — the pieces underneath.
- Decision 0003 — why base plus suffixes, and why there is no `default` breakpoint.
```

- [ ] **Step 8: Write the hooks README**

Create `packages/gutenberg/src/hooks/README.md`:

```markdown
---
name: hooks
entrypoint: "@isudev/gutenberg/hooks"
kind: hook
status: stable
since: 0.1.0
---

## Summary

Hooks for editor data: the responsive pair (`useBreakpoint`, `useResponsiveAttribute`) plus
small utilities for post context and value handling.

## When to use / When not to use

Use `useResponsiveAttribute` and `useBreakpoint` when you need responsive values but want to
lay the UI out yourself. If you just want a labelled control with a switcher beside it, use
`ResponsiveControl` instead.

## Import

```js
import { useBreakpoint, useResponsiveAttribute } from '@isudev/gutenberg/hooks';
```

## Props

`useResponsiveAttribute( args )`

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `attrName` | `string` | — | Yes | Base attribute name, e.g. `'columnGap'`. |
| `breakpoint` | `string` | — | Yes | Currently selected breakpoint id. |
| `attributes` | `Record<string, unknown>` | — | Yes | The block's attributes. |
| `setAttributes` | `( next: Record<string, unknown> ) => void` | — | Yes | The block's `setAttributes`. |
| `breakpoints` | `Breakpoint[]` | `DEFAULT_BREAKPOINTS` | No | The breakpoint set. |

`useBreakpoint( options )`

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| `initial` | `string` | base breakpoint id | No | Breakpoint selected on first render. |
| `breakpoints` | `Breakpoint[]` | `DEFAULT_BREAKPOINTS` | No | The breakpoint set. |
| `syncToEditor` | `boolean` | `false` | No | Push the selection to the editor's device preview. |
| `syncFromEditor` | `boolean` | `false` | No | Follow the editor's device preview. |

## Examples

### Composing the pieces by hand

```jsx
const [ breakpoint, setBreakpoint ] = useBreakpoint( { syncFromEditor: true } );
const { value, inheritedValue, hasValue, onChange } = useResponsiveAttribute( {
	attrName: 'columnGap',
	breakpoint,
	attributes,
	setAttributes,
} );

<BreakpointSwitcher
	value={ breakpoint }
	onChange={ setBreakpoint }
	hasValue={ hasValue }
/>
<RangeControl value={ value } placeholder={ inheritedValue } onChange={ onChange } />
```

## Behavior

- `useResponsiveAttribute` returns `value` (own), `inheritedValue` (ancestors only) and
  `resolvedValue` (`value ?? inheritedValue`), plus `hasOwnValue`, the `hasValue` map,
  `attrNameForBreakpoint`, `onChange`, `reset` and `resetAll`.
- `resetAll` clears every non-base attribute and leaves the base value alone.
- `useBreakpoint` returns a `[ breakpoint, setBreakpoint ]` tuple. Editor device types are
  capitalized (`'Tablet'`); the hook converts in both directions.
- An editor device type with no matching breakpoint id is ignored rather than guessed at.

## Styling

Not applicable — these hooks render nothing.

## Gotchas

- `useResponsiveAttribute` takes `attributes`/`setAttributes` as arguments and does not read
  a store, so it works outside a block but will not magically find the current block.
- `0` and `false` are values and do not fall back. `''`, `null` and `undefined` do.

## Related

- [`BreakpointSwitcher`](../components/BreakpointSwitcher/README.md)
- [`ResponsiveControl`](../controls/ResponsiveControl/README.md)
```

- [ ] **Step 9: Typecheck, test, commit**

```bash
npm run typecheck --workspace=packages/gutenberg
npm test --workspace=packages/gutenberg
git add packages/gutenberg/src/controls packages/gutenberg/src/hooks/README.md
git commit -m "feat(controls): add ResponsiveControl

Wires the switcher, the selection state and the attribute plumbing into one wrapper, and
hands resolved values to a render prop.

A render prop rather than cloneElement, because @wordpress/components does not name the
value prop consistently -- SelectControl uses value, RadioControl uses selected,
ToggleControl uses checked -- so cloning would have to guess. This library already hit that
inconsistency in RadioField.

The reset button never appears on the base breakpoint: its value is the thing being
overridden, not an override."
```

---

## Task 9: README drift guard

**Files:**
- Create: `packages/gutenberg/tests/helpers/props-from-interface.ts`
- Create: `packages/gutenberg/tests/readme-props-drift.test.ts`

**Interfaces:**
- Consumes: the READMEs and props interfaces from Tasks 7–8.
- Produces: a test that fails when a README's `## Props` table and its TypeScript interface disagree.

Docs and MCP descriptions are to be generated from these READMEs. A generator reading a
stale README produces confident, wrong documentation, which is worse than none — so the two
are pinned to each other.

- [ ] **Step 1: Write the failing test**

Create `packages/gutenberg/tests/readme-props-drift.test.ts`:

```ts
import path from 'node:path';
import { propsFromInterface, propsFromReadme } from './helpers/props-from-interface';

const SRC = path.resolve( __dirname, '..', 'src' );

const CASES = [
	{
		name: 'BreakpointSwitcher',
		readme: path.join( SRC, 'components/BreakpointSwitcher/README.md' ),
		types: path.join( SRC, 'components/BreakpointSwitcher/types.ts' ),
		interfaceName: 'BreakpointSwitcherProps',
	},
	{
		name: 'ResponsiveControl',
		readme: path.join( SRC, 'controls/ResponsiveControl/README.md' ),
		types: path.join( SRC, 'controls/ResponsiveControl/types.ts' ),
		interfaceName: 'ResponsiveControlProps',
	},
];

describe.each( CASES )(
	'$name README documents its props',
	( { readme, types, interfaceName } ) => {
		it( 'matches the declared props in both directions', () => {
			const documented = propsFromReadme( readme );
			const declared = propsFromInterface( types, interfaceName );

			expect(
				declared.filter( ( prop ) => ! documented.includes( prop ) )
			).toEqual( [] );

			expect(
				documented.filter( ( prop ) => ! declared.includes( prop ) )
			).toEqual( [] );
		} );
	}
);
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test --workspace=packages/gutenberg -- readme-props-drift`
Expected: FAIL — cannot resolve `./helpers/props-from-interface`.

- [ ] **Step 3: Implement the helper**

Create `packages/gutenberg/tests/helpers/props-from-interface.ts`:

```ts
import { readFileSync } from 'node:fs';
import ts from 'typescript';

/**
 * Property names declared on an interface, read from the TypeScript AST.
 *
 * Uses the compiler API rather than a regex because optional markers, generics and
 * multi-line types make interface members genuinely hard to match textually, and a false
 * negative here would let documentation drift silently.
 */
export function propsFromInterface(
	filePath: string,
	interfaceName: string
): string[] {
	const source = ts.createSourceFile(
		filePath,
		readFileSync( filePath, 'utf8' ),
		ts.ScriptTarget.Latest,
		true
	);

	const names: string[] = [];

	const visit = ( node: ts.Node ): void => {
		if (
			ts.isInterfaceDeclaration( node ) &&
			node.name.text === interfaceName
		) {
			for ( const member of node.members ) {
				if ( ts.isPropertySignature( member ) && member.name ) {
					names.push( member.name.getText( source ) );
				}
			}
		}

		ts.forEachChild( node, visit );
	};

	visit( source );

	if ( names.length === 0 ) {
		throw new Error(
			`No properties found for interface "${ interfaceName }" in ${ filePath }`
		);
	}

	return names;
}

/**
 * Property names documented in a README's `## Props` table, taken from the first
 * backticked cell of each row.
 */
export function propsFromReadme( filePath: string ): string[] {
	const markdown = readFileSync( filePath, 'utf8' );
	const afterHeading = markdown.split( /^##\s+Props\s*$/m )[ 1 ];

	if ( afterHeading === undefined ) {
		throw new Error( `No "## Props" section in ${ filePath }` );
	}

	const section = afterHeading.split( /^##\s+/m )[ 0 ];

	return [ ...section.matchAll( /^\|\s*`([^`]+)`/gm ) ].map(
		( match ) => match[ 1 ]
	);
}
```

- [ ] **Step 4: Run the test**

Run: `npm test --workspace=packages/gutenberg -- readme-props-drift`
Expected: PASS.

If it fails, the README is wrong, not the test — fix the table.

- [ ] **Step 5: Commit**

```bash
git add packages/gutenberg/tests/helpers/props-from-interface.ts packages/gutenberg/tests/readme-props-drift.test.ts
git commit -m "test: pin README prop tables to their TypeScript interfaces

Docs and MCP descriptions will be generated from these READMEs, and a generator reading a
stale README produces confident, wrong documentation -- worse than none. The guard walks the
TypeScript AST for declared props and compares both directions, so an undocumented prop and
a documented-but-deleted prop both fail."
```

---

## Task 10: Example block and manual verification

**Files:**
- Create: `examples/test-blocks/src/responsive-demo/block.json`
- Create: `examples/test-blocks/src/responsive-demo/index.js`
- Modify: `examples/test-blocks/test-blocks.php`
- Modify: `.agents/status.md`

**Interfaces:**
- Consumes: `ResponsiveControl` from `@isudev/gutenberg/controls`.
- Produces: a block that exercises both variants in a real editor.

- [ ] **Step 1: Write the block metadata**

Create `examples/test-blocks/src/responsive-demo/block.json`:

```json
{
	"$schema": "https://schemas.wp.org/trunk/block.json",
	"apiVersion": 3,
	"name": "isudev/responsive-demo",
	"title": "ISUdev Responsive Demo",
	"category": "widgets",
	"icon": "smartphone",
	"description": "Exercises ResponsiveControl in both switcher variants.",
	"textdomain": "isudev-test-blocks",
	"attributes": {
		"columnGap": { "type": "number" },
		"columnGapTablet": { "type": "number" },
		"columnGapMobile": { "type": "number" },
		"layout": { "type": "string" },
		"layoutTablet": { "type": "string" },
		"layoutMobile": { "type": "string" }
	},
	"editorScript": "file:./index.js"
}
```

`apiVersion` is 3 so the block does not force the post editor out of its iframe.

- [ ] **Step 2: Write the block**

Create `examples/test-blocks/src/responsive-demo/index.js`:

```jsx
import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { ResponsiveControl } from '@isudev/gutenberg/controls';

import metadata from './block.json';

const LAYOUT_OPTIONS = [
	{ label: __( 'Grid', 'isudev-test-blocks' ), value: 'grid' },
	{ label: __( 'Slider', 'isudev-test-blocks' ), value: 'slider' },
	{ label: __( 'Stack', 'isudev-test-blocks' ), value: 'stack' },
];

registerBlockType( metadata.name, {
	edit( { attributes, setAttributes } ) {
		const blockProps = useBlockProps();

		return (
			<div { ...blockProps }>
				<InspectorControls>
					<PanelBody
						title={ __( 'Responsive demo', 'isudev-test-blocks' ) }
					>
						{ /* Inline switcher: always-visible row of icons. */ }
						<ResponsiveControl
							attrName="columnGap"
							label={ __( 'Column Gap', 'isudev-test-blocks' ) }
							attributes={ attributes }
							setAttributes={ setAttributes }
						>
							{ ( { value, inheritedValue, onChange } ) => (
								<RangeControl
									min={ 0 }
									max={ 100 }
									value={ value }
									placeholder={ inheritedValue }
									onChange={ onChange }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							) }
						</ResponsiveControl>

						{ /* Dropdown switcher, linked to the editor's device preview. */ }
						<ResponsiveControl
							attrName="layout"
							label={ __( 'Layout', 'isudev-test-blocks' ) }
							variant="dropdown"
							syncToEditor
							syncFromEditor
							attributes={ attributes }
							setAttributes={ setAttributes }
						>
							{ ( { value, onChange } ) => (
								<SelectControl
									value={ value ?? '' }
									options={ [
										{ label: '—', value: '' },
										...LAYOUT_OPTIONS,
									] }
									onChange={ onChange }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							) }
						</ResponsiveControl>
					</PanelBody>
				</InspectorControls>

				<p>
					{ __( 'Resolved per breakpoint:', 'isudev-test-blocks' ) }
				</p>
				<ul>
					<li>
						{ `desktop — gap: ${
							attributes.columnGap ?? '—'
						}, layout: ${ attributes.layout || '—' }` }
					</li>
					<li>
						{ `tablet — gap: ${
							attributes.columnGapTablet ??
							attributes.columnGap ??
							'—'
						}, layout: ${
							attributes.layoutTablet ||
							attributes.layout ||
							'—'
						}` }
					</li>
					<li>
						{ `mobile — gap: ${
							attributes.columnGapMobile ??
							attributes.columnGapTablet ??
							attributes.columnGap ??
							'—'
						}, layout: ${
							attributes.layoutMobile ||
							attributes.layoutTablet ||
							attributes.layout ||
							'—'
						}` }
					</li>
				</ul>
			</div>
		);
	},

	save() {
		return null;
	},
} );
```

The list makes the cascade visible in the editor without opening devtools — the fastest way
to spot a resolution bug.

- [ ] **Step 3: Register the block in PHP**

In `examples/test-blocks/test-blocks.php`, replace the body of `register_blocks()` so every
built block registers itself and adding a third block needs no PHP change:

```php
/**
 * Register example blocks from their compiled metadata.
 *
 * Every directory under build/ is registered, so adding an example block is a matter of
 * adding a src/ directory — there is nothing to list here.
 */
function register_blocks(): void {
	foreach ( glob( __DIR__ . '/build/*', GLOB_ONLYDIR ) as $block_dir ) {
		register_block_type( $block_dir );
	}
}
```

The existing `add_action( 'init', __NAMESPACE__ . '\\register_blocks' );` line stays as-is.

While in this file, bump the plugin header's `Requires at least:` from `6.6` to `7.0`, since
the library's toolchain now targets WP 7.0.

- [ ] **Step 4: Build and verify in the editor**

Run, in a normal terminal:

```bash
npm run build --workspace=packages/gutenberg
npm run build:example
```

Then in wp-admin, add the **ISUdev Responsive Demo** block to a post and check:

1. The Column Gap row shows three icons; Desktop is selected.
2. Set gap 24 on Desktop. Switch to Tablet: the range is empty and shows 24 as placeholder;
   the list line for tablet reads 24.
3. Set gap 0 on Mobile. The mobile line reads 0, **not** 24 — the zero-is-a-value rule.
4. Tablet and Mobile icons show the override dot; Desktop never does.
5. A Reset button appears on Tablet and Mobile but not on Desktop.
6. The Layout row shows a single dropdown button; opening it lists all three breakpoints with
   the active one marked.
7. Changing the Layout breakpoint also changes the editor's device preview, and using the
   editor's own preview switcher moves the Layout breakpoint. Column Gap does not follow,
   since it opted out.
8. Open the browser console: no warnings from `@isudev/gutenberg`, no React key or hook
   warnings.

Fix anything that fails before continuing. If step 7 misbehaves, check
`core/editor`'s device-type values are capitalized.

- [ ] **Step 5: Update the project status**

Rewrite the "Where we are" and "Next steps" sections of `.agents/status.md` to record: the
wp-7.0 toolchain, the Jest harness, discovered entries and wildcard exports, the breakpoints
kernel, both hooks, `BreakpointSwitcher`, `ResponsiveControl`, the README contract with its
drift guard, and `verify:package`. Remove the items this plan completed from "Next steps"
and keep the remaining ones: `TextField`/`ToggleField`/`CheckboxField`, the remaining meta
and taxonomy wrappers, the other stage 7 components, the searchable options mode, and the
CSS strategy still deferred to whichever component first needs a stylesheet.

- [ ] **Step 6: Full verification and commit**

```bash
npm run typecheck --workspace=packages/gutenberg
npm test --workspace=packages/gutenberg
npm run verify:package --workspace=packages/gutenberg
git add examples/test-blocks .agents/status.md
git commit -m "example: add a responsive-demo block exercising both switcher variants

Covers the inline variant on a RangeControl and the dropdown variant on a SelectControl with
editor-preview sync enabled, and prints the resolved value per breakpoint so a cascade bug
is visible in the editor rather than only in devtools."
```

---

## Self-Review

**Spec coverage.** Walked each spec section against the plan:

| Spec section | Task |
|---|---|
| §4 Architecture (4 units) | 4, 5, 6, 7, 8 |
| §5 Breakpoint model, validation | 4 |
| §6 Value semantics, presence, cascade | 4, 5 |
| §7 BreakpointSwitcher, both variants, experimental risk | 7 |
| §8 ResponsiveControl, render prop | 8 |
| §9.1 Wildcard exports | 3 |
| §9.2 `@wordpress/icons` peer | 1 |
| §9.3 `verify:package` | 3 |
| §9.4 WP 7.0 toolchain, React ranges | 1 |
| §10 No CSS in v1, iframe rules | 7 (inline-styled dot, `DropdownMenu`), Global Constraints |
| §11 README contract + drift guard | 7, 8, 9 |
| §12 Testing | 2, and every subsequent task |
| §13 Example block | 10 |
| §14 Deliverables 1–9 | all |

Two spec items are deliberately **not** tasks, both listed in spec §15 as out of scope:
`BreakpointProvider` and the library-wide CSS strategy. `sideEffects` stays `false`, which is
correct while no stylesheet ships; Global Constraints and the BreakpointSwitcher README both
record that it must change when one does.

**Placeholder scan.** No `TBD`, no "add error handling", no "similar to Task N", no "write
tests for the above". Every code step carries the actual code, including Task 10 step 3,
which was rewritten against the real contents of `test-blocks.php` after the first draft
described the change abstractly.

**Type consistency.** Checked the names crossing task boundaries:
- `isPresent`, `resolveAttrName`, `resolveCascade`, `buildHasValueMap`, `validateBreakpoints`, `useValidatedBreakpoints` — defined in Task 4, used identically in 5, 6, 7.
- `resolveCascade`'s `options.skipActive` — introduced in Task 4's signature and tests, consumed in Task 5.
- `UseResponsiveAttributeResult` — defined in Task 5, extended by `ResponsiveControlRenderArgs` in Task 8.
- `BreakpointSwitcherProps` — defined in Task 7, referenced by the Task 9 drift test with the matching file path.
- `optionLabel` — defined in `InlineSwitcher.tsx` in Task 7 step 6 and imported by `DropdownSwitcher.tsx` in step 7. Slightly odd home for a shared helper, but it keeps the file count down and the import is explicit.
- `hasValue` is a `Record<string, boolean>` everywhere, and the base is always `false` in it — asserted in Task 4, relied on in Task 7's label logic and Task 8's reset logic.

Three problems found and actually fixed while reviewing, rather than merely noted:

1. Task 2's Jest config carried `setupFilesAfterEach`, which is not a Jest option. Jest
   ignores unknown keys, so this would not have errored — it would have quietly looked like
   configuration that worked. Removed; `setupFilesAfterEnv` is the real option and remains.
2. Task 10 step 3 described the PHP change abstractly. `test-blocks.php` has since been read
   and the step now carries the exact replacement, including the plugin header's
   `Requires at least` bump.
3. The test suite was too large, in the specific ways that produce brittle tests and wasted
   review. Cut: the Jest smoke test (a test asserting that Jest works), the step that broke
   the drift guard to prove it could fail, standalone tests for `resolveAttrName` (string
   concatenation), the `initial` prop pass-through test, the `console.warn` spy for invalid
   breakpoints (already covered directly by `validateBreakpoints`), and several
   "renders the label" assertions folded into the behavioral tests that already pass through
   them. Exact test counts were removed from the verification steps so nobody optimizes for a
   number. What remains covers the presence rule, cascade resolution, attribute selection,
   write/reset/resetAll, the sync directions, and the two variants' selection behavior.

---

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — a fresh subagent per task, with review between tasks.
2. **Inline Execution** — tasks executed in this session with checkpoints.
