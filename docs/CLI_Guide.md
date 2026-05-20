---
id: cli-guide
slug: /cli
sidebar_label: CLI Guide
sidebar_position: 8
---

# CLI Guide

The `agentic-pm` CLI manages APM installations, assistant configuration, template updates, and session archival. This doc covers every command, its options, and the directory structure the CLI creates.

## Installation

Requires Node.js v18 or higher.

**Global install (recommended):**

```bash
npm install -g agentic-pm
```

**Local install:**

```bash
npm install agentic-pm
```

After installing, navigate to the project directory and run `apm init` to initialize APM.

## Commands

### apm init

Initializes APM with official releases. Fresh installs only. If APM is already initialized, shows the current state and suggests `apm add`, `apm update`, or `apm archive`.

```bash
apm init
apm init -a claude
apm init -a claude copilot -t v1.0.0
```

| Flag | Description |
| :--- | :--- |
| `-t, --tag <tag>` | Install a specific release version |
| `-a, --assistant <id...>` | Pre-select assistant(s) to install |

The command fetches the latest compatible release from GitHub, prompts for assistant selection (unless `--assistant` is provided), downloads the assistant bundle, and installs:

- `.apm/` directory with project artifact templates (Spec, Plan, Tracker, Memory Index, metadata)
- Commands, guides, skills, and Agent files into the platform-specific directory (e.g. `.claude/`, `.cursor/`, `.github/`)

### apm custom

Installs APM from a custom or third-party repository instead of the official releases. Also manages saved custom repositories.

```bash
apm custom
apm custom -r owner/repo
apm custom -r owner/repo -t v1.0.0 -a claude
```

| Flag | Description |
| :--- | :--- |
| `-r, --repo <repo>` | Repository in `owner/repo` format |
| `-t, --tag <tag>` | Install specific release version (requires `--repo`) |
| `-a, --assistant <id...>` | Pre-select assistant(s) to install |
| `--add-repo <repos...>` | Save custom repository(ies) for future use |
| `--remove-repo <repos...>` | Remove saved repository(ies) |
| `--list` | List saved custom repositories |
| `--clear` | Clear all saved custom repositories |
| `-f, --force` | Skip confirmation prompts |

Without `--repo`, the CLI offers selection from saved repositories (managed via `--add-repo` and `--remove-repo`). Custom repositories show a security disclaimer on first use, which can be skipped for saved repositories.

> **Note:** When a saved repository has the disclaimer skip enabled, no security warning is shown during `apm custom`, `apm add`, or `apm update` for that repository. If the repository is later compromised, the user receives no warning. Use `apm custom --list` to review which repositories have the disclaimer skipped. See the [Security Guide](Security_Guide.md) for details.

**Repository management:**

```bash
apm custom --add-repo owner/repo
apm custom --remove-repo owner/repo
apm custom --list
apm custom --clear
```

### apm update

Updates installed assistant templates to the latest compatible version. Archives the current session before updating.

```bash
apm update
apm update -f
apm update -n pre-update-backup
```

| Flag | Description |
| :--- | :--- |
| `-f, --force` | Skip confirmation prompt |
| `-n, --name <name>` | Custom archive name for the pre-update snapshot |

The update process:

1. Archives the current `.apm/` artifacts to `.apm/archives/`
2. Removes all tracked assistant files
3. Downloads and installs the latest compatible release
4. Writes fresh metadata

For official installations, the CLI prefers stable releases. If currently on a pre-release, it offers both the latest stable and the latest pre-release as options. For custom installations, the User selects from available releases newer than the current version.

| Component | Behavior on update |
| :--- | :--- |
| Commands, guides, skills, agents | Replaced with latest version |
| `.apm/` project artifacts | Archived before replacement |
| `.apm/archives/` | Preserved |

### apm archive

Archives the current APM session or manages existing archives.

```bash
apm archive
apm archive -n my-feature-v1
apm archive -l
apm archive --delete session-2026-03-04-001
apm archive --clear
```

| Flag | Description |
| :--- | :--- |
| `-f, --force` | Skip confirmation prompt |
| `-n, --name <name>` | Custom archive directory name |
| `-l, --list` | List archived sessions with metadata |
| `--delete <name>` | Delete a specific archive |
| `--clear` | Delete all archives |

When creating an archive, the CLI:

1. Snapshots `.apm/` artifacts (Spec, Plan, Tracker, Memory, session summary if present) to `.apm/archives/session-YYYY-MM-DD-NNN/`
2. Writes `metadata.json` to the archive with the archival timestamp
3. Removes all tracked assistant files
4. Deletes installation metadata

