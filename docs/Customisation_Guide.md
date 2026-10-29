---
id: customisation-guide
slug: /customisation-guide
sidebar_label: Customisation Guide
sidebar_position: 10
---

# Customisation Guide

To customise APM, change its source templates in your own repository, build release bundles and install them with `apm custom`. Each bundle contains the files for one installation target, such as `agents` or `claude`.

## Custom Repositories

The [APM repository](https://github.com/sdi2200262/agentic-project-management) supports both a GitHub fork and "Use this template":

| | Fork | Template |
| :--- | :--- | :--- |
| **History** | Carries the upstream history | Starts with a clean history |
| **Upstream sync** | `git merge upstream/main` pulls in new APM releases | No upstream link; later changes need manual diffing |
| **Best for** | Customisation that keeps up with APM releases | Deep divergence, using APM as a starting point |

The workflow:

1. Fork or template the repository.
2. Change the templates, add skills, adjust procedures.
3. Run `npm ci` in the repository, then build with `VERSION=1.1.0 npm run build:release`, using your intended template version.
4. Inspect the ZIPs and `apm-release.json` in `dist/`: check installed paths, resolved placeholders and references. Try changed instructions in a separate project.
5. Create a version tag and GitHub Release, and attach the ZIPs and manifest. Adapt the repository's release workflow before using it.
6. Install with `apm custom -r owner/repo`.

The [customisation skill](https://github.com/sdi2200262/agentic-project-management/tree/main/skills/apm-customization) can guide your assistant through these changes and checks.

## The Build

Two files configure the build:

- **`build/build-config.json`** lists target IDs, display names, bundle names, skill and guide directories, and the minimum CLI version. Official targets are `agents` and `claude`. A target can declare older IDs it `replaces` so updates consolidate them.
- **`build/processors/placeholders.js`** resolves `{VERSION}`, `{SKILL_PATH:name}`, `{SKILL_DIR:name}`, `{GUIDE_PATH:name}` and `{CLAUDE_ONLY:text}`. Rules use workspace-root `AGENTS.md` for both targets.

Set `VERSION` when building locally. The Release Templates workflow sets it from the version input, or increments the latest stable patch when the input is empty.

`apm-release.json` identifies the targets and their ZIP bundles for the CLI. It must be attached to the release alongside the ZIPs.

## What You Can Change

| What | Where | Effect |
| :--- | :--- | :--- |
| **Procedures** | `templates/guides/` | How each procedure runs, from Context Gathering to Task Review |
| **Commands** | `templates/skills/apm-<N>-<action>/SKILL.md` | Each agent's role, what it reads, and how it initialises |
| **Communication** | `templates/skills/apm-communication/` | The Message Bus protocol and how agents address you |
| **Artifact templates** | `templates/apm/` | The starting structure of the Spec, the Plan, the Tracker, and the Index |
| **New skills** | `templates/skills/<name>/SKILL.md` | Protocols your agents can load |
| **Delegation** | Role initiation skills | Optional native subagent guidance within each role's scope |

For example, a team that wants authentication changes checked for security can add that requirement to `templates/guides/task-review.md`. State which Tasks need the review and what evidence the Manager should check. If the assistant supports native subagents, the Manager can delegate the review and verify its findings.

Follow the authoring standards in `templates/_standards/`; they are not shipped in bundles. For workflow changes, update `WORKFLOW.md` there first, then the affected skills, guides, formats and examples.

## Installing and Sharing

`apm update` uses the installed repository. Custom releases have no major-version filter, but manifest and minimum-CLI checks still apply. Private repositories need `GITHUB_TOKEN` or a signed-in `gh` CLI. See the [CLI Guide](CLI_Guide.md#apm-custom) for release selection and saved repositories.

When you share a repository, describe in its README what you changed, why, and how its behaviour differs from the official release.

:::warning[Security]
Custom bundles can overwrite project files and change agent instructions. Review them before installing; see the [Security Guide](Security_Guide.md) for the trust model and CLI safeguards.
:::

## Official Adaptations

Two adaptations offer different ways to divide the work. See their repositories for supported targets and full instructions.

### APM Auto

[APM Auto](https://github.com/sdi2200262/apm-auto) lets the Manager launch Worker subagents in Claude Code, review their output and continue without message delivery between separate Worker chats.

```bash
apm custom -r sdi2200262/apm-auto
```

### APM Semi

[APM Semi](https://github.com/sdi2200262/apm-semi) lets you claim Tasks and carry them out yourself. The Manager or paused Worker assists you, validates the result and writes the Task Log.

```bash
apm custom -r sdi2200262/apm-semi
```

## Related Docs

- [Prompt Engineering](Prompt_Engineering.md) - File types, formats and instruction design
- [CLI Guide](CLI_Guide.md) - Installation, updates and release requirements
