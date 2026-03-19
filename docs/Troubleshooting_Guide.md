---
id: troubleshooting-guide
slug: /troubleshooting-guide
sidebar_label: Troubleshooting Guide
sidebar_position: 9
---

# Troubleshooting Guide

Common issues encountered during APM sessions and how to resolve them.

## Planning Phase

### Omitted Requirements

If important requirements were missed during Context Gathering, the impact depends on when the omission is caught and how significant it is.

**During Context Gathering** - Provide the missing information in the current round or follow-up. The Planner iterates on gaps naturally.

**After the understanding summary** - Request modifications before approving. The Planner loops through targeted follow-ups until the summary is accurate.

**During Work Breakdown** - For minor additions, provide the missing requirement directly and the Planner can adjust the current document. For major omissions that reshape the project's scope or design, the Planner needs to reconstruct its understanding before continuing. Start a new Planner conversation with the omission included:

```
/apm-1-initiate-planner A previous Planner completed Context Gathering and started Work Breakdown but a critical requirement was missed: [describe the requirement]. Read any documents already written in .apm/, explore the codebase, then ask targeted questions to rebuild understanding with this new requirement incorporated before resuming Work Breakdown or modifying existing documents that may need correction.
```

**During Implementation** - Inform the Manager, which can modify the Spec, Plan, or Rules to incorporate new requirements. Small contained changes are within the Manager's authority. Significant changes (multiple Tasks affected, scope changes, design direction shifts) require User collaboration. See [planning document maintenance](Agent_Orchestration.md#planning-documents) for how the Manager handles modifications.

### Interrupted Work Breakdown

If Work Breakdown is interrupted (model limitations, platform issues, or network errors), instruct the Planner to continue from where it stopped. Be specific about which document was being written and what remains.

If the interruption caused significant context loss (the Planner seems confused about what was already completed), or if the platform auto-compacted the conversation because the Planner reached its context window limit, recovery requires a new Planner conversation. A new Planner will have the partially written documents in `.apm/` but not the gathered context from the previous conversation. The User needs to re-initiate the Planner and provide context about what was already completed so it can resume Context Gathering or Work Breakdown from the right point:

```
/apm-1-initiate-planner A previous Planner conversation was lost after completing Context Gathering and writing the Spec. Read .apm/spec.md for the approved Spec, explore the codebase to rebuild understanding, then ask targeted questions to reconstruct any missing context before resuming Work Breakdown.
```

Adapt the prompt to match the actual state. The new Planner reads whatever exists in `.apm/`, explores the codebase, and conducts targeted questions to reconstruct the gathered context. Once the Planner has sufficient understanding (confirmed through a summary the User approves), it resumes Work Breakdown from where the previous Planner left off.

## Implementation Phase

### Worker Execution Issues

Workers may get stuck during Task execution for several reasons: missing dependency context, persistent bugs, iteration spirals, or systemic issues in the codebase. The general pattern is the same regardless of the cause. If the Worker cannot resolve the issue within its own scope, it should return to the Manager for coordination-level resolution.

#### Integration Issues with Prior Work

A Worker may struggle when its Task depends on work done by another Worker. The Worker might not understand why it is struggling, and the User may not immediately recognize the root cause either. Symptoms include the Worker failing to connect with expected interfaces, making incorrect assumptions about how prior work is structured, or producing output that conflicts with what another Worker built.

These issues often stem from insufficient dependency context in the Task Prompt. The Manager is responsible for providing that context, and the resolution happens at the Manager level. Ask the Worker to log early and report back:

```
Stop execution and log what you have so far with Partial status. Describe what you are struggling with, what assumptions you are making about the prior work, and where things are not matching up. Write the Task Report and direct me to the Manager.
```

The Manager reviews the log with full project awareness, identifies the gap (often missing or insufficient dependency context from the producer Task), and issues a follow-up Task Prompt with the context the Worker needs.

#### Persistent Bugs or Iteration Spirals

A Worker may enter a cycle of repeated debugging attempts without making progress, or produce fixes that keep causing new issues. The Worker's context is being consumed without resolution, and the longer this continues the less useful context remains for actual execution.

If the Worker is persisting without using subagents, direct it to offload the investigation to a debug subagent before continuing. The subagent runs in its own context window so the Worker's context is preserved:

```
Spawn a debug subagent to isolate this issue in a fresh context. Pass it the specific error, relevant file paths, and what you have tried so far.
```

If the Worker has already used subagents and the issue remains unresolved, the problem likely exceeds what can be solved within the Worker's scope. It may be a systemic issue, a planning gap, or something that requires the Manager's coordination-level perspective. Intervene and ask the Worker to log early and return:

```
Stop execution and log with Partial status (or Failed if no progress was made). Describe the issue clearly, what was attempted, what the subagent found if applicable, and your assessment of the root cause. Write the Task Report and direct me to the Manager.
```

The Manager reviews the log with full project awareness and determines the next step: issuing a follow-up with a revised approach, modifying planning documents if the issue is systemic, or restructuring the Task entirely.

### Planning Document Revisions

