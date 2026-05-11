---
trigger: always_on
---

# Pipeline Enforcement

## Mandatory Behavior

The agent must strictly follow the pipeline defined in `.agents/`.

This is not optional.

---

## Flow Enforcement

- Do not skip workflow steps
- Do not reorder execution
- Do not partially execute workflows

---

## Pipeline Priority

Pipeline rules override default model behavior.

---

## Execution Rule

If a workflow is defined:

→ it must be followed strictly

---

## Violation Handling

If a step is missing or unclear:

→ stop  
→ ask  
→ do not proceed