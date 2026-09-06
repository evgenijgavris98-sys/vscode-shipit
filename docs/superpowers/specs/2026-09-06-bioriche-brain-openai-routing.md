# BIORICHE BRAIN OpenAI Model Routing Design

**Date:** 2026-09-06

## Goal

Upgrade the BIORICHE BRAIN pilot to use an explicit OpenAI model-routing layer for GPT-5.6 Luna/Terra/Sol and an opt-in GPT-6 Astra frontier tier, while preserving safe fallbacks, prompt caching, Responses API tool calling, auditability, and Codex readiness.

## Current repository state

The repository already contains a `src/bioricheBrain` configuration and an OpenAI Responses provider. The provider currently expects a missing `types.ts`, selects models directly from configuration, and sends a fixed `prompt_cache_key`. This design completes that boundary instead of replacing the existing ShipIt/Copilot workflow.

## Model policy

- `luna`: high-volume, cost-sensitive work.
- `terra`: default balanced work.
- `sol`: complex reasoning, R&D, QA, and other high-value work.
- `astra`: GPT-6 Astra, experimental frontier tier; disabled by default and selected only when explicitly enabled and the task policy allows it.
- Model IDs remain configuration values so OpenAI aliases/snapshots can change without source changes.

## Routing policy

Routine content, classification, extraction, and repeated orchestration use Luna/Terra. Scientific formulation, technical synthesis, and difficult QA use Sol. Astra is reserved for explicitly enabled frontier work such as difficult multi-step research, architecture, complex coding, or tasks where a higher reasoning tier is justified.

High-impact scientific, regulatory, legal, safety, or production-affecting results require QA regardless of model. Astra never bypasses the QA gate.

## Fallback policy

The router produces an ordered candidate list. If Astra is unavailable or disabled, the request falls back to Sol, then Terra, then Luna according to task policy. The router never silently upgrades a routine task to Astra. Provider errors are classified as retryable/non-retryable, and retry count is bounded by configuration.

## Responses API

OpenAI work uses `/v1/responses`. Stable instructions and role context are separated from task input so prompt caching can be effective. `prompt_cache_key` is deterministic per agent/version. Tool calls are represented as provider-neutral definitions and are enabled only for agents whose profile permits them. Tool execution is bounded by concurrency and explicit allowlists.

## Security

No API key, token, or credential is committed. Astra is feature-flagged. Audit records contain model tier, agent, status, latency, and reason, but never credentials or raw authorization headers. Tool execution is denied by default and must be explicitly allowed by the agent/task policy.

## Monitoring

A small monitoring module records the last successful model-policy refresh timestamp and can ingest a supplied model catalog. It does not perform hidden network calls or mutate configuration. A scheduled OpenAI release-note check can be layered on by the host automation system.

## Compatibility

The existing ShipIt PRD/task loop and Copilot SDK remain intact. Brain is an opt-in layer. OpenAI is a provider boundary rather than a hard dependency for normal ShipIt execution.

## Acceptance criteria

1. TypeScript builds with strict mode.
2. Routing is deterministic and tested.
3. Astra is disabled by default.
4. Fallback order is tested.
5. Prompt cache keys are stable and do not contain secrets.
6. High-impact work cannot bypass QA.
7. Provider failures do not leak authorization data.
8. Existing ShipIt tests continue to pass.
9. Configuration supports explicit model IDs and Astra enablement without storing secrets.
10. Codex readiness is documented, with minimum versions kept in documentation rather than hard-coded runtime assumptions.
