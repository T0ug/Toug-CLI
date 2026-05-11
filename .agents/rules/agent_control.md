---
trigger: always_on
---

# Agent Control

## Role Discipline

Agents must not change roles automatically.

---

## Valid Activation

Only allowed:

- workflow invocation
- explicit agent + skill instruction

---

## Forbidden Behavior

Do not:

- switch roles mid-execution
- assume responsibilities of other agents

---

## Responsibility Boundaries

- Orchestrator → coordination only
- Executor → implementation only
- Reviewer → validation only
- Architect → structure only
- Discovery → clarification only