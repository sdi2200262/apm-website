---
id: agent-orchestration
slug: /agent-orchestration
sidebar_label: Agent Orchestration
sidebar_position: 4
---

import Diagram from '@site/src/components/Diagram';

# Agent Orchestration

APM coordinates agents through planning documents, file-based communication, and structured memory. All communication passes through you, by design. Every exchange stays open to your review, and the workflow stays platform-agnostic.

This doc covers the coordination mechanisms that connect the roles described in [Agent Roles](Agent_Roles.md).

## Planning Documents

Three documents created during the Planning Phase form the coordination foundation for the entire Implementation Phase.

The **Spec** captures design decisions, constraints, and a Workspace section. The Manager extracts the relevant content into Task Prompts, and Workers do not read the Spec unless you widen their scope.

The **Plan** defines how work is organised: Stages, Tasks, Worker assignments, dependencies and validation criteria. The Manager uses it for dispatch decisions and progress tracking, and Workers do not read it unless you widen their scope.

The **Rules** define how work is performed: execution patterns that apply to all or most Tasks. This is the one document all agents access directly. Only universal patterns belong here; domain-specific guidance goes into Task Prompts. The Rules live in the `APM_RULES` block of workspace-root `AGENTS.md`, alongside your own content. For Claude Code, the Planner imports this file from an existing workspace `CLAUDE.md`.

