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

If planning is interrupted, continue in the same conversation. If that conversation is lost, invoke `apm-1-initiate-planner` in a new one. Tell it which documents were approved and what remains.

## Blocked Tasks

When a Worker cannot resolve a problem within its Task, ask it to log the current result, failed or unavailable checks, and what guidance it needs. Deliver its report to the Manager with `apm-5-check-reports`.

During review, the Manager can investigate, run final checks, and make small corrections itself or through a subagent. It can also send the Worker a follow-up or ask you to settle a requirement or approach. When a Task the Manager carries out through its subagents is blocked, it raises the problem with you directly. Unmet required validation stays recorded in the result. See [Task Review](Workflow_Overview.md#task-review).

## Context Recovery

A [Handoff](Agent_Orchestration.md#handoff-and-continuity) is the planned way to move an agent to a fresh conversation. [Recovery](Agent_Orchestration.md#recovery) is for when context was lost without one: the platform compacted the conversation, or you closed or cleared it.

### Recovery

Recovery covers the Manager and Workers; for a Planner, see [Planning Changes and Interruptions](#planning-changes-and-interruptions). Run the recovery command in the agent's conversation, or in a new one if the old one is gone:

```markdown
/apm-9-recover manager          # recover the Manager
/apm-9-recover frontend-agent   # recover a Worker by its identifier
```

The agent rebuilds its context from the project's files and asks you for brief context where gaps remain. The Manager records any gaps it couldn't resolve in the Tracker, and a Worker mentions the recovery in its next Task Report. If the agent still seems confused or inconsistent afterwards, run a Handoff to a fresh conversation.

### Faulty Handoff

A Handoff written by an agent whose context had already degraded, after a compaction or past its context limit, may record inaccuracies. If compaction left gaps, run recovery and check the current files before preparing a Handoff.

If the incoming agent's account of the current state and next action shows errors anyway:

- **Minor gaps:** correct them in the incoming agent's conversation.
- **Major errors:** fix the Handoff files, then open a new conversation for the same role and run its initiation command. The incoming agent reads the corrected files.
  - The **Handoff Log**, in `.apm/memory/handoffs/`, holds what the outgoing agent did, decided and noticed beyond the Task Logs.
  - The **Handoff Prompt**, in `.apm/bus/<agent-slug>/handoff.md`, holds the current state and outstanding Tasks. The incoming agent clears it once read. Rewrite it from the corrected Handoff Log and current files, since the next agent detects a Handoff only when the file has content.

## Installation Issues

Keep the CLI up to date before installing newer templates. See [release compatibility](CLI_Guide.md#versioning) for version requirements.

### Missing Installed Files

`apm status` names targets with missing installed files. Run `apm remove -a <id>`, then `apm add -a <id>` to restore that target from the installed release. Session files remain in `.apm/`.

### Upgrading to Templates v1.2.0

APM v1.2.0 needs CLI v1.0.4 or later. Pause active agents with their work preserved, then update between APM sessions:

```bash
npm install -g agentic-pm@latest
apm update
```

The update archives the current session, removes recorded template files and installs fresh templates. Templates v1.2.0 drop Rules. If your `AGENTS.md` has an `APM_RULES` block, keep any rules you still want as ordinary instructions and delete the markers. The CLI does not change `AGENTS.md`.

The CLI also consolidates target IDs from releases before v1.1.0 into `agents`, and rejects conflicting targets, such as both formats for `claude`, before changing any files.

If you installed a standalone APM skill in a directory that the CLI did not create, move it to your assistant's current skills directory yourself. Check `.apm/metadata.json` for the files managed by the CLI.

## Older Installations

For an installation the current CLI cannot manage, preserve its planning documents, logs and metadata before removing anything. Compare its files with the relevant [release notes](https://github.com/sdi2200262/agentic-project-management/blob/main/CHANGELOG.md) and keep your own assistant configuration.

The optional [apm-assist skill](https://github.com/sdi2200262/agentic-project-management/tree/main/skills/apm-assist) can inspect the installation, propose a migration and carry it out after your approval. Follow the [skills README](https://github.com/sdi2200262/agentic-project-management/blob/main/skills/README.md) to install it in your assistant's skills directory.
