---
id: context-engineering
slug: /context-engineering
sidebar_label: Context Engineering
sidebar_position: 7
---

# Context Engineering

APM's multi-agent design is built around a specific constraint: AI context windows are finite, and they degrade as they fill. This doc explains how APM engineers each Agent's context - how scoping is designed per role, how context flows between Agents during implementation, and how project state persists as a layered compression archive.

For the coordination mechanisms themselves, see [Agent Orchestration](Agent_Orchestration.md). For Agent roles and responsibilities, see [Agent Types](Agent_Types.md). This doc explains the reasoning underneath.

## Context Scoping

Each Agent role operates with a deliberately limited view of the project. The scoping is intentional: each role's context budget is shaped by what it needs to do well.

### Planner

The Planner dedicates its entire context window to planning. No execution history competes for space because the Planner does not participate in implementation. This is why APM separates planning from execution into distinct phases rather than having one Agent do both.

Having an entire conversation's context budget available allows the Planner to explore the codebase for deep understanding, conduct thorough discovery across multiple question rounds, cross-check findings against what actually exists, and decompose gathered context into planning documents through structured procedures. The quality of these documents determines the quality of everything that follows in the Implementation Phase.

### Manager

The Manager operates one layer above implementation detail. Its default context is coordination-level: planning documents, the Tracker, the Index, and Task Logs. It goes deeper when needed - reading source files for Task Prompt construction, investigating implementation detail during review, or operating at any level when the User requests it - but returns to the coordination layer after each pass. This is what allows a single Manager to coordinate many Tasks across multiple Workers without its context becoming unmanageable.

### Workers

Workers receive [Task Prompts](Agent_Orchestration.md#how-task-prompts-are-built) from the Manager and accumulate working context as they execute. A Worker assigned multiple Tasks across a project receives each when the Manager determines the Task is ready, building familiarity with the domain as it progresses. If the Worker's context fills up mid-project, it Hands off to a fresh instance that continues from where the previous left off.

A Worker never references the Spec, the Plan, or the Tracker. Each Task Prompt functions as a complete execution plan - dependency context, Spec content, and Plan Task fields synthesized into a single self-contained document. Every piece of coordination-level context the Worker does not carry is space available for the actual work: reading code, writing implementations, debugging, running validation.

## Context During Implementation

During the Implementation Phase, the Manager and Workers exchange context through the [Message Bus](Agent_Orchestration.md#the-message-bus) without ever sharing a context window. This isolation is what keeps each Agent's context focused.

### How the Manager Stays Lean

The Manager's context could easily bloat since it coordinates every Task, reviews every outcome, and maintains all project state. Two mechanisms keep it manageable:

- **Task Logs as abstraction** - The Manager reviews Task Logs rather than source code. A Worker might consume thousands of tokens reading files, debugging, and iterating. The Task Log compresses all of that into a structured summary, giving the Manager the outcome without the execution noise.
- **Stage summaries as compression** - At Stage boundaries, the Manager distills Task Logs and working notes into a Stage summary in the [Index](Agent_Orchestration.md#the-index). Detail from individual Tasks compresses into Stage-level observations. An incoming Manager after Handoff reads these summaries first, encountering the most compressed form of the project's history before loading recent detail.

### Cross-Agent Dependencies

Workers share a codebase, so they can see each other's outputs - the files, the code, the artifacts. What they lack is the context behind that work: why it was built that way, what architectural decisions shaped it, where to look for integration points, what constraints apply.

The Manager bridges this gap. It oversaw both sides of the dependency, assigned the producer Task, reviewed the outcome, and understands the design intent from the Spec. When constructing the consumer's Task Prompt, the Manager reads the producer's Task Log, extracts the key outputs and integration details, and provides the consuming Worker with the context it cannot get from the code alone.

When a Task depends on work done by the same Worker, the context is lighter. The Worker already has working familiarity from executing the producer Task, so the Manager provides recall anchors and file paths rather than full explanations.

### Cross-Instance Dependencies

When a Worker [Handoff](Agent_Orchestration.md#handoff-and-continuity) occurs, the incoming instance loads only current-Stage Task Logs to keep its context lean for execution. This means it lacks the previous instance's working familiarity with earlier Tasks, since previous-Stage work is outside its context.

The Manager accounts for this by treating those dependencies as if a different Worker had done the work, providing more comprehensive context in future Task Prompts. The incoming Worker can execute reliably without context gaps, while the lean log loading maintains efficiency.

## Project State Persistence

Every piece of project state in APM exists as a file outside any Agent's context window. When a conversation ends or an Agent's context fills up, the project state survives in the file system.

The [Tracker](Agent_Orchestration.md#the-tracker) holds live project state, reflecting the current moment. [Memory](Agent_Orchestration.md#file-based-memory) is a separate hierarchy that captures project history through Task Logs, Handoff Logs, and the Index. Together, they compose into a compression pipeline: execution detail flows into Task Logs, Task Logs compress into Stage summaries, working notes distill into Memory notes in the Index. Each layer reduces volume while preserving what matters for coordination.

An incoming Manager after Handoff reads the Index first - the most compressed and durable layer - then the Tracker for current state, then relevant Task Logs for recent detail. Each layer adds specificity, but the compressed layers load first so the Agent has the big picture before the details.

[Session archives](Workflow_Overview.md#session-continuation) extend this principle across APM sessions. The archive is a contextual snapshot. A new Planner examines relevant archives during Context Gathering and validates findings against the current codebase, enabling iterative development without starting from zero.

## Related Docs

- [Prompt Engineering](Prompt_Engineering.md) - How APM's files are designed and structured
- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Customization Guide](Customization_Guide.md) - Custom repositories and template customization
