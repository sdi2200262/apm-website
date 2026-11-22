---
id: agent-orchestration
slug: /agent-orchestration
sidebar_label: Agent Orchestration
sidebar_position: 4
---

import Diagram from '@site/src/components/Diagram';

# Agent Orchestration

The [Planner, Manager and Workers](Agent_Roles.md) coordinate through planning documents and shared files. The Manager's subagents return their results to it directly. When the work uses Workers in separate conversations, the Manager and Workers exchange messages through a file-based Message Bus. By default, you deliver each message and can review it.

## Planning Documents

The Planner creates two documents:

- **Spec** (`.apm/spec.md`) - Intended outcomes, required behavior, design decisions, acceptance criteria and constraints, including the version control agreement.
- **Plan** (`.apm/plan.md`) - How to deliver and check the work through ordered milestones called **Stages**, each containing bounded units of work called **Tasks**. Each Task names who carries it out (the Manager or a Worker), its dependencies, outputs and checks.

Lasting workspace conventions live in workspace-root `AGENTS.md`. The Planner proposes changes to it for your approval, and the Manager and Workers keep it current. For Claude Code, the Planner adds an import of `AGENTS.md` to an existing `CLAUDE.md`, preserving your instructions.

The Spec and Plan each have a Notes section. Spec Notes hold assumptions, open decisions and alternatives that apply across the design. They also describe any optional documents agreed for the session, such as research under `.apm/research/`. Plan Notes record where you agreed to take part and how Tasks coordinate. They can suggest coordination options and say when those options would help.

