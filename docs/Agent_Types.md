---
id: agent-types
slug: /agent-types
sidebar_label: Agent Types
sidebar_position: 3
---

# Agent Types

APM coordinates three specialized Agent types that work together to execute a project. Each Agent has a distinct role with carefully scoped context designed for its responsibilities.

The framework achieves specialization through context scoping rather than access control. Each Agent sees only the information relevant to its role. Task Prompts are designed to be self-contained, so Agents have no reason to look beyond them.

## How APM Works

APM operates in two phases. In the Planning Phase, a Planner creates three planning documents - the Spec (what to build), the Plan (how work is organized into Stages and Tasks), and the Rules (how work is performed). In the Implementation Phase, a Manager coordinates Workers to execute those Tasks.

Agents communicate through a file-based Message Bus - the Manager writes Task assignments, Workers write results back, and the User carries messages between conversations. Project state persists in structured files: the Tracker (live project state), the Index (durable observations), and Task Logs (per-Task execution summaries). When an Agent's context fills, a Handoff transfers working knowledge to a fresh instance.

Each mechanism is covered in detail in [Agent Orchestration](Agent_Orchestration.md). This doc focuses on the three Agent roles and how they use them.

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

- **Context Gathering** - Assesses the workspace environment and conducts structured discovery to gather project context, producing an Understanding Summary for User review and approval. See [Context Gathering](Workflow_Overview.md#context-gathering) for the full procedure.

- **Work Breakdown** - Decomposes gathered context into three [planning documents](Agent_Orchestration.md#planning-documents) (Spec, Plan, and Rules), each reviewed with the User before proceeding. The Planner may include notes in the Spec and Plan headers to pass context on to the Manager. Initializes the [Message Bus](Agent_Orchestration.md#the-message-bus) for all Workers defined in the Plan. See [Work Breakdown](Workflow_Overview.md#work-breakdown) for the full procedure.

## Manager

The Manager coordinates execution using the three planning documents and the Tracker, noting progression in the Memory Index. It operates throughout the project, assigning Tasks to Workers based on the Plan, extracting context from the Spec into Task assignments, and reviewing completed work.

**Operational Context:** Sees all planning documents, the Tracker, the Index, and the Message Bus. Maintains a coordination-level perspective, going deeper into implementation detail when investigation requires it or the User requests it.

**Core Responsibilities:**

- **Task Assignment** - Assesses Task readiness, [constructs self-contained Task Prompts](Agent_Orchestration.md#how-task-prompts-are-built), determines [dispatch mode](Agent_Orchestration.md#dispatch-modes), and delivers via the Task Bus. See [Task Assignment](Workflow_Overview.md#task-assignment) for the full procedure.

- **Task Review** - Reviews completed work from Task Reports and Task Logs, determining whether to proceed, issue follow-ups, or modify planning documents. See [Task Review](Workflow_Overview.md#task-review) for the full procedure.

- **Planning Document Maintenance** - Updates the Spec, Plan, or Rules when execution reveals issues with initial design decisions, Task definitions, dependencies, or universal patterns.
    - Assesses cascade implications and determines whether modifications require User collaboration.

- **Memory Maintenance** - Updates the [Tracker and Index](Agent_Orchestration.md#memory-and-project-state) after each Task Review and at Stage boundaries.

- **Version Control Coordination** - Owns the entire version control lifecycle. During first initialization, the Manager explores git state, combines the Planner's observations with its own detection, and establishes conventions with User approval. During implementation, it creates feature branches, manages worktrees for parallel dispatch, and performs merges at Stage boundaries.

The Manager operates through multiple instances via [Handoff](Agent_Orchestration.md#handoff-and-continuity) when context limits approach.

## Workers

Workers execute Tasks assigned by the Manager. Each Worker is defined in the Plan with a specific domain (frontend, backend, API, infrastructure, etc.) and follows the Rules during execution. Multiple Workers operate in parallel when dependencies allow.

**Operational Context:** Sees the current Task Prompt (including extracted Spec context, instructions, validation criteria), accumulated working context from prior Tasks in the current instance, and the Rules. Visibility into other Agents' work or planning documents only when the Manager explicitly provides that context in a Task Prompt.

**Core Responsibilities:**

- **Task Execution** - Executes assigned Tasks following the Task Prompt instructions and validates results per specified criteria. When validation fails, the Worker investigates the root cause before attempting a fix, and spawns a debug subagent for deeper investigation when a correction does not resolve the issue. See [Task Execution](Workflow_Overview.md#task-execution) for the full procedure.

- **Task Logging** - Documents execution results in a structured Task Log and writes a Task Report to the Report Bus. Task Logs bridge the Manager's coordination view and the Worker's execution details, letting the Manager understand outcomes without reviewing code directly. See [Task Logging](Workflow_Overview.md#task-logging) for contents and procedure.

- **Rules Proposals** - When execution reveals patterns or corrections that could benefit all Workers, the Worker proposes the update to the User after Task completion. Changes are written to Rules only after User approval.

Workers operate through multiple instances via [Handoff](Agent_Orchestration.md#handoff-and-continuity) when context limits approach.

## Next Steps

- [Agent Orchestration](Agent_Orchestration.md) - Communication, Memory, dispatch, and Handoff mechanics
- [Workflow Overview](Workflow_Overview.md) - Detailed walkthrough of every procedure
- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [Context Engineering](Context_Engineering.md) - How APM manages what each Agent sees and why
