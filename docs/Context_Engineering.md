---
id: context-engineering
slug: /context-engineering
sidebar_label: Context Engineering
sidebar_position: 7
---

# Context Engineering

Context engineering keeps a model's limited attention on relevant information. APM uses role boundaries, shared records and Handoffs to address the [context decay and pressure](Introduction.md#the-problem) that build up in long conversations.

[Agent Orchestration](Agent_Orchestration.md) explains the mechanisms. This doc explains why they are designed that way.

## Context Scoping

### Planner

The Planner's conversation is devoted to understanding and planning the work. Separating planning from implementation keeps execution history from competing with requirements while they are still being settled.

The Spec, Plan and Rules preserve the approved decisions from that exploration. These documents carry the result into implementation; the Manager and Workers do not need to reconstruct the planning conversation.

### Manager

The Manager works from planning documents, live coordination state and recorded outcomes. It reads source code when preparing an assignment or investigating a result, leaving routine implementation to Workers. This lets it coordinate across areas without carrying every Worker's debugging and execution history.

### Workers

A Worker receives the Rules and a self-contained Task Prompt. The Manager includes the design decisions, dependency context and constraints the Task needs. Keeping the Spec, Plan, Tracker and Index outside the Worker's usual scope leaves more room for code, implementation and validation.

Workers retain familiarity across assignments in their area. The Manager can refer briefly to a Worker's own earlier outputs, while unfamiliar dependencies need reading and integration instructions. A Handoff trades some of that familiarity for a fresh conversation, so later Task Prompts give fuller context for earlier work it has not read.

Any role may delegate focused work to native subagents within its scope, then verify their findings. This keeps isolated research or debugging out of the main conversation without changing the role's responsibilities.

## Context Across Conversations

Agents share files, not conversations. Reading another Worker's code may show what it does without explaining the decisions or constraints behind it. The Manager supplies that missing context through Task Prompts, using the earlier work's logs and evidence.

Shared records also keep the session independent of any one conversation:

- **Task Logs** preserve results, validation and consequential findings from execution.
- **The Tracker** holds current coordination state and next actions.
- **Stage summaries** condense accepted work, decisions and validation limits, with links to Task Logs.
- **The Index** links to those summaries and holds findings useful beyond a Stage.

An incoming Manager can start with the Index and summaries, then follow sources where more detail is needed. This reduces how much history it must load while keeping the evidence available.

A Handoff applies the same principle to a role's working context. The outgoing agent writes a durable record of what the next conversation needs and checks current state before transferring the role. Platform compaction instead replaces conversation history with a summary that later compactions may condense again. The Handoff files remain available for verification and continuation.

[Archives](Workflow_Overview.md#session-continuation) carry this history between APM sessions. A new Planner reads relevant records and checks their claims against the current codebase, since archived decisions and results may no longer describe it.

## Related Docs

- [Agent Orchestration](Agent_Orchestration.md) - Communication, Memory and continuity mechanisms
- [Prompt Engineering](Prompt_Engineering.md) - How instructions and records are structured
