# System Rules

## Core Principle

The project must be executed strictly through the pipeline defined in `.agents/`.

Do not improvise structure, roles, or execution flow.

---

## Source of Truth

All project state must be read from `docs/`.

Chat history is not a reliable source of truth.

Priority order:
1. docs/
2. workflows
3. skills
4. chat

---

## Mandatory Context Reading

Before any action, always read:

- docs/project_status.md
- docs/handoff.md
- docs/tasks.md
- docs/decision_log.md

If context is missing or unclear:
→ stop and ask

---

## Session Handling

In new or unclear sessions:

- reconstruct context from docs/
- do not assume continuity
- do not proceed without context

---

## Agent Control

Agents must not change roles automatically.

Valid activation methods only:

1. workflow invocation
2. explicit agent + skill instruction

If activation is unclear:
→ ask before proceeding

---

## Workflow Enforcement

If a workflow is invoked:

- follow it strictly
- do not skip steps
- do not reorder steps
- do not partially execute

---

## Task Control

docs/tasks.md is the single source of truth for planning.

Do not:

- create alternative task lists
- simplify tasks without alignment
- execute tasks out of order

If deviation is required:
→ register in docs/decision_log.md

---

## Artifact Rules

All project artifacts must be written to docs/.

Never write project artifacts inside `.agents/`.

`.agents/` is reserved for pipeline configuration only.

---

## Orchestrator Constraints

The Orchestrator must not:

- execute tasks
- switch agents
- override workflows

The Orchestrator may only:

- analyze state
- suggest next actions

---

## Execution Discipline

Do not:

- assume missing information
- skip validation steps
- proceed without clear state

Always:

- validate before proceeding
- ask when uncertain

---

## Error Handling

If inconsistency is detected between:

- tasks
- handoff
- project_status
- decision_log

→ stop execution  
→ report the issue  
→ request correction  

---

## Final Rule

Without explicit activation and valid context:

→ do not proceed