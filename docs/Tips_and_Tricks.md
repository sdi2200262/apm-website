---
id: tips-and-tricks
slug: /tips-and-tricks
sidebar_label: Tips and Tricks
sidebar_position: 12
---

# Tips and Tricks

Practical choices for models, coordination overhead and review points during an APM session.

## Model Selection

Use capable reasoning models for the Planner and Manager: their decisions shape many Tasks. Match each Worker to its Task's difficulty and required tools; a cheaper model may suit bounded, familiar work. Higher reasoning effort can be useful for complex planning or coordination when your model supports it.

### Switching Models

Check that a replacement model understands the current state and instructions. Switching between Tasks gives you a clear point to review this. To move a Manager or Worker to a fresh conversation, use a [Handoff](Agent_Orchestration.md#handoff-and-continuity). Keep the Planner's gathered context available until its documents are approved.

## Cost Efficiency

Reviewing requirements and validation before implementation can prevent follow-ups and rework. Task size and dispatch also affect how much coordination passes through you.

### Context Up Front

Give the Planner existing requirements, relevant code paths and known constraints when starting it. [Getting Started](Getting_Started.md#step-1-initiate-the-planner) shows how to include context with the initiation skill.

### Batch-Friendly Planning

Ask for smaller Tasks when you want frequent review points, or for batches when you prefer fewer deliveries covering more work. Discuss this during planning so Task boundaries support your preference. The Manager chooses actual [dispatches](Agent_Orchestration.md#dispatch-modes) as dependencies become ready.

### Handoff Timing

Use your assistant's context display or reminders to plan a Handoff before the limit. Review its continuation files while the current work is still clear. If compaction has already lost context, use [recovery](Troubleshooting_Guide.md#context-recovery) first.

### Subagents

Focused research, debugging or verification may suit a native subagent when it can work independently. The parent agent keeps its role's scope and checks the findings before using them.

## Workflow Efficiency

### Validation Criteria

Give concrete pass/fail checks and identify anything that needs your judgement, access or outside action. This helps Workers validate independently and makes remaining limits clear during review. For example:

```text
Each API endpoint must return the documented status codes and response shape. Run the existing test suite and add tests for the new endpoints, including timeout handling.
```

If a milestone needs verification across Tasks, tell the Planner so it appears in the Plan, or ask the Manager before the Stage closes.

### Steering

- Correct a Worker in its conversation; it records consequential corrections for the Manager and asks before adding them to Rules.
- Give the Manager your observations when delivering a report, such as a missed edge case or changed requirement.
- Ask the Manager to record pending decisions and blockers in the Tracker, or to change Task structure and dispatch where needed.

[Workflow Overview](Workflow_Overview.md#task-cycles) explains how these changes affect active work, follow-ups and approvals.

### Splitting Sessions

Split a large goal when later work depends on decisions the current session must settle. Natural boundaries include a feature, a software layer or a change in direction. Agree the current scope with the Planner; a later session can use its archive. See [Session Continuation](Workflow_Overview.md#session-continuation) for closing and restarting.

## Related Docs

- [Getting Started](Getting_Started.md) - Running a first session
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Recovering context and resolving blocked work
