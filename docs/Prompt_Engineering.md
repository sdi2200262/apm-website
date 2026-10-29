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
| **Guides** | A procedure for one role | Read by that role at initiation |
| **Initial documents** | Starting structure for the Spec, Plan, Tracker and Index | Filled in and maintained during the session |

The numbered command skills set `disable-model-invocation: true` and point to the files their action needs. Each skill has a name and description in YAML frontmatter; guides have none. The communication skill includes a supporting guide for agents outside APM to join the Message Bus.

Guides separate procedures from initiation. The Planner reads both Context Gathering and Work Breakdown at the start, so it can develop the division of work during questioning. The Manager reads Task Assignment and Task Review; Workers read Task Execution and Task Logging.

## Writing Patterns

Instructions address the agent following them and remain readable to the person inspecting or changing them. They name concrete actions, files and conditions in the order the agent needs them. Shared rules have one authoritative home, with references from other files. This keeps copies from drifting apart and leaves more context for the work.

## Structured Formats

Task Prompts, reports and logs pair YAML frontmatter with a Markdown body. YAML holds identifiers, paths and states that determine the next action; Markdown carries instructions, results and evidence that need reading and judgement.

For example, a Task Log with a non-Success `status` or `important_findings: true` tells the Manager to investigate. The Manager checks these fields against the log and deliverables before accepting the work. A flag does not establish that a claim is correct.

## Platform-Agnostic Design

The build produces two targets from the same sources: `agents` installs skills and guides under `.agents/`, and `claude` under `.claude/`. Both use `.apm/` for session files and workspace-root `AGENTS.md` for Rules.

Placeholders resolve paths, the template version and Claude-specific text. Instructions name skills without a command prefix because invocation syntax varies by assistant; procedures and document formats stay the same. See [The Build](Customisation_Guide.md#the-build) for source locations and configuration.

## Terminology

APM capitalises terms with a defined workflow meaning, such as Worker, Task, Stage and Handoff, and uses ordinary English elsewhere. Consistent names let agents identify the same roles, work units and records across files.

## Related Docs

- [Context Engineering](Context_Engineering.md) - Why each role loads particular information
- [Customisation Guide](Customisation_Guide.md) - Changing, building and distributing templates