After archival, the project is uninitialized. The User runs `apm init` to begin a new APM session with fresh templates. Archives remain accessible in `.apm/archives/` and are detected by the Planner during Context Gathering in subsequent sessions.

### apm add

Adds assistant(s) to an existing installation without affecting the current APM session.

```bash
apm add
apm add -a copilot
apm add -a copilot opencode cursor
```

| Flag | Description |
| :--- | :--- |
| `-a, --assistant <id...>` | Assistant(s) to add |

Fetches the same release version currently installed and shows only uninstalled assistants. Without `--assistant`, prompts for selection. For custom installations, the security disclaimer is shown unless the repository has it skipped - matching the behavior of `apm custom` and `apm update`.

### apm remove

Removes assistant(s) from the installation.

```bash
apm remove
apm remove -a copilot
apm remove -a copilot opencode -f
```

| Flag | Description |
| :--- | :--- |
| `-a, --assistant <id...>` | Assistant(s) to remove |
| `-f, --force` | Skip confirmation prompt |

Removes tracked files for the specified assistant(s) and updates metadata. Warns when removing all assistants. The `.apm/` project artifacts are preserved.

### apm status

Shows the current installation state.

```bash
apm status
```

Displays: source (official or custom), repository, release version, CLI version, install date, installed assistants with file counts, and archive count. If APM is not initialized, shows archive count if any exist or suggests `apm init`.

## Directory Structure

After initialization, APM creates the following structure (paths shown for Cursor, other platforms use their own directories):

```text
project/
├── .apm/
│   ├── spec.md                # Design decisions and constraints
│   ├── plan.md                # Stages, Tasks, dependencies
│   ├── tracker.md             # Live project state
│   ├── memory/
│   │   └── index.md           # Durable project memory
│   ├── bus/                   # Message Bus (created by Planner)
│   ├── archives/              # Archived sessions (created by apm archive)
│   └── metadata.json          # Installation metadata
├── .cursor/
│   ├── commands/              # APM commands
│   ├── apm-guides/            # Procedure guides
│   ├── skills/                # Shared procedural skills
│   └── agents/                # Subagent configurations
└── ...
```

Platform-specific directories: `.claude/` for Claude Code, `.github/` for GitHub Copilot, `.antigravity/` for Antigravity, `.opencode/` for OpenCode, `.codex/` and `.agents/` for Codex (guides and agents go to `.codex/`; commands and skills go to `.agents/skills/`).

## Versioning

The CLI and template releases version independently but share major version for compatibility.

| Track | Distribution | Update method |
| :--- | :--- | :--- |
| **CLI** (`agentic-pm`) | npm, follows semver | `npm update -g agentic-pm` |
| **Template releases** | GitHub Releases, auto-incrementing patches | `apm update` |

CLI v1.x fetches only v1.x.x template releases from the official repository. Custom repositories have no version filtering, allowing access to any available release.

## Global Configuration

The CLI stores global settings in `~/.apm/config.json`, including saved custom repositories with per-repository settings (such as whether to skip the security disclaimer). This file is managed automatically by `apm custom --add-repo` and related flags.

## Workspace Metadata

Each initialized project has `.apm/metadata.json` tracking the current installation. This file is used by `apm update`, `apm add`, `apm remove`, and `apm archive` to know the current state.

| Field | Type | Description |
| :--- | :--- | :--- |
| `source` | string | `"official"` or `"custom"` |
| `repository` | string | Repository in `owner/repo` format |
| `releaseVersion` | string | Release tag (e.g. `"v1.0.0"`) |
| `cliVersion` | string | CLI version that performed the installation |
| `assistants` | string[] | Installed assistant IDs (e.g. `["cursor", "claude"]`) |
| `installedFiles` | object | Map of assistant ID to array of installed file paths |
| `installedAt` | string | ISO 8601 timestamp of installation |

### Archive Metadata

Each archive in `.apm/archives/` contains its own `metadata.json` with the same fields as the workspace metadata plus:

| Field | Type | Description |
| :--- | :--- | :--- |
| `archivedAt` | string | ISO 8601 timestamp of archival |
| `reason` | string | Why the archive was created (e.g. `"archive"`, `"update"`, `"migration"`) |

The `apm archive --list` command reads these fields to display archive information.

## Related Docs

- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Customization Guide](Customization_Guide.md) - Custom repositories and template customization
- [Security Guide](Security_Guide.md) - Trust model, risks, and mitigation for custom repositories
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimization, and workflow efficiency
