# Configuration Reference Page Template

> Reference pages are **information-oriented**. The configuration reference documents every configuration option the system accepts, organized by section.

## Template

```markdown
# Configuration Reference

{System Name} is configured through {configuration method: file, environment variables, CLI flags, or a combination}. This page documents every configuration option.

## Configuration File

The default configuration file is located at `{default_path}`. Specify an alternative with:

```bash
{app} --config /path/to/config.{ext}
```

### Minimal Configuration

```{yaml/toml/json}
{minimal working configuration with only required fields}
```

### Complete Configuration

```{yaml/toml/json}
{complete configuration with all options and their defaults, commented}
```

---

## {Section Name}

{Brief description of what this section configures.}

| Option | Type | Default | Required | Description |
|--------|------|---------|----------|-------------|
| `{section}.{option1}` | string | `"{default}"` | Yes | {Description} |
| `{section}.{option2}` | integer | `{default}` | No | {Description}. Range: {min}–{max}. |
| `{section}.{option3}` | boolean | `{default}` | No | {Description} |
| `{section}.{option4}` | list | `[]` | No | {Description} |
| `{section}.{option5}` | enum | `"{default}"` | No | {Description}. Values: `{a}`, `{b}`, `{c}`. |

### Example

```{yaml/toml/json}
{section}:
  {option1}: "value"
  {option2}: 42
  {option3}: true
```

---

## {Another Section}

{Continue the same pattern for each configuration section...}

---

## Environment Variables

All configuration options can be overridden with environment variables. The mapping follows this pattern:

```
{APP_PREFIX}_{SECTION}_{OPTION} = value
```

| Environment Variable | Config Equivalent | Example |
|----------------------|-------------------|---------|
| `{APP}_DATABASE_URL` | `database.url` | `postgres://localhost/mydb` |
| `{APP}_LOG_LEVEL` | `logging.level` | `info` |
| `{APP}_PORT` | `server.port` | `8080` |

Environment variables take precedence over configuration file values.

## Configuration Precedence

Configuration is resolved in this order (highest precedence first):

1. **CLI flags** — `--{option} value`
2. **Environment variables** — `{APP}_{OPTION}=value`
3. **Configuration file** — `{config_path}`
4. **Built-in defaults**

## Validation

{System Name} validates configuration on startup. Invalid configuration produces an error with the specific field and reason:

```
Error: Invalid configuration
  → {section}.{option}: expected integer, got string "abc"
  → {section}.{option}: value 0 is below minimum (1)
```

## See Also

- [Installation Guide](../getting-started/installation.md)
- [How to Configure {Common Task}](../how-to/configure-{task}.md)
- [{CLI Commands Reference}](./cli/{commands}.md)
```

## Writing Guidelines

1. **Document every option** — include type, default, required status, and description
2. **Show defaults explicitly** — the reader needs to know what happens without configuration
3. **Provide minimal and complete examples** — minimal for quick start, complete for reference
4. **Document environment variable mapping** — many deployment environments use env vars
5. **Explain precedence** — when multiple sources conflict, which wins?
6. **Show validation errors** — help the reader debug configuration issues

## Traceability

| Field | Value |
|-------|-------|
| **Architecture Component** | {Link to configuration component in architecture docs} |
| **Cross-cutting Concern** | {If configuration relates to a cross-cutting concern} |
