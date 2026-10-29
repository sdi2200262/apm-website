---
id: tips-and-tricks
slug: /tips-and-tricks
sidebar_label: Tips and Tricks
sidebar_position: 12
---

# Tips and Tricks

Practical guidance for choosing models, controlling coordination overhead and steering the work.

## Model Selection

APM works best with capable reasoning models, such as the top models from Claude, GPT, or Gemini.

- **Planner and Manager:** use the strongest model you can. Their planning and coordination decisions shape every Task.
- **Workers:** choose a model for the Task's difficulty and required tools. A cheaper model may suit bounded, familiar work.

If your model lets you set its reasoning effort, set it higher for the Planner and the Manager.

### Switching Models

When switching models, check that the replacement understands the current state and instructions. Switching between Tasks gives you a clearer point to review this. For a fresh conversation with another model, use a [Handoff](Agent_Orchestration.md#handoff-and-continuity).

## Cost Efficiency

Thorough planning is the best saving. Time spent reviewing the planning documents before you approve them spares follow-ups and rework during implementation.

### Context Up Front

The Planner's initiation command accepts project context, which makes its questions more targeted and spares follow-up rounds:

```
/apm-1-initiate-planner We're building a REST API for a task management app. Here's the PRD: @docs/prd.md and the existing codebase is in src/
```

### Batch-Friendly Planning

Batch dispatch reduces message deliveries. Mention during Context Gathering that you prefer batch-friendly Tasks, and the Planner favours sequential chains for the same Worker. You can also ask the Manager to prefer batch dispatch when several Tasks for one Worker are ready. Batches also mean fewer exchanges pass through you, each covering more work.

### Handoff Timing

Use the context usage your assistant shows to plan a [Handoff](Agent_Orchestration.md#handoff-and-continuity) before the limit. Check that its files describe the current work and next action. If compaction has already lost context, use recovery first.

Some assistants support context reminders or hooks. These can help you choose when to hand off; you still review the continuation state.

### Subagents

If an agent spends its context on debugging, research, or exploration that could run in isolation, ask it to launch a subagent.

## Workflow Efficiency

### Validation Criteria

The validation criteria you give the Planner reach every Task Prompt. When they are specific and testable, Workers can execute, validate, and iterate on their own, sometimes completing complex work without your input. Workers validate with whatever tools the platform offers: a test suite, a linter or type checker, a browser tool for UI work.

Describe what "done" means in testable terms:

```
Each API endpoint should return the correct status codes and response shapes. The Worker should validate by running the existing test suite (npm test) and adding new tests for any endpoints it creates.
```

If you want a milestone verified before the next Stage, tell the Manager. It can run checks, examine edge cases, or send a verification subagent.

### Steering

You can steer implementation at any point:

- **Correct a Worker** in its conversation. It applies the correction and records what matters for the Manager. At Task completion, it asks whether a correction useful for later Tasks should become a Rule.
- **Add context when delivering a report.** Give the Manager your observations alongside `apm-5-check-reports`, such as a missed edge case or a changed requirement.
- **Keep coordination notes in the Tracker.** Pending decisions, blockers and preferences for upcoming work belong there. Shared execution conventions belong in the Rules.
- **Change the work or dispatch.** Ask the Manager for a missing Task or a different grouping. Changes affecting several Tasks, scope or design need your approval.

### Splitting Sessions

For large projects, several APM sessions with an archive between each keep every session focused. Each new Planner examines relevant archives with your confirmation, and context carries forward. Common splits:

- **Per feature:** one session per feature or deliverable.
- **Per layer:** one session per layer, such as the database, then the backend, then the frontend.
- **After a change of direction:** when execution hits a blocker that changes the plan, run `/apm-8-summarize-session` in a new conversation, then archive the session. A new Planner plans the revised approach with the archive in view.

## Related Docs

- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Customisation Guide](Customisation_Guide.md) - Custom repositories and template customisation
- [Security Guide](Security_Guide.md) - Trust model, risks, and mitigation for custom repositories
