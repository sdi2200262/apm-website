---
id: tips-and-tricks
slug: /tips-and-tricks
sidebar_label: Tips and Tricks
sidebar_position: 12
---

# Tips and Tricks

Practical guidance for APM sessions: choosing models, keeping costs down, and steering the work.

## Model Selection

APM works best with capable reasoning models, such as the top models from Claude, GPT, or Gemini.

- **Planner and Manager:** use the strongest model you can. Their planning and coordination decisions shape every Task.
- **Workers:** a smaller model is often enough, since Workers mostly write code and run tools. Give harder Tasks to a stronger one.

If your model lets you set its reasoning effort, set it higher for the Planner and the Manager.

### Switching Models

Switching models mid-conversation is generally safe for Workers, whose context is scoped to the current Task. Avoid it for the Planner, which relies on everything gathered during Context Gathering. The Manager can switch between Task cycles, but one model throughout coordinates more consistently.

## Cost Efficiency

### Context Up Front

The Planner's initiation command accepts project context, which makes its questions more targeted and spares follow-up rounds:

```
/apm-1-initiate-planner We're building a REST API for a task management app. Here's the PRD: @docs/prd.md and the existing codebase is in src/
```

### Batch-Friendly Planning

On platforms that bill per request, batch dispatch saves exchanges. Mention during Context Gathering that you prefer batch-friendly Tasks, and the Planner favours sequential chains for the same Worker. You can also ask the Manager to prefer batch dispatch when several Tasks for one Worker are ready.

### Handoff Timing

A [Handoff](Agent_Orchestration.md#handoff-and-continuity) before the context limit costs less than recovery after compaction, and an agent with clean context writes better Handoff artifacts. Trigger Handoffs from the context usage your platform shows. When a Worker is one or two Tasks from finishing, it can be simpler to let the platform compact, recover, and finish.

Knowing when to hand off is the hard part, since decay is often visible only after quality drops. Some platforms support hooks that fire at context thresholds. For Claude Code, [`cc-context-awareness`](https://github.com/sdi2200262/cc-context-awareness) sets such thresholds and can prompt the agent to start a Handoff.

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

You can steer the workflow at any point during implementation.

#### Directing Workers

Correct or extend a Worker's Task mid-execution. Workers record your corrections in the Task Log for the Manager, and offer to add them to the Rules:

```
The API response format changed since the Plan was written - use the v2 format from docs/api-v2.md instead.
```

#### Adding Context to Reports

Add your own notes when you deliver a report:

```
/apm-5-check-reports python-agent

The task was executed but I noticed the error handling doesn't cover timeout scenarios. I want the next Task for this Worker to address that before moving on.
```

#### Working Notes and Rules

Preferences or observations for the coming Tasks of a Stage go into the Tracker as working notes:

```
Add a working note: I prefer verbose logging during this Stage so I can monitor execution progress across Workers.
```

A pattern every Worker should follow for the rest of the project belongs in the Rules:

```
I want all new API endpoints to follow the error response format defined in docs/api-errors.md. Add this to Rules so all Workers follow it.
```

#### Tasks and Dispatch

Ask the Manager for Tasks the Plan lacks, or suggest groupings from what you know about the work:

```
I need a new Task for setting up CI/CD - this wasn't in the Plan but we need it before Stage 2.
```

```
The database schema and the API routes don't depend on each other - dispatch them in parallel to separate Workers.
```

### Splitting Sessions

For large projects, several APM sessions with an archive between each keep every session focused. Each new Planner examines the archives, and context carries forward. Common splits:

- **Per feature:** one session per feature or deliverable.
- **Per layer:** one session per layer, such as the database, then the backend, then the frontend.
- **After a change of direction:** when execution hits a blocker that changes the plan, run `/apm-8-summarize-session` in a new conversation, then archive the session. A new Planner plans the revised approach with the archive in view.

## Related Docs

- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Customization Guide](Customization_Guide.md) - Custom repositories and template customisation
- [Security Guide](Security_Guide.md) - Trust model, risks, and mitigation for custom repositories
