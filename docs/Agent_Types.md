---
id: agent-types
slug: /agent-types
sidebar_label: Agent Types
sidebar_position: 3
---

# Agent Types

APM coordinates three specialized Agent types that work together to execute your project. Each Agent has a distinct role with carefully scoped context designed for its responsibilities.

The framework achieves specialization through context scoping rather than access control. Each Agent sees only the information relevant to its role - not because it can't read other files, but because Task Prompts are designed to be self-contained so there's no reason to look beyond them.

## Context Scoping

Each Agent type operates with a different view of the project:

- **Planner** - Sees project requirements, constraints, and the complete vision. Operates with full context during the Planning Phase to create planning documents.

- **Manager** - Sees planning documents (Spec, Plan, Rules), Task Logs, the Tracker, and the Index. Maintains a coordination-level perspective without implementation details.

- **Workers** - See their Task Prompts, accumulated working context from prior Tasks in the current instance, and the Rules. No visibility into full project scope or other Agents' work unless the Manager explicitly provides it in a Task Prompt.

## Quick Agent Comparison

| Agent Type | Role | Context Scope | Instances | Active Phase |
| :--- | :--- | :--- | :--- | :--- |
| **Planner** | Architect | Full project vision and requirements | 1 | Planning Phase |
| **Manager** | Coordinator | Planning documents and Memory | Multiple (via Handoff) | Implementation Phase |
| **Worker** | Executor | Task Prompt and working context | Multiple (via Handoff) | Implementation Phase |

## Planner

The Planner operates once at project start to transform requirements into planning documents. It conducts structured discovery and decomposes gathered context into the documents that guide all subsequent work.

**Operational Context:** Fresh instance with no prior project history. Has access to User-provided requirements, existing documentation, and codebase if applicable.

**Core Responsibilities:**

- **Context Gathering** - Conducts structured discovery through three Question Rounds covering project vision, technical requirements, and implementation approach.
    - When archived sessions exist (`.apm/archives/`), detects them and asks about relevance before starting question rounds.
    - Uses the `apm-archive-explorer` custom subagent to efficiently extract context from indicated archives.
    - Produces an Understanding Summary for User review and approval.

- **Work Breakdown** - Decomposes gathered context into three planning documents:
    - **Spec** - Project-specific design decisions and constraints defining what is being built.
    - **Plan** - Stage and Task breakdown with agent assignments, validation criteria, and a Dependency Graph defining how work is organized.
    - **Rules** - Universal execution patterns defining how work is performed (written to the platform's rules file - e.g. `CLAUDE.md`, `AGENTS.md`).
    - Reviews each document with the User for approval before proceeding. Iterates on feedback until all three are finalized. Initializes the Message Bus for all Agents defined in the Plan.

:::tip
Thoroughness during Planning Phase prevents ambiguity and blockers during execution. The Planner's work establishes the foundation for the entire Implementation Phase.
:::

## Manager

The Manager coordinates execution using the three planning documents and the Tracker, noting progression in the Memory Index. It operates throughout the project, assigning Tasks to Workers based on the Plan, extracting context from the Spec into Task assignments, and reviewing completed work.

**Operational Context:** Sees all planning documents, the Tracker, the Index, and the Message Bus. Maintains coordination-level perspective without diving into code, unless investigation requires it or the User requests it.

**Core Responsibilities:**

- **Task Assignment** - Assesses Task readiness based on dependency completion and the current Tracker.
    - Constructs Task Prompts with objective, instructions, validation criteria, and context extracted from the Spec.
    - Determines dispatch mode (single, batch, or parallel) and delivers Task Prompts via the Task Bus.

- **Task Review** - Reads Task Reports from the Report Bus and Task Logs from Workers.
    - Determines review outcome: proceed and dispatch any ready Tasks, issue a follow-up (retry with refined instructions), or modify planning documents then proceed or follow up.

- **Planning Document Maintenance** - Updates the Spec, Plan, or Rules when execution reveals issues with initial design decisions, task definitions, dependencies, or universal patterns.
    - Assesses cascade implications and determines whether modifications require User collaboration.

- **Memory Maintenance** - Updates the Tracker after each Task Review.
    - Tracks Task statuses (Ready, Active, Done, Waiting), Agent assignments, active branches, and merge state.
    - Appends Stage summaries to the Index after Stage completion.
    - Maintains working notes in the Tracker for ephemeral coordination context.

- **Version Control Coordination** - Initializes and manages feature branches and worktrees for parallel task execution.
    - Performs merge sweeps at Stage boundaries to ensure all work is integrated before advancing.

- **Completion Recommendation** - After all Stages complete, recommends running `/apm-8-summarize-session` to summarize and optionally archive the completed APM session.

The Manager operates through multiple instances via Handoff when context limits approach. Each instance continues from where the previous left off using Handoff Logs, the Tracker, and the Index.

## Workers

Workers execute Tasks assigned by the Manager. Each Worker is defined in the Plan with a specific domain (frontend, backend, API, infrastructure, etc.) and follows the Rules during execution. Multiple Workers operate in parallel when dependencies allow.

**Operational Context:** Sees the current Task Prompt (including extracted Spec context, instructions, validation criteria), accumulated working context from prior Tasks in the current instance, and the Rules. No visibility into full project scope, other Agents' work, or planning documents unless the Manager explicitly provides context in a Task Prompt.

**Core Responsibilities:**

- **Task Execution** - Receives Task Prompt via the Task Bus.
    - If cross-Agent dependencies exist, reads specified files to integrate context from other Workers' prior Tasks.
    - Executes instructions step by step. Validates results per specified criteria (programmatic tests, artifact checks, User review).
    - Iterates on failure until success or stop condition.

- **Task Logging** - Creates a Task Log documenting outcome, validation results, deliverables, technical decisions, and flags for Manager review. Writes a brief Task Report to the Report Bus summarizing status and key findings.
    - Task Logs serve as the context abstraction layer between the Manager's coordination view and the Worker's execution details.

- **Rules Proposals** - When execution reveals patterns or corrections that could benefit all Workers, the Worker proposes the update to the User after Task completion. Changes are written to Rules only after User approval.

Workers operate through multiple instances via Handoff when context limits approach. After Handoff, previous-Stage same-Agent dependencies are treated as cross-Agent dependencies requiring explicit file reading.

## Next Steps

- [Agent Orchestration](Agent_Orchestration.md) - Communication, Memory, dispatch, and Handoff mechanics
- [Workflow Overview](Workflow_Overview.md) - Detailed walkthrough of every procedure
- [Token Consumption Tips](Token_Consumption_Tips.md) - Model selection and cost optimization
