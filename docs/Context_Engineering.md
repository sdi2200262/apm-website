---
id: context-engineering
slug: /context-engineering
sidebar_label: Context Engineering
sidebar_position: 7
---

# Context Engineering

APM's design starts from the two problems with long LLM conversations, described in the [Introduction](Introduction.md#the-problem): *context decay*, where the LLM recalls earlier decisions less reliably as context accumulates, and *context pressure*, where each call costs more and the conversation nears the context window's limit. Context engineering is the practice of managing everything a model's context holds, keeping its limited attention and tokens on relevant material. This doc explains the choices APM makes and the intent behind them.

[Agent Orchestration](Agent_Orchestration.md) describes the mechanisms themselves. This doc covers the reasoning underneath them.

## Context Scoping

Each role sees a deliberately limited view of the project, shaped by what it needs to do its job.

### Planner

The Planner gives its whole context window to planning and takes no part in implementation. Separating the two phases is meant to keep execution history from competing with the project's intent while that intent is still being settled.

The Planner's conversation does not carry into implementation. It holds exploration, discarded options, and corrections, and only the end results, approved by you, moves on in the Spec, the Plan, and the Rules. The Manager and Workers start from those documents with focused context, and the Planner's conversation can simply end.

### Manager

The Manager works one layer above implementation. Its default context is coordination-level: the planning documents, the Tracker, the Index, and Task Logs. It goes deeper when it needs to, reading source files to write a Task Prompt or to investigate a doubtful result, then returns to coordination. Staying at that level is intended to let one Manager coordinate many Tasks across several Workers without its context growing in proportion.

### Workers

Each Worker sees its Task Prompt, the Rules, and the working context it builds over its Tasks. It generally never reads the Spec, the Plan, or the Tracker: the Manager writes what the Task needs from them into the prompt. The less coordination context a Worker carries, the more of its window remains for reading code, implementing, debugging, and validating.

A Worker develops working knowledge in its conversation across the Tasks of its domain. Familiarity is the gain: the Manager can send a brief reminder about the Worker's own earlier work instead of full context. Decay is the cost, as the conversation grows, but can be countered using Handoffs. Workers still launch subagents for investigation or debugging, which keeps that load out of their own context.

## Context Across Conversations

The Manager and Workers each have their own context, and only what the Message Bus carries passes between them. This matters because Workers share a codebase and can read each other's output, but not the reasoning behind it: why it was built that way and how it connects to other work. The Manager holds that reasoning, since it assigned and reviewed the earlier work, so it supplies whatever the next Worker lacks.

This depends on where the project's state lives. All project state sits in files outside any agent's context window, so a conversation can end, fill, or be compacted without losing the project's state or history.

The Manager coordinates every Task and reviews every outcome; its context grows with them. A compression pipeline is meant to prevent that, with each layer compressing the one below it. A Worker's Task Log reduces its reading, debugging, and iteration to the outcome and what the Manager needs to know. Additionally, at each Stage boundary, the Manager condenses the Stage's Task Logs into a summary in the Index and distils its working notes into Memory notes. Each layer is progressively smaller than the one before. For example, a future Manager uses the compressed Index to understand the big picture of the project and can operate from it, instead of reconstructing the project's entire coordination history from all the older Task Logs.

The same reasoning explains why a Handoff is preferred to compaction. Compaction replaces the conversation's history with a summary, trading detail for space. Each later compaction condenses the summary further. A Handoff instead writes its record to files that persist. Successive Handoffs leave a durable history of the role's work, and you can invoke one early, before decay sets in.

[Session archives](Workflow_Overview.md#session-continuation) carry the same principle across sessions. A new Planner examines relevant archives during Context Gathering and checks them against the current codebase, so each session can build on the last.

## Related Docs

- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Customisation Guide](Customisation_Guide.md) - Custom repositories and template customisation
