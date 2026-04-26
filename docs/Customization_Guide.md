---
id: customization-guide
slug: /customization-guide
sidebar_label: Customization Guide
sidebar_position: 10
---

# Customization Guide

APM supports customization through custom repositories. By forking or templating the official repository, Users can modify APM's templates, add new capabilities, and publish releases that install via `apm custom`.

## How Custom Repositories Work

The official APM repository contains source templates that the build system processes into platform-specific bundles. A custom repository is a copy of this codebase where the User modifies the templates to fit their needs.

**Fork vs template:** The [APM repository](https://github.com/sdi2200262/agentic-project-management) supports both GitHub fork and "Use this template". Each has different tradeoffs:

| | Fork | Template |
| :--- | :--- | :--- |
| **Git history** | Carries the full upstream commit history | Starts with a clean, empty history |
| **Upstream sync** | `git merge upstream/main` pulls in new APM releases | No upstream link - merging future changes requires manual diffing |
| **Best for** | Incremental customization that tracks upstream improvements (e.g. a team adding domain-specific procedures while staying current with APM releases) | Deep divergence where the APM repo is a starting point, not an ongoing dependency (e.g. building a substantially different workflow that shares the build system but rewrites most templates) |

The workflow:

1. Fork or template the [APM repository](https://github.com/sdi2200262/agentic-project-management) to create a copy
2. Make changes to templates, add new skills, adjust procedures
3. Build locally with `npm run build:release` to produce bundles in `dist/`
4. Create a GitHub Release and attach the build artifacts
5. Install with `apm custom -r owner/repo`

The `agentic-pm` CLI handles custom repositories the same way it handles the official one at install time - it fetches the release manifest, presents available assistants, downloads the bundle, and extracts it into the project. The one difference is version filtering: `apm init` restricts official releases to the CLI's major version (e.g. CLI v1.x only fetches v1.x.x), while `apm custom` exposes all available releases regardless of CLI version.

## The Build Pipeline

Running `npm run build:release` processes source templates into platform-specific bundles. The build system is configured by two key files:

**`build/build-config.json`** defines an array of **targets**. In the official APM repository, each target corresponds to a supported assistant (Claude Code, Cursor, Copilot, Gemini CLI, OpenCode, Codex), but the build system itself is target-agnostic - a custom repository could define any set of targets. Each target specifies its output format (Markdown or TOML), config directory (e.g. `.claude/`, `.cursor/`, `.github/`), and directory layout for commands, guides, skills, and agents. It also defines platform-specific values like argument syntax and subagent invocation patterns.

**`build/processors/placeholders.js`** resolves template placeholders to target-specific values at build time. Templates are authored once with placeholders like `{RULES_FILE}`, `{SKILL_PATH:name}`, `{ARGS}`, and `{SUBAGENT_GUIDANCE}`, and the build system replaces them per target. For example, `{RULES_FILE}` becomes `CLAUDE.md` for Claude Code but `GEMINI.md` for Gemini CLI, and `{ARGS}` becomes `$ARGUMENTS` for Markdown platforms but `{{args}}` for TOML. This is what makes APM's templates platform-agnostic at the source level.

The build produces two types of output in `dist/`:

- **ZIP bundles** - One per target (e.g., `claude.zip`, `cursor.zip`). Each contains the commands, guides, skills, agent configurations, and `.apm/` artifact templates for that target, with all placeholders resolved.
- **`apm-release.json`** - The release manifest that tells the CLI what is available in the release:

```json
{
  "version": "1.0.0",
  "assistants": [
    {
      "id": "claude",
      "name": "Claude Code",
      "bundle": "claude.zip",
      "configDir": ".claude"
    }
  ]
}
```

When a User runs `apm init` or `apm custom`, the CLI fetches `apm-release.json` from the GitHub Release, reads the `assistants` array to present available options, then downloads and extracts the corresponding ZIP bundle. Without a valid `apm-release.json` attached to the release, the CLI cannot discover or install the bundles.

When creating a GitHub Release for a custom repository, attach all files from `dist/` - both the ZIP bundles and `apm-release.json`.

## The Customization Skill

The APM repository includes an optional customization skill at `skills/apm-customization/SKILL.md`. Since the skill lives in the repository itself, it is available in any fork or template without needing separate installation.

The skill guides an AI agent through navigating the repository structure, understanding the conventions, making changes, building, and releasing.

## What Can Be Customized

### Procedures

APM's procedures (Context Gathering, Work Breakdown, Task Assignment, Task Execution, Task Review, Task Logging) are defined in guide files under `templates/guides/`. Each guide follows a structured pattern with operational standards, step-by-step actions, and output specifications. Modifying a guide changes how that procedure behaves for all Agents that read it.

### Agent Behavior

Initiation commands under `templates/commands/` define each Agent's role, what documents it reads, and its procedural flow. Changes here affect how Agents initialize, what they load into context, and how they structure their work.

### Communication and Coordination

The Communication Skill under `templates/skills/apm-communication/` defines the Message Bus protocol, Agent-to-User communication standards, and terminology boundaries. Custom repositories can modify these to change how Agents communicate.

### Planning Document Structure

Artifact templates under `templates/apm/` define the initial structure of the Spec, Plan, Tracker, and Memory Index. Custom repositories can adjust these templates to match specific project needs.

### New Skills

Custom skills can be added under `templates/skills/`. Each skill lives in its own directory with a `SKILL.md` file. Skills are loaded at initialization and are available to all Agents that reference them.

### New Subagent Configurations

Custom subagent configurations can be added under `templates/agents/`. These define specialized subagents that Agents can spawn during the workflow.

## Using `apm custom`

The `apm custom` command handles installation from custom repositories. See the [CLI Guide](CLI_Guide.md#apm-custom) for full details.

Common workflows:

**First-time install from a custom repo:**

```bash
apm custom -r owner/repo
```

The CLI fetches available releases, presents a security disclaimer (first time only), and prompts for assistant selection.

**Install a specific version:**

```bash
apm custom -r owner/repo -t v1.0.0
```

**Save a custom repo for future use:**

```bash
apm custom --add-repo owner/repo
```

Saved repositories appear as options when running `apm custom` without `--repo`, and can skip the security disclaimer on subsequent use.

**Update a custom installation:**

```bash
apm update
```

When an installation comes from a custom repository, `apm update` fetches newer releases from that same repository.

:::warning[Security]
Custom repositories can write files anywhere within the project directory - not just prompt and procedural files, but also source code, configuration files, and dependency manifests. The `agentic-pm` CLI shows a security disclaimer the first time a custom repository is used. Saved repositories can skip the disclaimer on subsequent use, meaning a compromised repository produces no warning.

There is no signature verification on releases. Review the repository contents before installing, particularly commands and guides that define Agent behavior. See the [Security Guide](Security_Guide.md) for full details on the trust model, risks, and mitigations.
:::

## Official Custom Adaptations

### APM Auto - Autonomous Subagent Dispatch

[APM Auto](https://github.com/sdi2200262/apm-auto) is a Claude Code-only adaptation that replaces user-mediated Worker chats with Manager-driven subagent dispatch via Claude Code's `Agent()` tool. The Manager autonomously spawns ephemeral subagents to execute Tasks, reviews their output, merges branches, and continues - only pausing when genuine human judgment is needed.

Key changes from the official workflow:
- Workers become ephemeral subagents dispatched via a custom `apm-worker` agent definition
- The Manager operates an autonomous coordination loop instead of waiting for User-mediated message delivery
- Dependencies are classified at dispatch time (intra-batch vs cross-dispatch) instead of planning time
- Commands reduced from 9 to 5 (Worker commands eliminated)
- Single Claude Code target

Best for prototyping, fast execution, and simpler projects where managing separate Worker chats adds friction without proportional value.

```bash
apm custom -r sdi2200262/apm-auto
```

### APM Semi - Collaborative Human-and-Agent Execution

[APM Semi](https://github.com/sdi2200262/apm-semi) is an official custom adaptation that gives the User direct execution authority over any Task while keeping APM's structure and context management. The User can claim any Task at any point and execute it themselves; the agent on their side - the Manager during coordination or the paused Worker mid-execution - stays on standby, answering questions, running validation when the User returns, and writing the Task Log on the User's behalf.

Key changes from the official workflow:
- User-claimable Tasks during Plan review and dynamically throughout the Implementation Phase
- Conversational claim, unclaim, takeover, and report-done with no slash commands needed
- Sovereignty signal capture during Context Gathering, carried into Plan Analysis as User-owned assignments
- Standby collaboration on User-held Tasks: validation iteration, residual handling, Task Log written on the User's behalf
- Proactive claim suggestions at Stage boundaries based on accumulated session signal
- All six APM platforms supported (Claude Code, Cursor, Copilot, Gemini CLI, OpenCode, Codex CLI)

Best for users who want to author the substantive code themselves and lean on AI for boilerplate or peripheral Tasks - a collaborative way of working agentically rather than a fully delegated one.

```bash
apm custom -r sdi2200262/apm-semi
```

## Community Examples

### Domain-Specific APM

A team building data pipelines forks APM and adds domain-specific Workers and procedures:

- `templates/guides/data-validation.md` - A new guide for a Data Validation Worker with pipeline-specific validation steps
- `templates/skills/apm-data-quality/SKILL.md` - A shared skill defining data quality standards all Workers follow
- Modified `templates/guides/work-breakdown.md` - Adjusted decomposition principles to favor stage-based pipeline architecture
- Modified `templates/_standards/WORKFLOW.md` - Updated to reflect the new data validation procedure

### Stricter Review Process

An enterprise team forks APM to enforce additional review gates:

- Modified `templates/guides/task-review.md` - Added mandatory security review steps to the Task Review procedure, requiring the Manager to spawn a security subagent for Tasks touching authentication or payment code
- `templates/agents/apm-security-reviewer.md` - A custom subagent configuration for automated security review
- Modified `templates/_standards/WORKFLOW.md` - Updated Task Review specification to include the security review step

## Sharing Customizations

Custom repositories can be shared with teams or the community. Anyone with access to the repository can install from it using `apm custom -r owner/repo`. For private repositories, the User needs a GitHub token configured for access.

When sharing a custom repository, document what was changed and why in the repository's README. If the customization adds new commands or skills, note their purpose and usage. If it modifies existing procedures, describe how the behavior differs from the official release.

## Related Docs

- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Security Guide](Security_Guide.md) - Trust model, risks, and mitigation for custom repositories
- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [Context Engineering](Context_Engineering.md) - How APM manages what each Agent sees and why
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimization, and workflow efficiency
