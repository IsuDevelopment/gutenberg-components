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
features and usage examples. Those files are the only source of documentation in the
project: the docs site, the machine-readable `catalog.json` and the agent guide shipped in
the tarball are all generated from them by `npm run catalog`. Start from
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

## Documentation

- **Docs site** — [`docs/`](./docs), a Starlight site whose reference pages are projected
  from the colocated READMEs. `npm run docs:dev` to work on it.
- **For coding agents** — the package ships
  `AGENTS.md` and `catalog.json`, both generated from the READMEs at pack time rather than
  committed. In a project that consumes the library, `npx @isudev/gutenberg init`
  vendors that guide and points the project's own `AGENTS.md` at it. The site publishes
  `llms.txt`, and [`context7.json`](./context7.json) covers agents using Context7.
- Decision [`0011`](./.agents/decisions/0011-agent-facing-documentation-pipeline.md)
  explains why there are four delivery paths and what each one is for.

## Local development

Node 22 (see [`.nvmrc`](./.nvmrc)).

```bash
npm install                 # sets up workspaces (symlinks @isudev/gutenberg)
npm run dev                 # tsup --watch: rebuilds the library on save
npm run start:example       # wp-scripts start: rebuilds the demo blocks on save
npm run docs:dev            # Starlight, with the READMEs synced on start
```

The example plugin is symlinked into a local WordPress site at
`wp-content/plugins/isudev-test-blocks`. See
[`.agents/instructions/local-development.md`](./.agents/instructions/local-development.md).
