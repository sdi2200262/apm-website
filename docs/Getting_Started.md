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
- **AI Assistant** - One of the supported platforms: Claude Code, Cursor, GitHub Copilot, Antigravity, OpenCode, or Codex
- **Project Workspace** - A directory for your project

**Model selection:** Use the most capable model available to you for every role. To save cost, you may switch to a cheaper model for Workers. See [Tips and Tricks](Tips_and_Tricks.md) for recommended models and cost-effective alternatives.

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

The initialisation command will:

- **Prompt for AI Assistant** - Select your platform from supported assistants
- **Download APM Assets** - Fetch the latest commands, guides, and skills
- **Create `.apm/` directory** - Planning document templates, project Tracker, Index, and installation metadata
- **Install procedural files** - Commands, guides, skills, and agent configurations placed in your platform's directory (e.g. `.claude/` for Claude Code, `.cursor/` for Cursor, `.github/` for Copilot)

After initialisation completes, you're ready to begin.

Copilot and Antigravity receive APM commands as skills, invoked from the `/` menu. If you have an older installation using prompt files or workflows, run `apm update` between sessions to switch to the current files.

:::caution Codex and Antigravity
These assistants currently overwrite each other's APM skills when installed in the same workspace. See [Troubleshooting](Troubleshooting_Guide.md#codex-and-antigravity-shared-skills) for details.
:::

:::note Codex
Codex has no custom slash commands. APM installs its commands there as skills, and you invoke them with `$` instead of `/` - for example, `$apm-1-initiate-planner`.
:::

:::note "Open a new agent"
Each APM agent runs in its own isolated conversation. What this looks like varies by platform:

- **Claude Code** - Run `claude` in a new terminal, open a new Claude Code tab in VS Code, or start a new session in the desktop app
- **Codex** - Run `codex` in a new terminal, or start a new chat in the IDE extension or app
- **Cursor** - Start a new Agent chat in the editor, or run `agent` in a new terminal
- **GitHub Copilot** - Start a new chat in VS Code, or run `copilot` in a new terminal
- **Antigravity** - Start a new conversation in the app or IDE agent panel, or run `agy` in a new terminal
- **OpenCode** - Run `opencode` in a new terminal, or start a new session in the desktop app

Throughout this guide, **"open a new agent"** means whichever of the above applies to your platform. Keep active agent conversations open during the APM session for easy switching between them. Don't delete conversations until the agent has handed off or the session is complete.
:::

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
- **Round 3** - Implementation approach and quality

After each round, the Planner iterates on gaps before advancing. When your answers reference existing code or documentation, it explores the codebase to ground its understanding. After all rounds, it presents an Understanding Summary for your approval.

:::tip
- Share all relevant constraints and uncertainties upfront
- Provide existing documentation early to improve subsequent questions
- Be specific about validation criteria - how will you know each requirement is met?
:::

### Work Breakdown

This procedure produces three planning documents:

