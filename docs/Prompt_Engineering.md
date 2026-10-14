---
id: prompt-engineering
slug: /prompt-engineering
sidebar_label: Prompt Engineering
sidebar_position: 6
---

# Prompt Engineering

APM's workflow runs on structured files that agents read and follow. This doc explains how those files are organised and why, which matters most when you read or [customise](Customisation_Guide.md) them.

## File Types

APM installs four types of files into your project:

| Type | What it is | How it enters context |
| :--- | :--- | :--- |
| **Commands** | Prompts you invoke by name (`/`, or `$` in Codex) | Delivered directly as a prompt |
| **Guides** | One procedure each, for one role | Read by the role that performs it |
| **Skills** | Protocols shared by several roles | Read at initialisation |
| **Agent files** | Subagent configurations | Read when a subagent is launched |

Commands are the only files you send to the model. They set the agent's role and point it to the guides and skills it needs; the agent reads everything else itself.

Guides keep each procedure apart from the command, scoped to the one role that performs it, and each agent loads only its own. The Manager reads Task Assignment and Task Review at initialisation, and Workers read Task Execution and Task Logging. The Planner reads Context Gathering first and Work Breakdown only once you approve its understanding.

Skills hold what several roles share. The communication skill defines the Message Bus protocol and how agents address you, and every role loads it at initialisation. A skill can also carry supporting files, such as the integration guide that lets agents outside APM join the Message Bus. Agent files configure APM's own subagents: currently the `apm-archive-explorer`, which the Planner uses to research archived sessions.

Commands, skills, and agent files each carry a name and a one-line description in YAML frontmatter, which the build and your assistant use to identify them. Guides carry none.

## Writing Patterns

APM's files are written for two readers: the agent following them and the person reading or changing them. Instructions are imperative and concrete, naming files, fields, and conditions, in order less open to interpretation. Each concept is explained once, in one file, and referenced elsewhere. Duplication costs tokens and lets copies drift apart. Files stay short for the same reason: every token an agent spends reading procedure is a token unavailable for the work.

## Structured Formats

APM's artifacts, such as Task Prompts, Task Logs, Handoff Logs, and the planning documents, pair YAML frontmatter with a Markdown body. The split follows how agents use the information.

YAML carries facts an agent should not have to infer: flags, identifiers, and states that decide the next step. A Task Log whose `status` is anything but Success, or which sets `important_findings: true`, tells the Manager to investigate before accepting the work. The Manager still checks each flag against the body, and a mismatch is a warning sign. Markdown carries everything that needs reading and judgement.

## Platform-Agnostic Design

APM's files are written once and adapted to each assistant at build time. Placeholders in the source resolve to the platform's rules file (`CLAUDE.md` for Claude Code, `AGENTS.md` for the others), its install paths, its argument syntax, and its way of launching subagents. Each assistant installs the files in its own place and format. Codex, Copilot, and Antigravity receive APM's commands as skills. Codex invokes them with `$`; Copilot and Antigravity use the `/` menu. These remain user-triggered commands, separate from the procedural skills agents read. The workflow itself is identical everywhere: a Planner in Claude Code and a Planner in Cursor follow the same procedures and produce the same planning documents.

## Terminology

APM's files share a small formal vocabulary, always capitalised: Planner, Manager, Worker, Spec, Plan, Rules, Task, Stage, Handoff, and the rest. Everything else is plain English. Consistent terms help agents behave consistently. For example, when every file uses "Task" for one defined unit of work, agents carry that precision into their own messages.

## Related Docs

- [Context Engineering](Context_Engineering.md) - How APM manages what each agent sees and why
- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Customisation Guide](Customisation_Guide.md) - Custom repositories and template customisation
