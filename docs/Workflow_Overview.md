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

The Planning Phase produces the planning documents that guide all subsequent work. The [Planner](Agent_Roles.md#planner) works through two procedures: Context Gathering develops the design and division of work with you; Work Breakdown turns the approved understanding into documents.

<Diagram name="planning-phase-overview" alt="The Planner gathers context and elicits requirements from you, consolidates them and presents its understanding; once you agree, it creates the planning documents, which you review for completeness before planning completes." />

### Context Gathering

The Planner conducts structured discovery through three progressive question rounds, each building on the previous.

Before the questions start, the Planner scans the workspace for repositories, existing materials, and your assistant's rules file. It treats materials you name in your initiation context as authoritative and asks you to confirm anything else it finds before exploring it in depth. The Planner reads relevant archives in `.apm/archives/` and checks them against the current codebase. Context you pass with `/apm-1-initiate-planner` makes its questions more targeted, and discovery still runs.

**Round 1 - Existing Materials and Vision.** What the project is, why it exists, and what materials and prior work you already have.

**Round 2 - Technical Requirements.** Design decisions, constraints, dependencies, risks, and how the work will be validated.

**Round 3 - Implementation Approach and Quality.** Your preferences for workflow, quality, Task size, Workers, parallelism and review points. The Planner also agrees Git use, base branches, branch and commit conventions, and whether to track APM files. If `.apm/` is inside a repository, ignoring it is the default proposal.

After each round, the Planner follows up on any gaps. When your answers point to existing code, it explores it. It may delegate focused research to native subagents, then checks their findings before using them. Each round ends with a short summary of what was gathered.

During the rounds, the Planner develops tentative Stages, Tasks and Workers with you, revising them as it learns. After agreeing the session's scope, it presents a consolidated **Understanding Summary**. Corrections loop through targeted follow-ups until you approve, before any planning document is written.

### Work Breakdown

The Planner writes the three [planning documents](Agent_Orchestration.md#planning-documents) one at a time: the Spec, then the Plan, then the Rules. It explains its proposal, writes the document, then waits for your review and approval before starting the next.

The Rules go in workspace-root `AGENTS.md`. The Planner preserves existing instructions and imports it from an existing workspace `CLAUDE.md` for Claude Code. Any agreed repository initialisation or ignore-file changes follow Rules approval.

After all three approvals, the Planner initialises the [Message Bus](Agent_Orchestration.md#the-message-bus) and the Planning Phase is complete. The Manager checks the work against these documents, and Workers receive what they need from them through their Task Prompts. A gap here carries into implementation. To continue, open a new conversation and run `/apm-2-initiate-manager`.

## Implementation Phase

The Implementation Phase executes the planning documents, with the [Manager](Agent_Roles.md#manager) coordinating and [Workers](Agent_Roles.md#workers) executing Tasks.

<Diagram name="implementation-phase-overview" alt="The Manager reviews the planning documents and writes assignments, keeping the Tracker; you notify the Workers, who execute, log to Memory, and report through the Message Bus; you notify the Manager, who reviews logs and reports, until the project is complete." />

### First Manager Initialisation

The first Manager reads the planning documents and explores the working codebases. It presents its understanding for your approval, then populates the Tracker with the first Stage's Tasks and the Workers. It dispatches under the Git agreements made during planning.

### Task Cycles

Each Task progresses through four procedures: Task Assignment, Task Execution, Task Logging, and Task Review.

<Diagram name="task-cycle" alt="For each Task, the Manager prepares a Task Prompt and writes it to the Task Bus; the Worker reads it, executes and validates, writes a Task Log to Memory and a Task Report to the Report Bus; the Manager reads the report, reviews the log, and updates the session state." />

#### Task Assignment

The Manager assesses which Tasks are ready, then determines the [dispatch mode](Agent_Orchestration.md#dispatch-modes) - single, batch, or parallel.

For each Task, the Manager [constructs a self-contained Task Prompt](Agent_Orchestration.md#how-task-prompts-are-built) and writes it to the Worker's Task Bus, directing you to the Worker's conversation. Before delivering the prompt, you can read it and ask the Manager for changes.

For Workers not yet initialised, you open a new conversation and run `/apm-3-initiate-worker <id>` with the identifier the Manager gives you. For batch dispatch, the Manager summarises what the Worker will receive. For parallel dispatch, it lists each Worker with its required action.

#### Task Execution

The Worker receives the Task Prompt, either on initialisation or through `/apm-4-check-tasks` for later Tasks. It reads any files from [other agents' work](Agent_Orchestration.md#dependency-context) that the prompt names, executes the instructions under the Rules, and validates the result against the prompt's criteria. It completes autonomous checks first and pauses for you only when a criterion needs your judgement or action. You can interrupt or steer the Worker at any point.

If validation fails, the Worker investigates and makes targeted fixes. It may use native subagents for focused work. Missing dependencies, conflicting instructions and problems beyond the Task need guidance. Success requires the objective and every validation criterion to pass; unavailable or unrun checks remain explicit limits.

When you give a correction or directive during execution, the Worker complies immediately and continues. At completion, the Worker asks whether corrections useful for later Tasks should become Rules and records the correction and your decision in its Task Log. It writes approved additions to the existing shared Rules file and records the path in its log.

#### Task Logging

With version control, the Worker commits its changes. It then writes a Task Log to Memory with the outcome status (Success, Partial, or Failed), validation results, deliverables, and any flags for the Manager. It then writes a brief Task Report to its Report Bus and directs you to deliver it to the Manager. Before you deliver it, you can review the work - the changes, the tests, the Worker's summary - and ask the Worker for more.

For batch execution, the Worker logs each Task as it completes and writes one consolidated report at the end, or when it stops on a failure.

#### Task Review

The Manager receives the report via `/apm-5-check-reports` (add a Worker's identifier when several are active) and reviews it as an outsider to the code. It reads the Task Log, checks that the claimed status matches the log's content, and checks the work against what it assigned and against the planning documents. For anything doubtful, it investigates itself or sends a subagent. There are three outcomes:

- **Proceed** - The Manager updates the [Tracker](Agent_Orchestration.md#the-tracker), merges the dispatch unit's branch where needed, and dispatches newly ready Tasks.
- **Follow-up** - The Worker retries from a new Task Prompt with refined instructions, replacing its previous log while preserving consequential earlier findings and their resolution. The Task keeps its ID and stays Active.
- **Document modification** - Execution revealed a problem in the Spec, Plan, or Rules. The Manager works out the knock-on effects and brings you in when the change is beyond its authority. It then proceeds or issues a follow-up.

A report from a [non-APM agent](Agent_Orchestration.md#the-message-bus) carries its own evidence and skips Worker-log review. If required work or validation remains, the Task stays Active. You may accept a Partial outcome, but the recorded result keeps its limits.

After each review, the Manager reassesses readiness and dispatches the next Task in the same turn when one is ready. It pauses only when no Tasks are ready and Workers are active, or when a decision requires your collaboration.

### Stage Progression

Stages are sequential: each begins once the previous one completes. Parallel work happens only within a Stage, through parallel Task dispatch.

<Diagram name="stage-progression" alt="Stage 1 holds Tasks such as data models, a storage layer, an auth handler, API endpoints, and integration tests; later Stages follow in order until the project is complete." />

A Stage completes when all its Tasks are Done, required Stage verification is resolved and its branches are merged. The Manager verifies the Stage when you request it, the Plan calls for it, or any Task needed a follow-up or reported Important Findings. Otherwise it records why verification was skipped. It writes `stage-<NN>.summary.md` in the Stage's Memory folder and links it from the [Index](Agent_Orchestration.md#the-index) before moving on.

### Project Completion

After all Stages complete, the Manager marks the project as complete in the Tracker and presents a summary of what was delivered, what was found along the way, and how each Stage went. It then guides you through the optional next steps in Session Continuation, below.

## Session Continuation

An APM session ends when its planned work is complete or you stop early. A larger goal can span several sessions, with archives carrying the history forward.

Before summarising or archiving, pause active agents and record unfinished work and Git state.

1. **Summarise (optional)** - Invoke `apm-8-summarize-session` in a new conversation, or ask the Manager at completion or early stopping. It checks the session records against deliverables and Git state, then writes `.apm/session.summary.md` with outcomes, consequential decisions, validation and remaining limits.
2. **Archive (optional)** - Run [`apm archive`](CLI_Guide.md#apm-archive), with `--name <name>` if desired. The CLI preserves the session files and moves remaining worktrees through Git, including uncommitted contents. It verifies preservation before clearing active files and installed instructions. Worktrees stay attached to their source repositories; archiving does not finish, commit or merge their work.
3. **Continue** - Run `apm init` for fresh templates and invoke `apm-1-initiate-planner` in a new conversation. The Planner asks which archives are relevant and checks them against current evidence.

## Next Steps

- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [Context Engineering](Context_Engineering.md) - How APM manages what each agent sees and why
- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimisation, and workflow efficiency
- [Customisation Guide](Customisation_Guide.md) - Custom repositories and template customisation
