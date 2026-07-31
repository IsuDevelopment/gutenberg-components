# Specs

Approved designs, one file per feature: `YYYY-MM-DD-<topic>-design.md`.

A spec is the *what* and *why* — architecture, component boundaries, data flow, error
handling, testing strategy — settled and agreed before any code exists. Its matching plan
in `../plans/` is the *how*.

Specs live here, not under `docs/`, because they are shared working context for everyone
on the project (human or agent) rather than published documentation. User-facing docs are
generated from the per-component `README.md` files under `packages/gutenberg/src/`.

A spec is a record of a decision, so amend it rather than rewriting history: when
implementation proves part of it wrong, add a dated amendment section explaining what
changed and why. If the change is architectural, also record an ADR in `../decisions/`.
