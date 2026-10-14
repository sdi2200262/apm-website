---
id: troubleshooting-guide
slug: /troubleshooting-guide
sidebar_label: Troubleshooting Guide
sidebar_position: 9
---

# Troubleshooting Guide

Common issues in APM sessions and how to resolve them.

## Planning Phase

### Omitted Requirements

If Context Gathering missed an important requirement, the fix depends on when you notice:

- **During Context Gathering:** give the missing information in the current round. The Planner follows up on gaps.
- **At the Understanding Summary:** ask for changes before approving. The Planner loops through targeted follow-ups until the summary is accurate.
- **During Work Breakdown:** give a minor addition directly, and the Planner adjusts the current document. An omission that reshapes the scope or design needs the Planner to rebuild its understanding. Start a new Planner conversation with the omission included:

  ```
  /apm-1-initiate-planner A previous Planner completed Context Gathering and started Work Breakdown but a critical requirement was missed: [describe the requirement]. Read any documents already written in .apm/, explore the codebase, then ask targeted questions to rebuild understanding with this new requirement incorporated before resuming Work Breakdown or modifying existing documents that may need correction.
  ```

- **During implementation:** tell the Manager, which can update the Spec, the Plan, or the Rules. Small, contained changes are its call; larger ones need your approval (see [Planning Documents](Agent_Orchestration.md#planning-documents)). If a change it proposes seems too large or too small for the issue, redirect it.

### Interrupted Work Breakdown

1. If Work Breakdown stopped on a platform or network error, ask the Planner to continue. Name the document it was writing and what remains.
2. If the Planner seems confused about what it has finished, or the platform has compacted its conversation, start a new Planner conversation. The new Planner sees the documents already in `.apm/` but none of the gathered context. Tell it what was completed, adapting this prompt to the actual state:

   ```
   /apm-1-initiate-planner A previous Planner conversation was lost after completing Context Gathering and writing the Spec. Read .apm/spec.md for the approved Spec, explore the codebase to rebuild understanding, then ask targeted questions to reconstruct any missing context before resuming Work Breakdown.
   ```

3. Approve its summary, and the Planner resumes Work Breakdown where the previous one left off.

## Implementation Phase

### Stuck Workers

A Worker may get stuck on missing dependency context, a persistent bug, or a systemic issue in the codebase. Whatever the cause, if the Worker cannot resolve it within its own scope, the issue goes back to the Manager.

#### Integration with Earlier Work

A Worker may struggle when its Task depends on another Worker's output. It may fail to connect with expected interfaces, assume the wrong structure for the earlier work, or produce output that conflicts with it. Neither the Worker nor you may see the cause at first.

Such issues usually come from thin dependency context in the Task Prompt, which is the Manager's to fix.

1. Ask the Worker to log early and report back:

   ```
   Stop execution and log what you have so far with Partial status. Describe what you are struggling with, what assumptions you are making about the prior work, and where things are not matching up. Write the Task Report and direct me to the Manager.
   ```

2. Deliver the report. The Manager reviews the log with the whole project in view, finds the gap, and issues a follow-up Task Prompt with the missing context.

#### Persistent Bugs

A Worker may cycle through debugging attempts without progress, or produce fixes that cause new issues. Each attempt spends context the Worker needs for execution.

1. If the Worker has not used a subagent, ask it to hand the investigation to one:

   ```
   Spawn a debug subagent to isolate this issue in a fresh context. Pass it the specific error, relevant file paths, and what you have tried so far.
   ```

2. If a subagent has not solved it either, the problem likely lies beyond the Worker's scope: a systemic issue or a gap in the plan. Ask the Worker to log early and return:

   ```
   Stop execution and log with Partial status (or Failed if no progress was made). Describe the issue clearly, what was attempted, what the subagent found if applicable, and your assessment of the root cause. Write the Task Report and direct me to the Manager.
   ```

3. Deliver the report. The Manager decides the next step: a follow-up with a revised approach, a change to the planning documents, or a restructured Task.

### Message Bus

| Issue | Cause and fix |
| :--- | :--- |
| `/apm-4-check-tasks` or `/apm-5-check-reports` finds nothing | The other agent has not written its message yet. Check its conversation. |
| A Worker declines a Task Prompt and names another Worker | The prompt was meant for that Worker. You likely ran `/apm-4-check-tasks` in the wrong conversation. |

## Context Recovery

A [Handoff](Agent_Orchestration.md#handoff-and-continuity) is the planned way to move an agent to a fresh conversation. [Recovery](Agent_Orchestration.md#recovery) is for when context was lost without one: the platform compacted the conversation, or you closed or cleared it.

### Recovery

Recovery covers the Manager and Workers; for a Planner, see Interrupted Work Breakdown above. Run the recovery command in the agent's conversation, or in a new one if the old one is gone:

```markdown
/apm-9-recover manager          # recover the Manager
/apm-9-recover frontend-agent   # recover a Worker by its identifier
```

The agent rebuilds its context from the project's files and asks you for brief context where gaps remain. The Manager notes the recovery in the Tracker, and a Worker mentions it in its next Task Report. If the agent still seems confused or inconsistent afterwards, perform a Handoff to start a clean instance.

### Faulty Handoff

A Handoff written by an agent whose context had already degraded, after a compaction or past its context limit, may record inaccuracies. If compaction has already happened, recover first, continue in that conversation, and hand off later.

If the incoming agent's Understanding Summary shows errors anyway:

- **Minor gaps:** correct them in the incoming agent's conversation.
- **Major errors:** fix the Handoff artifacts, then open a new conversation for the same role and run its initiation command. The incoming agent reads the corrected artifacts.
  - The **Handoff Log**, in `.apm/memory/handoffs/`, holds the working context, decisions, and notes.
  - The **Handoff Prompt**, in `.apm/bus/<agent-slug>/handoff.md`, holds the current state and outstanding Tasks. The incoming agent clears it once read. Rewrite it from the corrected Handoff Log, since the next agent detects a Handoff only when the file has content.

## CLI Issues

| Issue | Fix |
| :--- | :--- |
| `apm init` reports that APM is already installed | To start fresh, run `apm archive`, then `apm init`. |
| `apm update` finds no compatible release | Update the CLI with `npm update -g agentic-pm`, then run `apm update` again. CLI v1.x fetches only v1.x.x releases (see [Versioning](CLI_Guide.md#versioning)). |

### Missing Installed Files

`apm status` checks the files recorded in installation metadata. If files are missing, it names the affected assistants. Run `apm remove -a <id>`, then `apm add -a <id>` to reinstall that assistant's files from the installed release. Session artifacts remain in `.apm/`.

### Codex and Antigravity Shared Skills

Codex and Antigravity install some APM skills to the same paths in `.agents/skills/`, with different command syntax and guide paths. The one installed or updated last overwrites the other's instructions. This is a known issue pending a fix.

To restore one assistant's instructions, run `apm remove -a <id>`, then `apm add -a <id>`. If both remain installed, this overwrites the other's instructions again. CLI v1.0.2 keeps shared files when removing an assistant and warns when they contain that assistant's instructions; older CLIs delete them.

### Minimum CLI Version

If a release requires a newer CLI, run `npm update -g agentic-pm`, then retry the installation or update. This requirement is separate from the major-version filter for official releases.

## Migrating from v0.5.x

v0.5.x installations differ in file structure, metadata format, and CLI, and the v1 CLI cannot manage them directly. The [CHANGELOG](https://github.com/sdi2200262/agentic-project-management/blob/main/CHANGELOG.md) lists the changes.

1. Move the existing `.apm/` artifacts (Implementation Plan, Memory directory, metadata) into a directory under `.apm/archives/`, for example `.apm/archives/my-project/`.
2. Convert the old `metadata.json` to the v1 [archive schema](CLI_Guide.md#archive-metadata) and place it in that directory. Map `templateVersion` to `releaseVersion` and full assistant names to short IDs, and add `archivedAt` and `reason: "migration"`.
3. Optionally, write a session summary into the same directory.
4. Remove `.apm/guides/`, `.apm/metadata.json`, and the APM-installed files in your assistant's directories (in v0.5.x, usually prefixed `apm-`), keeping your own files.
5. Install the current CLI: `npm install -g agentic-pm`.
6. Run `apm init`. The new Planner detects the migration archive during Context Gathering.

The optional [apm-assist](https://github.com/sdi2200262/agentic-project-management/tree/main/skills/apm-assist) skill can do this for you. Install it in your workspace and mention it in your assistant's chat: the agent detects your version, proposes a migration plan, and carries it out after your approval. It can also answer questions about APM from the live docs.

For example, in Claude Code:

```bash
mkdir -p .claude/skills/apm-assist
curl -sL https://raw.githubusercontent.com/sdi2200262/agentic-project-management/main/skills/apm-assist/SKILL.md \
  -o .claude/skills/apm-assist/SKILL.md
```

Other assistants take the same file in their own skills directory; the [skills README](https://github.com/sdi2200262/agentic-project-management/tree/main/skills) lists the paths.

## Related Docs

- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Customisation Guide](Customisation_Guide.md) - Custom repositories and template customisation
- [Security Guide](Security_Guide.md) - Trust model, risks, and mitigation for custom repositories
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimisation, and workflow efficiency
