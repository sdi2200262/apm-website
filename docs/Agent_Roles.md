---
id: agent-roles
slug: /agent-roles
sidebar_label: Agent Roles
sidebar_position: 3
---

import Diagram from '@site/src/components/Diagram';

# Agent Roles

APM has three roles: the Planner defines the work, the Manager coordinates it, and Workers carry it out. Each works in its own conversation with the context its responsibilities need.

## Comparison

| Role | Context Scope | Conversations | Active Phase |
| :--- | :--- | :--- | :--- |
| **Planner** | Project requirements and workspace research | One | Planning Phase |
| **Manager** | Planning documents, live state and work history | Successive via Handoff | Implementation Phase |
| **Worker** | Its assignments, Rules and working context | One per area, successive via Handoff | Implementation Phase |

A **Handoff** moves a role to a fresh conversation when context runs low. The role continues from shared files; [Agent Orchestration](Agent_Orchestration.md#handoff-and-continuity) explains how.

## Planner

The Planner explores the workspace and questions you about the work, then writes the Spec (what to build), Plan (how work is divided) and Rules (shared Worker execution conventions). Its role ends after planning.

<Diagram name="overview" variant="planning" alt="The overview diagram with the Planner, you, and the planning documents highlighted." phone />

- **[Context Gathering](Workflow_Overview.md#context-gathering)** - Researches requirements, develops design and the division of work with you, and presents its understanding for approval.
- **[Work Breakdown](Workflow_Overview.md#work-breakdown)** - Writes the three planning documents for separate approval, then prepares communication for the Manager and Workers.

## Manager

The Manager assigns Tasks, reviews results and maintains the planning documents, live progress and work history. It investigates results, runs checks and makes contained corrections during review, leaving substantial implementation to Workers.

<Diagram name="overview" variant="manager" alt="The overview diagram with the Manager and its Tracker highlighted." phone />

- **[Task Assignment](Workflow_Overview.md#task-assignment)** - Chooses ready work and sends each Worker a self-contained assignment, the **Task Prompt**.
- **[Task Review](Workflow_Overview.md#task-review)** - Checks reported results and decides whether to accept them, request another attempt or update planning documents.
- **State and version control** - Records progress and findings, manages branches and worktrees under the agreed conventions, and merges accepted work.

## Workers

Each Worker handles one area, such as the frontend or API, building familiarity across assignments. It works from its Task Prompts, the Rules and its conversation. The Manager supplies needed planning and dependency context; Workers do not read the Spec, Plan or coordination records unless you widen their scope.

<Diagram name="overview" variant="workers" alt="The overview diagram with the Workers and Memory highlighted." phone />

- **[Task Execution](Workflow_Overview.md#task-execution)** - Implements and validates assigned work, investigates failures, and asks for guidance on problems beyond its Task.
- **[Task Logging](Workflow_Overview.md#task-logging)** - Records evidence in a **Task Log** and sends the Manager a short **Task Report** with the outcome and log path.
- **Rules proposals** - Offers to retain corrections to shared execution practices as Rules. Changes need your approval.

Any role may delegate focused work to native subagents and must verify their findings. These subagents are separate from APM Workers and stay within their parent's scope.

## Next Steps

[Agent Orchestration](Agent_Orchestration.md) explains how these roles communicate, share state and continue across conversations.
