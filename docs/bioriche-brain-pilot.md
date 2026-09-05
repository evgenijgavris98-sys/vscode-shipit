# BIORICHE BRAIN — Multi-Agent Pilot

## Goal
Introduce a small, testable agent orchestration layer without replacing the existing ShipIt runtime.

## Pilot graph

Orchestrator → R&D Chemist → QA Inspector

The Orchestrator classifies work, selects a model tier, and delegates. R&D Chemist performs the domain task. QA Inspector independently checks the result and can request a bounded retry. On retry, QA feedback is passed back to R&D so the draft is regenerated rather than rechecked unchanged.

## Model policy

- Luna (`gpt-5.6-luna`): routine routing, monitoring, extraction, formatting and low-risk preparation.
- Terra (`gpt-5.6-terra`): normal production reasoning and synthesis.
- Sol (`gpt-5.6-sol`): high-stakes scientific/legal/regulatory reasoning and final review.
- Astra (`gpt-6-astra`): critical reasoning, architecture, complex R&D, critical QA and difficult multi-step coordination.

Model identifiers are configuration-driven and can be overridden with environment variables. Astra is the current OpenAI flagship for the hardest end-to-end work and is available through the Responses API. Access is still rolling out, so the provider must fail clearly when credentials or model access are unavailable.

## Runtime configuration

- `BIORICHE_BRAIN_ENABLED=true` enables the provider-facing brain configuration; disabled by default.
- `OPENAI_API_KEY` is read only at runtime and is never committed.
- `BIORICHE_BRAIN_MODEL_LUNA`, `BIORICHE_BRAIN_MODEL_TERRA`, `BIORICHE_BRAIN_MODEL_SOL`, `BIORICHE_BRAIN_MODEL_ASTRA` optionally override model IDs.
- `BIORICHE_BRAIN_MAX_QA_RETRIES` bounds QA-driven regeneration.

## Safety boundaries

- No secrets in prompts, logs or committed configuration.
- Bounded retries and concurrency.
- QA must not silently rewrite unsupported claims.
- Scientific, medical, legal and regulatory outputs are advisory and require appropriate human validation before external use.
- Provider-specific APIs are isolated behind an adapter so the existing ShipIt code remains usable.
- GPT-6 Astra uses supported reasoning levels only; the integration does not send unsupported `none`, `temperature`, or `top_p` parameters.

## Caching policy

Keep stable system instructions, agent role definitions and versioned BIORICHE reference material separate from per-task context. The OpenAI adapter supplies a stable `prompt_cache_key` per agent role so repeated work can benefit from provider-side caching where supported.

## Acceptance criteria

1. Unit tests cover all four routing tiers and QA-driven regeneration.
2. A deterministic mock provider can execute the pilot without network access.
3. Provider credentials are read only from environment/runtime secrets.
4. The existing extension build and tests remain green.
5. The pilot can be disabled without changing existing ShipIt behavior.
6. CI runs compile, lint and tests on pushes and pull requests.
