---
id: context-engineering
slug: /context-engineering
sidebar_label: Context Engineering
sidebar_position: 7
---

# Context Engineering

Context engineering keeps a model's limited attention on relevant information. APM uses role boundaries, shared files and Handoffs to address the [context decay and pressure](Introduction.md#the-problem) that build up in long conversations.

[Agent Orchestration](Agent_Orchestration.md) explains the mechanisms. This doc explains why they are designed that way.

## Context Scoping

### Planner

The Planner's conversation is devoted to understanding and planning the work. Separating planning from implementation keeps execution history from competing with requirements while they are still being settled.

The Spec and Plan preserve the approved decisions and relevant findings from that exploration, with reasons and sources where useful. The Planner adapts its explanations to your expertise and how closely you want to review the work. `AGENTS.md` keeps lasting workspace conventions.

### Manager

The Manager works from planning documents, current coordination and recorded outcomes. It uses the documents' sources and current code to fill in the technical detail needed for implementation, prepare Task Prompts and investigate results. It hands substantial implementation to subagents or Workers. It does not carry their debugging and execution history.

### Workers

A Worker works from `AGENTS.md` and a self-contained Task Prompt. The Manager includes the design decisions, dependency context and constraints the Task needs. Keeping the Spec, Plan, Tracker and Index outside the Worker's usual scope leaves more room for code, implementation and validation.

Workers keep what they learn about their area across assignments. The Manager can refer briefly to a Worker's own earlier outputs, while work the Worker hasn't seen needs instructions on what to read and how to build on it. After a Handoff, Task Prompts give fuller context for earlier work the new conversation has not read.

Any role may delegate focused work, such as research, debugging or parts of a Task, to subagents within its scope, then verify their findings. That work stays out of the role's own conversation. A subagent starts with only its brief and suits bounded work. A Worker suits an area where familiarity across assignments helps, or where you want to work closely with it.

## Context Across Conversations

Agents share files, not conversations. Reading another Worker's code may show what it does without explaining the decisions or constraints behind it. The Manager supplies that missing context through Task Prompts, using the earlier work's Task Logs.

Shared files also keep the session independent of any one conversation:

- **Task Logs** preserve results, validation and findings for each Task or attempt.
- **The Tracker** holds current coordination state and next actions.
- **Stage summaries** condense accepted work, decisions and any issues you accepted, with links to Task Logs.
- **The Index** links to those summaries and holds lasting findings.

An incoming Manager reads the current Spec, Plan, Tracker and Index. It uses Handoff and relevant Task Logs to check progress and find where to resume.

A Handoff applies the same principle to a role's conversation. The outgoing agent writes down what the next conversation needs and checks current state before transferring the role. Platform compaction instead replaces conversation history with a summary that later compactions may condense again. The Handoff files remain available for verification and continuation.

[Archives](Workflow_Overview.md#session-continuation) carry this history between APM sessions. A new Planner reads relevant archives and checks their claims against the current codebase.