The Manager may update the Spec, the Plan, or the Rules when execution findings warrant it. Small, contained changes are its call; changes that affect several Tasks, the design direction, the scope, or the Stage structure need your approval. Workers may also [propose Rules updates](Agent_Roles.md#workers) during execution, with changes written only after your approval.

## The Message Bus

Agents communicate through a file-based Message Bus in `.apm/bus/`. The Planner initialises it at the end of the Planning Phase, creating a directory for each Worker defined in the Plan and one for the Manager.

Each Worker's directory contains three bus files:

- **Task Bus** (`task.md`) - The Manager writes Task Prompts here. The Worker reads them when you run `/apm-4-check-tasks` in the Worker's conversation.
- **Report Bus** (`report.md`) - The Worker writes Task Reports here. The Manager reads them when you run `/apm-5-check-reports` in the Manager's conversation.
- **Handoff Bus** (`handoff.md`) - An outgoing agent writes its Handoff Prompt here. The incoming agent reads it during initialisation.

An agent clears its incoming bus before writing its reply, and the Handoff Bus is cleared once read. The Manager's own directory holds only a Handoff Bus.

The delivery step is deliberate. Before you deliver a message, you can review the work behind it and ask for changes. That review keeps you informed about the code being built and helps you catch mistakes early. [Task Cycles](Workflow_Overview.md#task-cycles) walks through each exchange.

<Diagram name="message-bus" alt="The Manager writes to the Worker's Task Bus and the Worker reads it; the Worker writes to its Report Bus and the Manager reads it; you sit between them on both paths." phone />

Non-APM agents can also participate by creating their own directory under `.apm/bus/`. The Manager recognises reports from agents outside the Plan and can incorporate their contributions or assign follow-up work.

## Task Prompts and Dispatch

The Manager's central coordination job is constructing Task Prompts and deciding when and how to dispatch them.

### How Task Prompts Are Built

A Task Prompt is a self-contained document that gives a Worker everything it needs to execute a Task. The Manager builds it from the Task's fields in the Plan, relevant Spec decisions, dependency outputs, Tracker context and lasting findings in Memory. The Spec content is embedded directly, and the Worker never needs to open the Spec.

### Dependency Context

The Manager scales the dependency context to the Worker's familiarity with the earlier work. For the Worker's own earlier Tasks, a light reminder is enough: key file paths and brief references. For another Worker's output, the Task Prompt carries comprehensive context: which files to read, what was produced, and how to integrate it.

After a Worker Handoff, the incoming Worker lacks familiarity with Tasks from earlier Stages, and the Manager treats those dependencies like another Worker's output. After recovery, it likewise gives a Worker fuller context for its own earlier work.

### Dispatch Modes

The Manager assesses all ready Tasks before each dispatch and chooses how to send them:

**Single dispatch** - One Task to one Worker. This is the default when only one Task is ready or when dependencies prevent grouping.

**Batch dispatch** - Two or three Tasks to the same Worker in one message: a sequential chain, or a group of independent Tasks that are ready together. The Worker runs them in order, logs each, stops at the first failure, and reports once.

**Parallel dispatch** - Tasks to different Workers simultaneously when no unresolved cross-Worker dependencies exist. Requires version control; without it, the Manager dispatches one Task at a time.

With version control, each dispatch unit works on its own branch, and parallel units also get their own git worktree. The Manager coordinates all merges. It reviews incoming reports and dispatches ready work without waiting for unrelated Workers.

Task size and dispatch mode set how often exchanges pass through you. Ask the Planner for smaller or larger Tasks, and the Manager for the dispatch mode you want.

## Memory and Session State

Session state lives in structured files outside any agent's context. The Manager is the primary consumer and maintainer of this state.

<Diagram name="overview" variant="state" alt="The overview diagram with the planning documents, the Tracker, and Memory highlighted." phone />

### The Tracker

The Tracker (`.apm/tracker.md`) records Task states (Waiting, Ready, Active, Done), next actions, branches and worktrees, each Worker's conversation number and context, and pending coordination notes. A Task stays Active through execution and review until the Manager makes a final decision. Done is final; later fixes become new Tasks.

### The Index

The Index (`.apm/memory/index.md`) holds lasting findings with source links and a table linking to each Stage summary. Summaries live in `.apm/memory/stage-<NN>/stage-<NN>.summary.md` and record outcomes, consequential findings and decisions, validation and limits, with links to the Task Logs. An incoming Manager can use these records to understand earlier work without loading every log.

### File-based Memory

Memory is organised as a file hierarchy under `.apm/`:

```text
.apm/
├── tracker.md
├── memory/
│   ├── index.md
│   ├── stage-01/
│   │   ├── task-01-01.log.md
│   │   ├── task-01-02.log.md
│   │   ├── task-01-03.log.md
│   │   └── stage-01.summary.md
│   ├── stage-02/
│   │   └── ...
│   └── handoffs/
│       ├── manager/
│       │   └── handoff-01.log.md
│       └── frontend-agent/
│           └── handoff-01.log.md
```

Workers write each Task Log at the path the Manager gives in the Task Prompt. Task Logs are the context bridge between Workers and the Manager: the Manager reads them to make coordination decisions and investigates the code itself when a log raises doubts.

<Diagram name="state-compression" alt="Task Logs hold execution detail and the Tracker holds coordination detail; Stage summaries condense the results, and the Index links to them and records lasting findings." phone />

## Handoff and Continuity

When an agent's context window fills up, a Handoff transfers working knowledge to a fresh instance. It can happen at any point during the Implementation Phase, and you decide when; the Manager may also flag signs of context decay in a Worker's reports. Hand off early, before the quality of the work declines. Run `/apm-6-handoff-manager` or `/apm-7-handoff-worker` in the outgoing conversation, review and approve its Handoff Log and Prompt, then open a new conversation for the same role, and run its initiation command (for a Worker, with its identifier). The incoming agent detects the Handoff Prompt and reconstructs its context; check its account of the current state and next action before continuing.

### Why Handoff Works

Compaction keeps the noise of a long conversation: debugging attempts, trial and error, abandoned approaches. A Handoff filters it into two artifacts. The **Handoff Log** records what was done, decided, and observed beyond the Task Logs, and stays in Memory. The **Handoff Prompt** describes the current state, the outstanding work, and how the incoming agent should continue; it goes to the Handoff Bus and is cleared once read.

<Diagram name="handoff" alt="The outgoing agent writes a Handoff Log to Memory and a Handoff Prompt to the Handoff Bus; you open a new conversation, where the incoming agent reads both with other relevant session state." phone />

### Manager vs Worker Handoff

A **Manager Handoff** describes outstanding Tasks in full: the original Task Prompts may be gone from the bus. A **Worker Handoff** mid-Task points to the Task Prompt still in the bus, and a mid-batch Handoff states the progress of each Task in the batch.

### Context Reconstruction

An incoming **Manager** reads the planning documents, the Tracker, the Index, the Handoff Log, and the current Stage's Task Logs, reading earlier ones on demand.

An incoming **Worker** reads the Rules, the Handoff Log, and its own current-Stage Task Logs. Previous-Stage logs stay unloaded, keeping its context lean for execution, and the Manager compensates with richer dependency context for Tasks that depend on earlier Stages.

### Recovery

If a platform auto-compacts an agent's context and its behaviour degrades - forgetting constraints, repeating questions, losing track of state - or you lose a conversation, run the recovery command:

```markdown
/apm-9-recover manager          # recover the Manager
/apm-9-recover frontend-agent   # recover a Worker
```

Recovery rebuilds working context from the role's instructions, bus and project files. It keeps the same conversation number and records that context was recovered. Use a Handoff when you can anticipate the context limit; see [Context Engineering](Context_Engineering.md#context-across-conversations) for the reasoning and [Troubleshooting](Troubleshooting_Guide.md#context-recovery) for recovery problems.

## Next Steps

- [Workflow Overview](Workflow_Overview.md) - Detailed walkthrough of every procedure in both phases
- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [Context Engineering](Context_Engineering.md) - How APM manages what each agent sees and why
