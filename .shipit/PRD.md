# BIORICHE BRAIN OpenAI Model Routing

## Completed in this branch
- [x] Define Brain domain contracts and deterministic model-tier routing
- [x] Add opt-in Brain configuration with bounded concurrency and retries
- [x] Implement Orchestrator → R&D Chemist → QA Inspector provider flow
- [x] Add QA gate and secret-safe audit trail
- [x] Add stable prompt context and cache-friendly prompt composition
- [x] Add OpenAI Responses provider using `/v1/responses`
- [x] Add Astra feature flag and Sol/Terra/Luna fallback
- [x] Add allowlisted, bounded tool policy
- [x] Add model-policy monitoring boundary
- [x] Add CI quality gates for compile, lint, and tests
- [x] Document Codex readiness and rollout controls

## Controlled rollout
- [ ] Verify CI on the pull request
- [ ] Configure `OPENAI_API_KEY` only in the runtime environment
- [ ] Enable `BIORICHE_BRAIN_ENABLED=true` only in the pilot environment
- [ ] Enable `BIORICHE_BRAIN_ASTRA_ENABLED=true` only after Sol fallback is verified
- [ ] Review QA/audit output before expanding production scope
