# @isudev/gutenberg (monorepo)

Standalone component library for the WordPress Gutenberg editor, published to npm and
consumed **per component** via subpath exports.

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

## Local development

```bash
npm install                 # sets up workspaces (symlinks @isudev/gutenberg)
npm run dev                 # tsup --watch: rebuilds the library on save
npm run start:example       # wp-scripts start: rebuilds the demo blocks on save
```

The example plugin is symlinked into a local WordPress site at
`wp-content/plugins/isudev-test-blocks`. See
[`.agents/instructions/local-development.md`](./.agents/instructions/local-development.md).
