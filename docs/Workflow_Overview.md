---
id: workflow-overview
slug: /workflow-overview
sidebar_label: Workflow Overview
sidebar_position: 5
---

import Diagram from '@site/src/components/Diagram';

# Workflow Overview

An APM session moves from planning to implementation, ending when the planned work is complete or you stop early. This walkthrough builds on [Agent Roles](Agent_Roles.md) and the mechanisms in [Agent Orchestration](Agent_Orchestration.md).

## Where You Take Part

A few points are built in: the approvals in planning and when the Manager starts, and the pause between Stages. The Planner and Manager recommend others, based on the work and your experience. You decide which to take up. Agents take only a clear yes to a stated decision as approval, and don't ask permission for routine steps. Through a session, you take part:

1. **In planning** - You answer the Planner's questions and approve its Understanding Summary, then the Spec, then the Plan. You review its proposed `AGENTS.md` updates.
2. **When the Manager starts** - You approve its understanding of the planning documents, including how you agreed to stay involved.
3. **During Tasks** - Where you agreed with the Planner or Manager to step in, you review changes, run checks only you can run, or settle decisions, such as accepting unmet checks or changes to scope or design. With Workers, you pass on their Task Prompts and Task Reports. You can also take on any Task yourself; see [Your Own Work](#your-own-work).
4. **Between Stages** - The Manager reports each finished Stage and asks before starting the next, unless you agreed otherwise.
5. **At a Handoff** - The outgoing agent recaps what passes on, and you start the fresh conversation.
6. **At completion** - You review the deliverables and decide whether to summarise and archive the session.

You can change where you take part and who does the work by telling the Manager. When you agree on an ongoing change, the Manager replaces the earlier agreement in the Plan and updates affected Task instructions before the work continues.

## Planning Phase

The Planner works with you during Context Gathering to agree what the session will deliver and how the work will proceed. Once you approve its understanding, it writes the planning documents during Work Breakdown.

<Diagram name="planning-phase" alt="The Planner gathers context and elicits requirements from you, consolidates them and presents its understanding; once you agree, it creates the planning documents, which you review for completeness before planning completes." />

### Context Gathering

The Planner surveys your repositories, existing materials, instructions and archives, and checks its findings against the current codebase. It asks you when it's unclear which sources govern.

The Planner's questions cover three topics:

1. **Existing Materials and Vision** - Purpose, scope, deliverables and prior work.
2. **Technical Requirements** - Design choices, constraints, dependencies, risks and validation.
3. **Implementation Approach, Quality and Coordination** - Tools, quality, how the agents will work together, and where you want to stay involved. Where you use version control, agree on base branches, branch and commit conventions, and whether to track APM files.

The Planner has at least one exchange with you on each topic and returns to earlier topics when later answers affect them. It signals when the conversation moves to a new topic. Where the context already answers its questions, it confirms its understanding and asks what to add or correct. When planning depends on implementation results, the Planner usually recommends a later session.

Before presenting its **Understanding Summary**, the Planner confirms how you'll take part. It points out work that can proceed independently or overlap, and work that benefits from the same agent carrying it through in sequence. The summary covers what the session will deliver and how the work will proceed. Review and correct it before giving your approval.

### Work Breakdown

The Planner writes the [Spec and Plan](Agent_Orchestration.md#planning-documents) in that order. For each, it explains the proposal, writes the document and waits for your approval before starting the next. It applies corrections to affected earlier documents too.

The Plan gives each Task a useful result with the setup and checks it needs. The Planner weighs dependencies, size and coordination cost when splitting or combining work. It groups Tasks that can be assessed together into Stages and prefers fewer Stages for small sessions. You can also agree to reviews within a Stage.

After Plan approval, it reviews workspace-root `AGENTS.md` and proposes updates, creating the file if it's missing. It then creates the Message Bus and directs you to start the Manager in a new conversation with `apm-2-initiate-manager`.

## Implementation Phase

The Manager coordinates repeated cycles of assignment, execution, logging and review. Its own Tasks run through its subagents. When the work uses Workers in separate conversations, as the diagram shows, their messages go through the Message Bus and you deliver them.

<Diagram name="implementation-phase" alt="The Manager reviews the planning documents and writes assignments, keeping the Tracker; you deliver their assignments to the Workers, who execute, log to Memory, and report through the Message Bus; you deliver the reports to the Manager, who reviews logs and reports, until the project is complete." />

### First Manager Initialisation

The Manager reads the planning documents and explores the working codebases. It presents its understanding for your approval. If the session uses version control, it includes the setup for the first work and the conventions it will follow. After approval, it populates the Tracker, applies any agreed setup and starts ready work.

### Task Cycles

The Plan names who carries out each Task: the Manager, through its subagents, or a Worker.

A Task assigned to a Worker passes through four procedures:

<Diagram name="task-cycle" alt="For each Task, the Manager prepares a Task Prompt and writes it to the Task Bus; the Worker reads it, executes and validates, writes a Task Log to Memory and a Task Report to the Report Bus; the Manager reads the report, reviews the log, and updates the session state." />

#### Task Assignment

The Manager chooses ready work and a [dispatch mode](Agent_Orchestration.md#dispatch-modes), prepares the workspace and writes a self-contained Task Prompt to the Worker's bus. It tells you which Worker conversation to use and which skill to invoke.

A Worker takes one Task or batch at a time. New Workers receive it through `apm-3-initiate-worker <id>`; existing Workers through `apm-4-check-tasks`.

#### Task Execution

The Worker builds on the dependencies named in its prompt, follows the instructions and `AGENTS.md`, and validates the result. It runs its own checks first, then pauses for checks that need your judgement or outside action. It fixes failures within its Task and asks for guidance when a problem goes beyond it, such as missing dependencies or conflicting instructions.

You can correct the Worker during execution. At completion, it asks whether corrections to workspace conventions should go in `AGENTS.md`, unless you already said how to handle them.

#### Task Logging

The Worker completes any review you agreed to and follows the agreed commit conventions. It then writes a short Task Report and a Task Log covering its deliverables, validation results, findings and any uncommitted work. The outcome is:

- **Success** - The objective is achieved and every validation criterion passed.
- **Partial** - Some work or required validation remains.
- **Failed** - The objective was not achieved despite attempts to fix it.

The log names any check that could not be run. Findings that affect acceptance or later work are flagged as **Important Findings**; Partial and Failed outcomes always have them.

For a batch, the Worker validates and logs each Task before starting the next. It stops at the first Partial or Failed outcome and reports which Tasks were not started.

It tells you how to deliver the report with `apm-5-check-reports` in the Manager's conversation.

#### Task Review

The Manager checks the Task Log and deliverables against the Task Prompt and planning documents, and looks into Important Findings and unmet criteria. It can finish small amounts of remaining work and run final validation itself. Substantial or uncertain work normally gets an independent review by a separate subagent. The Manager scales review to the work: one reviewer can cover related Tasks, and small, well-checked changes may need none. It then decides:

- **Accept** - Mark the Task Done, integrate accepted work that dependent Tasks need, and dispatch newly ready work. You may agree to accept a Partial outcome; the work and checks it leaves open stay recorded.
- **Follow-up** - Send the remaining work and review findings to the same Worker, which already has the context. The Task keeps its ID, and each attempt gets its own log.
- **Planning change** - Update the affected requirements and Task fields before preparing further work. Changes within one Task can proceed; changes affecting several Tasks, design, scope or Stages need your approval.

If another attempt seems unlikely to help, the Manager presents options to you first. While a decision or follow-up is pending, the Task stays Active. Done is final: a later fix needs a new Task. The Manager records its decision in the Tracker.

### Manager Tasks

For its own Tasks, the Manager hands substantial implementation to subagents and focuses on coordination and review. It handles small investigations, corrections and final checks itself, and does substantial implementation directly only if you explicitly agree and the Plan records it.

The Manager checks the subagents' results and validates each Task. Substantial or uncertain work normally gets the same independent review. It then writes one Task Log for the Task, using the same outcomes as Worker logs. It accepts unmet work or checks only with your agreement.

### Your Own Work

You can take on any Task, or part of one, or hand it back later. Tell the Manager for its own Tasks, or the Worker for a Worker's Task. That agent stops overlapping work, briefs you on progress and pending checks, and stays available to help. When you hand the work back, it checks your changes, validates the result and logs the Task as usual.

### Stage Progression

Stages run in order. Within a Stage, Tasks whose dependencies are done can run in parallel.

<Diagram name="stage-progression" alt="Stage 1 holds Tasks such as data models, a storage layer, an auth handler, API endpoints, and integration tests; later Stages follow in order until the project is complete." />

The Manager runs any Stage checks you or the Plan asked for, and tests how the Stage's work fits together where Task checks haven't already covered it. Once all Tasks are Done and those checks are resolved, it writes the Stage summary, reports the Stage to you and asks before starting the next one, unless you agreed otherwise. The summary keeps the Stage's decisions, validation results and any issues you accepted.

### Project Completion

After all Stages complete, the Manager records completion and reports the deliverables, findings that matter for later work, and any issues you accepted. It explains what archiving preserves and clears before asking if you want a saved summary, an archive, or both.

## Session Continuation

A larger goal can span several APM sessions. Before summarising or archiving, pause active work and record what's unfinished; if you stop early, the Manager does this with you.

1. **Summarise** - Invoke `apm-8-summarize-session` in a new conversation, or ask the Manager at completion or early stopping. It checks the Tracker and Memory against the deliverables and writes `.apm/session.summary.md` with outcomes, decisions, validation and open issues.
2. **Archive** - Run [`apm archive`](CLI_Guide.md#apm-archive), optionally with `--name <name>`. It preserves the session's `.apm/` files and linked Git worktrees under `.apm/worktrees/` before clearing active files and installed instructions. Archiving does not finish, commit or merge work.
3. **Continue** - Run `apm init`, then invoke `apm-1-initiate-planner` in a new conversation. The Planner checks relevant archives against the current workspace.

## Next Steps

- [Prompt Engineering](Prompt_Engineering.md) - How APM's instructions and file formats are designed
- [Context Engineering](Context_Engineering.md) - Why APM scopes and transfers context this way
