# Changelog

## 0.1.0

Initial streamlined release.

### Security

- Execute Git commands with argv-based `execFileSync('git', args)` instead of shell-interpolated command strings.
- Validate branch names with `git check-ref-format --branch` before worktree creation.
- Use `git show-ref --verify --quiet` for branch-existence checks.
- Add regression coverage for shell metacharacters in Git arguments.

### Changed

- Update Pi imports to current `@earendil-works/*` packages.
- Package compiled JavaScript from `dist/index.js` for Pi ecosystem installs.
- Simplify README and package metadata for a cleaner public release.
- Replace Bun-oriented project setup with npm scripts and `package-lock.json`.

### Removed

- Remove legacy planning/memory artifacts from the published project.
- Remove release-please scaffolding and old release docs.
