# BIORICHEBRAIN open-source radar — 2026-10-15

## Scope

Fresh review of official repositories and documentation for projects relevant to the current BIORICHEBRAIN architecture:

- OpenAI Agents SDK as primary runtime
- MCP as the tool boundary
- explicit capability / approval / audit controls
- persistent memory with provenance
- bounded delegation
- checkpoint / resume
- sandboxing
- evaluation and observability

This document separates verified facts from hypotheses and records decisions to avoid unnecessary dependencies.

## Verified signals

### 1. OpenAI Agents JS 0.20.0 — keep as the primary runtime

Official release activity shows `@openai/agents` / `@openai/agents-core` 0.20.0 released on 2026-10-08.

Relevant changes called out by the official release page:

- automatic MCP tool discovery defaults to a bounded 64-page limit;
- local Unix file operations require trusted Python and reject disabled protection;
- model calls after approval resume count toward `maxTurns`;
- earlier 0.19.x changes tightened conditional approval binding, sensitive-data tracing behavior, streaming backpressure, and checkpoint restart validation.

**Decision:** retain OpenAI Agents SDK as the production runtime. The changes align directly with BIORICHEBRAIN approval, checkpoint, audit, and sandbox requirements.

**Implementation status:** no dependency change in this PR. The existing branch still declares `^0.18.0`; upgrading must be paired with a lockfile refresh and full CI run, so it is intentionally deferred rather than guessed.

### 2. Official MCP TypeScript SDK v2 — canary only

The official SDK repository documents a split-package v2 line for Node/Bun/Deno, with server/client packages and updated MCP-spec work. The repository also states that v1.x remains the supported production line until v2 stabilizes.

The repository documents mixed licensing: Apache-2.0 for new contributions and MIT for existing code.

**Decision:** keep the existing MCP boundary and do not migrate production code in this radar PR. A future canary may test the split packages behind a feature flag, but only after package-level license review, dependency review, and rollback verification.

**Implementation status:** no MCP dependency added.

### 3. Sandboxing — policy model is more valuable than another framework

Current ecosystem projects expose multiple sandbox profiles and privilege tiers, but adding a new sandbox runtime would expand the threat model and operational surface before BIORICHEBRAIN has a concrete code-execution workload.

**Decision:** first encode sandbox profile metadata and approval requirements in existing audit/provenance events. Do not add a sandbox SDK solely because it is popular.

**Implementation status:** no sandbox dependency added.

### 4. Memory and observability — strengthen provenance before adding a framework

Candidate memory/observability frameworks were rejected for now because they would duplicate current audit and task-state storage, add transitive dependencies, or require a separate data-plane decision.

**Decision:** preserve the current dependency-light approach and prioritize schema correctness, replay fixtures, redaction tests, and explicit source references before introducing a new memory or telemetry backend.

## Rejected / deferred options

- **FastMCP as a second MCP framework:** rejected for production; it would duplicate the current MCP boundary and its documented compatibility posture does not justify a second runtime layer here.
- **Large integration MCP bundles:** deferred; capability surface grows faster than the current approval/audit model can safely govern.
- **New agent orchestration frameworks:** rejected; bounded delegation is already implemented in the project and another framework would create competing lifecycle semantics.
- **Cloud-hosted sandbox SDKs:** deferred until a concrete shell/code execution workload, threat model, and cost boundary exist.
- **New memory frameworks:** deferred until provenance requirements cannot be met with the existing durable task/audit records.

## Concrete next improvement

The next safe code change should be dependency-free and testable:

1. define a small provenance fixture schema for audit/checkpoint events;
2. add regression cases for approval-resume, checkpoint restart rejection, retry persistence, and secret redaction;
3. run these fixtures in CI before considering any new framework or runtime dependency.

This PR intentionally does not implement that schema because the current branch exposes no shared test fixture contract yet; inventing one here would create avoidable API churn.

## Source links

- OpenAI Agents JS releases: https://github.com/openai/openai-agents-js/releases
- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- MCP TypeScript API docs: https://ts.sdk.modelcontextprotocol.io/
- GitHub Agentic Workflows sandbox profiles: https://github.github.com/gh-aw/reference/sandboxing/
