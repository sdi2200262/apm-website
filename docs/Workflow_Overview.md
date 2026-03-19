---
id: workflow-overview
slug: /workflow-overview
sidebar_label: Workflow Overview
sidebar_position: 5
---

import ThemedImage from '@theme/ThemedImage';

# Workflow Overview

This doc walks through every procedure in both phases of an APM session, covering what happens and in what order. It builds on two preceding docs: [Agent Types](Agent_Types.md) covers each Agent's role and responsibilities, and [Agent Orchestration](Agent_Orchestration.md) covers the coordination mechanisms (planning documents, the Message Bus, Task Prompt construction, Memory, and Handoff). Where this doc touches on those topics, it references back rather than repeating them.

## Planning Phase

The Planning Phase produces the planning documents that guide all subsequent work. The [Planner](Agent_Types.md#planner) runs once at project start through two sequential procedures: Context Gathering, then Work Breakdown.

<ThemedImage
  alt="Planning Phase - Context Gathering through three rounds produces an understanding summary, Work Breakdown creates Spec, Plan, and Rules"
  sources={{
    light: '/img/diagrams/planning-workflow-light.svg',
    dark: '/img/diagrams/planning-workflow-dark.svg',
  }}
  style={{margin: '1.5rem 0'}}
/>

### Context Gathering

The Planner conducts structured discovery through three progressive question rounds, each building on the previous. The goal is to gather enough context to create accurate planning documents without interrogating exhaustively.

Before starting, the Planner checks for archived APM sessions in `.apm/archives/`. If archives exist, it presents them and asks about relevance. Relevant archives are examined via the `apm-archive-explorer` subagent, with findings verified against the current codebase before integration into question rounds.

**Round 1 - Existing Materials and Vision.** Project type, problem and purpose, essential features and scope, existing documentation and materials, current plan or vision, previous work and codebase context.

**Round 2 - Technical Requirements.** Design decisions and constraints, work structure and dependencies, technical and resource requirements, complexity and risk assessment, validation criteria.

**Round 3 - Implementation Approach and Quality.** Technical constraints and preferences, workflow patterns and quality standards, coordination and approval requirements, domain organization, finalizing design decisions.

After each round, the Planner assesses gaps and follows up before advancing. When User responses reference codebase elements, the Planner explores proactively - using subagents for substantial research to preserve its own context for Work Breakdown. Each round ends with a completion summary covering what was gathered, which planning documents the findings inform, and why the round is ready to advance.

After all three rounds, the Planner presents a consolidated **understanding summary** for User review. The User verifies that the Planner accurately understands the project before planning documents are created. Modifications loop through targeted follow-ups until the User approves.

### Work Breakdown

The Planner decomposes gathered context into three [planning documents](Agent_Orchestration.md#planning-documents) through visible reasoning, presenting its thinking in chat before writing to files. This makes decomposition decisions visible and allows the User to redirect before artifacts are committed.

**Spec.** The Planner analyzes design decisions from gathered context and writes the Spec. The User reviews and approves before it moves on.

**Plan.** The Planner identifies work domains and maps them to Workers, identifies all Stages, then breaks each Stage into Tasks. After writing the full Plan, it performs a review pass assessing workload distribution, cross-Agent dependencies, and generates a Dependency Graph. The User reviews and approves.

**Rules.** The Planner extracts universal execution patterns and writes them to the platform's rules file (e.g. `CLAUDE.md`, `AGENTS.md`). The User reviews and approves.

After all three documents are approved, the Planner initializes the [Message Bus](Agent_Orchestration.md#the-message-bus). The Planning Phase is complete. The User opens a new conversation and initiates the Manager.

## Implementation Phase

The Implementation Phase executes the planning documents. The [Manager](Agent_Types.md#manager) coordinates, [Workers](Agent_Types.md#workers) execute Tasks, and the cycle repeats until all Stages complete.

### First Manager Initialization

The first Manager instance (Manager 1) reads all planning documents and its procedural guides, then:

- Initializes version control if a git repository exists (detects the base branch, establishes branch conventions)
- Populates the Tracker with Stage 1 Tasks and all Worker assignments
- Initializes the Memory Index
- Presents an understanding summary covering project scope, key design decisions, Workers, and Stage structure

The User reviews the summary and authorizes the Manager to proceed. It then assesses which Tasks are ready and begins dispatching work.

<ThemedImage
  alt="Implementation Phase - four-procedure Task cycle (Assignment, Execution, Logging, Review) repeating across sequential Stages until project completion"
  sources={{
    light: '/img/diagrams/implementation-workflow-light.svg',
    dark: '/img/diagrams/implementation-workflow-dark.svg',
  }}
  style={{margin: '1.5rem 0'}}
/>

### Task Cycles

Each Task progresses through four procedures: Task Assignment, Task Execution, Task Logging, and Task Review. This cycle repeats for every Task in the project.

#### Task Assignment

The Manager assesses which Tasks are ready based on dependency completion and the Tracker, then determines the [dispatch mode](Agent_Orchestration.md#dispatch-modes) - single, batch, or parallel. The Manager may also wait if a pending report would unlock a more efficient dispatch combination.

For each Task, the Manager [constructs a self-contained Task Prompt](Agent_Orchestration.md#how-task-prompts-are-built) and writes it to the Worker's Task Bus, directing the User to the Worker's conversation.

For uninitialized Workers, the Manager directs the User to create a new conversation and run the initiation command with the Worker's identifier. For batch dispatch, it summarizes what the Worker will receive. For parallel dispatch, it lists each Worker with its required action.

#### Task Execution

The Worker receives the Task Prompt via `/apm-4-check-tasks` and begins execution:

1. **Context integration** - If [dependencies on other Agents' work](Agent_Orchestration.md#dependency-context) exist, the Worker reads the specified files to integrate prior work before starting.
2. **Execution** - The Worker follows the instructions step by step, applying Rules from the platform's rules file throughout.
3. **Validation** - Results are validated in a fixed order: automated checks first, then output verification, then User review if specified. The Worker does not request User review until programmatic and artifact validation pass.
4. **Iteration** - If validation fails, the Worker corrects and re-validates. This continues until success or a stop condition is reached (fixes causing new issues, the issue requires external resolution, or debugging produces diagnosis without resolution). At a stop condition, the Worker spawns a debug subagent for fresh-context resolution.

When the User provides a correction or directive during execution, the Worker complies immediately and continues. At Task completion, the correction is noted in the Task Log as an important finding for the Manager. The Worker then asks whether the correction should become a Rule for all Workers, but only after logging and reporting so it does not block the workflow.

#### Task Logging

Once execution is complete, the Worker writes a structured Task Log to Memory documenting:

- Outcome status (Success, Partial, or Failed)
- Validation results
- Deliverables and file changes
- Flags for Manager attention (important findings, compatibility issues)

The Worker then writes a brief Task Report to its Report Bus summarizing status and key findings, and directs the User to deliver the report to the Manager.

For batch execution, the Worker logs each Task immediately after completing it and only writes a consolidated batch report after all Tasks are done (or after stopping on failure).

#### Task Review

The Manager receives the report via `/apm-5-check-reports` and reviews the outcome:

1. **Report processing** - The Manager reads the Task Report and checks for Handoff or recovery indications. For batch reports, each Task's outcome is processed individually.
2. **Log review** - The Manager reads the Task Log, interprets status and flags, and assesses whether the claimed status is consistent with the log content. Inconsistency between claimed status and actual content is a hallucination indicator.
3. **Review outcome** - If everything looks good (Success, no flags, content supports the status), the Manager proceeds. If something needs attention, the Manager investigates - self-investigating for small-scope issues, spawning a subagent for larger ones. Three outcomes are possible:
    - **Proceed** - No issues found. Update the Tracker, dispatch any newly ready Tasks.
    - **Follow-up** - Worker must retry. The Manager creates a new Task Prompt with refined instructions based on what went wrong. Same log path - the Worker overwrites the previous log.
    - **Document modification** - Execution revealed issues with the Spec, Plan, or Rules. The Manager assesses cascade implications and determines whether modifications fall within its authority or require User collaboration. After modifications, the Manager proceeds or issues a follow-up.
4. **Tracker update** - Every outcome path ends with updating the [Tracker](Agent_Orchestration.md#the-tracker).

After each review, the Manager immediately reassesses readiness and dispatches the next Task in the same turn when one is ready. Review and dispatch happen continuously without waiting for User input. The Manager pauses only when no Tasks are ready and Workers are active (wait state), or when a decision requires User collaboration.

### Stage Progression

Stages are sequential. Stage N+1 begins after Stage N completes. Parallel work across domains happens through parallel Task dispatch within a single Stage, not cross-Stage execution.

After all Tasks in a Stage are Done, the Manager reviews the Stage's Task Logs, distills durable observations from working notes into [Memory notes](Agent_Orchestration.md#the-index), appends a Stage summary to the Index, and proceeds to the next Stage's first dispatch.

### Project Completion

After all Stages complete, the Manager sets the Tracker status to complete and presents a project completion summary covering: Stages completed, total Tasks executed, Workers involved, Stage outcomes, notable findings, and final deliverables.

The Manager recommends running `/apm-8-summarize-session` in a new conversation to produce a session summary and optionally archive the APM session.

## Handoff

When an Agent's context window approaches its limits, a Handoff transfers working knowledge to a fresh instance. The mechanics of Handoff - the two-artifact system, context reconstruction, and how it affects dependency context - are covered in [Agent Orchestration](Agent_Orchestration.md). This section describes how Handoff fits into the workflow.

Handoff can happen at any point during the Implementation Phase. The Manager or Worker signals context pressure, or the User notices signs of degradation (repeating questions, forgetting constraints, reduced quality). The User triggers the Handoff by running `/apm-6-handoff-manager` or `/apm-7-handoff-worker`. The outgoing Agent creates its artifacts, the User opens a new conversation for the same role, and the incoming Agent auto-detects the handoff prompt during initialization.

If auto-compaction happens instead and the Agent starts acting inconsistently, the User runs `/apm-9-recover` to reconstruct working context without a full Handoff.

## Session Continuation

When an APM session ends, whether through project completion, a decision to pause, or a shift in direction, the User can archive the session and start fresh.

1. **Summarize** - The User runs `/apm-8-summarize-session` in a new conversation. The summarization Agent reads `.apm/` artifacts, validates them against the current codebase, and produces a session summary.
2. **Archive** - The User runs `apm archive` (or `apm archive --name custom-name`). This snapshots `.apm/` artifacts to `.apm/archives/`, removes installed assistant files, and clears installation metadata.
3. **Continue** - The User runs `apm init` to start a new APM session with fresh templates. The new Planner detects existing archives during Context Gathering and asks about their relevance - so each APM session can build on what came before.

## Next Steps

- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [Context Engineering](Context_Engineering.md) - How APM manages what each Agent sees and why
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Modifying APM](Modifying_APM.md) - Local edits, custom repositories, and template customization
