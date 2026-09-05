# BIORICHE BRAIN Multi-Agent Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve ShipIt from a single Copilot-driven PRD loop into a safe pilot orchestration layer for BIORICHE BRAIN with Orchestrator, R&D Chemist, QA Inspector, model routing, tool orchestration, and reusable prompt context.

**Architecture:** Keep the existing ShipIt task loop intact and introduce a provider-neutral Brain orchestration layer beside it. The Orchestrator classifies work, selects an agent profile and model tier, invokes tools, and sends outputs through QA before accepting high-impact results. Production behavior remains opt-in until the pilot tests pass.

**Tech Stack:** TypeScript, VS Code Extension API, existing GitHub Copilot SDK wrapper, existing ShipIt orchestrator/task runner, Node.js test stack, configuration-driven agent profiles.

**Spec:** `docs/superpowers/specs/2026-09-05-bioriche-brain-multi-agent.md`

## Global Constraints

- Preserve existing ShipIt PRD/task workflow and commands.
- Do not hard-code API keys, tokens, or credentials.
- Model tiers are configuration labels (`luna`, `terra`, `sol`), not assumptions about provider availability.
- Multi-agent execution must be bounded by explicit concurrency and retry limits.
- QA is mandatory for high-impact scientific, regulatory, legal, and production changes.
- Existing Copilot SDK integration remains the default provider until an OpenAI Responses provider is explicitly configured and tested.
- Every new orchestration component must have automated tests before production enablement.

---

### Task 1: Define Brain domain contracts

**Files:**
- Create: `src/brain/types.ts`
- Create: `src/brain/agents.ts`
- Create: `src/brain/modelRouter.ts`
- Test: `src/test/brain/modelRouter.test.ts`

**Interfaces:**
- `AgentId = 'orchestrator' | 'rd-chemist' | 'qa-inspector'`
- `ModelTier = 'luna' | 'terra' | 'sol'`
- `AgentProfile` describes role, tier, risk level, and capabilities.
- `routeTask(input): RoutingDecision` deterministically maps task metadata to an agent and tier.

- [ ] Write routing tests for routine, scientific, and high-impact QA cases.
- [ ] Implement minimal contracts and deterministic routing.
- [ ] Run the existing test suite and new tests.

### Task 2: Add configuration for the pilot

**Files:**
- Modify: `src/config.ts`
- Create: `src/brain/config.ts`
- Test: `src/test/brain/config.test.ts`

**Interfaces:**
- `BrainConfig` contains `enabled`, `provider`, `maxConcurrency`, `maxRetries`, and agent model tiers.

- [ ] Write tests for defaults and invalid values.
- [ ] Implement configuration parsing using existing VS Code settings patterns.
- [ ] Verify no secrets are stored in source or settings defaults.

### Task 3: Implement the Orchestrator pilot

**Files:**
- Create: `src/brain/orchestrator.ts`
- Modify: `src/orchestrator.ts`
- Test: `src/test/brain/orchestrator.test.ts`

**Interfaces:**
- `BrainOrchestrator.execute(request): Promise<BrainResult>`
- Existing ShipIt orchestration remains compatible and delegates only when Brain is enabled.

- [ ] Write failing tests for delegation and bounded retries.
- [ ] Implement delegation to the three pilot agents.
- [ ] Add explicit failure/timeout handling.
- [ ] Run tests.

### Task 4: Add QA gate and audit trail

**Files:**
- Create: `src/brain/qaGate.ts`
- Create: `src/brain/audit.ts`
- Test: `src/test/brain/qaGate.test.ts`

**Interfaces:**
- `evaluate(result, risk): QaDecision`
- Audit records must contain timestamp, agent, tier, status, and reason; never credentials.

- [ ] Test that high-impact results cannot bypass QA.
- [ ] Test that secrets are excluded from audit records.
- [ ] Implement minimal QA gate and structured audit events.

### Task 5: Introduce reusable prompt context

**Files:**
- Create: `src/brain/promptContext.ts`
- Modify: `src/promptBuilder.ts`
- Test: `src/test/brain/promptContext.test.ts`

**Interfaces:**
- `buildStableContext(profile): StablePromptContext`
- `buildTaskPrompt(context, task): string`

- [ ] Separate stable role/rules from per-task data.
- [ ] Add provider-neutral cache metadata hooks without depending on a specific API.
- [ ] Test deterministic prompt composition and bounded context size.

### Task 6: Add provider boundary for future Responses API integration

**Files:**
- Create: `src/brain/provider.ts`
- Create: `src/brain/providers/copilot.ts`
- Create: `src/brain/providers/openaiResponses.ts`
- Test: `src/test/brain/provider.test.ts`

**Interfaces:**
- `BrainProvider.run(request): Promise<ProviderResult>`
- Provider selection is configuration-driven.

- [ ] Write contract tests against a mock provider.
- [ ] Adapt the existing Copilot SDK wrapper behind the provider interface.
- [ ] Add an OpenAI Responses adapter skeleton that is disabled by default and contains no credentials.
- [ ] Verify provider selection and safe failure when the OpenAI provider is not configured.

### Task 7: Add CI quality gates

**Files:**
- Create/Modify: `.github/workflows/brain-ci.yml`
- Modify: `package.json`
- Test: CI workflow execution

- [ ] Add lint/typecheck/test commands for the Brain layer.
- [ ] Ensure CI runs on pull requests.
- [ ] Keep production enablement separate from CI validation.

### Task 8: Update product documentation and pilot PRD

**Files:**
- Create: `docs/superpowers/specs/2026-09-05-bioriche-brain-multi-agent.md`
- Modify: `.shipit/PRD.md`
- Modify: `README.md`

- [ ] Document the three-agent pilot, model-tier semantics, safety gates, and rollout path.
- [ ] Replace the placeholder PRD tasks with the Brain pilot backlog.
- [ ] Document configuration and local verification commands.

### Task 9: Verification before production enablement

**Files:**
- Test: complete repository test suite and CI

- [ ] Run lint.
- [ ] Run typecheck/build.
- [ ] Run all tests.
- [ ] Verify Brain is disabled by default unless explicitly enabled.
- [ ] Verify existing ShipIt workflow remains functional.
- [ ] Only after all checks pass, enable the pilot in a controlled environment.
