---
id: getting-started
slug: /getting-started
sidebar_label: Getting Started
sidebar_position: 2
---

# Getting Started

This guide takes you through installation, planning and your first cycle of assignments and reports.

## Prerequisites

You need Node.js 18 or later, a project directory, and an assistant that supports `AGENTS.md` and `.agents/skills/`, or Claude Code.

## Installation

Install the CLI:

```bash
npm install -g agentic-pm
```

In your project directory, run:

```bash
apm init
```

Choose `agents` for agents using `AGENTS.md` and `.agents/skills/`, such as Codex, Cursor and GitHub Copilot, or `claude` for Claude Code. To install both:

```bash
apm init -a agents claude
```

The CLI installs skills and procedure guides for your target, plus session files under `.apm/`. See the [CLI Guide](CLI_Guide.md#installation) for local installation and file paths.

APM's commands are skills. Examples here use Claude Code's `/` syntax; in Codex, use `$`, such as `$apm-1-initiate-planner`. Other assistants use their skill picker or chat syntax. Each APM agent works in its own conversation; keep active chats available so you can switch between them.

## Step 1: Initiate the Planner

The **Planner** defines the work with you. Open a new chat in your project and run:

```markdown
/apm-1-initiate-planner
```

You can include your project request and reference documents:

```markdown
/apm-1-initiate-planner We're building Horse Tinder, a dating app for horses: owners swipe through profiles and match horses from nearby stables. Next.js frontend, Firebase backend. Here's the PRD: @docs/prd.md
```

The Planner uses this context to focus its questions.

## Step 2: Work Through the Planning Phase

### Context Gathering

The Planner surveys the workspace and explores relevant code while questioning you in three rounds:

1. Existing materials, vision and scope.
2. Technical requirements, constraints and validation.
3. Implementation approach, quality and coordination preferences, including Git use and conventions.

It develops design choices and a tentative division of work with you, resolves gaps, and agrees what this APM session covers. Review its **Understanding Summary** and correct anything missing before approving it.

### Work Breakdown

The Planner writes three documents, in order:

- **Spec** - What to build: design decisions, constraints and workspace references.
- **Plan** - How work is divided: bounded assignments called **Tasks**, grouped into ordered milestones called **Stages**. Each Task names its implementation agent (**Worker**), deliverables, dependencies and validation criteria.
- **Rules** - Shared Worker execution conventions, written inside `APM_RULES` in workspace-root `AGENTS.md`. For Claude Code, the Planner imports this file from an existing workspace `CLAUDE.md`, preserving your instructions.

Review and approve each document before the next begins. These documents guide implementation, so settle unclear requirements and checks here. After Rules approval, the Planner applies agreed repository setup and creates the Message Bus, the files agents use to exchange assignments and reports.

## Step 3: Initiate the Manager

The **Manager** coordinates implementation. Open a new chat and run:

```markdown
/apm-2-initiate-manager
```

It reads the planning documents, explores the codebases and presents its understanding for approval. Once approved, it starts assigning Tasks and maintains the **Tracker**, the live record of progress and next actions.

## Step 4: Your First Task Cycle

**1. Receive an assignment.** The Manager writes a **Task Prompt**, with the instructions and context a Worker needs, to the Message Bus. It tells you which Worker to start and what to run. Before delivering any message, you can review the work or ask for changes.

**2. Start the Worker.** A **Worker** carries out assignments in one area of the project. Open a new chat and use the identifier the Manager gives you:

```markdown
/apm-3-initiate-worker frontend-agent
```

The Worker reads its waiting prompt, executes the Task and validates the result. It pauses for checks or decisions that need you. You can also steer it during execution.

**3. Collect the result.** The Worker writes a **Task Log** to **Memory**, the session's work history, and a short **Task Report** to the Message Bus. It tells you when the report is ready.

**4. Deliver the report.** In the Manager's chat, run:

```markdown
/apm-5-check-reports frontend-agent
```

Without an identifier, this collects every pending report. The Manager checks the logs and deliverables, accepts the result, sends a follow-up or updates the planning documents. Unfinished work and validation limits remain recorded; a Task stays Active while review or follow-up is pending.

## Step 5: Continuing the Project

For later assignments, return to the same Worker's chat and run:

```markdown
/apm-4-check-tasks
```

Repeat the cycle as Tasks become ready. The Manager may send a batch to one Worker or independent work to several Workers in parallel. See [Dispatch Modes](Agent_Orchestration.md#dispatch-modes) for how those choices affect your review points.

Stages complete in order. [Workflow Overview](Workflow_Overview.md) covers follow-ups, planning changes, validation and Stage completion.

## Context Limits

When a Manager or Worker's context approaches its limit, use a **Handoff** to continue that role in a fresh conversation:

1. Run `/apm-6-handoff-manager` or `/apm-7-handoff-worker` in the outgoing chat.
2. Review and approve its Handoff Log and Handoff Prompt.
3. Open a new chat for the same role and run its initiation skill, with the identifier for a Worker.
4. Check its account of the current state and next action before continuing.

If context was lost through compaction or a closed chat, use `apm-9-recover` to rebuild it. See [Troubleshooting](Troubleshooting_Guide.md#context-recovery) for recovery commands and Handoff problems.

## After Completion

When the planned work is complete, or you stop early, pause active agents and record unfinished work. You can keep the session in place or archive it for later sessions.

For an optional summary first, invoke `/apm-8-summarize-session` in a new chat or ask the Manager at session end. To archive and start again:

```bash
apm archive --name horse-tinder-v1
apm init
```

Archiving preserves session records and remaining worktrees before clearing active APM files and installed instructions. The worktrees stay attached to their source repositories. The next Planner can use relevant archives as context. See [CLI archival](CLI_Guide.md#apm-archive) for details.

## Next Steps

Keep the [Quick Reference](Quick_Reference.md) at hand during a session. To understand the roles and their context boundaries, continue with [Agent Roles](Agent_Roles.md).
