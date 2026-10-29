---
id: agent-roles
slug: /agent-roles
sidebar_label: Agent Roles
sidebar_position: 3
---

import Diagram from '@site/src/components/Diagram';

# Agent Roles

APM has three roles, each with the context its responsibilities need. The Planner defines the work, the Manager coordinates it, and Workers carry it out from self-contained [Task Prompts](Agent_Orchestration.md#how-task-prompts-are-built). [Agent Orchestration](Agent_Orchestration.md) covers how they work together.

## Comparison

| Role | Context Scope | Instances | Active Phase |
| :--- | :--- | :--- | :--- |
| **Planner** | Full project vision and requirements | One | Planning Phase |
| **Manager** | Planning documents and Memory | Successive (via Handoff) | Implementation Phase |
| **Worker** | Task Prompt and working context | One per domain, successive via Handoff | Implementation Phase |

## Planner

The Planner operates once, at the start of a session, to turn your requirements into planning documents. It conducts structured discovery with you and decomposes the gathered context into the documents that guide all subsequent work.

<Diagram name="overview" variant="planning" alt="The overview diagram with the Planner, you, and the planning documents highlighted." phone />

**Core Responsibilities:**

- **Context Gathering** - Assesses the workspace and conducts structured discovery to gather project context, producing an Understanding Summary for your review and approval. See [Context Gathering](Workflow_Overview.md#context-gathering) for the full procedure.

- **Work Breakdown** - Decomposes gathered context into three [planning documents](Agent_Orchestration.md#planning-documents) (Spec, Plan, and Rules), each reviewed with you before proceeding. The Planner may include Notes sections in the Spec and Plan to pass context on to the Manager. Initialises the [Message Bus](Agent_Orchestration.md#the-message-bus) for all Workers defined in the Plan. See [Work Breakdown](Workflow_Overview.md#work-breakdown) for the full procedure.

## Manager

The Manager coordinates execution using the three planning documents and the [Tracker](Agent_Orchestration.md#the-tracker), recording Stage summaries and linking them from the [Index](Agent_Orchestration.md#the-index). It operates throughout the project, assigning Tasks to Workers based on the Plan, extracting context from the Spec into Task assignments, and reviewing completed work.

<Diagram name="overview" variant="manager" alt="The overview diagram with the Manager and its Tracker highlighted." phone />

**Operational Context:** Sees the planning documents, the Tracker, the Index, and Task Logs, at a coordination level, going deeper when an investigation requires it or you ask.

**Core Responsibilities:**

- **Task Assignment** - Assesses Task readiness, [constructs self-contained Task Prompts](Agent_Orchestration.md#how-task-prompts-are-built), determines [dispatch mode](Agent_Orchestration.md#dispatch-modes), and writes each prompt to the Task Bus for you to deliver. See [Task Assignment](Workflow_Overview.md#task-assignment) for the full procedure.

- **Task Review** - Reviews completed work from Task Reports and Task Logs, then decides whether to proceed, issue follow-ups, or modify planning documents. See [Task Review](Workflow_Overview.md#task-review) for the full procedure.

- **Planning Document Maintenance** - Updates the Spec, Plan, or Rules when execution shows the original design needs to change.

- **Memory Maintenance** - Updates the [Tracker and Index](Agent_Orchestration.md#memory-and-session-state) after each Task Review and at Stage boundaries.

- **Version Control Coordination** - Owns the version control lifecycle: follows the conventions agreed during planning, manages branches and worktrees, and merges accepted branches before dependent work and Stage completion.

## Workers

Workers execute Tasks assigned by the Manager. Each Worker is defined in the Plan with a specific domain (frontend, backend, API, infrastructure, etc.) and follows the Rules during execution. Multiple Workers operate in parallel when dependencies allow.

<Diagram name="overview" variant="workers" alt="The overview diagram with the Workers and Memory highlighted." phone />

**Operational Context:** Sees its Task Prompt, the working context from its earlier Tasks, and the Rules. The Manager includes the needed context from other agents' work and planning documents in the Task Prompt. Workers do not read the Spec, Plan, Tracker or Index unless you widen their scope.

**Core Responsibilities:**

- **Task Execution** - Executes assigned Tasks following the Task Prompt instructions, validates results against its criteria, investigates failures and makes targeted fixes. It may delegate focused work to native subagents. See [Task Execution](Workflow_Overview.md#task-execution) for the full procedure.

- **Task Logging** - Documents execution results in a structured Task Log and writes a Task Report to the Report Bus. See [Task Logging](Workflow_Overview.md#task-logging) for contents and procedure.

- **Rules Proposals** - When you correct a Worker or give it a directive that could benefit all Workers, the Worker asks at Task completion whether the directive should become a Rule for later Tasks. The Rules change only with your approval.

## Next Steps

- [Agent Orchestration](Agent_Orchestration.md) - Communication, Memory, dispatch, and Handoff mechanics
- [Workflow Overview](Workflow_Overview.md) - Detailed walkthrough of every procedure
- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [Context Engineering](Context_Engineering.md) - How APM manages what each agent sees and why
