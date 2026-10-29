---
id: troubleshooting-guide
slug: /troubleshooting-guide
sidebar_label: Troubleshooting Guide
sidebar_position: 9
---

# Troubleshooting Guide

Resolve interruptions and installation problems. For the normal session workflow, see [Getting Started](Getting_Started.md).

## Planning Changes and Interruptions

Give corrections to the Planner during planning, or to the Manager during implementation. The agent updates affected documents and asks for approval when a change affects the scope, design or several Tasks.

If planning is interrupted, continue in the same conversation. If that conversation is lost, invoke `apm-1-initiate-planner` in a new one. Tell it which documents were approved and what remains. It needs to reconstruct missing context before continuing.

## Blocked Tasks

When a Worker cannot resolve a problem within its Task, ask it to log the current result, failed or unavailable checks, and what guidance it needs. Deliver its report to the Manager with `apm-5-check-reports`.

The Manager can resolve contained questions, checks and corrections during review. It sends remaining work to the Worker or asks you to settle a requirement or approach. Required validation that remains unmet stays visible in the result. See [Task Review](Workflow_Overview.md#task-review).

## Context Recovery

A [Handoff](Agent_Orchestration.md#handoff-and-continuity) is the planned way to move an agent to a fresh conversation. [Recovery](Agent_Orchestration.md#recovery) is for when context was lost without one: the platform compacted the conversation, or you closed or cleared it.

### Recovery

Recovery covers the Manager and Workers; for a Planner, see [Planning Changes and Interruptions](#planning-changes-and-interruptions). Run the recovery command in the agent's conversation, or in a new one if the old one is gone:

```markdown
/apm-9-recover manager          # recover the Manager
/apm-9-recover frontend-agent   # recover a Worker by its identifier
```

The agent rebuilds its context from the project's files and asks you for brief context where gaps remain. The Manager notes the recovery in the Tracker, and a Worker mentions it in its next Task Report. If the agent still seems confused or inconsistent afterwards, perform a Handoff to start a clean instance.

### Faulty Handoff

A Handoff written by an agent whose context had already degraded, after a compaction or past its context limit, may record inaccuracies. If compaction left gaps, run recovery and check the current files before preparing a Handoff.

If the incoming agent's account of the current state and next action shows errors anyway:

- **Minor gaps:** correct them in the incoming agent's conversation.
- **Major errors:** fix the Handoff artifacts, then open a new conversation for the same role and run its initiation command. The incoming agent reads the corrected artifacts.
  - The **Handoff Log**, in `.apm/memory/handoffs/`, holds the working context, decisions, and notes.
  - The **Handoff Prompt**, in `.apm/bus/<agent-slug>/handoff.md`, holds the current state and outstanding Tasks. The incoming agent clears it once read. Rewrite it from the corrected Handoff Log and current files, since the next agent detects a Handoff only when the file has content.

## Installation Issues

Keep the CLI up to date before installing newer templates. See [release compatibility](CLI_Guide.md#versioning) for version requirements.

### Missing Installed Files

`apm status` names targets with missing installed files. Run `apm remove -a <id>`, then `apm add -a <id>` to restore that target from the installed release. Session artifacts remain in `.apm/`.

### Upgrading to Templates v1.1.0

Update the CLI first, then update templates between APM sessions:

```bash
npm update -g agentic-pm
apm update
```

CLI v1.0.3 consolidates older official target IDs into `agents` and keeps `claude` when installed. The update archives the current session, removes recorded template files and installs fresh templates. Both targets can coexist.

If you installed a standalone APM skill in a directory that the CLI did not create, move it to your assistant's current skills directory yourself. Check `.apm/metadata.json` for the files managed by the CLI.

## Older Installations

For an installation the current CLI cannot manage, preserve its planning documents, logs and metadata before removing anything. Compare its files with the relevant [release notes](https://github.com/sdi2200262/agentic-project-management/blob/main/CHANGELOG.md) and keep your own assistant configuration.

The optional [apm-assist skill](https://github.com/sdi2200262/agentic-project-management/tree/main/skills/apm-assist) can inspect the installation, propose a migration and carry it out after your approval. Follow the [skills README](https://github.com/sdi2200262/agentic-project-management/blob/main/skills/README.md) to install it in your assistant's skills directory.

## Related Docs

- [CLI Guide](CLI_Guide.md) - Commands, installation targets and metadata
- [Agent Orchestration](Agent_Orchestration.md#handoff-and-continuity) - Handoff and recovery mechanics