The Manager maintains these documents and copies relevant Spec and Plan content into **Task Prompts**, the messages that assign Tasks to Workers. Workers read `AGENTS.md` directly. [Workflow Overview](Workflow_Overview.md#task-review) covers changes during implementation.

## The Message Bus

When APM uses separate Worker conversations, their messages go through the Message Bus in `.apm/bus/`. Each Worker has a folder named by its identifier, such as `frontend-agent`, with three files:

| Bus | File | Message |
| :--- | :--- | :--- |
| **Task Bus** | `task.md` | A Task Prompt from the Manager: the assignment |
| **Report Bus** | `report.md` | A Task Report from the Worker: the outcome and Task Log path |
| **Handoff Bus** | `handoff.md` | A Handoff Prompt: instructions for a fresh conversation |

The Manager's folder holds only `handoff.md`, for its own Handoffs. Each file holds one message at a time; its reader clears it after processing.

You deliver each message by invoking a skill in its recipient's conversation. [Getting Started](Getting_Started.md#working-with-a-worker) walks through the delivery steps.

<Diagram name="message-bus" alt="The Manager writes to the Worker's Task Bus and the Worker reads it; the Worker writes to its Report Bus and the Manager reads it; you sit between them on both paths." phone />

## Task Prompts and Dispatch

### Task Prompts and Subagent Briefs

A Task Prompt gives a Worker the objective, instructions, working directory, expected output and validation. The Manager adds the Spec decisions, dependency outputs and findings the Task needs.

Subagents get a shorter brief from the agent that delegates to them: the objective, permitted scope, needed context and expected results. The delegating agent checks their results before relying on them.

### Dependency Context

A Task depends on another when it needs that Task's output. Before starting a Task, the Manager checks its listed dependencies against the results it needs and resolves any mismatches in the Plan and Tracker.

For a Worker's own earlier work, the Manager points briefly to the key outputs. For work the Worker hasn't seen, including its own earlier work after a Handoff, it explains what was produced, which files to read and how to build on it.

### Dispatch Modes

A dispatch sends ready work to a free Worker:

- **Single** - One Task.
- **Batch** - Two or three Tasks for the same Worker: independent ready Tasks or a dependency chain. The Worker runs them in order and reports once.
- **Parallel** - Independent Tasks or batches for different Workers at the same time. For work in one repository, use separate working copies where available, such as Git worktrees, Jujutsu workspaces or Mercurial shared clones. Check what state and resources they still share. In a shared working directory, give each Task separate writable paths and keep inputs stable. The same rules apply to the Manager's subagents.

The Manager integrates accepted work as agreed during planning and makes sure each Task has the earlier work it depends on.

With Workers, Task size and dispatch mode determine how often exchanges pass through you. Discuss Task size with the Planner and dispatch preferences with the Manager.

The Manager's subagents can take one Task, a group of related Tasks or part of several, and each returns its results when it finishes.

## Memory and Session State

The **Tracker** and **Memory** are the coordination documents. The Tracker shows what is happening now and what needs to happen next. Memory preserves work history and context for later work.

<Diagram name="overview" variant="state" alt="The overview diagram with the planning documents, the Tracker, and Memory highlighted." phone />

### The Tracker

The Tracker (`.apm/tracker.md`) records Task states and next actions, branches and worktrees, the Manager's and each Worker's conversation number, and current coordination notes. Each Handoff starts a role's next numbered conversation; the number identifies which conversation wrote each log. Tasks are Waiting on dependencies, Ready to assign, Active through execution and review, or Done after a final decision.

Tracker Notes explain blockers, pending decisions, tentative preferences and proposals that affect current work. They say when the information applies and how it affects the next action or decision.

### File-based Memory

Memory lives in `.apm/memory/`:

- **Task Logs** - Results, validation and findings for each Task, in `stage-<NN>/`. The Manager writes one log for each of its own Tasks; a Worker writes one for each attempt, and follow-up logs link back to earlier ones.
- **Stage summaries** - The Manager's record of a Stage, at `stage-<NN>/stage-<NN>.summary.md`.
- **Handoff Logs** - What the next conversation needs to continue, at `handoffs/<agent-slug>/handoff-<NN>.log.md`.

[Quick Reference](Quick_Reference.md#project-structure) shows the full directory layout.

### The Index

The Index (`.apm/memory/index.md`) lists Stage outcomes and links to their summaries. Index Notes preserve findings, limits, established preferences and agreed changes that matter to later work, with links to their sources.

Each Stage summary records accepted outcomes, findings, decisions, validation results and any issues you accepted, with links to its Task Logs. The Manager keeps the summary current until the next Stage starts or the session closes. When a later Stage changes an earlier result, its summary links to the earlier work.

When a Tracker or Index note describes a consequential document update, it gives the before and after, the reason for the change, and its effect on the work. It links to the updated section.

<Diagram name="state-compression" alt="Task Logs hold execution detail and the Tracker holds coordination detail; Stage summaries condense the results, and the Index links to them and records lasting findings." phone />

## Handoff and Continuity

A Handoff transfers a Manager or Worker role to a fresh conversation. The outgoing agent checks current files and any version control state, writes its Handoff Log and Handoff Prompt, and gives you a short recap. Reviewing the Handoff files is optional. [Getting Started](Getting_Started.md#context-limits) gives the steps.

### Why Handoff Works

A Handoff writes down what later conversations need to continue. It produces two files:

- **Handoff Log** - What was done, decided and observed beyond the Task Logs. It stays in Memory.
- **Handoff Prompt** - Checked current state, what to read and where to resume. It travels through the Handoff Bus.

[Context Engineering](Context_Engineering.md#context-across-conversations) explains why APM uses these files rather than relying on conversation compaction.

<Diagram name="handoff" alt="The outgoing agent writes a Handoff Log to Memory and a Handoff Prompt to the Handoff Bus; you open a new conversation, where the incoming agent reads both with other relevant session state." phone />

Before its Handoff, the Manager pauses running subagents and records outstanding Task Prompts, Task Reports and any work you are doing yourself. A Worker records where to resume its current Task, including any part you are doing yourself. The incoming agent reads its Handoff Log with the session files it needs, such as the Tracker for a Manager or its recent Task Logs for a Worker.

### Recovery

Recovery rebuilds context after compaction or a lost conversation without changing the role's conversation number. It rereads instructions, bus messages and project files, asking you about gaps the files cannot settle. See [Troubleshooting](Troubleshooting_Guide.md#context-recovery) for commands and recovery problems.

## Next Steps

[Workflow Overview](Workflow_Overview.md) follows these mechanisms through planning, implementation and session closure.
