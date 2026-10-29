---
id: workflow-overview
slug: /workflow-overview
sidebar_label: Workflow Overview
sidebar_position: 5
---

import Diagram from '@site/src/components/Diagram';

# Workflow Overview

An APM session moves from planning to implementation, ending when the planned work is complete or you stop early. This walkthrough builds on [Agent Roles](Agent_Roles.md) and the mechanisms in [Agent Orchestration](Agent_Orchestration.md).

## Planning Phase

The Planner develops the design and division of work with you during Context Gathering, then writes the planning documents during Work Breakdown.

<Diagram name="planning-phase-overview" alt="The Planner gathers context and elicits requirements from you, consolidates them and presents its understanding; once you agree, it creates the planning documents, which you review for completeness before planning completes." />

### Context Gathering

The Planner surveys repositories, existing materials, instructions and archives. It uses materials you identify as authoritative and asks which other planning materials are relevant before reading them. It checks findings against the current codebase.

Discovery follows three question rounds:

1. **Existing Materials and Vision** - Purpose, scope, deliverables and prior work.
2. **Technical Requirements** - Design choices, constraints, dependencies, risks and validation.
3. **Implementation Approach and Quality** - Tools, quality, Task size, Workers, parallelism and review points. This includes Git use, base branches, branch and commit conventions, and whether to track APM files. Ignoring `.apm/` is the default proposal when it is inside a repository.

Each round includes questions, research and follow-ups, then a short summary. The Planner resolves gaps needed to define the work or agrees with you how planned research will settle them. Context supplied at initiation makes questions more targeted but does not skip a round.

The Planner develops tentative Stages, Tasks and Workers as it learns. Once the session's scope and important choices are settled, it presents an **Understanding Summary** for your approval. Corrections are resolved before document writing begins.

### Work Breakdown

