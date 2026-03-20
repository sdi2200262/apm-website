---
id: getting-started
slug: /getting-started
sidebar_label: Getting Started
sidebar_position: 2
---

# Getting Started with APM

This guide walks you through your first APM session - from installation through completing your first few tasks.

## Prerequisites

Before starting, ensure you have:

- **Node.js** - Version 18 or higher for the APM CLI
- **AI Assistant** - One of the supported platforms: Claude Code, Cursor, GitHub Copilot, Gemini CLI, or OpenCode
- **Project Workspace** - A directory for your project

**Model selection:** For best performance, use **Claude Opus 4.6** or **GPT-5.2+** throughout all Agent roles. For a budget-friendlier alternative, **Claude Sonnet 4.6** throughout delivers strong results. Workers can also use GPT-5.4, GPT-5.3-Codex, or Gemini 3.1 Pro. For the full model matrix, see [Tips and Tricks](Tips_and_Tricks.md).

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

The initialization command will:

- **Prompt for AI Assistant** - Select your platform from supported assistants
- **Download APM Assets** - Fetch the latest commands, guides, and skills
- **Create `.apm/` directory** - Planning document templates, project Tracker, Memory Index, and installation metadata
- **Install procedural files** - Commands, guides, skills, and Agent configurations placed in your platform's directory (e.g. `.claude/` for Claude Code, `.cursor/` for Cursor, `.github/` for Copilot)

After initialization completes, you're ready to begin.

:::note How Agents communicate
Throughout an APM session, Agents communicate by writing to files in `.apm/bus/` - the **Message Bus**. The Manager writes Task assignments to a Worker's Task Bus; the Worker writes results back to its Report Bus. You act as the messenger between Agent conversations, running commands like `/apm-4-check-tasks` and `/apm-5-check-reports` to deliver messages. Each Agent tells you exactly what to do next - which command to run and in which conversation.
:::

:::note "Open a new Agent"
Each APM Agent runs in its own isolated conversation. What this looks like varies by platform:

**IDE assistants:**
- **Cursor** - Start a new Cursor Agent chat
- **GitHub Copilot** - Start a new Copilot Chat

**CLI assistants:**
- **Claude Code** - Open a new terminal and start Claude Code
- **Gemini CLI** - Open a new terminal and start Gemini CLI
- **OpenCode** - Open a new terminal and start OpenCode

Throughout this guide, **"open a new Agent"** means whichever of the above applies to your platform. The key is that each Agent gets its own context - separate from every other Agent. Keep active Agent conversations open during the APM session for easy switching between them - don't delete conversations until the Agent has Handed off or the session is complete.
:::

## Step 1: Initiate the Planner

Open a new Agent and run:

```markdown
/apm-1-initiate-planner
```

The Planner will introduce itself, confirm its role, and outline its two procedures: Context Gathering (structured project discovery) followed by Work Breakdown (decomposition into planning documents).

You can optionally pass project context as an argument to give the Planner a head start:

```markdown
/apm-1-initiate-planner We're building a REST API for a task management app using Express and PostgreSQL. Here's the PRD: @docs/prd.md
```

The Planner incorporates this before starting Context Gathering - it won't skip the discovery process, but it will ask more targeted questions.

## Step 2: Work Through the Planning Phase

The Planner guides you through both procedures to create the planning documents. Take your time here - the quality of these documents directly shapes how well implementation goes.

### Context Gathering

The Planner asks questions across three rounds to understand your project:

- **Round 1** - Existing materials and vision
- **Round 2** - Technical requirements
- **Round 3** - Implementation approach and quality

After each round, the Planner iterates on gaps before advancing. It will also explore your codebase when your answers reference existing code or documentation. After all rounds, it presents an understanding summary for your approval.

:::tip
- Share all relevant constraints and uncertainties upfront
- Provide existing documentation early to improve subsequent questions
- Be specific about validation criteria - how will you know each requirement is met?
:::

### Work Breakdown

The Planner creates three planning documents:

