---
id: context-engineering
slug: /context-engineering
sidebar_label: Context Engineering
sidebar_position: 7
---

# Context Engineering

APM's multi-agent design is built around a specific constraint: AI context windows are finite, and they degrade as they fill. This doc explains how APM engineers each Agent's context, covering how scoping is designed per role, how context flows between Agents during implementation, and how Memory accumulates as a persistent context archive.

For the coordination mechanisms themselves, see [Agent Orchestration](Agent_Orchestration.md). For Agent roles and responsibilities, see [Agent Types](Agent_Types.md). This doc explains the reasoning underneath.

## Context Scoping

Each Agent role operates with a deliberately limited view of the project. The scoping is intentional: each role's context budget is shaped by what it needs to do well.

### Planner

The Planner dedicates its entire context window to planning. No execution history competes for space because the Planner does not participate in implementation. This is why APM separates planning from execution into distinct phases rather than having one Agent do both.

Having an entire conversation's context budget available allows the Planner to explore the codebase for deep understanding, conduct thorough context gathering across multiple question rounds, and cross-check findings against what actually exists in the workspace. The Planner iterates on gaps, follows up on ambiguities, proactively investigates when responses reference existing code or documentation, and decomposes gathered context through structured procedures into planning documents. The quality of these documents determines the quality of everything that follows in the Implementation Phase.

### Manager

The Manager operates one layer above implementation detail. Its default context is coordination-level: planning documents, the Tracker, the Memory Index, and Task Logs. It goes deeper when needed - reading source files for Task Prompt construction, investigating implementation detail during review, or operating at any level when the User requests it - but returns to the coordination layer after each pass. This is what allows a single Manager to coordinate many Tasks across multiple Workers without its context becoming unmanageable.

### Workers

Workers receive Task Prompts from the Manager one at a time (or in batches) and accumulate working context as they execute. A Worker assigned seven Tasks across a project receives each when the Manager determines the Task is ready, building familiarity with the domain as it progresses. If the Worker's context fills up mid-project, it Hands off to a fresh instance that continues from where the previous left off.

Each [Task Prompt](Agent_Orchestration.md#how-task-prompts-are-built) functions as a complete execution plan, composed of dependency context, Spec content, and Plan Task fields synthesized into a single self-contained document. A Worker receiving a Task Prompt has everything needed to execute that Task end-to-end without referencing the Plan, the Spec, or the Tracker. Every piece of coordination-level context the Worker does not carry is space available for the actual work: reading code, writing implementations, debugging, running validation.

## Context During Implementation

During the Implementation Phase, the Manager and Workers exchange context through the [Message Bus](Agent_Orchestration.md#the-message-bus) without ever sharing a context window. The Manager writes Task Prompts to a Worker's Task Bus. The Worker reads the prompt, executes, and writes a Task Report back. The User carries messages between conversations. This isolation is what keeps each Agent's context focused.

### How the Manager Stays Lean

The Manager's context could easily bloat since it coordinates every Task, reviews every outcome, and maintains all project state. APM keeps it manageable through two mechanisms:

- **Task Logs as abstraction** - The Manager reviews Task Logs rather than source code. A Worker might consume thousands of tokens reading files, debugging, and iterating. The Task Log compresses all of that into a structured summary of a few hundred tokens, giving the Manager the outcome without the noise.
- **Stage summaries as compression** - At Stage boundaries, the Manager distills Task Logs and working notes into a Stage summary in the Index. Detail from individual Tasks compresses into Stage-level observations. An incoming Manager after Handoff reads these summaries first, encountering the most compressed form of the project's history.

### Cross-Worker Dependencies

Workers share a codebase, so they can see each other's outputs: the files, the code, the artifacts. What they lack is the context behind that work. Why it was built that way, what architectural decisions shaped it, where to look for integration points, what constraints apply. A Worker looking at code written by another Worker sees the result but not the reasoning.

The Manager bridges this gap. It oversaw both sides of the dependency, assigned the producer Task, reviewed the outcome, and understands the design intent from the Spec. When constructing the consumer's Task Prompt, the Manager reads the producer's Task Log, extracts the key outputs and integration details, and provides the consuming Worker with the context it cannot get from the code alone: where to look, how the pieces connect, and what constraints to respect.

When a Task depends on work done by the same Worker, the context is lighter. The Worker already has working familiarity from executing the producer Task, so the Manager provides recall anchors and file paths rather than full explanations.

### Cross-Instance Dependencies

When a Worker Handoff occurs, the incoming instance [loads only current-Stage Task Logs](Agent_Orchestration.md#context-reconstruction) to keep its context lean for execution. This means it lacks the previous instance's working familiarity with earlier Tasks, since previous-Stage work is outside its context.

The Manager accounts for this by treating those dependencies as if a different Worker had done the work, providing more comprehensive context in future Task Prompts. The incoming Worker can execute reliably without context gaps, while the lean log loading maintains efficiency.

## Project State Persistence

Every piece of project state in APM exists as a file outside any Agent's context window. When a conversation ends or an Agent's context fills up, the project state survives in the file system.

The **Tracker** (`.apm/tracker.md`) holds live project state: Task statuses, Agent tracking, branch state, and working notes. It reflects the current moment and is updated constantly by the Manager.

**Memory** (`.apm/memory/`) is a separate hierarchy that captures project history:

| Layer | Location | What it captures | Lifecycle |
| :--- | :--- | :--- | :--- |
| **Index** | `.apm/memory/index.md` | Durable memory: persistent observations and Stage summaries | Accumulates across the project, read first after Handoff |
| **Task Logs** | `.apm/memory/stage-NN/` | Per-Task execution summaries | Written once per Task, organized by Stage |
| **Handoff Logs** | `.apm/memory/handoffs/` | Instance-level working knowledge | Written during Handoff, one per Agent instance |

Together, the Tracker and Memory compose into a compression pipeline. Execution detail flows into Task Logs. Task Logs compress into Stage summaries. Working notes in the Tracker distill into Memory notes in the Index. Each layer reduces the volume while preserving what matters for coordination.

An incoming Manager after Handoff reads the Index first (Memory notes and Stage summaries, the most compressed and durable layer), then the Tracker for current state, then relevant Task Logs for recent detail. Each layer adds specificity, but the compressed layers load first so the Agent has the big picture before the details.

### Session Archives

When an APM session is archived, the entire `.apm/` state (planning documents, Tracker, Memory) is snapshot into `.apm/archives/`. This archive is a contextual snapshot of the project at that point in time. When a new Planner starts a subsequent session, it can examine relevant archives to understand what was previously built, what was decided, and what issues remain. The Planner validates archived findings against the current state of the codebase, since the archive is a snapshot and code may have changed since it was created. This enables iterative development across sessions without starting from zero context each time.

## Related Docs

- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [CLI Guide](CLI.md) - All CLI commands and options
- [Customization Guide](Customization_Guide.md) - Custom repositories and template customization
