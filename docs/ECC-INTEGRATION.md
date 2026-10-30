# BIORICHEBRAIN — Everything Claude Code adoption plan

Date: 2026-10-30  
Upstream: https://github.com/affaan-m/everything-claude-code  
License reported by upstream README: MIT

## Decision

Adopt selected, portable engineering practices from Everything Claude Code (ECC) into the existing BIORICHEBRAIN runtime. Do **not** install the upstream repository wholesale, replace the current orchestrator, or execute third-party hooks/MCP servers automatically.

ECC is primarily a Claude Code plugin and also documents integrations for Codex, OpenCode, Cursor and other harnesses. Its reusable concepts include agents, skills, rules, hooks, continuous-learning/instinct workflows, quality gates, security scanning, and model routing. BIORICHEBRAIN already has its own agent registry/runtime and security boundaries, so integration must be additive and adapter-based.

## Compatibility and boundaries

- **Primary target:** existing BIORICHEBRAIN TypeScript runtime in `src/bioricheBrain`.
- **Do not assume Claude Code is installed** on the target workstation. No workstation shell or local Claude configuration is available through the GitHub connector.
- **Do not add a hard dependency on Claude Code**, Anthropic credentials, paid services, or a new MCP server.
- Treat ECC agents, skills, hooks, prompts, and MCP configuration as untrusted third-party inputs until reviewed.
- Never import upstream hooks into the production lifecycle without an explicit allowlist, timeout, capability declaration, and tests.
- Do not copy API keys, provider credentials, or personal settings from examples.
- Keep existing tool-deny-by-default, audit, provenance, and approval gates intact.
- Preserve the existing BIORICHEBRAIN orchestrator and memory source of truth; ECC must not create a second competing memory store.

## What to adopt

| ECC concept | BIORICHEBRAIN application | Adoption rule |
|---|---|---|
| Skills with clear activation criteria | Extend the existing skill registry with metadata, input/output contracts, and examples | Import only reviewed skills; no automatic execution |
| Specialized agents | Map useful roles to existing registered agents (reviewer, test resolver, security reviewer, documentation researcher) | Reuse roles; do not create duplicate permanent agents |
| Rules / instructions | Add concise project, language, and safety rules to the existing policy layer | Keep rules modular; resolve conflicts in favour of BIORICHEBRAIN security policy |
| Hooks | Lifecycle events around planning, tool invocation, verification, and completion | Event allowlist, deterministic handlers, timeout, audit; no arbitrary shell hooks |
| Continuous learning / instincts | Candidate observations for the existing memory engine | Store as untrusted proposals; require evidence, confidence, deduplication, and approval before promotion |
| Quality gates | Compile, lint, tests, secret scan, dependency policy, and artifact verification | Required checks; failures block promotion |
| Security scan | Threat review of agent instructions, MCP definitions, scripts, and dependencies | Static review first; no execution of scanned code |
| Model routing | Route by task complexity, cost, and required capability | Use only configured providers; never silently change provider or expose secrets |

## Initial BIORICHEBRAIN skill candidates

1. **research-first** — gather source material and record provenance before implementation.
2. **plan-and-verify** — break work into bounded steps; verify each acceptance criterion.
3. **code-review** — inspect correctness, maintainability, security, and regression risk.
4. **test-driven-fix** — reproduce, add/adjust a test, fix, rerun focused and full checks.
5. **security-review** — inspect prompt injection, tool permissions, secrets, dependency risk, and unsafe execution.
6. **documentation-lookup** — prefer official documentation and version-matched API references.
7. **release-readiness** — summarize changed files, checks, known gaps, rollback, and approval state.

These are proposed capabilities, not claims that the skills have already been installed or registered.

## Safe implementation sequence

### Phase 1 — inventory (no runtime changes)
- Compare ECC manifests and component directories with the current BIORICHEBRAIN agent/skill registry.
- Record upstream commit SHA, release/tag, file provenance, and license notice.
- Select a small initial allowlist; exclude MCP server configs and executable hooks from the first import.

### Phase 2 — adapter and schema
- Define a normalized skill manifest: `id`, `version`, `description`, `triggers`, `inputs`, `outputs`, `capabilities`, `risk`, `source`, `approvalRequired`.
- Map ECC-compatible agent/skill metadata into the existing registry; do not create a parallel orchestrator.
- Require capability checks before every tool call and record decisions in the existing audit trail.

### Phase 3 — tests and gated activation
- Add schema validation and tests for duplicate IDs, unknown capabilities, malformed manifests, and policy conflicts.
- Add prompt-injection fixtures and verify imported content cannot grant itself tools or permissions.
- Run compile, lint, unit/integration tests, dependency checks, and secret scanning.
- Keep imported skills disabled until a human enables each one.

### Phase 4 — controlled rollout
- Enable one low-risk documentation/research skill first.
- Run in observe-only mode; compare outputs against existing agents.
- Promote only after acceptance tests and review. Keep rollback as a registry disable/revert, not a destructive migration.

## Acceptance checklist

- [ ] Exact upstream commit/tag and license file recorded.
- [ ] File-by-file import allowlist reviewed.
- [ ] No unreviewed shell scripts, hooks, MCP servers, or dependencies activated.
- [ ] Existing orchestrator and memory engine remain the only sources of truth.
- [ ] Every skill declares capabilities and approval requirements.
- [ ] Imported prompts are treated as untrusted data.
- [ ] Audit events include source, version, selected skill, capability decision, and result.
- [ ] Unit, integration, security, and regression tests pass.
- [ ] A rollback path is documented and tested.
- [ ] Target workstation smoke test completed before claiming local installation.

## Current execution status

This change records the integration decision and implementation contract only. It does not install software on a workstation, activate upstream hooks, add dependencies, or claim runtime integration. The GitHub connector can modify repository content, but it cannot run commands on the user's computer. Runtime work should follow the phases above and remain behind the existing review/CI gates.
