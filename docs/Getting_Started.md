---
id: getting-started
slug: /getting-started
sidebar_label: Getting Started
sidebar_position: 2
---

# Getting Started

This guide walks you through your first APM session - from installation through completing your first few tasks.

If you want your AI assistant to help explain APM concepts or answer questions as you go, the [`apm-assist`](https://github.com/sdi2200262/agentic-project-management/tree/main/skills/apm-assist) skill can be installed into any project and reads the live documentation.

## Prerequisites

Before starting, ensure you have:

- **Node.js** - Version 18 or higher for the APM CLI
- **AI assistant** - An agent that supports `AGENTS.md` and `.agents/skills/`, or Claude Code
- **Project Workspace** - A directory for your project

**Model selection:** Use a capable model for planning and coordination, and match Workers to the difficulty of their Tasks. See [Tips and Tricks](Tips_and_Tricks.md#model-selection).

## Installation

Install the CLI globally via npm:

```bash
npm install -g agentic-pm
```

Or locally in your project workspace:

```bash
npm install agentic-pm
```

Then navigate to your project directory and run:

```bash
apm init
```

Choose an installation target:

- **`agents`** - For agents that use `AGENTS.md` and `.agents/skills/`, such as Codex, Cursor and GitHub Copilot. Skills go in `.agents/skills/` and procedure guides in `.agents/apm-guides/`.
- **`claude`** - For Claude Code. Skills go in `.claude/skills/` and guides in `.claude/apm-guides/`.

To install both:

```bash
apm init -a agents claude
```

Both targets share the same workflow and `.apm/` session files. The CLI creates templates for the Spec, Plan, Tracker and Memory Index, along with installation metadata. The Planner writes the planning documents and creates the Message Bus. The Manager maintains the Tracker and Index during implementation.

APM's commands are skills. Invoke them by name using your assistant's skill picker or chat syntax. Examples in this guide use Claude Code's `/` syntax; in Codex, use `$`, such as `$apm-1-initiate-planner`. With a local CLI installation, use `npx apm` in place of `apm`.

Each APM agent works in its own conversation. Start a new chat or terminal session for each role, and keep active conversations available so you can switch between them when delivering messages.

## Step 1: Initiate the Planner

Open a new agent and run:

```markdown
/apm-1-initiate-planner
```

The Planner will introduce itself, confirm its role, and outline its two procedures, Context Gathering and Work Breakdown.

You can optionally pass project context as an argument to give the Planner a head start:

```markdown
/apm-1-initiate-planner We're building Horse Tinder, a dating app for horses: owners swipe through profiles and match horses from nearby stables. Next.js frontend, Firebase backend. Here's the PRD: @docs/prd.md
```

This context is incorporated before Context Gathering begins - the discovery process isn't skipped, but its questions become more targeted.

## Step 2: Work Through the Planning Phase

This step covers both procedures that produce the planning documents. Take your time here: the quality of these documents directly shapes how well implementation goes.

### Context Gathering

Context Gathering starts with a workspace scan, followed by three question rounds:

- **Round 1** - Existing materials and vision
- **Round 2** - Technical requirements
- **Round 3** - Implementation approach, quality and coordination preferences, including Git use and conventions

After each round, the Planner iterates on gaps before advancing. When your answers reference existing code or documentation, it explores the codebase to ground its understanding. It develops design choices and a tentative division of work with you as it learns. Before writing documents, it agrees the scope of this APM session and presents an Understanding Summary for your approval.

### Work Breakdown

This procedure produces three planning documents:

- **Spec** - Design decisions, constraints, and a workspace overview defining what is being built and where
- **Plan** - Ordered Stages, Tasks, Worker assignments, dependencies and validation criteria defining how work is organised
- **Rules** - Shared execution conventions in the `APM_RULES` block of workspace-root `AGENTS.md`. For Claude Code, the Planner adds an import to an existing workspace `CLAUDE.md`, preserving your instructions.

You review and approve each document before the Planner proceeds to the next. Each document is settled before the next one builds on it. Request modifications and corrections as needed. The Manager checks the work against these documents, and Workers receive what they need from them through their Task Prompts. A gap here carries into implementation. After all three approvals, the Planner initialises the Message Bus and the Planning Phase completes.

## Step 3: Initiate the Manager

Open a new agent and run:

```markdown
/apm-2-initiate-manager
```

The Manager reads the planning documents and explores the working codebases, then presents an Understanding Summary covering scope, design decisions, Workers and Stages. Review it and correct any gaps before authorising implementation. It then populates the Tracker and starts dispatching under the Git agreements made during planning.

## Step 4: Your First Task Cycle

This is the core loop of the Implementation Phase. Each Task goes through four procedures - Task Assignment, Task Execution, Task Logging, and Task Review. Agents exchange messages through files in `.apm/bus/`, the **Message Bus**: the Manager writes assignments and Workers write reports. Each message waits there until you deliver it, and the agent tells you which command to run and in which conversation.

**1. Manager dispatches a Task** - The Manager constructs a self-contained Task Prompt, carrying the context the Worker needs from the Spec and the Plan, and writes it to the Worker's Task Bus. It then tells you which Worker conversation to go to and what to run. The Worker works from this prompt, its working knowledge and the Rules.

**2. Initialise the Worker** - Open a new agent for the assigned Worker and run the initiation command with the Worker's identifier. The Manager tells you the exact identifier to use.

```markdown
/apm-3-initiate-worker frontend-agent
```

The Worker picks up the pending Task Prompt, executes it, validates the result against the prompt's criteria, and iterates if validation fails.

:::tip
Workers pause when the Task requires your review or action. You can also interrupt or steer the Worker at any point during execution.
:::

**3. Worker logs and reports** - Once execution is complete, the Worker writes a structured Task Log to Memory (status, validation results, deliverables, and any flags for the Manager). It then writes a brief Task Report to its Report Bus and tells you to deliver it to the Manager.

**4. Deliver the report to the Manager** - Run `/apm-5-check-reports` in the Manager's conversation. Use the targeted version (e.g. `/apm-5-check-reports frontend-agent`) when multiple Workers are active. Before you deliver it, review whatever you need - the Worker's code changes, its summary, the tests - and ask for changes. For example, if the Worker reports that its tests pass but some edge cases were skipped, you may ask it to cover them before you deliver the report.

The Manager checks the Task Log and deliverables against the assignment and planning documents. It investigates findings, unmet checks and inconsistent claims before deciding:

- **Proceed** - Accept the result and dispatch newly ready Tasks
- **Follow-up** - Task needs retry with refined instructions
- **Document modification** - Execution revealed planning issues, update documents first

The Manager records its decision in the Tracker. A Task stays Active through review and follow-ups. If you agree to accept a Partial outcome, its remaining work and validation limits stay visible.

## Step 5: Continuing the Project

The cycle from Step 4 repeats for each Task. Each Worker is initiated only once: for its later Tasks, run `/apm-4-check-tasks` in its existing conversation. As you work through the project, you'll encounter these variations:

### Follow-up Tasks

When a Task needs retry, the Manager creates a follow-up Task Prompt with refined instructions based on what went wrong. The Worker keeps the Task ID and Task Log path, replacing the previous attempt while retaining consequential earlier findings and their resolution.

### Document Modifications

When execution reveals issues with the planning documents, the Manager may update the Spec, Plan, or Rules. Small contained changes are within the Manager's authority. Significant changes (multiple Tasks affected, scope changes, design direction shifts) require your collaboration.

### Batch and Parallel Dispatch

For efficiency, the Manager may dispatch multiple Tasks at once:

**Batch dispatch** - Two or three Tasks to the same Worker in a single message. The Worker executes each Task in order, logs immediately after each, stops at the first Task that fails, and reports once for the batch.

**Parallel dispatch** - Tasks to different Workers simultaneously when no unresolved Cross-Worker dependencies link them. You manage multiple Worker conversations, delivering messages as each completes. Each dispatch gets its own git branch, and parallel dispatches also get separate git worktrees. Parallel dispatch needs version control; without it, the Manager dispatches one at a time.

## Context Limits

When an agent's context window approaches its limit, perform a Handoff to transfer working knowledge to a fresh instance that keeps what the agent learned. Look for signs of context decay: the agent repeating questions, forgetting constraints, or producing degraded responses. Hand off early, before the quality of the work declines.

The process:

1. Run `/apm-6-handoff-manager` or `/apm-7-handoff-worker` in the outgoing conversation
2. Review and approve its Handoff Log and Handoff Prompt
3. Open a new conversation for the same role and run its initiation skill (for a Worker, with its identifier)
4. Check the incoming agent's account of the current state and next action before continuing

If the platform auto-compacts an agent's context and its behaviour degrades, or you lose a conversation, run `/apm-9-recover` instead of a full Handoff. The agent rereads its documents and reconstructs working context as the same instance. A Handoff leaves cleaner context than recovery. It writes what matters to files, which persist, whereas a compaction summary exists only in the conversation and each later compaction condenses it further. Prefer a Handoff when you can anticipate the limit.

For the full mechanics, see [Handoff and Continuity](Agent_Orchestration.md#handoff-and-continuity). For recovery scenarios, see the [Troubleshooting Guide](Troubleshooting_Guide.md#context-recovery).

## After Completion

When the Manager completes all Tasks and Stages, it marks the project as complete in the Tracker and presents a completion summary. It then guides you through optional next steps:

Running `/apm-8-summarize-session` in a new conversation, or as the Manager when the session ends, produces a structured session summary that helps future Planners, and offers to help with archival.

Alternatively, you can archive directly via the CLI:
```bash
apm archive                        # auto-named session-YYYY-MM-DD-NNN
apm archive --name horse-tinder-v1 # custom archive directory name
```

Before archiving, pause active agents and record unfinished work. Archival preserves session records and moves remaining worktrees through Git with their uncommitted contents. It verifies preservation before clearing active files and installed instructions. Worktrees remain attached to their source repositories; Tasks and branches keep their current state. Run `apm init` afterward to start a new APM session with fresh templates. The new Planner detects existing archives during Context Gathering and asks about their relevance. Each APM session can then build on what came before.

## Next Steps

- [Agent Roles](Agent_Roles.md) - How Planner, Manager, and Worker roles work in depth
- [Agent Orchestration](Agent_Orchestration.md) - Communication, Memory, dispatch, and Handoff mechanics
- [Workflow Overview](Workflow_Overview.md) - Detailed walkthrough of every procedure
- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimisation, and workflow efficiency
