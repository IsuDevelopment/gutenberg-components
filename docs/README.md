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

Cloudflare Workers static assets, from `.github/workflows/docs.yml` on every push to
`master` that touches the docs or the READMEs they are built from. `wrangler.jsonc` holds
the Worker name and points at `dist/`; nothing runs server-side.

One-time setup outside the repository:

1. **Cloudflare API token** — My Profile → API Tokens → Create Token, template *Edit
   Cloudflare Workers*, scoped to this account. Store it as the GitHub Actions secret
   `CLOUDFLARE_API_TOKEN`.
2. **Account ID** — from any Cloudflare dashboard URL, or `npx wrangler whoami`. Store it as
   the secret `CLOUDFLARE_ACCOUNT_ID`.
3. **Public origin** — store it as the GitHub Actions *variable* `DOCS_SITE`. The workflow
   fails fast when it is missing, because `llms.txt` and the sitemap embed absolute URLs and
   a deploy without it would publish links to `http://localhost:4321`. The first deploy
   creates the Worker and prints its `*.workers.dev` hostname; set `DOCS_SITE` to that, or to
   a custom domain attached in the Worker's Settings → Domains & Routes.

Locally:

```bash
DOCS_SITE=https://example.com npm run docs:build
npm run deploy:dry-run --workspace=docs   # validates wrangler.jsonc without deploying
```

**The site must be served from the root of its origin.** The reference pages link to each
other with absolute paths (`/reference/controls/media-control/`), which a deploy under a
subpath — a GitHub Pages project site, say — would break. Both Workers and a custom domain
serve from the root, so this only becomes a constraint if the hosting changes.

## The `cookie` devDependency

Astro's prerender chunk imports `cookie` by bare specifier from `docs/dist/`, and npm hoists
the CommonJS `cookie@0.7.2` that `@wordpress/scripts` pulls in for the example plugin to the
repository root — so that is what resolution finds, and the ESM named imports fail. Declaring
`cookie@^2` here puts the ESM copy in `docs/node_modules/`, where it wins. It is a build-time
resolution fix, not something this site imports.
