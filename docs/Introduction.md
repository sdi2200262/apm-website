---
id: introduction
slug: /introduction
sidebar_label: Introduction
sidebar_position: 1
---

import ThemedImage from '@theme/ThemedImage';

# Agentic Project Management (APM)

**A structured approach to building complex projects with AI Agents.**

APM is an open-source framework for managing ambitious software projects with AI assistants - Claude Code, Cursor, GitHub Copilot, Gemini CLI, and OpenCode. Instead of working in a single, increasingly chaotic chat, APM structures your work into a coordinated system where different AI Agents handle planning, coordination, and execution as a team.

## The Problem: Context Decay

Building complex projects with AI assistants hits a fundamental wall: **context window limits**.

As conversations grow, context degrades. The AI loses track of requirements and constraints, produces bad code, and hallucinates details. Earlier parts of the conversation get compressed or discarded. For substantial projects, this makes sustained progress nearly impossible.

## The Solution: Structured Multi-Agent Coordination

APM treats the AI not as a single continuous assistant, but as a team of specialized Agents - each focused on a specific role with intentionally scoped context.

- **Specialization** - Different Agents handle planning, coordination, and implementation. Each operates in its own context with only the information it needs.

- **Persistence** - Project state lives in structured documents outside Agent contexts.
    - Planning documents define all work
    - Memory tracks progression
    - A file-based message bus system enables cross-Agent communication

- **Continuity** - When an Agent's context fills, a Handoff transfers working knowledge to a fresh instance. At intervals, completed APM sessions can be archived for future reference

This mirrors how human teams collaborate: specialized roles, shared documentation, and explicit communication protocols.

## Agent Types

APM coordinates three specialized agent types:

- **Planner** - Runs once at project start. Conducts structured discovery to gather requirements and constraints, then decomposes everything into three planning documents: Spec, Plan, and Rules. Acts as the project architect.

- **Manager** - Receives planning documents from the Planner and coordinates execution. Assigns tasks to Workers, reviews completed work, manages dependencies, and maintains the big picture.

- **Workers** - Execute specific tasks within defined domains (frontend, backend, API, etc.). Workers operate with tightly scoped context - they see their current task and accumulated working context, not the full project scope.

Each role is covered in depth in [Agent Types](Agent_Types.md).

## Project State

Structured files outside any Agent's context keep track of state and history, so nothing is lost when a chat ends or an Agent reaches its limits.

- **Planning Documents** - Three documents created by the Planner that guide all subsequent work: the Spec (what to build), the Plan (how work is organized), and the Rules (how work is performed).

- **Memory** - A file hierarchy that tracks project progression. Workers log their completed work; the Manager reads those logs to track progress without reviewing code directly. Durable observations accumulate across the project.

- **Message Bus System** - File-based message passing between Agent chats. The Manager writes task assignments; Workers write completion reports. You deliver messages by running simple commands, keeping APM platform-agnostic and every interaction auditable.

- **Handoff** - When an Agent's context window fills up, you transfer its working knowledge to a fresh instance. The outgoing Agent captures what it knows in structured artifacts; the incoming Agent reads them and picks up where the previous left off.

## Workflow

APM operates in two distinct phases:

- **Planning Phase** - The Planner runs two procedures back to back:
  1. **Context Gathering** - The Planner asks you structured questions across three rounds to understand your project's vision, technical requirements, and implementation approach. After each round it iterates on gaps, and once all rounds are complete it presents an understanding summary for your approval.
  2. **Work Breakdown** - The Planner decomposes everything it gathered into three planning documents: the Spec, the Plan, and the Rules. You review and approve each one before the Planner moves on.

- **Implementation Phase** - The Manager and Workers turn the planning documents into working software through repeating cycles:
  1. **Task Assignment** - The Manager assesses which tasks are ready, constructs a self-contained Task Prompt with all the context a Worker needs, and delivers it via the message bus system.
  2. **Task Execution** - The Worker receives the assignment, executes the work, and validates results against the criteria specified in the prompt.
  3. **Task Logging** - The Worker documents the outcome in a structured Task Log and writes a brief report back to the Manager via the message bus system.
  4. **Task Review** - The Manager reviews the log and report, then decides the next step: proceed to the next task, retry with refined instructions, or update the planning documents.

  The cycle repeats until all tasks complete. The Manager can dispatch tasks in parallel when dependencies allow, or batch sequential tasks to the same Worker.

<ThemedImage
  alt="APM session overview - Planning Phase produces Spec, Plan, and Rules; Implementation Phase cycles through task assignment, execution, logging, and review"
  sources={{
    light: '/img/diagrams/apm-overview-light.svg',
    dark: '/img/diagrams/apm-overview-dark.svg',
  }}
  style={{margin: '1.5rem 0'}}
/>

When an APM session completes - or at any point during one - you can archive it and start fresh. Archives live in `.apm/archives/` and are accessible to future Planners during Context Gathering, so subsequent APM sessions build on what came before rather than starting from zero.

## Installation & Usage

APM is installed via the [`agentic-pm`](https://www.npmjs.com/package/Agentic-pm) CLI, which scaffolds commands, guides, and skills into your project workspace.

To get started, see [Getting Started](Getting_Started.md).

## Contributing

APM is open source and welcomes contributions. Report bugs or request features via [GitHub Issues](https://github.com/sdi2200262/Agentic-project-management/issues), or submit improvements via Pull Requests.

For contribution guidelines, see [CONTRIBUTING.md](https://github.com/sdi2200262/Agentic-project-management/blob/main/CONTRIBUTING.md).

## Next Steps

- [Getting Started](Getting_Started.md) - Install APM and run your first APM session
- [Agent Types](Agent_Types.md) - Deep dive into Planner, Manager, and Worker roles
