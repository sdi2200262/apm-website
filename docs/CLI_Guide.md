---
id: cli-guide
slug: /cli
sidebar_label: CLI Guide
sidebar_position: 8
---

# CLI Guide

The `agentic-pm` CLI installs APM templates, updates them and manages session archives. This guide covers its commands, options and installation files.

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
apm init -a agents claude -t v1.1.0
```

| Flag | Description |
| :--- | :--- |
| `-t, --tag <tag>` | Install a specific release version |
| `-a, --assistant <id...>` | Pre-select installation target(s) |

Without `--tag`, it selects the newest stable official release matching the CLI's major version, then checks the release's minimum CLI requirement. Choose an installation target, the file layout your assistant uses, or pass its ID with `-a`. The CLI installs:

- The `.apm/` directory with planning and tracking templates, the Memory Index and installation metadata.
- Command skills, the communication skill and procedure guides in the selected target's directories.

| Target | For | Skills | Guides |
| :--- | :--- | :--- | :--- |
| `agents` | Agents supporting `AGENTS.md` and `.agents/skills/` | `.agents/skills/` | `.agents/apm-guides/` |
| `claude` | Claude Code | `.claude/skills/` | `.claude/apm-guides/` |

Both targets share `.apm/`. Install both with `-a agents claude`, or add one later with `apm add`. Planning writes shared Rules to workspace-root `AGENTS.md`.

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
| `-a, --assistant <id...>` | Pre-select installation target(s) |
| `--add-repo <repos...>` | Save custom repositories for later use |
| `--remove-repo <repos...>` | Remove saved repositories |
| `--list` | List saved custom repositories |
| `--clear` | Clear all saved custom repositories |
| `-f, --force` | Skip confirmation when removing or clearing repositories |

Without `--repo`, choose a saved repository or enter another. Custom installation asks for a [security acknowledgement](Security_Guide.md#the-security-disclaimer) unless you saved the repository with that prompt disabled. `--force` applies only to `--remove-repo` and `--clear`.

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

Stop active agents before updating. The CLI:

1. [Archives the session](#apm-archive), including remaining worktrees and uncommitted contents.
2. Removes installed template files.
3. Installs the new release, consolidating targets it replaces and dropping unsupported targets.
4. Writes fresh installation metadata.

Stable official installations update to the newest stable release. Pre-release installations offer available newer stable or pre-release versions. Custom installations offer newer releases from the same repository. To install a specific version, including a pre-release, use `apm init --tag <tag>` in a project without an active installation.

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

Stop active agents before archiving. The CLI:

1. Copies session records into `.apm/archives/session-YYYY-MM-DD-NNN/` and moves remaining worktrees there through Git, including uncommitted contents.
2. Writes archive metadata and verifies preservation.
3. Clears active session files, installed templates and installation metadata.

Existing archives and the Rules in `AGENTS.md` remain. Worktrees stay attached to their source repositories, so the archive is local session context rather than a standalone Git backup. Archiving does not finish Tasks, commit changes or merge branches. If it fails, inspect the paths the error identifies before continuing.

Run `apm init` for fresh templates. The next Planner asks which archives are relevant.

Deleting an archive also removes its worktrees and their uncommitted, untracked and ignored files. The confirmation describes what will be deleted; `-f` skips it. If deletion fails, the CLI stops and warns that cleanup may be partial. Branches remain.

### apm add

Adds installation targets to an existing installation without affecting the current session.

```bash
apm add
apm add -a agents
apm add -a claude
```

| Flag | Description |
| :--- | :--- |
| `-a, --assistant <id...>` | Targets to add |

It fetches the installed release and offers only the targets not yet installed. For custom installations, it shows the security disclaimer unless the repository skips it.

### apm remove

Removes installation targets from the installation.

```bash
apm remove
apm remove -a agents
apm remove -a agents claude -f
```

| Flag | Description |
| :--- | :--- |
| `-a, --assistant <id...>` | Targets to remove |
| `-f, --force` | Skip confirmation prompt |

It removes those targets' files and updates the metadata, warning you before removing the last one. Files also used by targets that remain installed are kept. The `.apm/` artifacts stay.

### apm status

Shows the current installation state.

```bash
apm status
```

It shows the source repository, template and CLI versions, install date, installed targets with file counts, and archive count. It flags missing installed files and gives restoration commands; it does not check file contents. Without an installation, it shows any archives or suggests `apm init`.

## Directory Structure

The `agents` target installs this layout:

```text
project/
├── .apm/
│   ├── spec.md                # Design decisions and constraints
│   ├── plan.md                # Stages, Tasks and dependencies
│   ├── tracker.md             # Live session state
│   ├── memory/
│   │   └── index.md           # Lasting findings and summary links
│   └── metadata.json          # Installation metadata
├── .agents/
│   ├── skills/                # Command and communication skills
│   └── apm-guides/            # Procedure guides
└── AGENTS.md                  # Rules, written during planning
```

The `claude` target uses `.claude/skills/` and `.claude/apm-guides/`. During the session, agents create the Message Bus, Task Logs and summaries under `.apm/`; parallel dispatch also creates `.apm/worktrees/`. See [Quick Reference](Quick_Reference.md#project-structure) for the full session layout.

## Versioning

The CLI and templates follow Semantic Versioning separately and share a major version.

| Track | Distribution | Update method |
| :--- | :--- | :--- |
| **CLI** (`agentic-pm`) | npm | `npm update -g agentic-pm` |
| **Template releases** | GitHub Releases | `apm update` |

CLI v1.x fetches only v1.x.x releases from the official repository. Custom repositories have no version filter. A release's optional `minCliVersion` applies to both sources. The CLI refuses installation when it is older than that minimum. Older CLIs may not enforce it correctly; update the CLI before installing newer templates. Templates v1.1.0 require CLI v1.0.3 or later.

The [changelog](https://github.com/sdi2200262/agentic-project-management/blob/main/CHANGELOG.md) labels changes by track. See [Troubleshooting](Troubleshooting_Guide.md#upgrading-to-templates-v110) for the v1.1.0 upgrade steps.

## Terminal Input

Interactive choices need a terminal. For scripts, supply the target with `-a` and a release with `--tag` where required. `-f` skips destructive-action confirmations; it does not choose a release or accept a custom repository's security disclaimer.

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
| `assistants` | string[] | Installed target IDs (e.g. `["agents", "claude"]`) |
| `assistantNames` | object | Display names by target ID; absent in older installations |
| `installedFiles` | object | Map of target ID to installed file paths; `_apm` records shared session templates |
| `installedAt` | string | ISO 8601 timestamp of installation |

### Archive Metadata

Each archive in `.apm/archives/` contains its own `metadata.json` with the same fields as the workspace metadata plus:

| Field | Type | Description |
| :--- | :--- | :--- |
| `archivedAt` | string | ISO 8601 timestamp of archival |
| `reason` | string | Why the archive was created (e.g. `"archive"`, `"update"`, `"migration"`) |

`archivedWorktrees` records moved worktree paths, source repositories, branches and whether unfinished files were present. `apm archive --list` reads the metadata and shows the worktree count.

## Related Docs

- [Troubleshooting Guide](Troubleshooting_Guide.md) - Restore an installation or recover a session
- [Customisation Guide](Customisation_Guide.md) - Build and publish custom templates
- [Security Guide](Security_Guide.md) - Bundle trust and security acknowledgements
