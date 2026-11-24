---
id: prompt-engineering
slug: /prompt-engineering
sidebar_label: Prompt Engineering
sidebar_position: 6
---

# Prompt Engineering

APM runs on files that agents read and follow. This doc explains their structure and writing conventions, for readers who want to understand or [customise](Customisation_Guide.md) them.

## File Types

| Type | Purpose | How it enters context |
| :--- | :--- | :--- |
| **Command skills** | Initiate roles, deliver messages, hand off, recover or summarise | Invoked by you, using your assistant's skill syntax |
| **Shared skill** | Communication and Message Bus rules | Read by every role at initiation |
| **Guides** | A procedure, such as Task Execution | Read at initiation by the roles that use it |
| **Initial documents** | Starting structure for the Spec, Plan, Tracker and Index | Filled in and maintained during the session |
| **Single-skill entry** | One `apm` skill for the research-preview targets | You can invoke it directly. An agent may also load it to suggest APM and starts a session with your agreement. |

The numbered command skills set `disable-model-invocation: true` and point to the files their action needs. Each skill has a name and description in YAML frontmatter; guides have none. The communication skill includes a supporting guide for agents outside APM to join the Message Bus.

Guides separate procedures from initiation. The Planner reads Context Gathering and Work Breakdown at the start. It follows Work Breakdown after you approve its understanding. The Manager reads Task Assignment and Task Review, plus Task Execution and Task Logging for its own Tasks. Workers read Task Execution and Task Logging.

## Writing Patterns

Instructions address the agent following them and remain readable to the person inspecting or changing them. They name concrete actions, files and conditions in the order the agent needs them. Each shared rule has one authoritative home that other files reference.

## Structured Formats

Task Prompts, reports and logs pair YAML frontmatter with a Markdown body. YAML holds identifiers, paths and states that determine the next action; Markdown carries instructions, results and evidence that need reading and judgement.

For example, a Task Log with a non-Success `status` or `important_findings: true` tells the Manager to investigate. The Manager checks these fields against the log and deliverables before accepting the work.

## Platform-Agnostic Design

The build produces all four [installation targets](CLI_Guide.md#apm-init) from the same sources. All use `.apm/` for session files and workspace-root `AGENTS.md` for workspace conventions.

Placeholders resolve paths, the template version and Claude-specific text. Instructions name skills without a command prefix because invocation syntax varies by assistant; procedures and document formats stay the same. See [The Build](Customisation_Guide.md#the-build) for source locations and configuration.

## Terminology

APM capitalises terms with a defined workflow meaning, such as Worker, Task, Stage and Handoff, and uses ordinary English elsewhere. Consistent names let agents identify the same roles, work units and records across files.
