---
id: quick-reference
slug: /quick-reference
sidebar_label: Quick Reference
sidebar_position: 3
---

# Quick Reference

A handy cheat sheet for APM sessions. All the commands, file paths, and workflows in one place.

## APM Commands

You run these as slash commands in your Agent conversations:

| Command | What it does |
| :--- | :--- |
| `/apm-1-initiate-planner` | Start the Planner (you can pass project context as an argument) |
| `/apm-2-initiate-manager` | Start the Manager |
| `/apm-3-initiate-worker <id>` | Start a Worker with the given identifier (e.g. `frontend-agent`) |
| `/apm-4-check-tasks` | Deliver a Task Prompt to the current Worker |
| `/apm-5-check-reports` | Deliver a Task Report to the Manager (add a Worker id to target a specific one) |
| `/apm-6-handoff-manager` | Initiate Manager Handoff before context fills |
| `/apm-7-handoff-worker` | Initiate Worker Handoff before context fills |
| `/apm-8-summarize-session` | Generate a structured session summary (current chat or new conversation) |
| `/apm-9-recover <role>` | Reconstruct context after compaction (e.g. `manager` or `frontend-agent`) |

## CLI Commands

You run these in your terminal from the project workspace:

| Command | What it does |
| :--- | :--- |
| `apm init` | Initialize APM with official templates |
| `apm custom -r owner/repo` | Initialize from a custom repository |
| `apm update` | Update templates to the latest compatible version |
| `apm archive` | Archive current session to `.apm/archives/` |
| `apm archive --name my-feature` | Archive with a custom name |
| `apm add -a copilot` | Add an assistant to an existing installation |
| `apm remove -a copilot` | Remove an assistant |
| `apm status` | Show current installation state |

## APM Project Structure

This is what `.apm/` looks like during a session:

```text
.apm/
├── spec.md              # What to build (design decisions, constraints, workspace)
├── plan.md              # How work is organized (Stages, Tasks, dependencies)
├── tracker.md           # Live project state (the Manager's dashboard)
├── metadata.json        # Installation metadata (source, version, assistants)
├── memory/
│   ├── index.md         # Durable observations and Stage summaries
│   ├── stage-01/        # Task Logs for Stage 1
│   │   ├── task-01-01.log.md
│   │   └── task-01-02.log.md
│   └── handoffs/        # Handoff Logs per Agent
│       ├── manager/
│       └── frontend-agent/
├── bus/                  # Message Bus (file-based Agent communication)
│   ├── manager/
│   │   └── handoff.md
│   └── frontend-agent/
│       ├── task.md       # Task Prompt (Manager to Worker)
│       ├── report.md     # Task Report (Worker to Manager)
│       └── handoff.md    # Handoff Prompt
└── archives/             # Archived sessions from previous runs
```

The Rules file lives outside `.apm/` - it's written to your platform's rules file (e.g. `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`) so your assistant reads it automatically.

## Planning Phase

1. **Start the Planner** - Open a new Agent conversation, run `/apm-1-initiate-planner`
2. **Answer questions** - Three rounds covering vision, requirements, and implementation approach
3. **Approve the Understanding Summary** - Verify the Planner understands the project
4. **Review planning documents** - Approve the Spec, then the Plan, then the Rules
5. **Done** - The Planner initializes the Message Bus. Open a new conversation for the Manager.

## Implementation Phase

1. **Start the Manager** - Run `/apm-2-initiate-manager`, review and approve its Understanding Summary
2. **Manager dispatches** - It writes a Task Prompt and tells you which Worker to go to
3. **Start or switch to the Worker** - Run `/apm-3-initiate-worker <id>` for new Workers, or `/apm-4-check-tasks` for existing ones
4. **Worker executes** - It follows the Task Prompt, validates results, and logs the outcome
5. **Carry the report** - Run `/apm-5-check-reports` in the Manager's conversation
6. **Manager reviews** - Proceeds, issues a follow-up, or modifies planning documents
7. **Repeat** - Steps 2-6 cycle until all Stages complete

## Handoff

When an Agent's context fills or quality degrades:

1. Run `/apm-6-handoff-manager` or `/apm-7-handoff-worker` in the outgoing conversation
2. Open a new conversation for the same role
3. Run the same initiation command - the incoming Agent auto-detects the Handoff

Handoff produces cleaner context than recovery (`/apm-9-recover`), so prefer it when you can anticipate the limit.

## After Completion

When the Manager finishes all Stages, you can archive the session and start fresh. Archives are preserved so future Planners can build on past work.

```bash
apm archive                        # snapshot .apm/ to archives, clean workspace
apm init                           # start a new session (the Planner detects past archives)
```

You can also run `/apm-8-summarize-session` first to generate a summary that future Planners can reference.
