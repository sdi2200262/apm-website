---
id: workflow-overview
slug: /workflow-overview
sidebar_label: Workflow Overview
sidebar_position: 5
---

import Diagram from '@site/src/components/Diagram';

# Workflow Overview

This doc walks through every procedure in both phases of an APM session, in order. It builds on the roles and mechanisms of the previous two docs, [Agent Roles](Agent_Roles.md) and [Agent Orchestration](Agent_Orchestration.md).

## Planning Phase

The Planning Phase produces the planning documents that guide all subsequent work. The [Planner](Agent_Roles.md#planner) works through two sequential procedures: Context Gathering, then Work Breakdown.

<Diagram name="planning-phase" alt="The Planner gathers context and elicits requirements from you, consolidates them and presents its understanding; once you agree, it creates the planning documents, which you review for completeness before planning completes." />

### Context Gathering

The Planner conducts structured discovery through three progressive question rounds, each building on the previous.

Before the questions start, the Planner scans the workspace for repositories, existing materials, and your assistant's rules file. It treats materials you name in your initiation context as authoritative and asks you to confirm anything else it finds before exploring it in depth. Archived sessions in `.apm/archives/` are examined through the `apm-archive-explorer` subagent and checked against the current codebase. Context you pass with `/apm-1-initiate-planner` makes its questions more targeted, and discovery still runs.

**Round 1 - Existing Materials and Vision.** What the project is, why it exists, and what materials and prior work you already have.

**Round 2 - Technical Requirements.** Design decisions, constraints, dependencies, risks, and how the work will be validated.

**Round 3 - Implementation Approach and Quality.** Your preferences for workflow, quality standards, and approvals, and the final design decisions.

After each round, the Planner follows up on any gaps. When your answers point to existing code, it explores it, sending subagents on substantial research to preserve its own context for Work Breakdown and checking their critical claims against the files. Each round ends with a short summary of what was gathered.

After all three rounds, the Planner presents a consolidated **Understanding Summary**. Corrections loop through targeted follow-ups until you approve, before any planning document is written.

### Work Breakdown

The Planner writes the three [planning documents](Agent_Orchestration.md#planning-documents) one at a time: the Spec, then the Plan, then the Rules. Before each, it presents its reasoning in chat, and you can redirect it before anything is written. It waits for your approval before starting the next.

After all three approvals, the Planner initialises the [Message Bus](Agent_Orchestration.md#the-message-bus) and the Planning Phase is complete. The Manager checks the work against these documents, and Workers receive what they need from them through their Task Prompts. A gap here carries into implementation. To continue, open a new conversation and run `/apm-2-initiate-manager`.

## Implementation Phase

The Implementation Phase executes the planning documents, with the [Manager](Agent_Roles.md#manager) coordinating and [Workers](Agent_Roles.md#workers) executing Tasks.

<Diagram name="implementation-phase" alt="The Manager reviews the planning documents and writes assignments, keeping the Tracker; you notify the Workers, who execute, log to Memory, and report through the Message Bus; you notify the Manager, who reviews logs and reports, until the project is complete." />

### First Manager Initialisation

The first Manager instance reads the planning documents, then:

- Explores the git state of each working repository (branches, recent history, and existing patterns) and combines it with the Planner's notes in the Spec and Plan headers. If `.apm/` is inside a repository, it adds `.apm/` to `.gitignore` by default and asks whether you want to track any of it in git.
- Presents an Understanding Summary alongside proposed version control conventions, for your approval.
- On approval, writes the conventions to the Tracker and the Rules file, populates the Tracker with Stage 1 Tasks and all Workers, and begins dispatching.

### Task Cycles

Each Task progresses through four procedures: Task Assignment, Task Execution, Task Logging, and Task Review.

<Diagram name="task-cycle" alt="For each Task, the Manager prepares a Task Prompt and writes it to the Task Bus; the Worker reads it, executes and validates, writes a Task Log to Memory and a Task Report to the Report Bus; the Manager reads the report, reviews the log, and updates the session state." />

#### Task Assignment

The Manager assesses which Tasks are ready, then determines the [dispatch mode](Agent_Orchestration.md#dispatch-modes) - single, batch, or parallel.

For each Task, the Manager [constructs a self-contained Task Prompt](Agent_Orchestration.md#how-task-prompts-are-built) and writes it to the Worker's Task Bus, directing you to the Worker's conversation. Before delivering the prompt, you can read it and ask the Manager for changes.

For Workers not yet initialised, you open a new conversation and run `/apm-3-initiate-worker <id>` with the identifier the Manager gives you. For batch dispatch, the Manager summarises what the Worker will receive. For parallel dispatch, it lists each Worker with its required action.

#### Task Execution

The Worker receives the Task Prompt, either on initialisation or through `/apm-4-check-tasks` for later Tasks. It reads any files from [other agents' work](Agent_Orchestration.md#dependency-context) that the prompt names, executes the instructions under the Rules, and validates the result against the prompt's criteria. It completes autonomous checks first and pauses for you only when a criterion needs your judgement or action. You can interrupt or steer the Worker at any point.

If validation fails, the Worker traces the root cause and retries, bringing in a debug subagent when a fix does not hold. If the issue persists, it presents the situation to you and reports Partial status.

When you give a correction or directive during execution, the Worker complies immediately and continues. At Task completion, the correction is noted in the Task Log as an important finding for the Manager. After logging and reporting, the Worker asks whether the correction should become a Rule for all Workers; you may decline.

#### Task Logging

Once execution is complete, the Worker writes a Task Log to Memory with the outcome status (Success, Partial, or Failed), validation results, deliverables, and any flags for the Manager. It then writes a brief Task Report to its Report Bus and directs you to deliver it to the Manager. Before you deliver it, you can review the work - the changes, the tests, the Worker's summary - and ask the Worker for more.

For batch execution, the Worker logs each Task as it completes and writes one consolidated report at the end, or when it stops on a failure.

#### Task Review

The Manager receives the report via `/apm-5-check-reports` (add a Worker's identifier when several are active) and reviews it as an outsider to the code. It reads the Task Log, checks that the claimed status matches the log's content, and checks the work against what it assigned and against the planning documents. For anything doubtful, it investigates itself or sends a subagent. There are three outcomes:

- **Proceed** - The Manager updates the [Tracker](Agent_Orchestration.md#the-tracker), merges the dispatch unit's branch where needed, and dispatches newly ready Tasks.
- **Follow-up** - The Worker retries from a new Task Prompt with refined instructions, overwriting its previous log.
- **Document modification** - Execution revealed a problem in the Spec, Plan, or Rules. The Manager works out the knock-on effects and brings you in when the change is beyond its authority. It then proceeds or issues a follow-up.

A report from a [non-APM agent](Agent_Orchestration.md#the-message-bus) skips the log review.

After each review, the Manager reassesses readiness and dispatches the next Task in the same turn when one is ready. It pauses only when no Tasks are ready and Workers are active, or when a decision requires your collaboration.

### Stage Progression

Stages are sequential: each begins once the previous one completes. Parallel work happens only within a Stage, through parallel Task dispatch.

<Diagram name="stage-progression" alt="Stage 1 holds Tasks such as data models, a storage layer, an auth handler, API endpoints, and integration tests; later Stages follow in order until the project is complete." />

After all Tasks in a Stage are Done, the Manager decides from the Stage's complexity and the Task Reviews whether the Stage needs holistic verification, and runs it where needed. It then writes a Stage summary to the [Index](Agent_Orchestration.md#the-index) and moves to the next Stage.

### Project Completion

After all Stages complete, the Manager marks the project as complete in the Tracker and presents a summary of what was delivered, what was found along the way, and how each Stage went. It then guides you through the optional next steps in Session Continuation, below.

## Session Continuation

When an APM session ends, whether through project completion, a decision to pause, or a shift in direction, you can archive the session and begin a new one.

1. **Summarise** - Run `/apm-8-summarize-session` in a new conversation. The summarisation agent reads the `.apm/` artifacts, validates them against the current codebase, and produces a session summary of decisions, completed work, and lessons learned. It also offers to archive the session.
2. **Archive** - Run [`apm archive`](CLI_Guide.md#apm-archive) (or `apm archive --name custom-name`). This snapshots all `.apm/` contents except `archives/` into `.apm/archives/`, then removes the active session files, installed assistant files, and installation metadata.
3. **Continue** - Run `apm init` to start a new APM session with fresh templates. The new Planner detects existing archives during Context Gathering and asks about their relevance. Each session can then build on earlier ones.

## Next Steps

- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [Context Engineering](Context_Engineering.md) - How APM manages what each agent sees and why
- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimisation, and workflow efficiency
- [Customisation Guide](Customisation_Guide.md) - Custom repositories and template customisation
