# BIORICHEBRAIN Open Source Radar — 2026-10-13

## Scope

Daily review of newly updated or emerging open-source GitHub projects relevant to the BIORICHEBRAIN stack. Evaluation criteria: active maintenance, permissive/open licensing, technical evidence, TypeScript/Node compatibility, security posture, and fit with the existing architecture.

## Current architecture baseline

- OpenAI Agents SDK is the primary agent runtime.
- MCP is the tool boundary.
- Explicit capability, approval, audit, and provenance controls are required.
- Persistent memory, bounded delegation, checkpoint/resume, sandboxing, and evaluation are first-class concerns.
- Current repository uses TypeScript/Node 22, `@openai/agents`, `@github/copilot-sdk`, `zod`, and CI on pull requests and `main` / `biorichebrain/**` branches.
- Current CI runs compile, lint, and a dependency-audit artifact; no runtime dependency changes were made in this radar cycle.

## Candidates reviewed

### 1. sandbaseai/sandbase-harness — WATCH / borrow patterns, no dependency

- Local-first, self-hosted runtime and MCP bridge with sandboxed sessions, memory, credentials, audit/replay, and a local console.
- Repository shows Apache-2.0 licensing, a security policy, and sustained commit activity.
- Strong architectural overlap with BIORICHEBRAIN: session durability, MCP boundary, audit/replay, credentials, and sandbox execution.
- Decision: do not add as a runtime. It overlaps the existing OpenAI Agents SDK role and would create a second orchestration/control plane. Reuse design patterns only after a focused security review.

### 2. modelcontextprotocol/typescript-sdk — WATCH / planned compatibility spike

- Official TypeScript SDK for MCP servers and clients; current v2 line targets the 2026-07-28 stateless MCP specification, while v1 remains the supported production line during the transition.
- Apache-2.0 for new contributions with existing code under MIT.
- Strong Node/TypeScript fit and directly relevant to the MCP boundary.
- Decision: do not upgrade blindly. The repository must first verify which MCP revision the current BIORICHEBRAIN adapters expect, then add a small compatibility test matrix for v1/v2 transports, auth helpers, and audit metadata. No package change in this cycle.

### 3. punkpeye/fastmcp — REJECT for adoption

- Mature TypeScript framework with useful ergonomics, testing helpers, and transport support.
- Official repository explicitly states it targets legacy handshake-based MCP revisions and does not support the current 2026-07-28 stateless specification.
- Decision: reject as a new foundation for BIORICHEBRAIN because it would move the tool boundary away from the official SDK and create protocol-version debt. It may remain a reference for test ergonomics only.

### 4. vinkius-labs/mcpfusion — WATCH / security review required

- TypeScript framework emphasizing typed egress controls, namespace removal, auditable behavior, and machine-readable SKILL.md contracts.
- The security model is conceptually aligned with BIORICHEBRAIN capability and approval controls.
- Decision: do not add as a dependency. Before any pilot, verify license terms, protocol compatibility, maintenance depth, and whether the controls are enforceable at runtime rather than prompt-level conventions.

### 5. agent-dispatch/mcp-server — REJECT for current architecture

- MCP server for spawning durable cloud subagents with SQLite state, status, logs, cancellation, and result retrieval.
- Useful reference for long-running task state and checkpoint/resume.
- Decision: reject for production adoption because it introduces a managed cloud execution plane and a new operational trust boundary. BIORICHEBRAIN currently requires explicit approval before irreversible external actions and prefers local/self-hosted control.

## Concrete conclusions

1. No new runtime dependency is justified this cycle.
2. The most valuable near-term improvement is a **MCP compatibility test matrix** around the official TypeScript SDK, not a framework swap.
3. The second priority is a **sandbox threat-model document** that evaluates isolation, network egress, credential exposure, action governance, detection, and kill-switch behavior.
4. A future observability pilot should prefer OpenTelemetry-compatible, self-hosted components and should prove measurable benefit before adding infrastructure.

## Security and license notes

- Prefer Apache-2.0, MIT, or similarly permissive licenses; confirm transitive licenses before adoption.
- Do not equate GitHub popularity with safety or production readiness.
- Do not auto-install or execute third-party repositories from radar results.
- Keep credentials outside agent-visible context; enforce capability allowlists and approval gates at the tool boundary.
- Treat sandboxing as a layered control problem: compute isolation, filesystem scope, network policy, credentials, action governance, observability, and response/kill-switch.

## What was actually implemented

- Added this documentation-only radar record on branch `biorichebrain/radar-2026-10-13`.
- No package.json changes.
- No production runtime changes.
- No irreversible external actions.
- Pull request is intentionally draft and must remain unmerged until CI passes and a human reviews the protocol/security implications.
