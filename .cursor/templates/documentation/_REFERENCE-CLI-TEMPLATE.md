# CLI Reference Page Template

> Reference pages are **information-oriented**. CLI reference pages document every command in a command group with full usage, options, arguments, and examples.

## Template

```markdown
# {Command Group} Commands

{One sentence describing what this group of commands does.}

## Commands

| Command | Description |
|---------|-------------|
| `{app} {group} {command1}` | {Brief description} |
| `{app} {group} {command2}` | {Brief description} |
| `{app} {group} {command3}` | {Brief description} |

---

## `{app} {group} {command1}`

{One sentence description of what this command does.}

### Usage

```
{app} {group} {command1} [OPTIONS] {REQUIRED_ARG}
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `{REQUIRED_ARG}` | Yes | {Description} |

### Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--{option1}` | `-{o}` | string | — | {Description} |
| `--{option2}` | | integer | `10` | {Description} |
| `--format` | `-f` | string | `text` | Output format: `text`, `json`, `csv` |
| `--verbose` | `-v` | flag | `false` | Enable verbose output |
| `--help` | `-h` | flag | | Show help message |

### Examples

**Basic usage:**

```bash
$ {app} {group} {command1} my-resource
{expected output}
```

**With options:**

```bash
$ {app} {group} {command1} my-resource --format json --{option1} value
{expected json output}
```

**Piping output:**

```bash
$ {app} {group} {command1} my-resource --format json | jq '.name'
"my-resource"
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | General error |
| `2` | Invalid arguments |
| `{N}` | {Specific error} |

---

## `{app} {group} {command2}`

{Continue the same pattern for each command...}

---

## Global Options

These options apply to all `{app} {group}` commands:

| Option | Short | Description |
|--------|-------|-------------|
| `--config` | `-c` | Path to configuration file |
| `--quiet` | `-q` | Suppress non-essential output |
| `--no-color` | | Disable colored output |

## Environment Variables

| Variable | Description | Overrides |
|----------|-------------|-----------|
| `{APP}_CONFIG` | Default configuration file path | `--config` |
| `{APP}_TOKEN` | Authentication token | `--token` |
| `{APP}_LOG_LEVEL` | Logging verbosity | `--verbose` |

## See Also

- [{Group} Tutorial](../tutorials/{group}-tutorial.md)
- [Configuration Reference](./configuration.md)
- [{Related Group} Commands](./{related-group}-commands.md)
```

## Writing Guidelines

1. **Document every option** — include type, default, and description for each
2. **Show realistic examples** — use domain-appropriate names and data
3. **Include output** — show exactly what the user will see
4. **Cover exit codes** — scripts depend on these for error handling
5. **Document environment variables** — many users configure via env vars
6. **Show piping patterns** — CLI users chain commands; show how

## Traceability

| Field | Value |
|-------|-------|
| **Architecture Component** | {Link to CLI component in architecture docs} |
| **Domain** | {Which domain these commands operate on} |
| **Component** | {Which implementation component implements this} |
