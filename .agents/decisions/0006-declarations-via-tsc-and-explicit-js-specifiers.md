# 0006 — Declarations via `tsc`, and explicit `.js` in relative specifiers

- Status: accepted
- Date: 2026-07-30

## Context

Decision 0005 gave every component its own folder, and `tsup` turns every `index.ts` into a
build entry. That took the package from 17 entry points to 25.

`tsup`'s `dts: true` builds a **separate rollup-plugin-dts program per entry**. At 25 entries
the declaration step stopped fitting in Node's default heap on a machine with a 4144 MB limit
and failed with `ERR_WORKER_OUT_OF_MEMORY`; it only completed with
`--max-old-space-size=6144`, taking 72 seconds. The JavaScript build takes under 200 ms. Every
future component would push that ceiling further, and the failure mode is memory-pressure
dependent, so it would appear to be intermittent — the worst kind of broken build.

Raising the heap in the build script was the obvious patch, but it treats a scaling problem as
a constant, and the number it hides behind grows with the library.

## Decision

**Emit declarations with `tsc`, not `tsup`.** `tsup` builds the JavaScript; a second step runs
`tsc -p tsconfig.build.json` with `emitDeclarationOnly`. `tsc` types the package once for all
entries, so cost stops scaling with entry count. Build time went from 72 s to under 7 s, and
the OOM class is gone. Because `dist/` mirrors `src/`, the emitted layout still lines up 1:1
with the subpath `exports` with no post-processing.

**Write relative import specifiers with an explicit `.js` extension** — `'./types.js'` for a
file, `'../../breakpoints/index.js'` for a directory.

This second part is not cosmetic; it is what makes the first part safe. `tsup`'s declaration
bundler inlined each entry into a single file, so extensionless relative imports never
survived into `dist/`. `tsc` preserves them, and Node's ESM resolution does not do extension
guessing: `@arethetypeswrong/cli` immediately reported `InternalResolutionError` on
`node16 (from ESM)` for every subpath. Explicit extensions make the emitted `.d.ts` files
resolvable under both Node ESM and bundler resolution, and `attw --profile esm-only` is green
again on all 16 subpaths.

TypeScript resolves `'./types.js'` to `./types.ts` under `moduleResolution: "Bundler"`, so
source, typecheck and the WordPress webpack build are all unaffected. Jest runs the
TypeScript directly, where the file really is `.ts`, so `jest.config.mjs` maps
`^(\.{1,2}/.*)\.js$` back to the extensionless path.

`declarationMap` stays off: the package does not publish `src/`, so declaration maps would
point at files the consumer never receives.

## Consequences

- Adding a component costs a folder and nothing else — no heap ceiling to raise, no entry list.
- **Every relative import in `src/` must carry `.js`.** A new file written without it still
  typechecks and still passes tests, and only shows up as an `attw` failure in
  `verify:package`. That gate is therefore load-bearing, not advisory.
- Declarations are per-file rather than bundled per entry, which is smaller and closer to the
  source, but means a `.d.ts` can import from a sibling `.d.ts` — fine for both resolvers, and
  the reason the extensions matter.
- `npm run dev` (`tsup --watch`) rebuilds JavaScript only. Type errors surface from
  `npm run typecheck` or the editor, not from the watch process.
- One more moving part in `build`: if `dist/` has JavaScript but no `.d.ts`, the `tsc` step
  failed while `tsup` succeeded.
