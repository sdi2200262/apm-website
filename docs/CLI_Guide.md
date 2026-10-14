---
id: cli-guide
slug: /cli
sidebar_label: CLI Guide
sidebar_position: 8
---

# CLI Guide

The `agentic-pm` CLI manages APM installations, assistant configuration, template updates, and session archival. This doc covers every command, its options, and the files the CLI creates.

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

Then run `apm init` in your project directory (with a local install, `npx apm init`).

## Commands

### apm init

Installs APM from the official releases, in a project without APM. If APM is already installed, it shows the current state and suggests `apm add`, `apm update`, or `apm archive`.

```bash
apm init
apm init -a claude
apm init -a claude copilot -t v1.0.0
```

| Flag | Description |
| :--- | :--- |
| `-t, --tag <tag>` | Install a specific release version |
| `-a, --assistant <id...>` | Pre-select assistant(s) to install |

It fetches the latest compatible release from GitHub, asks which assistant to install (pass several with `--assistant`, or add more later with `apm add`), and installs:

- The `.apm/` directory, with templates for the Spec, the Plan, the Tracker, and the Index, and the installation metadata.
- Commands, guides, skills, and agent files, in each assistant's directory (such as `.claude/`, `.cursor/`, or `.github/`).

### apm custom

Installs APM from a custom repository, and manages saved custom repositories.

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
| `--add-repo <repos...>` | Save custom repositories for later use |
| `--remove-repo <repos...>` | Remove saved repositories |
| `--list` | List saved custom repositories |
| `--clear` | Clear all saved custom repositories |
| `-f, --force` | Skip confirmation when removing or clearing repositories |

Without `--repo`, the CLI offers your saved repositories. A custom repository shows a security disclaimer on every install, unless you saved it and chose to skip the disclaimer. `--force` applies only to `--remove-repo` and `--clear`.

> **Note:** A saved repository that skips the disclaimer gives no warning even if it is later compromised. See the [Security Guide](Security_Guide.md#the-security-disclaimer).

**Repository management:**

```bash
apm custom --add-repo owner/repo
apm custom --remove-repo owner/repo
apm custom --list
apm custom --clear
```

### apm update

Updates the installed templates from the same source repository. Run it between sessions: the current session moves to the archive, and `.apm/` returns to blank templates.

```bash
apm update
apm update -f
apm update -n pre-update-backup
```

| Flag | Description |
| :--- | :--- |
| `-f, --force` | Skip confirmation prompt |
| `-n, --name <name>` | Custom archive name for the pre-update snapshot |

It:

1. Snapshots all current `.apm/` contents except `archives/` into `.apm/archives/`, then removes the active session files.
2. Removes the installed assistant files.
3. Installs the new release, dropping any assistant it no longer offers.
4. Writes fresh metadata.

For official installations, the CLI prefers stable releases; on a pre-release, it offers both the latest stable and the latest pre-release. For custom installations, you choose from the releases newer than yours.

| Component | On update |
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

1. Snapshots all `.apm/` contents except `archives/` into `.apm/archives/session-YYYY-MM-DD-NNN/`, including planning documents, the Tracker, Memory, the Message Bus, metadata, and any session summary.
2. Writes the archive's `metadata.json`, with the archival time.
3. Removes the installed assistant files.
4. Removes the active session files and installation metadata, keeping existing archives.

APM is then uninstalled. Run `apm init` to begin a new session with fresh templates. The Rules stay in your rules file. The archives stay in `.apm/archives/`, and the next Planner asks which are relevant during Context Gathering.

### apm add

Adds assistants to an existing installation without affecting the current session.

```bash
apm add
apm add -a copilot
apm add -a copilot opencode cursor
```

| Flag | Description |
| :--- | :--- |
| `-a, --assistant <id...>` | Assistants to add |

It fetches the installed release and offers only the assistants not yet installed. For custom installations, it shows the security disclaimer unless the repository skips it.

### apm remove

Removes assistants from the installation.

```bash
apm remove
apm remove -a copilot
apm remove -a copilot opencode -f
```

| Flag | Description |
| :--- | :--- |
| `-a, --assistant <id...>` | Assistants to remove |
| `-f, --force` | Skip confirmation prompt |

It removes those assistants' files and updates the metadata, warning you before removing the last one. Files also used by assistants that remain installed are kept. The `.apm/` artifacts stay. See [Troubleshooting](Troubleshooting_Guide.md#codex-and-antigravity-shared-skills) for the known shared-skill overwrite issue.

### apm status

Shows the current installation state.

```bash
apm status
```

It shows the source (official or custom), the repository, the release and CLI versions, the install date, the installed assistants with their file counts, and the number of archives. It also checks whether the tracked files exist and flags missing files, with commands to restore them. It does not check their contents. Without an installation, it shows any archives or suggests `apm init`.

## Directory Structure

After `apm init`, a project looks like this (shown for Cursor):

```text
project/
├── .apm/
│   ├── spec.md                # Design decisions and constraints
│   ├── plan.md                # Stages, Tasks, dependencies
│   ├── tracker.md             # Live session state
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

Other assistants use `.claude/` (Claude Code), `.github/` (GitHub Copilot), `.agents/` (Antigravity), and `.opencode/` (OpenCode). Copilot commands and skills go to `.github/skills/`, and Antigravity commands and skills to `.agents/skills/`. Codex splits its files: guides and agents go to `.codex/`, and commands and skills to `.agents/skills/`.

## Versioning

The CLI and the template releases are versioned separately but share a major version.

| Track | Distribution | Update method |
| :--- | :--- | :--- |
| **CLI** (`agentic-pm`) | npm, follows semver | `npm update -g agentic-pm` |
| **Template releases** | GitHub Releases, auto-incrementing patches | `apm update` |

CLI v1.x fetches only v1.x.x releases from the official repository. Custom repositories have no version filter. A release's optional `minCliVersion` applies to both sources: from CLI v1.0.2 onward, the CLI refuses installation if it is older than that minimum and asks you to update. Earlier CLIs ignore the field.

Both tracks follow Semantic Versioning. Template patches normally auto-increment; minor and major versions are set when releasing. The [changelog](https://github.com/sdi2200262/agentic-project-management/blob/main/CHANGELOG.md) labels each entry by track, such as `CLI v1.0.2` or `Templates v1.0.3`.

## Global Configuration

The CLI keeps global settings in `~/.apm/config.json`: your saved custom repositories and their settings, such as whether to skip the disclaimer. `apm custom` and its flags manage the file.

## Workspace Metadata

Each installation has `.apm/metadata.json`, which `apm update`, `apm add`, `apm remove`, and `apm archive` read to know the current state.

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

`apm archive --list` reads these fields.

## Related Docs

- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Customisation Guide](Customisation_Guide.md) - Custom repositories and template customisation
- [Security Guide](Security_Guide.md) - Trust model, risks, and mitigation for custom repositories
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimisation, and workflow efficiency
