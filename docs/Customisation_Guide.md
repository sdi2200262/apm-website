---
id: customisation-guide
slug: /customisation-guide
sidebar_label: Customisation Guide
sidebar_position: 10
---

# Customisation Guide

You can customise APM through a custom repository: a copy of the official repository with your own changes to its templates, published as releases that install with `apm custom`.

## Custom Repositories

The official repository holds source templates that a build turns into one bundle per assistant. A custom repository changes those templates and builds its own bundles.

The [APM repository](https://github.com/sdi2200262/agentic-project-management) supports both a GitHub fork and "Use this template":

| | Fork | Template |
| :--- | :--- | :--- |
| **History** | Carries the upstream history | Starts with a clean history |
| **Upstream sync** | `git merge upstream/main` pulls in new APM releases | No upstream link; later changes need manual diffing |
| **Best for** | Customisation that keeps up with APM releases | Deep divergence, using APM as a starting point |

The workflow:

1. Fork or template the repository.
2. Change the templates, add skills, adjust procedures.
3. Build with `npm run build:release`, which writes the bundles to `dist/`.
4. Create a GitHub Release and attach every file from `dist/`.
5. Install with `apm custom -r owner/repo`.

The CLI installs from a custom repository as it does from the official one. The one difference is version filtering: `apm init` fetches only releases matching the CLI's major version, while `apm custom` offers every release.

The repository includes a [customisation skill](https://github.com/sdi2200262/agentic-project-management/tree/main/skills/apm-customization) at `skills/apm-customization/SKILL.md`. Point your assistant to it for guidance on the repository's structure and conventions, making changes, building, and releasing.

## The Build

Two files configure the build:

- **`build/build-config.json`** lists the targets. In the official repository each target is a supported assistant, with its config directory (such as `.claude/` or `.cursor/`), its directory layout, and its subagent guidance.
- **`build/processors/placeholders.js`** resolves the placeholders in the templates, such as `{RULES_FILE}` and `{ARGS}`, to each target's values, and holds per-assistant rules such as argument syntax. A new target needs entries in both files. `{RULES_FILE}` becomes `CLAUDE.md` for Claude Code and `AGENTS.md` for the others.

The build writes to `dist/` one ZIP bundle per target, with all placeholders resolved, and a release manifest, `apm-release.json`. The CLI reads the manifest to list the available assistants, then downloads the chosen bundle. A release without the manifest cannot be installed.

## What You Can Change

| What | Where | Effect |
| :--- | :--- | :--- |
| **Procedures** | `templates/guides/` | How each procedure runs, from Context Gathering to Task Review |
| **Commands** | `templates/commands/` | Each agent's role, what it reads, and how it initialises |
| **Communication** | `templates/skills/apm-communication/` | The Message Bus protocol and how agents address you |
| **Artifact templates** | `templates/apm/` | The starting structure of the Spec, the Plan, the Tracker, and the Index |
| **New skills** | `templates/skills/<name>/SKILL.md` | Protocols your agents can load |
| **New subagents** | `templates/agents/` | Subagents your agents can launch |

For example, a team that wants every Task touching authentication checked for security might change two places:

- **`templates/agents/apm-security-reviewer.md`** - A new subagent that reviews code for security issues.
- **`templates/guides/task-review.md`** - A new step in Task Review: for Tasks that touch authentication, the Manager launches the security reviewer before accepting the work.

The conventions the templates follow are in `templates/_standards/`. They guide your edits and are not shipped in the bundles.

## Installing and Sharing

Anyone with access to a custom repository can install from it with `apm custom -r owner/repo`, and `apm update` then updates from the same repository. Private repositories need a GitHub token, from `GITHUB_TOKEN` or a signed-in `gh` CLI. The [CLI Guide](CLI_Guide.md#apm-custom) covers every option, including saving repositories for later.

When you share a repository, describe in its README what you changed, why, and how its behaviour differs from the official release.

:::warning[Security]
A custom bundle can write files anywhere in your project, and APM's maintainers have not reviewed it. Review a repository before installing it, especially the commands and guides that define agent behaviour. The [Security Guide](Security_Guide.md) covers the risks and mitigations.
:::

## Official Adaptations

Two custom adaptations are maintained alongside APM. Each shifts the balance between your involvement and autonomy.

### APM Auto

[APM Auto](https://github.com/sdi2200262/apm-auto) is a Claude Code adaptation that replaces Worker conversations with subagents the Manager launches itself. The Manager dispatches each Task to a subagent, reviews its output, merges its branch, and continues, pausing only for decisions that need you. It has five commands and no Worker commands. It may suit prototypes and simpler projects, where separate Worker conversations add more overhead than value.

```bash
apm custom -r sdi2200262/apm-auto
```

### APM Semi

[APM Semi](https://github.com/sdi2200262/apm-semi) lets you claim any Task and do it yourself, at Plan review or at any point during implementation. While you work, the agent on your side, the Manager or a paused Worker, stays on standby: it answers questions, runs validation when you return, and writes the Task Log for you. It supports all six assistants. It may suit developers who want to write the substantial code themselves and give boilerplate and peripheral Tasks to agents.

```bash
apm custom -r sdi2200262/apm-semi
```

## Related Docs

- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Security Guide](Security_Guide.md) - Trust model, risks, and mitigation for custom repositories
- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [Context Engineering](Context_Engineering.md) - How APM manages what each agent sees and why
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
