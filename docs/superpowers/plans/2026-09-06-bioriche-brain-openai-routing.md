# BIORICHE BRAIN OpenAI Model Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the BIORICHE BRAIN OpenAI provider with deterministic GPT-5.6/Astra routing, bounded fallback, prompt caching, tool policy, security/audit controls, monitoring, and Codex readiness.

**Architecture:** Extend the existing `src/bioricheBrain` layer instead of replacing ShipIt. Keep model selection provider-neutral, use the Responses API behind `BrainProvider`, and enforce Astra opt-in plus QA/tool policies before execution.

**Tech Stack:** TypeScript 5.9, Node 22 types/runtime, VS Code extension, native `fetch`, GitHub Actions, existing Copilot SDK.

**Spec:** `docs/superpowers/specs/2026-09-06-bioriche-brain-openai-routing.md`

## Global Constraints

- Preserve existing ShipIt PRD/task workflow and commands.
- Do not hard-code API keys, tokens, or credentials.
- Model IDs remain configurable values.
- Astra is disabled by default and cannot bypass QA.
- Tool execution is allowlisted and bounded.
- Retries and fallback are bounded.
- High-impact scientific, regulatory, legal, safety, and production work requires QA.
- Existing Copilot remains compatible and is not removed.

---

### Task 1: Define Brain contracts and routing policy

**Files:**
- Create: `src/bioricheBrain/types.ts`
- Create: `src/bioricheBrain/modelRouter.ts`
- Test: `src/test/bioricheBrain/modelRouter.test.ts`

**Interfaces:**
- `ModelTier = 'luna' | 'terra' | 'sol' | 'astra'`
- `BrainAgent = 'orchestrator' | 'rd_chemist' | 'qa_inspector'`
- `RiskLevel = 'routine' | 'scientific' | 'high_impact'`
- `routeTask(task): RoutingDecision`

Implement candidate ordering, Astra feature flag checks, and QA requirement calculation. Tests must cover routine, scientific, high-impact, Astra-disabled, and Astra-enabled routing.

### Task 2: Harden configuration

**Files:**
- Modify: `src/bioricheBrain/config.ts`
- Test: `src/test/bioricheBrain/config.test.ts`

Add provider selection, Astra enablement, bounded retries/concurrency, model IDs, and safe defaults. Numeric values must be clamped to non-negative bounded values. Environment variables remain the secret/configuration boundary.

### Task 3: Implement provider-neutral prompt context and cache policy

**Files:**
- Create: `src/bioricheBrain/promptContext.ts`
- Test: `src/test/bioricheBrain/promptContext.test.ts`

Separate stable role/rules from task data. Provide deterministic cache keys based only on agent and prompt schema version. Tests must prove the key contains no API key or task secrets and remains stable for the same profile/version.

### Task 4: Harden OpenAI Responses provider

**Files:**
- Modify: `src/bioricheBrain/openaiProvider.ts`
- Test: `src/test/bioricheBrain/openaiProvider.test.ts`

Use the selected model and prompt context through `/v1/responses`. Include reasoning effort only when configured/supported. Preserve `parallel_tool_calls` as a policy-controlled setting. Bound error detail and ensure authorization headers are never included in thrown errors. Add provider fallback hooks without embedding credentials.

### Task 5: Add QA/security gate and audit events

**Files:**
- Create: `src/bioricheBrain/qaGate.ts`
- Create: `src/bioricheBrain/audit.ts`
- Test: `src/test/bioricheBrain/qaGate.test.ts`

High-impact tasks must require QA. Astra cannot bypass QA. Audit events contain timestamp, agent, model tier, outcome, latency, and safe reason only. Tests must verify secret redaction and mandatory QA.

### Task 6: Add tool policy boundary

**Files:**
- Create: `src/bioricheBrain/toolPolicy.ts`
- Test: `src/test/bioricheBrain/toolPolicy.test.ts`

Represent tool definitions and an allowlist by agent/risk. Default is deny. Limit parallel tool calls and total calls. Tests must reject unauthorized tools and accept explicitly allowed tools.

### Task 7: Add OpenAI model-policy monitoring

**Files:**
- Create: `src/bioricheBrain/modelMonitor.ts`
- Test: `src/test/bioricheBrain/modelMonitor.test.ts`

Create a provider-neutral catalog refresh function that accepts model metadata, validates known tiers/IDs, and records the last refresh time. Do not add hidden network activity. The host can schedule official OpenAI release-note checks externally.

### Task 8: Wire the Brain entry point without breaking ShipIt

**Files:**
- Create: `src/bioricheBrain/index.ts`
- Modify: `src/extension.ts`
- Test: `src/test/bioricheBrain/index.test.ts`

Expose a single Brain entry point that selects routing, provider, QA, and audit behavior. Keep Brain opt-in. Existing ShipIt commands must continue to work when Brain is disabled.

### Task 9: Update configuration/documentation and Codex readiness

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Modify: `.shipit/PRD.md`
- Create: `docs/bioriche-brain/openai-routing.md`

Document model tiers, Astra flag, environment variables, fallback behavior, prompt caching, Responses API, tool policy, QA requirements, and Codex minimum versions: ChatGPT Desktop `26.707.30751` or Codex CLI `0.144.0` for GPT-5.6; Codex CLI `0.153.0+` for Astra.

### Task 10: Verification and CI

**Files:**
- Create/Modify: `.github/workflows/brain-ci.yml`

Run compile, lint, and tests. Verify Brain defaults to disabled, Astra defaults to disabled, and no secret appears in repository content. Keep production enablement separate from CI.
