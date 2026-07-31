# Local development workflow

Goal: iterate on `@isudev/gutenberg` and see changes in the WordPress Gutenberg editor
without publishing to npm.

## Why this works without `npm link` headaches

`@wordpress/*` and `react` are **externalized** by the block build
(`@wordpress/scripts` → `DependencyExtractionWebpackPlugin`) to WordPress globals. The
library ships them as externals too (see decision 0002). So there is exactly one React /
`wp.element` at runtime — the classic "duplicate React / invalid hook call" problem does
not occur. npm workspaces then symlink the library into the example plugin.

## Node version

The package requires Node 20 (`engines.node`), and `.nvmrc` pins 20.19.6. On this machine a
system Node 16 at `/usr/local/bin/node` takes precedence over nvm in a non-login shell, so
`node --version` can report 16 even with nvm installed — which breaks Jest, tsup and
`@wordpress/scripts` in confusing ways.

Run `nvm use` first, or prefix commands explicitly:

```bash
export PATH="$HOME/.nvm/versions/node/v20.19.6/bin:$PATH"
```

## One-time setup

```bash
# From the repo root:
npm install

# Symlink the example plugin into your local WordPress site.
# Set WP_PLUGINS_DIR to your own site's plugins directory — never commit a real path.
export WP_PLUGINS_DIR="$HOME/<path-to-your-site>/wp-content/plugins"

ln -s "$PWD/examples/test-blocks" "$WP_PLUGINS_DIR/isudev-test-blocks"
```

Keep `WP_PLUGINS_DIR` out of the repository. Export it from your shell profile, or put it
in `.env.local` — `.env*` is gitignored.

Then activate **"ISUdev Gutenberg — Test Blocks"** in wp-admin → Plugins.

## Day-to-day loop

Run two watchers (two terminals):

```bash
npm run dev            # tsup --watch → rebuilds packages/gutenberg/dist on save
npm run start:example  # wp-scripts start → rebuilds examples/test-blocks/build on save
```

Edit library source → `dist/` rebuilds → the example build picks it up → refresh the
Gutenberg editor. Add the `Demo` block to a post to exercise the components.

## Notes

- The library must be built at least once (`npm run build`) before the example build can
  resolve it.
- Build entries are discovered from the filesystem; subpath `exports` are not. A new
  `components/<Name>/index.ts` (or `controls/`, `fields/`) is automatically a build entry and
  is already covered by the wildcard export for its category, so there is nothing to
  register. A **new top-level directory** under `src/` becomes a build entry automatically
  but is not importable until you add its `exports` key to `package.json` by hand.
- Run `npm run verify:package` before publishing. The workspace symlink resolves the whole
  package directory, so a broken `files` or `exports` field is invisible locally and would
  surface only for the first consumer installing from npm.
