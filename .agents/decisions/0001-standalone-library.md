# 0001 — Standalone library, no host-project coupling

- Status: accepted
- Date: 2026-07-09
- Revised: 2026-07-30 (generalized; removed references to a specific prior codebase)

## Context

The library is published to npm and must be usable by anyone, in any WordPress
project. Component libraries that grow inside a single agency or product codebase
tend to accumulate coupling to that host: a project-wide config file, a global icon
registry, shared internal packages. Any of that would make the package unusable
outside its original home.

## Decision

`@isudev/gutenberg` is fully standalone. It reads no project-wide configuration
file and no global registry. Icons, option lists and configuration are **injected via
props**. Where prior art exists in another codebase, components are **reimplemented
from scratch** rather than copied, so no host-specific assumptions travel with them.

The only runtime dependencies are `@wordpress/*` packages, declared as peer
dependencies.

## Consequences

- Components in `components/` and `controls/` are written from scratch.
- `IconSelect` (and similar) accept an `icons` prop instead of reading a global source.
- No project-config layer anywhere in the codebase.
- Breakpoint sets are passed as a `breakpoints` prop with an exported default constant,
  not read from a global — see `0003-breakpoint-model.md`.
- Wider reuse and clean npm publishing, at the cost of rewriting rather than porting.
