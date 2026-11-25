---
id: agent-roles
slug: /agent-roles
sidebar_label: Agent Roles
sidebar_position: 3
---

import Diagram from '@site/src/components/Diagram';

# Agent Roles

APM has three roles. The Planner defines the work, the Manager coordinates implementation, and Workers carry out Tasks in separate conversations. Each works in its own conversation with the context its responsibilities need. You decide where you take part and who does each Task. See [Where You Take Part](Workflow_Overview.md#where-you-take-part).

## Comparison

| Role | Context Scope | Conversations | Active Phase |
| :--- | :--- | :--- | :--- |
| **Planner** | Project requirements, workspace research and `AGENTS.md` | One | Planning Phase |
| **Manager** | Planning documents, the Tracker and Memory | Successive via Handoff | Implementation Phase |
| **Worker** | Its Task Prompts, its Task Logs, `AGENTS.md` and its conversation | One per area, successive via Handoff | Implementation Phase |

A **Handoff** moves the Manager or a Worker to a fresh conversation when context runs low. The role continues from shared files; [Agent Orchestration](Agent_Orchestration.md#handoff-and-continuity) explains how.

Any role can delegate focused work to its own subagents and check their results. These subagents are separate from APM Workers and stay within their parent's scope.

## Planner

The Planner explores the workspace and discusses the work with you. It writes the Spec (what to deliver and what makes it acceptable) and Plan (how to deliver and check it). It also reviews `AGENTS.md` for lasting workspace conventions. Its role ends after planning.

<Diagram name="overview" variant="planning" alt="The overview diagram with the Planner, you, and the planning documents highlighted." phone />

- **[Context Gathering](Workflow_Overview.md#context-gathering)** - Researches the work, agrees on requirements, design and delivery with you, and presents its understanding for approval.
- **[Work Breakdown](Workflow_Overview.md#work-breakdown)** - Writes the Spec for approval, then organises the work into Stages and Tasks in the Plan for separate approval. It proposes any `AGENTS.md` updates and creates the Message Bus for the Manager and Workers.

## Manager

The Manager coordinates Tasks, reviews results and maintains the planning documents, the Tracker and Memory. It delegates substantial implementation in its own Tasks to subagents. It does substantial implementation itself only if you explicitly agree and the Plan records it.

<Diagram name="overview" variant="manager" alt="The overview diagram with the Manager and its Tracker highlighted." phone />

- **[Task Assignment](Workflow_Overview.md#task-assignment)** - Chooses ready work, briefs its subagents, and sends each Worker a self-contained assignment, the **Task Prompt**.
- **[Task Review](Workflow_Overview.md#task-review)** - Checks results from subagents and Workers, usually has a separate subagent review substantial work, and decides whether to accept them, request another attempt or update planning documents.
- **Tracking and version control** - Records progress and findings, manages branches and worktrees, and integrates accepted work under the conventions agreed during planning.

## Workers

Each Worker handles one area, such as the frontend or API, learning the area across assignments. It works from its Task Prompts, `AGENTS.md` and its conversation. The Manager supplies the planning and dependency context a Task needs; Workers leave the Spec, Plan and Tracker to the Manager unless you widen their scope.

<Diagram name="overview" variant="workers" alt="The overview diagram with the Workers and Memory highlighted." phone />

- **[Task Execution](Workflow_Overview.md#task-execution)** - Implements and validates assigned work, investigates failures, and asks for guidance on problems beyond its Task.
- **[Task Logging](Workflow_Overview.md#task-logging)** - Records the outcome, validation and findings in a **Task Log** and sends the Manager a short **Task Report** with the outcome and log path.
- **Workspace conventions** - Offers to retain corrections to workspace conventions in `AGENTS.md`, unless you already said how to handle them.

## Next Steps

[Agent Orchestration](Agent_Orchestration.md) explains how these roles communicate, share state and continue across conversations.
