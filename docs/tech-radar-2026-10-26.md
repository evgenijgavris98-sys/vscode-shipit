# BIORICHEBRAIN Open Source Radar — 2026-10-26

## Decision summary

- Keep OpenAI Agents SDK as the sole primary runtime and MCP as the tool boundary.
- Do not add a second agent orchestrator, memory platform, or observability backend this cycle.
- Track the official MCP TypeScript SDK v2 as a migration candidate, but do not upgrade production until the repository's policy gate, provenance, approval, and transport regressions pass on a dedicated PR.
- No production dependency or runtime code was changed in this cycle.

## Freshly checked candidates

### 1. Official MCP TypeScript SDK v2

Official repository: https://github.com/modelcontextprotocol/typescript-sdk

Evidence:
- The official repository advertises v2 packages `@modelcontextprotocol/server` and `@modelcontextprotocol/client`.
- It targets Node.js, Bun, and Deno and includes Streamable HTTP, stdio, auth helpers, and middleware adapters.
- The upstream documentation says v1.x remains the supported production line during the transition window.

Why it is not adopted today:
- The current BIORICHEBRAIN architecture already treats MCP as a security boundary; a version migration changes transport/auth/schema behavior and must be tested as a controlled compatibility change.
- Upstream v2 is still a migration-sensitive surface, so blindly updating would risk regressions in capability checks, provenance, approval routing, and audit records.
- The repo needs a dedicated dependency-update PR with lockfile regeneration and targeted MCP contract tests before adoption.

Decision: monitor and prepare a separate migration PR only after a repository-local compatibility matrix is added.

### 2. agentproto/ts

Official repository: https://github.com/agentproto/ts

Why it is interesting:
- TypeScript runtime with background sessions, MCP projection, HTTP transport, append-only persistence, and supervisor-style lifecycle APIs.

Why it is rejected for adoption:
- It overlaps with the existing OpenAI Agents SDK runtime, bounded delegation, checkpoint/resume, and audit design.
- Adding it would create a second session/orchestration state machine and a competing persistence model.
- The practical integration cost is higher than extending the current runtime contracts.

Decision: comparative reference only.

### 3. Sandbox / harness catalog candidates

Reviewed:
- self-hosted MCP harnesses with sandbox, audit, and replay;
- Rust or microVM control planes;
- coding-agent runtimes that project skills and workspaces into MCP.

Why none were adopted:
- They introduce new host-level trust boundaries, runtime languages, or container/microVM assumptions.
- Current repository evidence does not show a concrete untrusted-code workload that requires this extra control plane.
- CI cannot prove host-specific isolation guarantees without an approved deployment target and threat model.

Decision: monitor only; revisit when a real sandbox workload and deployment target are specified.

### 4. Memory and observability stacks

Reviewed:
- local decision-memory stores;
- filesystem-first durable-agent patterns;
- agent tracing/evaluation platforms;
- resumable streaming and replay systems.

Decision:
- Keep the existing JSONL audit/provenance and repository-owned regression path.
- Do not add a hosted or heavy observability dependency until there is a concrete need for multi-run dashboards, retention policy enforcement, or dataset-backed evaluations with an approved data boundary.

## Repository comparison

The target architecture remains coherent:

- OpenAI Agents SDK as primary runtime;
- MCP as tool boundary;
- explicit capability, approval, and audit controls;
- bounded delegation;
- persistent memory with provenance;
- checkpoint/resume;
- sandboxing boundaries;
- evaluation and CI gates.

The main risk is not missing framework features; it is accidental duplication of runtime and policy layers.

## Actual implementation this cycle

- Added this documentation-only radar entry on branch `biorichebrain/radar-2026-10-26`.
- No production dependency, runtime, workflow, or permission change was made.
- No merge was performed.
- The change is intentionally left behind a draft PR until CI and review are complete.

## Recommended next safe action

Create a dedicated MCP SDK compatibility PR that:
1. pins the exact candidate version;
2. regenerates the lockfile;
3. adds transport/auth/schema compatibility tests;
4. verifies provenance, approvals, audit, checkpoint/resume, and sandbox-policy regressions;
5. remains draft until CI is green.
