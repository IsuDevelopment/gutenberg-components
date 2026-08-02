# Documentation site

Starlight (Astro) site for `@isudev/gutenberg`. It has no content of its own beyond the
landing page: every reference page is projected from the colocated READMEs in
`packages/gutenberg/src/<category>/<Name>/README.md` by `scripts/sync-content.mjs`.

```bash
npm run docs:dev       # sync + astro dev
npm run docs:build     # sync + astro build → docs/dist
npm run docs:preview   # serve the built site
```

## What is generated

`npm run sync` (run automatically by `dev` and `build`) writes:

- `src/content/docs/reference/<category>/<name>.md` — one page per module, frontmatter
  translated to Starlight's schema and relative `README.md` links rewritten to site paths.
- `src/content/docs/reference/<category>/index.md` — the category index. When the library
  ships a hand-written one (`src/hooks/README.md` does) it is used as the intro and the
  module table is appended.
- `src/content/docs/agents.md` — the agent guide, same content as the `AGENTS.md` shipped in
  the npm tarball.
- `public/catalog.json` — the machine-readable module catalog, served verbatim.

All of the above is gitignored. Edit the READMEs in `packages/gutenberg/src/`, never the
generated pages.

`starlight-llms-txt` adds `/llms.txt`, `/llms-full.txt` and `/llms-small.txt` at build time.

## Deploying

`llms.txt` embeds absolute URLs, so set `DOCS_SITE` to the real origin in the deploy
environment:

```bash
DOCS_SITE=https://example.com npm run docs:build
```

Without it the build falls back to `http://localhost:4321`, which is fine locally and wrong
in anything published.

## The `cookie` devDependency

Astro's prerender chunk imports `cookie` by bare specifier from `docs/dist/`, and npm hoists
the CommonJS `cookie@0.7.2` that `@wordpress/scripts` pulls in for the example plugin to the
repository root — so that is what resolution finds, and the ESM named imports fail. Declaring
`cookie@^2` here puts the ESM copy in `docs/node_modules/`, where it wins. It is a build-time
resolution fix, not something this site imports.
