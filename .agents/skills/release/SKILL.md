---
name: release
description: Cut and publish a new version of @nftx-dev/vue-ds to npm. Use when asked to release, publish, tag or bump the version of the design system, or to check whether the latest changes are published.
---

# Release @nftx-dev/vue-ds

The package is published with npm staged publishing: `npm stage publish` uploads the version, and the maintainer approves it with 2FA on npmjs.com. A plain `npm publish` fails with `EOTP` when there is no interactive terminal, so do not use it.

## 1. Check what is unreleased

```bash
npm view @nftx-dev/vue-ds dist-tags          # what npm serves as latest
git describe --tags --abbrev=0               # last local tag
git log --oneline v<last>..HEAD              # commits since then
git ls-remote --tags origin                  # tags on GitHub
```

## 2. Pick the version

Follow semver against the `[Unreleased]` section of `CHANGELOG.md`. Removed props, changed defaults or changed selectors are breaking and call for a major bump; state this to the maintainer before tagging, since the version cannot be reused once published.

## 3. Prepare the release commit

1. Rename `## [Unreleased]` in `CHANGELOG.md` to `## [X.Y.Z] - YYYY-MM-DD`.
2. `npm version X.Y.Z --no-git-tag-version` (updates `package.json` and `package-lock.json`).
3. `npm run verify` must pass.
4. Commit the three files as `chore(release): X.Y.Z`. No `[skip ci]`: it would skip checks on the exact commit that is published.
5. Create two annotated tags on that commit: `git tag -a vX.Y.Z -m vX.Y.Z` and `git tag -a NFTX_DS_X.Y.Z -m NFTX_DS_X.Y.Z`.

## 4. Push and stage

1. `git push --follow-tags origin main`.
2. `npm whoami` must print the package owner; otherwise run `npm login` (prints a browser link).
3. `npm run stage:publish` runs `verify` again and stages the version. Note the staged id in the output.
4. The maintainer approves the staged version on npmjs.com.

## 5. Confirm

```bash
npm view @nftx-dev/vue-ds dist-tags          # latest must be X.Y.Z
```

Then update consumers such as `portal` (`npm install @nftx-dev/vue-ds@X.Y.Z`).