- **Spec** - Design decisions and constraints defining what is being built
- **Plan** - Stages, Tasks, Worker assignments, and a Dependency Graph defining how work is organized
- **Rules** - Universal execution patterns defining how work is performed (written to the platform's rules file - e.g. `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`)

You review and approve each document before the Planner proceeds to the next. Request modifications and corrections as needed. After all three approvals, the Planner initializes the Message Bus (creating directories and bus files in `.apm/bus/` for each Worker defined in the Plan) and version control (detecting or creating a git repository, recording conventions in the Tracker), and the Planning Phase completes.

## Step 3: Initiate the Manager

Open a new Agent and run:

```markdown
/apm-2-initiate-manager
```

As Manager 1 (the first instance), the Manager reads all planning documents and its procedural guides, verifies version control state (established by the Planner), populates the Tracker with Stage 1 Tasks and all Worker assignments, initializes the Memory Index, and presents an understanding summary covering project scope, key design decisions, Workers, and Stage structure.

Review the summary carefully. If it accurately reflects your project, authorize it to proceed - otherwise make corrections. The Manager then assesses which Tasks are ready and begins dispatching work.

## Step 4: Your First Task Cycle

This is the core loop of the Implementation Phase. Each Task goes through four procedures - assignment, execution, logging, and review - with you carrying messages between Agent conversations. Each Agent directs you on what to do next.

**1. Manager dispatches a Task** - The Manager constructs a self-contained Task Prompt (objective, instructions, validation criteria, and all the context a Worker needs) and writes it to the Worker's Task Bus. It then tells you which Worker conversation to go to and what to run.

**2. Initialize the Worker** - Open a new Agent for the assigned Worker and run the initiation command with the Worker's identifier. The Manager tells you the exact identifier to use.

```markdown
/apm-3-initiate-worker frontend-agent
```

The Worker resolves its identity against the Message Bus, confirms registration, and waits for its first Task Prompt.

**3. Deliver the Task** - Run `/apm-4-check-tasks` in the Worker's conversation. The Worker reads the Task Prompt from its Task Bus and begins execution - following the instructions, validating results against the criteria in the prompt, and iterating if validation fails.

:::tip
Workers pause for your review when User validation is specified in the Task Prompt. You can also interrupt or steer the Worker at any point during execution.
:::

**4. Worker logs and reports** - Once execution is complete, the Worker writes a structured Task Log to Memory (status, validation results, deliverables, and any flags for the Manager), then writes a brief Task Report to its Report Bus and tells you to deliver it to the Manager.

**5. Carry the report to the Manager** - Run `/apm-5-check-reports` in the Manager's conversation. Use the targeted version (e.g. `/apm-5-check-reports frontend-agent`) when multiple Workers are active. The Manager reads the Task Report and Task Log, then determines the next step:

- **Proceed** - Task successful, dispatch any newly ready Tasks
- **Follow-up** - Task needs retry with refined instructions
- **Document modification** - Execution revealed planning issues, update documents first

The Manager updates the Tracker and immediately assesses whether more Tasks are ready for dispatch. This completes one cycle.

## Step 5: Continuing the Project

The cycle from Step 4 repeats for each Task. As you work through the project, you'll encounter these variations:

### Follow-up Tasks

When a Task needs retry, the Manager creates a follow-up Task Prompt with refined instructions based on what went wrong. The Worker reuses the same Task Log path and overwrites the previous attempt.

### Document Modifications

When execution reveals issues with the planning documents, the Manager may update the Spec, Plan, or Rules. Small contained changes are within the Manager's authority. Significant changes - multiple Tasks affected, scope changes, design direction shifts - require your collaboration.

### Batch and Parallel Dispatch

For efficiency, the Manager may dispatch multiple Tasks at once:

**Batch dispatch** - Sequential Tasks to the same Worker in a single message. The Worker executes each Task in order, logs immediately after each, and stops if any Task fails.

**Parallel dispatch** - Tasks to different Workers simultaneously when no cross-Worker dependencies exist. You manage multiple Worker conversations, carrying messages as each completes. The Manager uses git branches and worktrees for workspace isolation.

## When Agents Reach Context Limits

When an Agent's context window approaches its limit, perform a Handoff to transfer working knowledge to a fresh instance.

### When to Handoff

Look for signs of context pressure: the Agent repeating questions it already asked, forgetting constraints you established earlier, or producing noticeably degraded responses. Handoff proactively rather than waiting for quality to collapse.

### Handoff Process

1. **Trigger Handoff** - Run `/apm-6-handoff-manager` or `/apm-7-handoff-worker` in the outgoing Agent's conversation.
2. **Outgoing Agent wraps up** - Creates a Handoff Log (working knowledge not captured in Task Logs) and writes a Handoff Prompt to its Handoff Bus with context reconstruction instructions.
3. **Open a new Agent** - For the same role (e.g. "Manager 2" or "Frontend Agent 2").
4. **Initialize the incoming Agent** - Run the same initialization command (`/apm-2-initiate-manager` or `/apm-3-initiate-worker frontend-agent`). The incoming Agent auto-detects the Handoff Prompt from its Handoff Bus.
5. **Verify and resume** - The incoming Agent reconstructs context from planning documents, Handoff Log, and relevant Task Logs, then presents an understanding summary for your verification before continuing.

### If Context Compaction Happens

Most AI platforms compress or discard earlier parts of a conversation when the context window fills - this is called auto-compaction. The platform notifies you when this happens.

APM is designed so that you trigger a Handoff *before* compaction occurs. If compaction does happen and the Agent starts acting inconsistently - forgetting constraints, repeating questions, losing track of state - use the recovery command:

```markdown
/apm-9-recover manager          # recover the Manager
/apm-9-recover frontend-agent   # recover a Worker by its identifier
```

The Agent re-reads its procedural documents and explores project artifacts to reconstruct working context. This is not a Handoff - the Agent continues as the same instance.

## After Project Completion

When the Manager completes all Tasks and Stages, it recommends running `/apm-8-summarize-session` in a new conversation. The summarization Agent reads all `.apm/` artifacts, validates them against the current codebase state, produces a session summary, and offers to archive.

To archive via the CLI:

```bash
apm archive                        # auto-named session-YYYY-MM-DD-NNN
apm archive --name my-feature-v1   # custom archive directory name
```

Archival snapshots the current `.apm/` artifacts to `.apm/archives/`, removes installed assistant files, and deletes installation metadata. Run `apm init` afterward to start a new APM session with fresh templates. The new Planner detects existing archives during Context Gathering and asks about their relevance - so each APM session can build on what came before.

## Next Steps

- [Agent Types](Agent_Types.md) - How Planner, Manager, and Worker roles work in depth
- [Agent Orchestration](Agent_Orchestration.md) - Communication, Memory, dispatch, and Handoff mechanics
- [Workflow Overview](Workflow_Overview.md) - Detailed walkthrough of every procedure
- [CLI Guide](CLI.md) - All CLI commands and options
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimization, and workflow efficiency
