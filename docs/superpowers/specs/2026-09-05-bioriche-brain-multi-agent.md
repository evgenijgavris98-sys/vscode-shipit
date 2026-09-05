# BIORICHE BRAIN Multi-Agent Pilot Specification

## Objective

Create a safe, provider-neutral orchestration layer that can coordinate three initial BIORICHE BRAIN roles: Orchestrator, R&D Chemist, and QA Inspector. The layer must preserve the existing ShipIt workflow and remain disabled by default until verified.

## Pilot roles

| Agent | Responsibility | Default tier | QA |
|---|---|---|---|
| Orchestrator | classify task, delegate, aggregate | terra | yes for final result |
| R&D Chemist | scientific reasoning and formulation analysis | sol | mandatory |
| QA Inspector | independent validation and risk checks | sol | final gate |

`luna`, `terra`, and `sol` are logical model tiers. Their concrete provider/model mapping is configuration, not hard-coded product availability.

## Execution flow

1. ShipIt receives a PRD task.
2. Brain Orchestrator classifies the task and risk.
3. A routing decision selects an agent profile and model tier.
4. Provider executes the request with bounded retries/timeouts.
5. High-impact results go to QA Inspector.
6. QA returns pass, revise, or block.
7. Only accepted results can update task state.
8. Audit metadata records the decision without secrets.

## Safety

- No credentials in source, prompts, logs, PRDs, or audit records.
- Brain is opt-in during the pilot.
- Concurrency and retries are explicitly bounded.
- Legal, regulatory, scientific, and production-impacting changes require QA.
- Provider failures fail closed for high-impact work.
- Existing ShipIt behavior must remain available when Brain is disabled.

## Provider boundary

The Brain layer exposes a provider interface. Existing Copilot SDK support is wrapped first. An OpenAI Responses adapter may be added behind the same interface, but must not assume API availability, model names, or credentials until configured and verified against current official documentation.

## Prompt context

Stable role instructions, safety rules, and project context are separated from per-task data. The architecture exposes cache-friendly stable context but does not require a provider-specific caching implementation in the first pilot.

## Rollout

Phase 1: contracts and deterministic routing.

Phase 2: three-agent execution with QA and audit.

Phase 3: CI and regression verification.

Phase 4: expand to the remaining BIORICHE BRAIN agents only after pilot metrics are acceptable.

## Acceptance criteria

- Existing ShipIt tests remain green.
- Brain routing and QA have automated coverage.
- Brain disabled by default.
- No secret leakage in logs/audit.
- Provider can be swapped without changing orchestration contracts.
- High-impact tasks cannot bypass QA.
