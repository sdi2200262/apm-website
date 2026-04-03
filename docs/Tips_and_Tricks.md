---
id: tips-and-tricks
slug: /tips-and-tricks
sidebar_label: Tips and Tricks
sidebar_position: 12
---

# Tips and Tricks

Practical guidance for getting the most out of APM sessions, covering model selection, cost optimization, workflow efficiency, and patterns that work well in practice.

## Model Selection

APM Agents perform best with capable reasoning models. For the best overall performance, use **Claude Opus 4.6** throughout all Agent roles. For a budget-friendlier alternative that still delivers strong results, use **Claude Sonnet 4.6** throughout.

Beyond these defaults, the table below provides a broader selection. The Planner and Manager handle architectural and coordination decisions where deeper reasoning produces better outcomes. Workers handle execution where code generation and tool use matter most.

### Recommended Models

| Agent | Recommended | Cost-effective alternative |
| :--- | :--- | :--- |
| **Planner** | Claude Opus 4.6, GPT-5.2+ | Claude Sonnet 4.6, GPT-5.1, GPT-5.2 |
| **Manager** | Claude Opus 4.6, GPT-5.2+, Gemini 3.1 Pro | Claude Sonnet 4.6, GPT-5.1, GPT-5.2, Gemini 3 Pro |
| **Workers** | Claude Opus 4.6, GPT-5.4, GPT-5.3-Codex, Gemini 3.1 Pro | Claude Sonnet 4.6, Claude Haiku 4.5, GPT-5.4 mini, GPT-5.3-Codex-Spark, Gemini 3 Flash, Grok Code Fast 1, DeepSeek V4, Qwen 3.5 |

**Codex models** (GPT-5.3-Codex, GPT-5.3-Codex-Spark and similar) are tuned for code generation and work well for Workers, but should not be used for Planners or Managers. These models lack the general reasoning and coordination abilities that planning and orchestration require.

**Budget models** (Claude Haiku 4.5, GPT-5.4 mini, Gemini 3 Flash, Grok Code Fast 1, DeepSeek V4, Qwen 3.5) work for Workers on straightforward Tasks. For complex Tasks involving architecture, multi-file coordination, or design decisions, use a more capable model.

### Model Switching

Switching models mid-conversation is generally safe for Workers because their context is tightly scoped to the current Task. For the Planner, avoid switching models during a session since the entire Planning Phase relies on accumulated context from Context Gathering. For the Manager, switching is possible between Task cycles but consistency produces better coordination.

### Reasoning Effort

For models with adjustable reasoning effort, use medium or higher throughout. The Planner and Manager benefit most from higher reasoning settings since they make architectural and coordination decisions.

## Cost Optimization

### Front-Loading Context

The Planner's optional argument accepts project context upfront, reducing the number of question rounds needed:

```
/apm-1-initiate-planner We're building a REST API for a task management app. Here's the PRD: @docs/prd.md and the existing codebase is in src/
```

Sharing existing documentation, PRDs, and codebase references early in Context Gathering prevents expensive follow-up rounds.

### Batch-Friendly Planning

On platforms that bill per request rather than per token, structuring work to favor batch dispatch reduces the number of exchanges.

The User can mention during Context Gathering that batch-friendly Task structure is preferred. The Planner considers this when organizing Tasks in the Plan, favoring sequential chains assigned to the same Worker or groups of independent same-Worker Tasks that can be dispatched together.

Alternatively, without modifying the planning procedures, the User can encourage the Manager to prefer batch dispatch when multiple same-Worker Tasks are ready simultaneously.

### Handoff Timing

Proactive Handoff before context window limits approach is cheaper than recovery after compaction. An Agent with clean context produces better Handoff artifacts than one already experiencing degradation. The User should trigger Handoffs based on the context usage they can see, instead of relying on platform auto-compaction or summarization mechanisms for continuity.

That said, if a Worker has only one or two Tasks left or is near completing its current Task, it can be more practical to let the platform auto-compact, use Recovery to finish the remaining work, and Handoff afterward if needed.

