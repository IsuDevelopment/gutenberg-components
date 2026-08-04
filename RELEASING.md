# Releasing `@isudev/gutenberg`

Every command you need, in order, from "I am happy with the changes" to "it is on npm".

Releases are **tag-driven**. You never run `npm publish` yourself:
[`.github/workflows/release.yml`](.github/workflows/release.yml) does it when a `v*` tag
appears, authenticating over OIDC so there is no token anywhere. Your job is to get the
version number and the tag right.

## Branch model this assumes

| Branch | Purpose |
| --- | --- |
| `stage` | Default branch. All work lands here. CI runs on every push and pull request. |
| `main` | Release branch. Only ever fast-forwarded from `stage`. Tags point here, and the docs site deploys from it. |

So `main` always describes what is published, and `stage` is whatever is next.

---

## Before your first release

One-time setup, and **the release will fail with `ENEEDAUTH` until it is done**:

npmjs.com → Packages → `@isudev/gutenberg` → **Settings** → **Trusted publishing** → GitHub
Actions.

| Field | Value |
| --- | --- |
| Organization or user | `IsuDevelopment` |
| Repository | `gutenberg-components` |
| Workflow filename | `release.yml` |
| Allowed actions | tick **`npm publish`** |
| Environment name | *leave empty* |

**Every field is case-sensitive**, the workflow filename includes its `.yml`, and *Allowed
actions* is easy to miss — a configuration that allows nothing authorises nothing. A package
can have only one trusted publisher at a time.

The workflow filename is part of the authorisation. Renaming `release.yml`, or moving the
publish step into a reusable workflow, breaks it — npm authorises the workflow that *starts*
the run, not one it calls.

Three requirements on our side, all already satisfied — worth knowing if this ever breaks:
the job runs on a GitHub-hosted runner (self-hosted is not supported), it declares
`id-token: write`, and `repository.url` in `packages/gutenberg/package.json` resolves to the
same GitHub repository.

Optional hardening, once it works: in the same settings page, *Require two-factor
authentication and disallow tokens*. It blocks token-based publishing without affecting
trusted publishing, which closes the manual-publish escape hatch — so only turn it on if you
are content to fix the workflow rather than publish by hand.

---

## 1. Your work is on `stage` and pushed

Nothing special to do. There is no generated file to refresh: `AGENTS.md` and `catalog.json`
are built at pack time and at docs-build time, so a README edit needs no follow-up command.

Check that CI is green before going further:

```bash
gh run list --branch stage --limit 3
```

A red `ci` means the release will fail at the same step. Fix it first.

## 2. Decide the version

Semver, and the major is still `0`, so:

| Change | Bump | Example |
| --- | --- | --- |
| Bug fix, docs, internals — no API change | **patch** | `0.1.1` → `0.1.2` |
| New module, new prop, new behaviour | **minor** | `0.1.2` → `0.2.0` |
| Removed or renamed public API | **minor** while `0.x` | `0.2.0` → `0.3.0` |

While the major is `0`, a minor may break the API — that is what `0.x` means, and the package
README says so. Do not reach for `1.0.0` until the cleanups in `.agents/status.md` are done;
it is a promise of a stable API.

**If you added a module in this release**, its README's `since:` must be the version you are
about to publish. Check before bumping:

```bash
grep -rn "^since:" packages/gutenberg/src --include=README.md | grep -v "since: 0\.1\.0"
```

Anything listed there should either match the version you are releasing, or be corrected to
it. A `since:` that has already shipped is never renumbered.

## 3. Bump, on `stage`

```bash
git switch stage && git pull

npm version patch --no-git-tag-version --workspace=packages/gutenberg   # or minor
npm install --package-lock-only
```

`--no-git-tag-version` matters: the tag has to be created after the merge to `main`, not here.

Sanity-check what you are about to release:

```bash
npm run verify:package --workspace=packages/gutenberg
```

That builds, runs `publint --strict`, runs `attw`, and resolves all 35 public subpaths out of
a real packed tarball. If it is green locally it will be green in the release job.

```bash
VERSION="$(node -p "require('./packages/gutenberg/package.json').version")"
git commit -am "chore: release ${VERSION}"
git push origin stage
```

## 4. Fast-forward `main`

```bash
git switch main && git pull
git merge --ff-only stage
git push origin main
```

If `--ff-only` refuses, `main` has commits `stage` does not. Do not force it — merge `main`
into `stage` first, push `stage`, then come back.

Pushing `main` redeploys the docs site. That is expected.

## 5. Tag, which publishes

```bash
VERSION="$(node -p "require('./packages/gutenberg/package.json').version")"
git tag "v${VERSION}"
git push origin "v${VERSION}"
```

The workflow refuses to publish if the tag and `package.json` disagree, so a typo here costs
a red run rather than a wrong version in the registry.

Watch it:

```bash
gh run watch "$(gh run list --workflow release --limit 1 --json databaseId --jq '.[0].databaseId')" --exit-status
```

## 6. Verify, then announce

```bash
npm view @isudev/gutenberg version                  # the new version
npm view @isudev/gutenberg dist.attestations        # provenance is attached
gh release create "v${VERSION}" --generate-notes    # GitHub release notes
```

The workflow deliberately does not create the GitHub release. Publishing to npm and writing
release notes stay separate so a failure in one is not tangled up with the other.

---

## When something goes wrong

**The release run failed and nothing was published.** Fix the cause on `stage`, fast-forward
`main` again, then move the tag onto the new commit:

```bash
git tag -f "v${VERSION}" && git push -f origin "v${VERSION}"
```

Force-moving a tag is safe *only* while that version has never been published. Check with
`npm view @isudev/gutenberg versions` first.

**The version was published and it is broken.** Do not unpublish — npm forbids it after 72
hours and it breaks anyone who already installed. Deprecate and release a fix:

```bash
npm deprecate @isudev/gutenberg@0.1.2 "Broken build, use 0.1.3"
```

**The publish step failed with `ENEEDAUTH`.** The trusted publisher is not configured, or its
workflow filename does not match. See "Before your first release".

**You need to publish while the workflow is broken.** `provenance` is passed as a flag in the
workflow rather than set in `publishConfig` precisely so this still works:

```bash
npm login
npm publish --workspace=packages/gutenberg
```

Expect no provenance attestation on that version, and fix the workflow afterwards.

---

## What the release workflow actually does

So that a red run tells you something:

| Step | Fails when |
| --- | --- |
| `setup-node` (Node 24) | — it uses Node 24, not the repo's 22, because trusted publishing needs npm ≥ 11.5.1 and only Node 24 bundles it |
| `npm supports trusted publishing` | a Node 24 patch regressed the bundled npm below 11.5.1 |
| `npm ci` | the lockfile disagrees with `package.json` — you forgot `npm install --package-lock-only` |
| `Tag matches the package version` | the tag and `package.json` disagree |
| `npm test` | tests fail |
| `Packaging gate` | `publint`, `attw`, or the tarball smoke test fails |
| `Publish` | authentication, or the version already exists in the registry |
