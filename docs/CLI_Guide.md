---
id: cli-guide
slug: /cli
sidebar_label: CLI Guide
sidebar_position: 8
---

# CLI Guide

The `agentic-pm` CLI manages APM installations, installation targets, template updates, and session archival. This doc covers every command, its options, and the files the CLI creates.

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

It fetches the latest compatible release from GitHub, asks which target to install (pass both with `--assistant`, or add one later with `apm add`), and installs:

- The `.apm/` directory, with templates for the Spec, the Plan, the Tracker, and the Index, and the installation metadata.
- Command skills, the communication skill and procedure guides in the selected target's directories.

| Target | For | Skills | Guides |
| :--- | :--- | :--- | :--- |
| `agents` | Agents supporting `AGENTS.md` and `.agents/skills/` | `.agents/skills/` | `.agents/apm-guides/` |
| `claude` | Claude Code | `.claude/skills/` | `.claude/apm-guides/` |

Both targets share `.apm/`. Rules are written during planning to workspace-root `AGENTS.md`.

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
3. Installs the new release, consolidating targets it replaces and dropping unsupported targets.
4. Writes fresh metadata.

Stop active agents before updating. Remaining worktrees move into the archive through Git with their uncommitted contents; they stay attached to their source repositories.

For official installations, `apm update` moves to the newest stable release and never offers a pre-release from a stable install. To try a pre-release, install it with `apm init --tag <tag>`. On a pre-release, `apm update` offers both the latest stable and the latest pre-release. For custom installations, you choose from the releases newer than yours.

| Component | On update |
| :--- | :--- |
| Skills and guides | Replaced with latest version |
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

1. Copies session records into `.apm/archives/session-YYYY-MM-DD-NNN/` and moves remaining worktrees there through Git, including uncommitted contents. Existing archives stay in place.
2. Writes the archive's `metadata.json`, with the archival time.
3. Removes the installed assistant files.
4. Removes the active session files and installation metadata, keeping existing archives.

Stop active agents before archiving. The CLI verifies preservation before clearing the active session. Worktrees remain attached to their source repositories; the archive is local session context, not a standalone Git backup. Archiving does not finish Tasks, commit changes or merge branches. If archival fails, inspect the paths the error identifies before continuing.

APM is then uninstalled. Run `apm init` to begin a new session with fresh templates. The Rules stay in `AGENTS.md`. The archives stay in `.apm/archives/`, and the next Planner asks which are relevant during Context Gathering.

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

It removes those targets' files and updates the metadata, warning you before removing the last one. Files also used by assistants that remain installed are kept. The `.apm/` artifacts stay.

### apm status

Shows the current installation state.

```bash
apm status
```

It shows the source (official or custom), the repository, the release and CLI versions, the install date, the installed assistants with their file counts, and the number of archives. It also checks whether the tracked files exist and flags missing files, with commands to restore them. It does not check their contents. Without an installation, it shows any archives or suggests `apm init`.

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

The CLI and the template releases are versioned separately but share a major version.

| Track | Distribution | Update method |
| :--- | :--- | :--- |
| **CLI** (`agentic-pm`) | npm, follows semver | `npm update -g agentic-pm` |
| **Template releases** | GitHub Releases, auto-incrementing patches | `apm update` |

CLI v1.x fetches only v1.x.x releases from the official repository. Custom repositories have no version filter. A release's optional `minCliVersion` applies to both sources. The CLI refuses installation when it is older than that minimum. Older CLIs may not enforce it correctly; update the CLI before installing newer templates. Templates v1.1.0 require CLI v1.0.3 or later.

Both tracks follow Semantic Versioning. Template patches normally auto-increment; minor and major versions are set when releasing. The [changelog](https://github.com/sdi2200262/agentic-project-management/blob/main/CHANGELOG.md) labels each entry by track, such as `CLI v1.0.2` or `Templates v1.0.3`.

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
| `assistants` | string[] | Installed assistant IDs (e.g. `["agents", "claude"]`) |
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

- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Customisation Guide](Customisation_Guide.md) - Custom repositories and template customisation
- [Security Guide](Security_Guide.md) - Trust model, risks, and mitigation for custom repositories
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimisation, and workflow efficiency