The Planner writes the [Spec, Plan and Rules](Agent_Orchestration.md#planning-documents) in that order. For each, it explains the proposal, writes the document and waits for your review and approval before starting the next. Corrections are applied to affected earlier documents too. Task boundaries reflect the work's size, complexity, uncertainty, dependencies and expertise. Research, implementation and validation may share a Task or need separate Tasks; each Task has a clear output and validation criteria.

After Rules approval, it performs any agreed repository initialisation and ignore-file changes. It then creates the Message Bus and directs you to start the Manager in a new conversation with `apm-2-initiate-manager`.

## Implementation Phase

The Manager coordinates repeated cycles of assignment, execution, logging and review.

<Diagram name="implementation-phase-overview" alt="The Manager reviews the planning documents and writes assignments, keeping the Tracker; you notify the Workers, who execute, log to Memory, and report through the Message Bus; you notify the Manager, who reviews logs and reports, until the project is complete." />

### First Manager Initialisation

The Manager reads the planning documents and explores the working codebases. It presents its understanding for your approval, then populates the Tracker and dispatches under the planning agreements.

### Task Cycles

Each Task passes through four procedures:

<Diagram name="task-cycle" alt="For each Task, the Manager prepares a Task Prompt and writes it to the Task Bus; the Worker reads it, executes and validates, writes a Task Log to Memory and a Task Report to the Report Bus; the Manager reads the report, reviews the log, and updates the session state." />

#### Task Assignment

The Manager chooses ready work and a [dispatch mode](Agent_Orchestration.md#dispatch-modes), prepares its branch or worktree when using Git, and writes a self-contained Task Prompt to the Worker's bus. It tells you which Worker conversation to use and which skill to invoke.

A Worker takes one dispatch at a time. New Workers receive it through `apm-3-initiate-worker <id>`; existing Workers through `apm-4-check-tasks`.

#### Task Execution

The Worker integrates the dependencies named in its prompt, follows the instructions under the Rules and validates the result. It runs autonomous checks first, then pauses for checks needing your judgement or outside action.

Failed checks lead to investigation and targeted fixes. Missing dependencies, conflicting instructions, repeated attempts without progress or work that substantially exceeds the assignment need guidance.

You can correct the Worker during execution. At completion, it asks whether corrections to shared execution practices should become Rules. Approved additions go in the existing shared Rules file and are recorded in the Task Log.

#### Task Logging

With version control, the Worker commits its changes. It writes a Task Log with deliverables, validation evidence and consequential findings, then a short Task Report. The outcome is:

- **Success** - The objective is achieved and every validation criterion passed.
- **Partial** - Some work or required validation remains, and guidance is needed.
- **Failed** - The objective was not achieved despite attempts to fix it.

Unavailable or unrun checks remain explicit limits. Findings that affect acceptance or later work are flagged as **Important Findings**; Partial and Failed outcomes always have them.

For a batch, the Worker validates and logs each Task before starting the next. It stops at the first Failed outcome and reports which Tasks were not started.

The Worker clears its Task Bus, writes its report and tells you how to deliver it with `apm-5-check-reports` in the Manager's conversation.

#### Task Review

The Manager checks the Task Log and deliverables against the assignment and planning documents. It investigates Important Findings, unmet criteria and inconsistent claims, resolving contained questions, checks and corrections during review. Its evidence stays separate from the Worker's recorded outcome. It then decides:

- **Accept** - Mark the Task Done, merge accepted work before dependent Tasks, and dispatch newly ready work. You may agree to accept a Partial outcome; its remaining work and validation limits stay recorded.
- **Follow-up** - Send concrete remaining work, reviewed findings and a completion check to the same Worker, using its established context. The Task keeps its ID; each attempt has a new numbered log linked to the original and previous follow-up. Unresolved criteria remain part of the Task's outcome.
- **Planning change** - Update the affected requirements and Task fields before preparing further work. Contained changes can proceed; changes affecting several Tasks, design, scope or Stages need your approval.

The Manager compares follow-ups with previous attempts. If another attempt has no supported approach or the remaining work substantially exceeds the assignment, it presents options to you before dispatching again.

While a decision or follow-up is pending, the Task stays Active. Done is final: a later fix needs a new Task. Corrections to unreported active work preserve its current dispatch and valid progress; the Manager asks you to pause the Worker, revises the prompt and redelivers it through `apm-4-check-tasks`.

The Manager records its decision and next actions in the Tracker, then dispatches ready work without waiting for unrelated reports. Reports from agents outside APM carry their own evidence and skip Worker-log review.

### Stage Progression

Stages run in order, with parallel Tasks within a Stage.

<Diagram name="stage-progression" alt="Stage 1 holds Tasks such as data models, a storage layer, an auth handler, API endpoints, and integration tests; later Stages follow in order until the project is complete." />

The Manager verifies the Stage's combined result when you request it, the Plan calls for it, or any Task needed a follow-up or reported Important Findings. Otherwise it records why verification was skipped. It uses relevant checks and preserves their reference inputs and evidence through cleanup.

A Stage completes once all Tasks are Done, required verification is resolved and, with version control, its branches are merged. The Manager writes the Stage summary, links it from the Index and starts the next Stage. Summaries preserve consequential decisions, evidence and accepted limits.

### Project Completion

After all Stages complete, the Manager records completion and reports deliverables, consequential findings and any accepted limitations. It offers a session summary and archive; both are optional.

## Session Continuation

A larger goal can span several APM sessions. Before summarising or archiving, pause active agents and record unfinished work and Git state.

1. **Summarise** - Invoke `apm-8-summarize-session` in a new conversation, or ask the Manager at completion or early stopping. It checks records against deliverables and writes `.apm/session.summary.md` with outcomes, decisions, validation and remaining limits.
2. **Archive** - Run [`apm archive`](CLI_Guide.md#apm-archive), optionally with `--name <name>`. It preserves records and remaining worktrees before clearing active files and installed instructions. Archiving does not finish, commit or merge work.
3. **Continue** - Run `apm init`, then invoke `apm-1-initiate-planner` in a new conversation. The Planner checks relevant archives against the current workspace.

## Next Steps

- [Prompt Engineering](Prompt_Engineering.md) - How APM's instructions and file formats are designed
- [Context Engineering](Context_Engineering.md) - Why APM scopes and transfers context this way
