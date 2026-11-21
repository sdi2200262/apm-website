---
id: getting-started
slug: /getting-started
sidebar_label: Getting Started
sidebar_position: 2
---

# Getting Started

This guide takes you through installation, planning and your first assignments.

## Prerequisites

You need Node.js 18.17 or newer in the 18.x series, or Node.js 20.5 or later. Use a project directory and either Claude Code or an assistant that supports `AGENTS.md` and `.agents/skills/`. Use capable reasoning models for the Planner and Manager, since their decisions shape many Tasks. A cheaper model may suit Workers and subagents on bounded work.

## Installation

Install the CLI. APM v1.2.0 needs CLI v1.0.4 or later:

```bash
npm install -g agentic-pm
```

In your project directory, run:

```bash
apm init
```

Choose `agents` for agents using `AGENTS.md` and `.agents/skills/`, such as Codex, OpenCode and Cursor, or `claude` for Claude Code. To install both:

```bash
apm init -a agents claude
```

The CLI installs skills and procedure guides for your target, plus session files under `.apm/`. See the [CLI Guide](CLI_Guide.md#installation) for local installation and file paths.

APM's commands are skills. Examples here use Claude Code's `/` syntax; in Codex, use `$`, such as `$apm-1-initiate-planner`. Other assistants use their skill picker or chat syntax. Each APM agent works in its own conversation; keep active chats open.

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

:::info[Research preview]
Two additional research-preview installation targets, `claude-single-skill` and `agents-single-skill`, provide the same workflow through one `apm` skill. The preview explores whether a single skill makes the workflow more flexible. See [apm init](CLI_Guide.md#apm-init) for installing them.

With a single-skill target, start planning by invoking `apm` in a new chat:

```markdown
/apm Plan the Jira ticket I owe.
```
:::

## Step 2: Work Through the Planning Phase

### Context Gathering

The Planner surveys the workspace and explores relevant code. It discusses each of these three topics with you:

1. Existing materials, vision and scope.
2. Technical requirements, constraints and validation.
3. Implementation approach, quality and coordination preferences, including version control.

The Planner develops design choices with you, resolves gaps and points out what can overlap and what is best done in sequence. Review its **Understanding Summary** for what the session will deliver and how the work will proceed. Correct anything missing before approving it.

### Work Breakdown

The Planner writes two documents, in order:

- **Spec** - What the session will deliver, the agreed design and constraints, and what makes the result acceptable.
- **Plan** - How to deliver and check the work. It groups bounded units of work called **Tasks** into ordered milestones called **Stages**. Each Task names who carries it out (the Manager or a Worker), its deliverables, dependencies and checks. The Plan also records how you agreed to stay involved.

Approve each document before the next begins. Settle unclear requirements and checks here, before implementation. Name any checks only you can run, such as trying a feature on your own machine. Task size also sets how often Worker messages pass through you: smaller Tasks for frequent review, batches for fewer exchanges.

After Plan approval, the Planner proposes updates to `AGENTS.md`, the workspace-root file of lasting conventions for your agents. It creates the file if it's missing. It then creates the Message Bus, the files that carry messages between the Manager and any Workers.

## Step 3: Initiate the Manager

The **Manager** coordinates implementation. Open a new chat and run:

```markdown
/apm-2-initiate-manager
```

It reads the planning documents, explores the codebases and presents its understanding for approval. If you agreed to use version control, it explains the setup for the first work and the conventions it will follow. After approval, it applies the agreed setup and starts on ready Tasks. It maintains the **Tracker**, which records progress and next actions, and pauses at the points you agreed during planning. You can change those points as the work goes. See [Where You Take Part](Workflow_Overview.md#where-you-take-part).

## Step 4: Your First Tasks

The Manager normally carries out substantial work in its own Tasks through subagents. If your assistant lacks native subagents, agree during planning to use separate Workers or have the Manager do the work directly. The Manager reviews and validates its Task results, then records each outcome in a **Task Log** in **Memory**, the session's work history. You see the results when you agreed to review them and in each Stage report, and can ask for changes.

### Working with a Worker

Tasks assigned to a Worker run in a separate conversation, and you pass messages between it and the Manager:

**1. Receive an assignment.** The Manager writes a **Task Prompt**, with the instructions and context a Worker needs, to the Message Bus. It tells you which Worker to start and what to run. Before delivering any message, you can review it or ask its author for changes.

**2. Start the Worker.** A **Worker** carries out assignments in one area of the project. Open a new chat and use the identifier the Manager gives you:

```markdown
/apm-3-initiate-worker frontend-agent
```

The Worker reads its waiting prompt, executes the Task and validates the result. It pauses for checks or decisions that need you. You can also steer it during execution.

**3. Collect the result.** The Worker writes a Task Log to Memory and a short **Task Report** to the Message Bus. It tells you when the report is ready.

**4. Deliver the report.** In the Manager's chat, run:

```markdown
/apm-5-check-reports frontend-agent
```

Without an identifier, this collects every pending report. The Manager checks the logs and deliverables, accepts the result, sends a follow-up or updates the planning documents.

You can also take on any Task yourself. Tell the Manager, or the Worker in its chat for a Worker's Task.

## Step 5: Continuing the Project

For a Worker's later assignments, return to its chat and run:

```markdown
/apm-4-check-tasks
```

Repeat the cycle as Tasks become ready. The Manager may send a batch to one Worker or independent work to several Workers in parallel. See [Dispatch Modes](Agent_Orchestration.md#dispatch-modes) for how those choices affect how often you pass messages.

Stages complete in order, and the Manager asks before starting the next one unless you agreed otherwise. [Workflow Overview](Workflow_Overview.md) covers follow-ups, planning changes, validation and Stage completion.

## Context Limits

When a Manager's or Worker's context approaches its limit, use a **Handoff** to continue that role in a fresh conversation. Plan it before the limit, using your assistant's context display, while the current work is still clear:

1. Run `/apm-6-handoff-manager` or `/apm-7-handoff-worker` in the outgoing chat.
2. The agent saves a Handoff Log and Handoff Prompt and gives you a short recap.
3. Open a new chat for the same role and run its initiation skill, with the identifier for a Worker.
4. Read its account of the current state and next action, and correct anything wrong.

If context was lost through compaction or a closed chat, use `/apm-9-recover` to rebuild it. See [Troubleshooting](Troubleshooting_Guide.md#context-recovery) for recovery commands and Handoff problems.

## After Completion

When the planned work is complete, the Manager reports the result. To stop early, tell the Manager; it pauses its subagents, asks you to pause Worker conversations and any work you hold, and records unfinished work. You can keep the session in place or archive it for later sessions. Split a large goal into several sessions when later planning depends on results the current session will produce.

For an optional summary first, invoke `/apm-8-summarize-session` in a new chat or ask the Manager at session end. To archive and start again:

```bash
apm archive --name horse-tinder-v1
apm init
```

The next Planner can use relevant archives as context. See [`apm archive`](CLI_Guide.md#apm-archive) for details.

## Next Steps

Keep the [Quick Reference](Quick_Reference.md) at hand during a session. To understand the roles and their context boundaries, continue with [Agent Roles](Agent_Roles.md).