- **Spec** - Design decisions, constraints, and a workspace overview defining what is being built and where
- **Plan** - Stages, Tasks, Worker assignments, and a Dependency Graph defining how work is organised
- **Rules** - Universal execution patterns defining how work is performed (written to your assistant's rules file: `CLAUDE.md` for Claude Code, `AGENTS.md` for the others)

You review and approve each document before the Planner proceeds to the next. Each document is settled before the next one builds on it. Request modifications and corrections as needed. The Manager checks the work against these documents, and Workers receive what they need from them through their Task Prompts. A gap here carries into implementation. After all three approvals, the Planner initialises the Message Bus and the Planning Phase completes.

## Step 3: Initiate the Manager

Open a new agent and run:

```markdown
/apm-2-initiate-manager
```

As the first Manager instance, the Manager reads the planning documents, then explores the git state of each working repository: branches, commit history, and branching patterns. If `.apm/` is inside a repository, it adds `.apm/` to `.gitignore` by default and asks whether you want to track any `.apm/` artifacts in git.

It then presents an Understanding Summary covering project scope, key design decisions, Workers, and Stage structure. Alongside this it proposes version control conventions for your approval. Review both carefully - if they accurately reflect your project, authorise the Manager to proceed. It then populates the Tracker, assesses which Tasks are ready, and begins dispatching work.

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

The Manager reviews the Task Report and Task Log sceptically, as an outsider to the code. It checks the work against what it assigned and against the planning documents, confirms that the log supports the reported status, and investigates any flag or inconsistency before accepting the work. It then determines the next step:

- **Proceed** - Task successful, dispatch any newly ready Tasks
- **Follow-up** - Task needs retry with refined instructions
- **Document modification** - Execution revealed planning issues, update documents first

The Manager updates the Tracker and immediately assesses whether more Tasks are ready for dispatch. This completes one cycle.

## Step 5: Continuing the Project

The cycle from Step 4 repeats for each Task. Each Worker is initiated only once: for its later Tasks, run `/apm-4-check-tasks` in its existing conversation. As you work through the project, you'll encounter these variations:

### Follow-up Tasks

When a Task needs retry, the Manager creates a follow-up Task Prompt with refined instructions based on what went wrong. The Worker reuses the same Task Log path and overwrites the previous attempt.

### Document Modifications

When execution reveals issues with the planning documents, the Manager may update the Spec, Plan, or Rules. Small contained changes are within the Manager's authority. Significant changes (multiple Tasks affected, scope changes, design direction shifts) require your collaboration.

### Batch and Parallel Dispatch

For efficiency, the Manager may dispatch multiple Tasks at once:

**Batch dispatch** - Sequential Tasks to the same Worker in a single message. The Worker executes each Task in order, logs immediately after each, stops at the first Task that fails, and reports once for the batch.

**Parallel dispatch** - Tasks to different Workers simultaneously when no cross-Worker dependencies exist. You manage multiple Worker conversations, delivering messages as each completes. Each dispatch gets its own git branch, and parallel dispatches also get separate git worktrees. Parallel dispatch needs version control; without it, the Manager dispatches one at a time.

## Context Limits

When an agent's context window approaches its limit, perform a Handoff to transfer working knowledge to a fresh instance that keeps what the agent learned. Look for signs of context decay: the agent repeating questions, forgetting constraints, or producing degraded responses. Hand off early, before the quality of the work declines.

The process:

1. Run `/apm-6-handoff-manager` or `/apm-7-handoff-worker` in the outgoing agent's conversation
2. Open a new agent for the same role
3. Run the same initiation command (for a Worker, with its identifier) - the incoming agent detects the Handoff and reconstructs context
4. Verify the incoming agent's Understanding Summary before continuing

If the platform auto-compacts an agent's context and its behaviour degrades, or you lose a conversation, run `/apm-9-recover` instead of a full Handoff. The agent rereads its documents and reconstructs working context as the same instance. A Handoff leaves cleaner context than recovery. It writes what matters to files, which persist, whereas a compaction summary exists only in the conversation and each later compaction condenses it further. Prefer a Handoff when you can anticipate the limit.

For the full mechanics, see [Handoff and Continuity](Agent_Orchestration.md#handoff-and-continuity). For recovery scenarios, see the [Troubleshooting Guide](Troubleshooting_Guide.md#context-recovery).

## After Completion

When the Manager completes all Tasks and Stages, it marks the project as complete in the Tracker and presents a completion summary. It then guides you through optional next steps:

Running `/apm-8-summarize-session` in a new conversation produces a structured session summary that helps future Planners, and offers to help with archival.

Alternatively, you can archive directly via the CLI:
```bash
apm archive                        # auto-named session-YYYY-MM-DD-NNN
apm archive --name horse-tinder-v1 # custom archive directory name
```

Archival snapshots all current `.apm/` contents except `archives/` into `.apm/archives/`, then removes the active session files, installed assistant files, and installation metadata. Run `apm init` afterward to start a new APM session with fresh templates. The new Planner detects existing archives during Context Gathering and asks about their relevance. Each APM session can then build on what came before.

## Next Steps

- [Agent Roles](Agent_Roles.md) - How Planner, Manager, and Worker roles work in depth
- [Agent Orchestration](Agent_Orchestration.md) - Communication, Memory, dispatch, and Handoff mechanics
- [Workflow Overview](Workflow_Overview.md) - Detailed walkthrough of every procedure
- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimisation, and workflow efficiency
