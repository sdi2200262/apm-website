---
id: prompt-engineering
slug: /prompt-engineering
sidebar_label: Prompt Engineering
sidebar_position: 6
---

# Prompt Engineering

APM's workflow is driven by structured files that Agents read and follow. This doc explains how those files are designed, why they are structured the way they are, and how Agents themselves generate structured content for other Agents during the workflow.

## File Types

APM installs four types of files into the project workspace:

| Type | What it is | How it enters context |
| :--- | :--- | :--- |
| **Commands** | Prompts the User sends to the model via slash commands | Delivered directly as a prompt |
| **Guides** | Procedural files containing a single procedure each | Read autonomously by Agents via file tools, on demand |
| **Skills** | Shared procedural files used by multiple roles | Read autonomously at initialization |
| **Agent files** | Subagent configurations | Read when spawning a subagent |

**Commands** are the only files the User sends directly to the model. Everything else is read autonomously by Agents through their file tools. Commands fall into four categories:

- **Initiation** (Planner, Manager, Worker) - Declare the Agent's role, list the documents it should read, and define its procedural flow
- **Handoff** (Manager, Worker) - Guide an outgoing Agent through context transfer
- **Utility** (check-tasks, check-reports, summarize-session) - Trigger specific workflow actions
- **Troubleshooting** (recover) - Reconstruct working context after disruptions

**Guides** are separated from commands for a specific reason: loading all procedural content at initialization would consume context space before the Agent needs it. Instead, each command tells the Agent which guides to read and when. The Manager reads Task Assignment and Task Review. Workers read Task Execution and Task Logging. The Planner reads Context Gathering and Work Breakdown. Each guide is scoped to one role and one procedure.

**Skills** are the exception to on-demand loading. The Communication Skill defines the Message Bus protocol, Agent-to-User communication standards, and terminology boundaries. This knowledge applies throughout the entire workflow, so it is loaded at initialization alongside the command.

**Agent files** configure custom subagents. The `apm-archive-explorer` is an example, a subagent the Planner spawns during Context Gathering to examine archived sessions.

## Writing Patterns

APM's files are written for two audiences: the AI Agent parsing instructions, and the human reading or modifying them. The patterns below serve both:

- **Imperative mood** - "Perform the following actions", "Read the Task Log", "Assess whether the status is consistent." Direct instructions produce more reliable Agent behavior than suggestions or descriptions.
- **Directly actionable** - Each instruction includes specific file paths, field names, and conditions. Vague instructions ("implement properly") lead to inconsistent execution.
- **Structured hierarchy** - H2 for major sections, H3 for subsections, bold for sub-topics, italic for list items. Consistent structure helps Agents locate specific instructions during execution and helps humans scan documents quickly.
- **De-duplication** - Each concept has one primary explanation in one location. Other files reference it rather than repeating it. Duplication wastes tokens and risks divergence between copies.
- **Token efficiency** - Prose over tables when equally clear. No redundant phrasing. Files aim to stay under ~500 lines, because every token an Agent spends reading procedural files is a token unavailable for execution.

Guides follow a consistent section pattern that Agents can rely on:

1. **Overview** - Who reads this, what it does
2. **Operational Standards** - Decision rules and reasoning approaches
3. **Procedure** - Step-by-step actions
4. **Structural Specifications** - Output formats and schemas
5. **Content Guidelines** - Common mistakes and quality standards

## Structured Formats

Many of APM's artifacts - Task Prompts, Task Logs, Handoff Logs, planning documents - pair YAML frontmatter with a Markdown body. Each artifact defines its own schema and body structure, but the split between YAML and Markdown reflects the same distinction in how Agents use information.

YAML carries facts the Agent should not have to infer or interpret from the body. If `important_findings: true` is set in a Task Log, the Manager knows its review procedure requires deeper investigation - the Worker raised that flag so the Manager does not have to read the body and assess whether findings exist. The Manager can then validate the flag's consistency against the body and research further if needed. If `status: Failed`, the procedural path is determined by the field, not by the Manager's interpretation of what happened. If `modified:` contains an attribution, any Agent knows who changed the file and when. YAML fields drive procedural decisions directly - they are flags, identifiers, and states that map to specific next actions.

Markdown carries everything that requires reading and reasoning: the actual instructions in a Task Prompt, the execution details in a Task Log, the working context in a Handoff Log. This is where nuance, explanation, and judgment live.

## Agent-Generated Content

During the workflow, Agents generate structured documents for other Agents. Each artifact type has its own schema and structure, but they all follow the same YAML-plus-Markdown approach as the installed files.

| Artifact | Generated by | Consumed by | Purpose |
| :--- | :--- | :--- | :--- |
| Task Prompt | Manager | Worker | Complete execution plan with context, objectives, instructions, and validation |
| Task Report | Worker | Manager | Brief completion summary: status, log path, key findings |
| Handoff Log | Outgoing Agent | Incoming Agent | Past-tense working knowledge not captured in Task Logs |
| Handoff Prompt | Outgoing Agent | Incoming Agent | Present-tense state and reconstruction instructions |

Task Prompts are the most design-intensive artifact. Each one is a complete execution plan - dependency context, design decisions from the Spec, instructions, expected outputs, and validation criteria - composed into a single self-contained document. See [How Task Prompts Are Built](Agent_Orchestration.md#how-task-prompts-are-built) for construction details.

## Platform-Agnostic Design

APM's files are authored once and adapted per platform at build time. The source files use placeholders that resolve to platform-specific values:

| Placeholder | Resolves to |
| :--- | :--- |
| `{RULES_FILE}` | `CLAUDE.md`, `AGENTS.md`, or `AGENTS.md` depending on platform |
| `{SKILL_PATH:name}` | Platform-specific path where skills are installed |
| `{ARGS}` | Platform's argument syntax (`$ARGUMENTS`, `{{args}}`, or descriptive text for platforms without argument variables) |
| `{SUBAGENT_GUIDANCE}` | Platform-native subagent invocation |

The core workflow is identical across all platforms. A Planner on Claude Code and a Planner on Cursor follow the same procedures, read the same guides, and produce the same planning documents. The differences are limited to file paths, argument syntax, subagent invocation, and format (Markdown for Antigravity, Markdown for everything else).

## Terminology

APM defines a formal vocabulary used consistently across all files. Terms like Task, Stage, Worker, Manager, Planner, Handoff, Spec, Plan, and Rules carry specific defined meanings and are always capitalized. All other language is natural English with no formal status.

This matters because consistent terminology produces consistent Agent behavior. When every file uses "Task" to mean a specific work unit with defined lifecycle states, Agents inherit that precision and use it in their own communication. Ambiguity in terminology leads to ambiguity in execution.

## Related Docs

- [Context Engineering](Context_Engineering.md) - How APM manages what each Agent sees and why
- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Customization Guide](Customization_Guide.md) - Custom repositories and template customization