When execution reveals issues with the planning documents, the Manager can modify them. See [planning document maintenance](Agent_Orchestration.md#planning-documents) for how the three documents relate to each other.

| Change scope | Who handles it |
| :--- | :--- |
| Single Task clarification, adding a missing dependency, isolated Spec addition | Manager (within authority) |
| Multiple Tasks affected, design direction change, scope change, new Stage | Manager with User collaboration |

If the Manager proposes changes that seem too large or too small for the situation, redirect it. The Manager explains its reasoning visibly in chat, so the User can assess whether the proposed modification matches the actual issue.

### Message Bus Issues

**Empty bus** - If `/apm-4-check-tasks` or `/apm-5-check-reports` returns no content, the bus file is empty. The Manager may not have written the Task Prompt yet, or the Worker may not have written the report yet. Check with the other Agent's conversation to confirm the message was sent.

**Wrong agent receives a task** - Workers validate the `agent` field in the Task Prompt against their registered identity. If there is a mismatch, the Worker declines and directs the User to the correct Worker. This typically means the User ran `/apm-4-check-tasks` in the wrong conversation.

## Context Recovery

APM is designed so that project state lives in files, not in any single Agent's context window. When context is lost, whether through platform compaction, a closed conversation, or a degraded Handoff, the state can be reconstructed from those files. This section covers the different recovery scenarios and when to use each approach.

### Handoff vs Recovery

[Handoff](Agent_Orchestration.md#handoff-and-continuity) is a formal APM procedure performed *before* context limits are reached. The User triggers it proactively when the conversation is getting long or the Agent signals context pressure. The outgoing Agent creates structured artifacts (Handoff Log and Handoff Prompt), the incoming Agent reads them and reconstructs context cleanly. Instance numbers increment. This is the intended way to transfer context in APM.

Recovery is a troubleshooting measure for when Handoff was not performed in time. This happens when the platform auto-compacts the conversation, the User accidentally closes or clears a session, or a newly initiated Agent needs to reconstruct context without Handoff artifacts in place. The instance number does not increment because no formal context transfer occurred.

### Recovery

When an Agent's context is lost without a Handoff (auto-compaction, lost conversation, accidental clear), use the recovery command:

```markdown
/apm-9-recover manager          # recover the Manager
/apm-9-recover frontend-agent   # recover a Worker by its identifier
```

The Agent re-reads its procedural documents and explores project artifacts to reconstruct working context. When gaps remain that exploration cannot fill, the Agent asks the User for brief context before continuing. The Agent notes the recovery event in its next communication so the Manager is aware that some working context is reconstructed rather than first-hand.

If recovery does not restore adequate context (the Agent still seems confused or produces inconsistent output), perform a full Handoff instead to start a clean instance.

### Corrupted Handoff

A corrupted Handoff happens when the outgoing Agent's context was already degraded before the Handoff was triggered. This occurs if the User performed a Handoff after auto-compaction instead of using Recovery, or if the Agent exceeded its context window limit before the Handoff command was run. The Handoff artifacts themselves may contain inaccuracies or hallucinations because the outgoing Agent's context was unreliable when it created them.

In general, if auto-compaction has already occurred, Recovery (`/apm-9-recover`) is the better first step. Recover working context, continue working in that conversation, and Handoff later when context limits approach again.

If the User has already proceeded with a Handoff and the incoming Agent's understanding summary reveals corruption:

**Minor gaps** - Provide corrections directly in the incoming Agent's conversation. The Agent integrates them and continues.

**Major issues** - The Handoff artifacts themselves are unreliable. Review and correct them before reinitializing:

- **Handoff Log** in `.apm/memory/handoffs/` - correct any inaccurate working context, decisions, or coordination notes
- **Handoff Prompt** in `.apm/bus/<agent-slug>/handoff.md` - correct current state, outstanding Tasks, or reconstruction instructions

After editing, start a new conversation for the same role and run the initiation command. The incoming Agent reads the corrected artifacts during initialization.

## CLI Issues

### Already Initialized

Running `apm init` when APM is already initialized shows the current state and suggests alternatives.

If an active APM session exists (planning documents, Tracker, Memory with content), use `apm archive` first to preserve the session before reinitializing.

If the `.apm/` artifacts are still templates (no session has started), there is nothing worth archiving. Delete the contents of `.apm/` except `archives/` if it exists, remove the assistant directory files installed by APM, and run `apm init`.

### Version Mismatches

The `agentic-pm` CLI and template releases share major version for compatibility. CLI v1.x fetches only v1.x.x template releases.

If `apm update` reports no compatible releases, the `agentic-pm` CLI may need updating:

```bash
npm update -g agentic-pm
apm update
```

## Migrating from Older Versions

Projects using APM v0.5.x or earlier have a different file structure, metadata format, and CLI than v1.0.0+. The `agentic-pm` CLI v1.0.0+ cannot directly manage v0.5.x installations.

APM provides an optional **migration skill** that can guide an AI agent through the migration process: assessing the old installation, explaining the differences, archiving the existing session with proper metadata conversion, cleaning up old files, and preparing the project for `apm init` with the current `agentic-pm` CLI.

**Installation (Claude Code example):**

```bash
mkdir -p .claude/skills/apm-migration
curl -sL https://raw.githubusercontent.com/sdi2200262/agentic-project-management/main/skills/apm-migration/SKILL.md \
  -o .claude/skills/apm-migration/SKILL.md
```

For other platforms, see the [standalone skills README](https://github.com/sdi2200262/agentic-project-management/tree/main/skills).

After installing, reference the skill in the assistant's chat to begin the migration. The Agent will assess the current state, propose a plan, and execute after approval.

## Related Docs

- [CLI Guide](CLI.md) - All CLI commands and options
- [Customization Guide](Customization_Guide.md) - Custom repositories and template customization
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimization, and workflow efficiency
