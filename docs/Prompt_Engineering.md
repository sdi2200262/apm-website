---
id: prompt-engineering
slug: /prompt-engineering
sidebar_label: Prompt Engineering
sidebar_position: 6
---

# Prompt Engineering

APM's workflow runs on structured files that agents read and follow. This doc explains how those files are organised and why, which matters most when you read or [customise](Customisation_Guide.md) them.

## File Types

APM installs skills, guides and initial session documents:

| Type | Purpose | How it enters context |
| :--- | :--- | :--- |
| **Command skills** | Initiate roles, deliver messages, hand off, recover or summarise | Invoked by you, using your assistant's skill syntax |
| **Shared skill** | Communication and Message Bus rules | Read by every role at initiation |
| **Guides** | A procedure for one role | Read by that role at initiation |
| **Initial documents** | Starting structure for the Spec, Plan, Tracker and Index | Filled in and maintained during the session |

The numbered command skills are user-triggered and set `disable-model-invocation: true`. They establish the role or action and point to the files it needs. The communication skill also includes a guide for agents outside APM to join the Message Bus.

Guides keep procedures separate from initiation. The Planner reads both Context Gathering and Work Breakdown at the start, so it can develop the division of work during questioning. The Manager reads Task Assignment and Task Review; Workers read Task Execution and Task Logging.

Each skill has a name and description in YAML frontmatter. Guides have no frontmatter. Native subagents are optional: each role can delegate focused work within its scope and must verify the findings. APM does not install subagent configurations.

## Writing Patterns

APM's files are written for two readers: the agent following them and the person reading or changing them. Instructions are imperative and concrete, naming files, fields, and conditions, in order less open to interpretation. Each concept is explained once, in one file, and referenced elsewhere. Duplication costs tokens and lets copies drift apart. Files stay short for the same reason: every token an agent spends reading procedure is a token unavailable for the work.

## Structured Formats

Task Prompts, reports and logs pair YAML frontmatter with a Markdown body. The split follows how agents use the information.

YAML carries facts an agent should not have to infer: flags, identifiers, and states that decide the next step. A Task Log whose `status` is anything but Success, or which sets `important_findings: true`, tells the Manager to investigate before accepting the work. The Manager still checks each flag against the body, and a mismatch is a warning sign. Markdown carries everything that needs reading and judgement.

## Platform-Agnostic Design

APM's files are written once and built for two installation targets. `agents` installs skills and guides under `.agents/`; `claude` installs them under `.claude/`. Both share `.apm/` session documents and workspace-root `AGENTS.md` for Rules.

Build placeholders resolve skill and guide paths, the template version and Claude-specific text. The instructions name skills without a command prefix because invocation syntax varies by assistant. The procedures and document formats remain the same for both targets.

## Terminology

APM's files share a small formal vocabulary, always capitalised: Planner, Manager, Worker, Spec, Plan, Rules, Task, Stage, Handoff, and the rest. Everything else is plain English. Consistent terms help agents behave consistently. For example, when every file uses "Task" for one defined unit of work, agents carry that precision into their own messages.

## Related Docs

- [Context Engineering](Context_Engineering.md) - How APM manages what each agent sees and why
- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Customisation Guide](Customisation_Guide.md) - Custom repositories and template customisation
