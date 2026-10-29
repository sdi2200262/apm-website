---
id: introduction
slug: /introduction
sidebar_label: Introduction
sidebar_position: 1
---

import Diagram from '@site/src/components/Diagram';

# Agentic Project Management (APM)

**A spec-driven multi-agent framework for AI-assisted software engineering.**

APM is an open-source framework for managing ambitious software projects with AI assistants. It works with agents that use `AGENTS.md` and `.agents/skills/`, and with Claude Code. An **APM session** takes one body of work through a Planning Phase and an Implementation Phase. A larger project can span several sessions.

## The Problem

A coding agent is an LLM working in a loop with tools. LLMs keep no state between calls: the agent resends the whole conversation for each step of a task. On long tasks, LLMs suffer from two problems:

- **Context decay** - The longer the conversation and the more context accumulates, the less reliably the LLM recalls earlier decisions and instructions, and the less consistently it reasons about them.
- **Context pressure** - Every call costs more than the last and brings the conversation closer to the context window's limit, where the platform must cut or summarise it, losing earlier detail.

## How APM Works

APM counters each problem, and keeps you in charge throughout.

- **Planning documents, against decay** - APM is **spec-driven**. Before any code is written, a Planner works with you to record the project's intent, requirements, and constraints in three planning documents: the Spec (what to build), the Plan (how the work is divided), and the Rules (how the work is carried out). The Plan groups Tasks (assignments with their own deliverables and checks) into Stages (ordered milestones).
- **Separate agents, against pressure** - APM is a *multi-agent system* where a Manager hands out the work and Workers carry it out, each in its own conversation with only the context its work needs. Splitting the work this way keeps each conversation's context small and focused on its own job.
- **Coordination through you** - The Planner, the Manager, and the Workers communicate only through you, by design. You deliver their messages by invoking skills in their chats. Each exchange is a chance to review the work and ask for changes before mistakes spread. How work is divided and assigned sets how often this happens. We call these deliberate review points *productive friction*.

Workers keep their conversations across assignments, building familiarity with their area. When context fills, a **Handoff** transfers the role to a fresh conversation. Agents can also delegate focused work to their assistant's built-in helper agents (native subagents), then verify the results.

<Diagram name="overview" alt="The APM workflow: in the Planning Phase you and the Planner write the Spec, the Plan, and the Rules; in the Implementation Phase the Manager hands out assignments and Workers report back through you, with the session's state in shared files." phone />

Throughout implementation, the Manager checks the work against the planning documents and Workers follow the Rules, under your supervision. Shared files outside any conversation hold the session's state and history. When a session ends, you can archive it, and later Planners can build on the archive.

## Installation

The [`agentic-pm`](https://www.npmjs.com/package/agentic-pm) CLI installs APM's skills, guides and initial session files into your project. [Getting Started](Getting_Started.md) walks through installation and your first session.

If you want your AI assistant to explain APM concepts or help with migration from an older version, the [`apm-assist`](https://github.com/sdi2200262/agentic-project-management/tree/main/skills/apm-assist) skill can be installed into any project and answers questions by reading the live documentation.

## Contributing

Report bugs and request features through [GitHub Issues](https://github.com/sdi2200262/agentic-project-management/issues). See [CONTRIBUTING.md](https://github.com/sdi2200262/agentic-project-management/blob/main/CONTRIBUTING.md) for contribution guidelines.

## Reading Order

**Start using APM** - [Getting Started](Getting_Started.md) walks you through installation and your first session end to end. There is also a [Quick Reference](Quick_Reference.md) with every command and workflow in one place, to keep at hand.

**Understand the architecture** - Three docs build on each other: [Agent Roles](Agent_Roles.md) covers the three roles, [Agent Orchestration](Agent_Orchestration.md) covers how they coordinate, and [Workflow Overview](Workflow_Overview.md) walks through every procedure.

**Go deeper** - [Prompt Engineering](Prompt_Engineering.md) explains how APM's files are designed. [Context Engineering](Context_Engineering.md) explains why each agent sees what it sees.

**Look things up** - [CLI Guide](CLI_Guide.md) for commands and options, [Troubleshooting](Troubleshooting_Guide.md) for common issues, [Customisation](Customisation_Guide.md) for custom repositories, [Security](Security_Guide.md) for the trust model, and [Tips and Tricks](Tips_and_Tricks.md) for model selection and workflow efficiency.
