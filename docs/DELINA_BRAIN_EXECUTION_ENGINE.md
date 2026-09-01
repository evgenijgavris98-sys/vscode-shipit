# DELINA BRAIN Execution Engine

## Purpose

Extend the ShipIt task loop into the execution layer for DELINA/BIORICHE BRAIN without replacing the proven PRD → user stories → execution workflow.

## Architecture

```text
BRAIN
  |
  +-- Planner: turns goals into bounded tasks
  |
  +-- Agent Registry: selects a specialist for each task
  |
  +-- Execution Engine: runs one story at a time
  |
  +-- Review Gate: QA / Legal / Regulatory / domain checks
  |
  +-- Memory Adapter: records decisions, evidence and outcomes
  |
  +-- GitHub Adapter: source control, issues, PRs and audit trail
```

## Design rules

1. Keep the existing ShipIt orchestrator as the execution backbone.
2. Do not hard-code DELINA-specific agents into the core task runner.
3. Route work through an explicit agent registry.
4. Require a review gate before a task is considered complete when policy requires it.
5. Preserve progress and state in machine-readable files so execution can resume safely.
6. Never store API keys, OAuth tokens or other secrets in PRDs, progress logs or agent metadata.
7. A blocked task must remain blocked; the engine must not silently mark it complete.
8. Every agent result should identify its role, status, evidence references and next action.

## Initial specialist roles

- LAB_DIRECTOR — orchestration and prioritization
- RND_CHEMIST — formulation and technical analysis
- MARKET_ANALYST — market, competitor and pricing research
- LEGAL_GUARD — legal-risk review
- REGULATORY_WATCHDOG — regulatory/claims review
- QA_INSPECTOR — quality and verification
- SUPPLY_CHAIN — sourcing and operational checks
- CONTENT_MANAGER — approved content production

The registry is intentionally extensible; adding a role must not require changes to the orchestrator.

## Execution lifecycle

`PLANNED → ASSIGNED → IN_PROGRESS → REVIEW → COMPLETE`

Failure paths:

`IN_PROGRESS → BLOCKED`

`IN_PROGRESS → RETRY → IN_PROGRESS`

A task can only enter `COMPLETE` after its required review gates pass.

## Phase 1 implementation

- Add neutral execution-domain types.
- Add an agent registry interface and default DELINA role catalog.
- Add configuration flags for Brain mode and review gates.
- Add documentation and tests before changing the existing orchestration behavior.

## Phase 2

Integrate registry selection into `TaskRunner` and add review-gate callbacks.

## Phase 3

Add memory and GitHub adapters, then expose Brain status in the existing sidebar.

## Phase 4

Add autonomous scheduling/automation outside the VS Code extension where appropriate.
