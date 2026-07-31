# @isudev/gutenberg (monorepo)

Standalone component library for the WordPress Gutenberg editor, published to npm and
consumed **per component** via subpath exports.

The package is currently held at pre-publication version **`0.0.1`**. Version history will
start when the first npm release is prepared.

- Library: [`packages/gutenberg`](./packages/gutenberg)
- Example blocks (WP plugin): [`examples/test-blocks`](./examples/test-blocks)

**Agents / contributors: read [`AGENTS.md`](./AGENTS.md) first** — it carries the code map
and the core principles. All project knowledge (architecture plan, decisions, instructions,
skills, specs, plans) lives under [`.agents/`](./.agents/).

Every component lives in its own folder with its own `README.md` documenting all of its
features and usage examples; the docs and MCP tool descriptions are generated from those
files. Start from
[`.agents/instructions/adding-a-component.md`](./.agents/instructions/adding-a-component.md)
or
[`changing-a-component.md`](./.agents/instructions/changing-a-component.md).

## Importing modules

Prefer the narrowest public subpath so a block only exposes the component and its actual
dependencies to the consumer's bundler:

```js
import { BlockLinkControl } from '@isudev/gutenberg/controls/BlockLinkControl';
import { IconSelect } from '@isudev/gutenberg/components/IconSelect';
```

Category imports are also supported and remain tree-shakeable:

```js
import { BlockLinkControl, LinkText } from '@isudev/gutenberg/controls';
```

The complete current module catalog — each module's purpose, narrowest import and detailed
README — lives in the [package README](./packages/gutenberg/README.md#public-module-catalog).
That catalog is the documentation entry point until a dedicated GitBook is introduced.

## Local development

```bash
npm install                 # sets up workspaces (symlinks @isudev/gutenberg)
npm run dev                 # tsup --watch: rebuilds the library on save
npm run start:example       # wp-scripts start: rebuilds the demo blocks on save
```

The example plugin is symlinked into a local WordPress site at
`wp-content/plugins/isudev-test-blocks`. See
[`.agents/instructions/local-development.md`](./.agents/instructions/local-development.md).
