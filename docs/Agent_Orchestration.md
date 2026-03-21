---
id: agent-orchestration
slug: /agent-orchestration
sidebar_label: Agent Orchestration
sidebar_position: 4
---

# Agent Orchestration

APM coordinates Agents through planning documents, file-based communication, and structured memory. Agents never communicate with each other directly. The User mediates every exchange by running commands in the appropriate conversation, keeping the workflow platform-agnostic and every interaction visible.

This doc covers the coordination mechanisms that connect the Agent roles described in [Agent Types](Agent_Types.md). Together, these two docs provide the foundation for understanding the full [Workflow Overview](Workflow_Overview.md).

## Planning Documents

Three documents created during the Planning Phase form the coordination foundation for the entire Implementation Phase.

The **Spec** captures design decisions, constraints, and a workspace overview (directory structure, repositories, authoritative documents). The Manager reads it directly and extracts relevant content into Task Prompts so that each Worker receives only the design context it needs. Workers never reference the Spec.

The **Plan** defines how work is organized: Stages, Tasks, Worker assignments, dependencies, and a Dependency Graph. The Planner identifies logical work domains from the project's requirements and maps each domain to a Worker (e.g. Frontend Agent, Backend Agent, API Agent). The Dependency Graph visualizes which Tasks can run in parallel, which form chains, and where one Worker's output feeds into another's. The Manager uses the Plan for dispatch decisions and progress tracking. Workers never reference the Plan.

The **Rules** define how work is performed: universal execution patterns that apply to every Worker regardless of domain. This is the one document all Agents access directly. Because all Workers read the same file, only genuinely universal patterns belong here. Domain-specific guidance goes into Task Prompts via Spec extraction instead.

The flow between phases is direct: the Planner creates all three documents with User approval, then the Manager reads them and uses them to coordinate Workers throughout the Implementation Phase. The Manager may update these documents when execution findings warrant it: the Spec and Plan when design decisions or Task definitions need adjustment. Workers may propose Rules updates when they discover universal patterns during execution, with changes written only after User approval.

## The Message Bus

Agents communicate through a file-based Message Bus in `.apm/bus/`. The Planner initializes it at the end of the Planning Phase, creating a directory for each Worker defined in the Plan and one for the Manager.

Each Worker's directory contains three bus files:

- **Task Bus** (`task.md`) - Manager writes Task Prompts here. The Worker reads them when the User runs `/apm-4-check-tasks` in the Worker's conversation.
- **Report Bus** (`report.md`) - Worker writes Task Reports here. The Manager reads them when the User runs `/apm-5-check-reports` in the Manager's conversation.
- **Handoff Bus** (`handoff.md`) - An outgoing Agent writes its Handoff Prompt here. The incoming Agent reads it during initialization.

The Manager writes to a Worker's Task Bus, the Worker reads it and later writes back to its Report Bus, and the Manager reads the report. The User mediates every exchange by running `/apm-4-check-tasks` to deliver assignments and `/apm-5-check-reports` to deliver reports. Each Agent provides specific guidance covering only its end of the exchange. See [Task Cycles](Workflow_Overview.md#task-cycles) for the full procedural walkthrough.

## Task Prompts and Dispatch

The Manager's central coordination job is constructing Task Prompts and deciding when and how to dispatch them.

### How Task Prompts Are Built

A Task Prompt is a self-contained document that gives a Worker everything it needs to execute a Task. The Manager builds each one by synthesizing three sources:

- **Dependency context** - If the Task depends on prior work, the Manager includes context from the producer Task. How much context depends on whether the Worker is familiar with that work (covered below).
- **Spec content** - The Manager extracts design decisions, constraints, and specifications relevant to this specific Task and embeds them directly in the prompt. No references to the Spec by path.
- **Plan Task fields** - The Task's objective, steps, guidance, output expectations, and validation criteria from the Plan, transformed into actionable instructions.

The result reads like a focused project plan for a single piece of work, complete with context, objectives, detailed instructions, expected outputs, and validation criteria.

### Dependency Context

Tasks often depend on outputs from prior Tasks. How much context the Manager includes depends on the Worker's familiarity with the producer's work:

**Same-Agent dependencies** - The Worker completed the producer Task itself and has working familiarity. The Manager provides light context: recall anchors, key file paths, brief references to previous work.

**Cross-Agent dependencies** - A different Worker completed the producer Task. The consuming Worker has zero familiarity. The Manager provides comprehensive context: file reading instructions, output summaries, and integration guidance.

After a Worker Handoff, the incoming Worker lacks the previous instance's working familiarity with earlier Tasks. The Manager accounts for this by providing more comprehensive context in future Task Prompts, treating those dependencies the same way it would treat work done by a different Worker.

### Dispatch Modes

The Manager assesses all ready Tasks before each dispatch and determines the most efficient way to send them:

**Single dispatch** - One Task to one Worker. The default when only one Task is ready or dependencies prevent grouping.

**Batch dispatch** - Multiple sequential Tasks to the same Worker in a single message. Candidates are either a chain where each Task depends on the previous, or a group of independent same-Worker Tasks all ready simultaneously. The Worker executes them in order, logging each before moving to the next.