The hardest part of Handoff is knowing when to trigger it - context degradation is not always obvious until quality has already dropped. If your platform supports hooks or triggers that fire at context thresholds, you can use them to detect when Handoff is needed and prompt the Agent to initiate it. For Claude Code, [`cc-context-awareness`](https://github.com/giannisp01/cc-context-awareness) provides configurable context threshold hooks, and ships with a ready-made `apm-handoff` template that handles Manager, Worker, and Planner agents out of the box.

### Subagent Usage

Workers should use subagents for substantial debugging or research rather than consuming their own context window. A debug subagent runs in its own context, resolves the issue (or reports findings), and returns results. The Worker's context is preserved for actual execution. The Planner similarly benefits during Context Gathering, where substantial codebase exploration is better delegated to a subagent so the Planner's context remains available for Work Breakdown.

Agents are designed to use subagents on their own, but they do not always take the initiative. If the User notices an Agent spending significant context on debugging, research, or exploration that could run in isolation, prompting it to spawn a subagent can save considerable context for the work that follows.

## Workflow Efficiency

### Planning Quality

The most effective cost optimization is thorough planning. A well-structured Plan with clear Task boundaries, accurate dependencies, and specific validation criteria reduces follow-ups, rework, and debugging during implementation. Time spent reviewing planning documents before approving them pays for itself in fewer Task iterations.

### Steering the Workflow

You can influence the APM workflow at any point during the Implementation Phase. Here are some examples:

**Direct Workers during execution** - You can steer a Worker mid-Task with corrections, scope adjustments, or additional work. Workers note User directives in the Task Log by default so the Manager sees them during review, but explicitly asking the Worker to log it ensures it gets flagged:

```
The API response format changed since the Plan was written - use the v2 format from docs/api-v2.md instead. Flag this in your Task Log as an important finding so the Manager updates the Spec and future Tasks use the right format.
```

**Add context when delivering reports** - When you run `/apm-5-check-reports`, you can include additional context or requirements alongside the delivery. The Manager factors these into its next decisions:

```
/apm-5-check-reports python-agent

The task was executed but I noticed the error handling doesn't cover timeout scenarios. I want the next Task for this Worker to address that before moving on.
```

**Request new Tasks** - Tell the Manager you need something that isn't in the Plan. It can create Tasks, adjust dependencies, or modify the Plan on the fly:

```
I need a new Task for setting up CI/CD - this wasn't in the Plan but we need it before Stage 2.
```

**Add working notes** - Working notes are ephemeral coordination context in the Tracker. They capture preferences, environment details, and observations that should inform upcoming Tasks. You can add them through a Worker (noted in the Task Log, picked up by the Manager during review) or through the Manager directly:

```
Add a working note: I prefer verbose logging during this Stage so I can monitor execution progress across Workers.
```

**Update Rules** - Rules are universal execution patterns that apply to all Workers permanently. If you identify a pattern that every Worker should follow, it belongs in Rules:

```
I want all new API endpoints to follow the error response format defined in docs/api-errors.md. Add this to Rules so all Workers follow it.
```

Workers can also propose Rules updates when they discover patterns during execution.

### Session Management

For large projects, splitting work across multiple APM sessions and archiving between them keeps each session focused. The new Planner examines archived sessions during Context Gathering, so context carries forward without a single session trying to hold everything. Some patterns that work well:

**Per-feature sessions** - One APM session per feature or deliverable. Archive after each feature is complete, start a new session for the next. Each Planner picks up where the previous left off.

**Direction changes** - If an APM session hits a blocker or execution reveals important findings that require a change of direction, pause the Manager, ask it to wrap up its working notes, summarize the session, and archive. A new Planner can assess the situation with the full archive context and plan the revised approach from scratch.

**Sequential layer builds** - For projects with clear layers (e.g. database first, then backend, then frontend), each layer can be its own APM session. Each session's archive informs the next Planner about what was built and how it works.

## Related Docs

- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Customization Guide](Customization_Guide.md) - Custom repositories and template customization
- [Security Guide](Security_Guide.md) - Trust model, risks, and mitigation for custom repositories
