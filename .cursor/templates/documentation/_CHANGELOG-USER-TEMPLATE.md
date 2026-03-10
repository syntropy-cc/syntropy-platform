# User-Facing Changelog Template

> The user-facing changelog records changes **from the user's perspective**. It describes what users can now do, what behaves differently, and what they need to migrate. It does not describe internal refactoring, code changes, or implementation details.

## Template

```markdown
# Changelog

All notable changes to {System Name} are documented here.

This project follows [Semantic Versioning](https://semver.org/) and this changelog follows [Keep a Changelog](https://keepachangelog.com/) format.

## [Unreleased]

{Changes that are merged but not yet released.}

### Added

- {New feature or capability described from user perspective}

### Changed

- {Behavior change described from user perspective}

### Deprecated

- {Feature that will be removed in a future version, with migration guidance}

### Removed

- {Feature that was removed, with migration guidance if applicable}

### Fixed

- {Bug fix described by the symptom the user experienced}

---

## [{Version}] - {YYYY-MM-DD}

### Added

- New `{command/endpoint/feature}` for {what it enables} ([documentation](../reference/{page}.md))
- Support for {capability} when using {feature}

### Changed

- The `{command/endpoint}` now {new behavior} instead of {old behavior}
- Default value for `{option}` changed from `{old}` to `{new}`

### Deprecated

- `{feature/flag/endpoint}` is deprecated and will be removed in v{X}.0. Use `{replacement}` instead. See [migration guide](../how-to/migrate-{feature}.md).

### Removed

- Removed `{feature/flag/endpoint}` (deprecated since v{Y}.0)

### Fixed

- Fixed {symptom} when {condition} ([#issue](link))
- {Command/endpoint} no longer {incorrect behavior} when {condition}

### Security

- {Security-related change, if any}

---

## [{Previous Version}] - {YYYY-MM-DD}

{Continue the pattern...}
```

## Writing Guidelines

1. **User perspective** — "New `export` command for downloading reports" not "Added ExportService class"
2. **Mention the affected surface** — name the command, endpoint, config option, or UI element
3. **Deprecation warnings** — always include the removal version and the replacement
4. **Migration guidance** — for breaking changes, link to a migration how-to guide
5. **Link to documentation** — new features should link to their documentation page
6. **Group by version** — unreleased changes at the top, then descending by version

## Categories

| Category | What Goes Here | Example |
|----------|----------------|---------|
| **Added** | New features, commands, endpoints | "New `pipeline run` command" |
| **Changed** | Behavior changes, default changes | "Default output format is now JSON" |
| **Deprecated** | Features being phased out | "`--legacy` flag deprecated, use `--v2`" |
| **Removed** | Features that no longer exist | "Removed XML output support" |
| **Fixed** | Bug fixes described by symptom | "Fixed timeout when processing large files" |
| **Security** | Vulnerability fixes, auth changes | "Fixed token not being invalidated on logout" |