**Parallel dispatch** - Tasks to different Workers simultaneously when no unresolved cross-Worker dependencies exist. Requires version control: each dispatch unit operates on its own branch, and the Manager coordinates all merges.

Before dispatching, the Manager may wait if a pending report would unlock Tasks that combine well with what's currently ready, since waiting briefly can produce a more efficient dispatch.

## Memory and Project State

Project state lives in structured files outside any Agent's context. When a conversation ends or an Agent reaches its limits, the state survives in the file system. The Manager is the primary consumer and maintainer of this state.

### The Tracker

The Tracker (`.apm/tracker.md`) is the live project state document, serving as the Manager's operational dashboard. It contains:

- **Task tracking** - Task statuses per Stage (Waiting, Ready, Active, Done), Agent assignments, and branch state. Updated after every Task Review.
- **Agent tracking** - Which Workers exist, their current instance numbers, and coordination notes. Updated when Workers are first initialized and when Handoffs are detected.
- **Version control state** - Base branch, branch convention, and commit convention established by the Planner during the Planning Phase.
- **Working notes** - Ephemeral coordination context that the Manager and User accumulate during a Stage. Includes pending considerations, User preferences, and durable observations.

### The Index

The Index (`.apm/memory/index.md`) is the project's durable memory. It contains:

- **Memory notes** - Persistent observations and patterns with lasting value. Placed first in the file so incoming Managers encounter durable knowledge immediately after Handoff.
- **Stage summaries** - Appended after each Stage completes. Compress a Stage's execution into a coordination-ready summary: outcome, Agents involved, notable findings, and references to individual Task Logs.

At Stage completion, the Manager distills working notes from the Tracker into Memory notes in the Index, retaining only observations that would help a future Agent. Ephemeral items are discarded.

### File-based Memory

Memory is organized as a file hierarchy under `.apm/`:

```text
.apm/
├── tracker.md
├── memory/
│   ├── index.md
│   ├── stage-01/
│   │   ├── task-01-01.log.md
│   │   ├── task-01-02.log.md
│   │   └── task-01-03.log.md
│   ├── stage-02/
│   │   └── ...
│   └── handoffs/
│       ├── manager/
│       │   └── handoff-01.log.md
│       └── frontend-agent/
│           └── handoff-01.log.md
```

Each Stage gets its own directory under `memory/`. Workers write Task Logs directly into the Stage directory for the Task they completed - the Manager provides the exact path in each Task Prompt. Handoff Logs are organized per Agent under `memory/handoffs/`.

Task Logs are the context bridge between Workers and the Manager. The Manager reads logs to understand what happened and make coordination decisions without reviewing code directly. Workers flag findings that might affect the broader project - the Manager interprets these with full project awareness during [Task Review](Workflow_Overview.md#task-review).

Task Logs also serve Handoff continuity. Incoming Agents read relevant logs to reconstruct what was accomplished.

## Handoff and Continuity

When an Agent's context window fills up, a Handoff transfers working knowledge to a fresh instance. Rather than losing accumulated context to compaction, the outgoing Agent captures it in structured artifacts that the incoming Agent reads to resume where the previous left off.

### Why Handoff Works

Normal context compaction accumulates noise: debugging attempts, trial-and-error, abandoned approaches. Handoff filters this through two structured artifacts, each with a distinct purpose:

- **Handoff Log** - Past tense. What was done, what was decided, what was observed. Working knowledge not captured in Task Logs. Stored persistently in Memory.
- **Handoff Prompt** - Present tense. Current state, outstanding work, and specific instructions for the incoming Agent on how to reconstruct context. Written to the Handoff Bus and cleared after the incoming Agent processes it.

The incoming Agent inherits clean, structured context rather than a compressed conversation history.

### Manager vs Worker Handoff

A **Manager Handoff** must describe outstanding Tasks in full within the Handoff Prompt, since the original Task Prompts may no longer be available in the bus files.

A **Worker Handoff** mid-Task can reference the original Task Prompt directly since it's still in the bus. A Worker Handoff between Tasks simply notes readiness to receive the next assignment.

### Context Reconstruction

An incoming **Manager** reads: planning documents, the Tracker, the Index (Memory notes and Stage summaries), the Handoff Log, and relevant recent Task Logs.

An incoming **Worker** reads: the Rules, the Handoff Log, and their own current-Stage Task Logs. Previous-Stage logs are not loaded - keeping the incoming Worker's context lean so most of the budget is available for execution. The Manager compensates by providing richer dependency context in future Task Prompts for any Tasks that depend on work from before the Handoff.

### Recovery

If a platform auto-compacts an Agent's context and behavior degrades - forgetting constraints, repeating questions, losing track of state - the User runs the recovery command:

```markdown
/apm-9-recover manager          # recover the Manager
/apm-9-recover frontend-agent   # recover a Worker
```

Recovery is distinct from Handoff. The Agent re-reads its procedural documents and explores project artifacts to rebuild working context, continuing as the same instance without incrementing the instance number.

## Next Steps

- [Workflow Overview](Workflow_Overview.md) - Detailed walkthrough of every procedure in both phases
- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [Context Engineering](Context_Engineering.md) - How APM manages what each Agent sees and why
