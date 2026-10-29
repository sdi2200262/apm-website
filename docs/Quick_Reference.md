---
id: quick-reference
slug: /quick-reference
sidebar_label: Quick Reference
sidebar_position: 3
---

# Quick Reference

Commands, paths and workflow steps to keep at hand. For your first session, follow [Getting Started](Getting_Started.md).

## Commands

Invoke these skills by name in your agent conversations. Examples use Claude Code's `/` syntax; in Codex, use `$`. Other assistants use their own skill picker or chat syntax:

| Command | What it does |
| :--- | :--- |
| `/apm-1-initiate-planner` | Start the Planner (you can pass project context as an argument) |
| `/apm-2-initiate-manager` | Start the Manager |
| `/apm-3-initiate-worker <id>` | Start a Worker with the given identifier (e.g. `frontend-agent`) |
| `/apm-4-check-tasks` | Deliver a Task Prompt to the current Worker |
| `/apm-5-check-reports` | Deliver a Task Report to the Manager (add one or more Worker ids to target specific Workers) |
| `/apm-6-handoff-manager` | Initiate Manager Handoff before context fills |
| `/apm-7-handoff-worker` | Initiate Worker Handoff before context fills |
| `/apm-8-summarize-session` | Summarise a session and offer to archive it |
| `/apm-9-recover [role]` | Reconstruct context after compaction or a lost conversation (e.g. `manager` or `frontend-agent`) |

## CLI

You run these in your terminal from the project workspace:

| Command | What it does |
| :--- | :--- |
| `apm init` | Initialise APM with official templates |
| `apm custom -r owner/repo` | Initialise from a custom repository |
| `apm update` | Archive the current session, then update templates to the latest compatible version |
| `apm archive` | Archive the current session to `.apm/archives/` and remove installed assistant files |
| `apm archive --name my-feature` | Archive with a custom name |
| `apm add -a claude` | Add an installation target |
| `apm remove -a claude` | Remove an installation target |
| `apm status` | Show current installation state |

For every option, see the [CLI Guide](CLI_Guide.md).

## Project Structure

This is what `.apm/` looks like during a session:

```text
.apm/
├── spec.md              # What to build (design decisions, constraints, workspace)
├── plan.md              # How work is organised (Stages, Tasks, dependencies)
├── tracker.md           # Live session state (the Manager's dashboard)
├── metadata.json        # Installation metadata (source, version, assistants)
├── session.summary.md   # Optional, from /apm-8-summarize-session
├── memory/
│   ├── index.md         # Lasting findings and links to Stage summaries
│   ├── stage-01/        # Task Logs for Stage 1
│   │   ├── task-01-01.log.md
│   │   ├── task-01-02.log.md
│   │   └── stage-01.summary.md
│   └── handoffs/        # Handoff Logs per agent
│       ├── manager/
│       └── frontend-agent/
├── bus/                  # Message Bus (file-based agent communication)
│   ├── manager/
│   │   └── handoff.md
│   └── frontend-agent/
│       ├── task.md       # Task Prompt (Manager to Worker)
│       ├── report.md     # Task Report (Worker to Manager)
│       └── handoff.md    # Handoff Prompt
├── worktrees/            # Git worktrees for parallel dispatch
└── archives/             # Archived sessions from previous runs
    └── index.md          # One row per archived session
```

The Rules live in the `APM_RULES` block of workspace-root `AGENTS.md`. For Claude Code, the Planner imports it from an existing workspace `CLAUDE.md`.

## Planning Phase

1. **Start the Planner** - Open a new agent conversation, run `/apm-1-initiate-planner`
2. **Answer questions** - Three rounds: existing materials and vision, technical requirements, and implementation approach, quality and coordination, including Git agreements
3. **Approve the Understanding Summary** - Verify the Planner understands the project
4. **Review planning documents** - Approve the Spec, then the Plan, then the Rules
5. **Done** - The Planner initialises the Message Bus. Open a new conversation for the Manager.

## Implementation Phase

1. **Start the Manager** - Run `/apm-2-initiate-manager`, review and approve its Understanding Summary
2. **Manager dispatches** - It writes a Task Prompt and tells you which Worker to go to
3. **Start or switch to the Worker** - Run `/apm-3-initiate-worker <id>` for new Workers, or `/apm-4-check-tasks` for existing ones
4. **Worker executes** - It follows the Task Prompt, validates results, and logs the outcome
5. **Deliver the report** - Run `/apm-5-check-reports` in the Manager's conversation
6. **Manager reviews** - Proceeds, issues a follow-up, or modifies planning documents
7. **Repeat** - Steps 2-6 cycle until all Stages complete

## Handoff

When an agent's context fills or quality degrades:

1. Run `/apm-6-handoff-manager` or `/apm-7-handoff-worker` in the outgoing conversation
2. Review and approve its Handoff Log and Handoff Prompt
3. Open a new conversation for the same role and run its initiation skill (for a Worker, with its identifier)
4. Check the incoming agent's account of the current state and next action before continuing

For context lost without a Handoff, see [Recovery](Troubleshooting_Guide.md#context-recovery).

## After Completion

At completion or early stopping, pause active agents and record unfinished work. An optional `/apm-8-summarize-session` can run in a new chat or in the Manager's chat. To archive and start another session:

```bash
apm archive                        # move .apm/ artifacts to archives, clean workspace
apm init                           # reinstall and start a new session (the Planner detects past archives)
```
