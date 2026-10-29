---
id: agent-orchestration
slug: /agent-orchestration
sidebar_label: Agent Orchestration
sidebar_position: 4
---

import Diagram from '@site/src/components/Diagram';

# Agent Orchestration

The [Planner, Manager and Workers](Agent_Roles.md) coordinate through planning documents, a file-based Message Bus and shared records. You deliver their messages, keeping each exchange open to review.

## Planning Documents

The Planner creates three documents:

- **Spec** (`.apm/spec.md`) - Required behavior, design decisions and constraints. Its Workspace section records repositories, references and agreed Git setup.
- **Plan** (`.apm/plan.md`) - Ordered milestones called **Stages**, each containing bounded assignments called **Tasks**. Tasks name a Worker, dependencies, outputs and validation criteria.
- **Rules** - Shared Worker execution conventions, in the `APM_RULES` block of workspace-root `AGENTS.md`. For Claude Code, the Planner imports it from an existing workspace `CLAUDE.md`, preserving your instructions.

Spec Notes hold design assumptions and context; Plan Notes hold coordination considerations. Settled requirements, dependencies and conventions stay in their owning sections. APM procedures stay in the role guides.

The Manager maintains these documents and copies relevant Spec and Plan content into assignments called **Task Prompts**. Workers read the Rules directly. [Workflow Overview](Workflow_Overview.md#task-review) covers changes during implementation.

## The Message Bus

The Message Bus lives in `.apm/bus/`. Each Worker has a folder named by its identifier, such as `frontend-agent`, with three files:

| Bus | File | Message |
| :--- | :--- | :--- |
| **Task Bus** | `task.md` | A Task Prompt from the Manager: the assignment |
| **Report Bus** | `report.md` | A Task Report from the Worker: the outcome and Task Log path |
| **Handoff Bus** | `handoff.md` | A Handoff Prompt: instructions for a fresh conversation |

The Manager's folder holds only `handoff.md`. Each file holds at most one pending message. An agent clears a processed message before replying; Handoff Prompts are cleared after loading.

You deliver each message by invoking a skill in its recipient's conversation. [Getting Started](Getting_Started.md#step-4-your-first-task-cycle) walks through the delivery steps.

<Diagram name="message-bus" alt="The Manager writes to the Worker's Task Bus and the Worker reads it; the Worker writes to its Report Bus and the Manager reads it; you sit between them on both paths." phone />

Agents outside APM can contribute through their own bus folders. Their reports carry their evidence directly; they do not become Workers or write Task Logs.

## Task Prompts and Dispatch

### How Task Prompts Are Built

A Task Prompt gives a Worker the objective, instructions, working directory, expected output and validation. The Manager combines the Plan's Task entry with relevant Spec decisions, dependency outputs, coordination notes and lasting findings. This keeps each assignment self-contained.

### Dependency Context

A Task depends on another when it needs that Task's output. The Manager scales the supplied context to the Worker's familiarity:

- **Same-Worker dependency** - Its own earlier work: key outputs, paths and how to build on them.
- **Cross-Worker dependency** - Unfamiliar work: what was produced, which files to read and how to integrate it.

After a Handoff, a Worker has not loaded its earlier-Stage Task Logs, so those dependencies need Cross-Worker context. Recovery may also leave gaps that require fuller instructions.

### Dispatch Modes

A dispatch sends ready work to a free Worker:

- **Single** - One Task.
- **Batch** - Two or three Tasks for the same Worker: independent ready Tasks or a dependency chain. The Worker runs them in order and reports once.
- **Parallel** - Independent Tasks or batches for different Workers at the same time. This requires version control and a separate Git worktree for each Worker.

With version control, each dispatch gets a branch and the Manager coordinates merges. It reviews reports and dispatches ready work without waiting for unrelated Workers.

Task size and dispatch mode determine how often exchanges pass through you. Discuss Task size with the Planner and dispatch preferences with the Manager.

## Memory and Session State

Shared files keep the session's state outside any conversation. The **Tracker** holds live coordination state; **Memory** preserves work history and continuation context.

<Diagram name="overview" variant="state" alt="The overview diagram with the planning documents, the Tracker, and Memory highlighted." phone />

### The Tracker

The Tracker (`.apm/tracker.md`) records Task states and next actions, branches and worktrees, each Worker's conversation number and context, and coordination notes. Notes remain while ongoing work needs them or their decisions await a Stage summary or Index entry. The Manager updates the Tracker after review and dispatch. Tasks are Waiting on dependencies, Ready to assign, Active through execution and review, or Done after a final decision.

### The Index

The Index (`.apm/memory/index.md`) holds brief findings and accepted or unresolved limits that later work needs, with source links and a table linking to Stage summaries. Each summary records accepted outcomes, consequential findings and decisions, validation and limits, with links to its Task Logs.

### File-based Memory

Memory lives in `.apm/memory/`:

- **Task Logs** - A Worker's evidence and findings for one Task, at `stage-<NN>/task-<NN>-<MM>.log.md`.
- **Stage summaries** - The Manager's record of a Stage, at `stage-<NN>/stage-<NN>.summary.md`.
- **Handoff Logs** - Working context for the next conversation, at `handoffs/<agent-slug>/handoff-<NN>.log.md`.

The Index provides navigation through these records. [Quick Reference](Quick_Reference.md#project-structure) shows the full directory layout.

<Diagram name="state-compression" alt="Task Logs hold execution detail and the Tracker holds coordination detail; Stage summaries condense the results, and the Index links to them and records lasting findings." phone />

## Handoff and Continuity

A Handoff transfers a Manager or Worker role to a fresh conversation. The outgoing agent checks current files and Git state, prepares its continuation records and asks you to review them. The incoming agent uses the approved records to resume. [Getting Started](Getting_Started.md#context-limits) gives the steps.

### Why Handoff Works

A Handoff saves selected working context in files that later conversations can reread. It produces two records:

- **Handoff Log** - What was done, decided and observed beyond the Task Logs. It stays in Memory.
- **Handoff Prompt** - Checked current state, what to read and where to resume. It travels through the Handoff Bus.

[Context Engineering](Context_Engineering.md#context-across-conversations) explains why APM uses these records rather than relying on conversation compaction.

<Diagram name="handoff" alt="The outgoing agent writes a Handoff Log to Memory and a Handoff Prompt to the Handoff Bus; you open a new conversation, where the incoming agent reads both with other relevant session state." phone />

### Manager vs Worker Handoff

The Manager records outstanding assignments, reports and merges. A Worker mid-Task keeps its Task Prompt in the bus and records where to resume; mid-batch, it also records which Tasks are already logged.

### Context Reconstruction

An incoming Manager reads planning documents, the Tracker, the Index, its Handoff Log and the Task Logs needed for current coordination.

An incoming Worker reads the Rules, its Handoff Log and its own current-Stage Task Logs. The Manager supplies richer dependency context for earlier work it has not read.

### Recovery

Recovery rebuilds context after compaction or a lost conversation without changing the role's conversation number. It rereads instructions, bus messages and project files, asking you about gaps the records cannot settle. See [Troubleshooting](Troubleshooting_Guide.md#context-recovery) for commands and recovery problems.

## Next Steps

[Workflow Overview](Workflow_Overview.md) follows these mechanisms through planning, implementation and session closure.
