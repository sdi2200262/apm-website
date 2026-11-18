---
id: introduction
slug: /introduction
sidebar_label: Introduction
sidebar_position: 1
---

import Diagram from '@site/src/components/Diagram';

# Agentic Project Management (APM)

**A spec-driven multi-agent framework for AI-assisted software engineering.**

APM is an open-source framework for AI-assisted software development, working with Claude Code and assistants that use `AGENTS.md` and `.agents/skills/`, such as Codex, OpenCode and Cursor. Instead of working in a single, increasingly long conversation, APM structures your work into a coordinated system where different agents handle planning, coordination, and execution. You choose where and how you take part.

## The Problem

A coding agent is an LLM working in a loop with tools. LLMs keep no state between calls: the agent resends the whole conversation for each step of a task. On long tasks, LLMs suffer from two problems:

- **Context decay** - The longer the conversation and the more context accumulates, the less reliably the LLM recalls earlier decisions and instructions, and the less consistently it reasons about them.
- **Context pressure** - Every call costs more than the last and brings the conversation closer to the context window's limit, where the platform must cut or summarise it, losing earlier detail.

## How APM Works

APM counters each problem.

- **Planning documents, against decay** - APM is **spec-driven**. Before any code is written, a Planner works with you to record the project's intent, requirements, and constraints in two planning documents: the Spec (what to build) and the Plan (how the work is divided). Agents work from these documents instead of relying only on what their long conversation holds. Lasting workspace conventions go in `AGENTS.md`.
- **Separate agents, against pressure** - APM is a *multi-agent system* where a Manager coordinates the work and carries it out through subagents or Workers in separate conversations, each with only the context its work needs.

Subagents start from a brief and suit bounded work. Workers keep what they learn about their area across assignments. When a Manager's or Worker's context fills, a Handoff passes what it has learned to a fresh conversation.

<Diagram name="overview" alt="The APM workflow: in the Planning Phase you and the Planner write the Spec and the Plan; in the Implementation Phase the Manager carries out Tasks through subagents or hands out assignments to Workers, who report back through you, with the session's state in shared files." phone />

Throughout implementation, the Manager checks all work against the planning documents, whoever did it. Shared files outside any conversation hold the session's state and history. When a session ends, you can archive it, and later Planners can build on the archive.

## Productive Friction

Some points where you take part are built in. Before any code is written, you approve the Spec, the Plan, and the Planner's and Manager's understanding of the work. The Manager also checks with you before each new stage, unless you agree otherwise. Beyond those, the Planner and Manager suggest other points, such as code reviews, manual testing, or writing parts of the code yourself. You choose which to keep. You also choose who does the work: the Manager's subagents, Workers you coordinate, you, or a mix. You can change this at any time. We call these points *productive friction*. They help you keep authority over, and understanding of, the software being built.

## Installation

Install APM with the [`agentic-pm`](https://www.npmjs.com/package/agentic-pm) CLI, which scaffolds the commands, guides, and skills that APM agents use into your project workspace. To get started, see [Getting Started](Getting_Started.md).

If you want your AI assistant to explain APM concepts or help migrate from an older version, the [`apm-assist`](https://github.com/sdi2200262/agentic-project-management/tree/main/skills/apm-assist) skill can be installed into any project and answers questions by reading the live documentation. To change or distribute APM's templates, the [`apm-customization`](https://github.com/sdi2200262/agentic-project-management/tree/main/skills/apm-customization) skill guides your assistant through the source repository.

## Contributing

APM is open source and welcomes contributions. Report bugs or request features via [GitHub Issues](https://github.com/sdi2200262/agentic-project-management/issues), or submit improvements via Pull Requests.

For contribution guidelines, see [CONTRIBUTING.md](https://github.com/sdi2200262/agentic-project-management/blob/main/CONTRIBUTING.md).

## Reading Order

**Start using APM** - [Getting Started](Getting_Started.md) walks you through installation and your first session. The [Quick Reference](Quick_Reference.md) lists every command and workflow in one place.

**Understand the architecture** - Three docs build on each other: [Agent Roles](Agent_Roles.md) covers the three roles, [Agent Orchestration](Agent_Orchestration.md) covers how they coordinate, and [Workflow Overview](Workflow_Overview.md) walks through every procedure.

**Go deeper** - [Prompt Engineering](Prompt_Engineering.md) explains how APM's files are designed. [Context Engineering](Context_Engineering.md) explains why each agent sees what it sees.

**Look things up** - [CLI Guide](CLI_Guide.md) for commands and options, [Troubleshooting](Troubleshooting_Guide.md) for common issues, [Customisation](Customisation_Guide.md) for custom repositories, and [Security](Security_Guide.md) for the trust model.
