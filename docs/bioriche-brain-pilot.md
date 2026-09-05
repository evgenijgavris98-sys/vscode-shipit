# BIORICHE BRAIN — Multi-Agent Pilot

## Goal
Introduce a small, testable agent orchestration layer without replacing the existing ShipIt runtime.

## Pilot graph

Orchestrator → R&D Chemist → QA Inspector

The Orchestrator classifies work, selects a model tier, and delegates. R&D Chemist performs the domain task. QA Inspector independently checks the result and can request a bounded retry.

## Model policy

- Luna: routine routing, monitoring, extraction, formatting and low-risk preparation.
- Terra: normal production reasoning and synthesis.
- Sol: high-stakes scientific/legal/regulatory reasoning and final review.

Model names must remain configuration-driven. Never hard-code an assumed model identifier; availability must be verified against the connected provider/API account.

## Safety boundaries

- No secrets in prompts, logs or committed configuration.
- Bounded retries and concurrency.
- QA must not silently rewrite unsupported claims.
- Scientific, medical, legal and regulatory outputs are advisory and require appropriate human validation before external use.
- Provider-specific APIs are isolated behind an adapter so the existing ShipIt code remains usable.

## Caching policy

Keep stable system instructions, agent role definitions and versioned BIORICHE reference material separate from per-task context so provider-side prompt caching can be used where supported.

## Acceptance criteria

1. Unit tests cover routing and retry limits.
2. A deterministic mock provider can execute the pilot without network access.
3. Provider credentials are read only from environment/runtime secrets.
4. The existing extension build and tests remain green.
5. The pilot can be disabled without changing existing ShipIt behavior.
