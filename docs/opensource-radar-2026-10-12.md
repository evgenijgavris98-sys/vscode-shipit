# BIORICHEBRAIN Open-Source Radar — 2026-10-12

## Scope

Fresh review of GitHub projects relevant to the current architecture:
- OpenAI Agents SDK as primary runtime
- MCP as the tool boundary
- explicit capability/approval/audit controls
- persistent memory with provenance
- bounded delegation and checkpoint/resume
- sandboxing and evaluation

This record intentionally recommends only low-risk, evidence-backed improvements. No runtime dependency is added by this report.

## Recommended actions

### 1. Keep the official MCP TypeScript SDK as the compatibility target

**Verified**
- Official repository: https://github.com/modelcontextprotocol/typescript-sdk
- The v2 line is still beta/pre-release; v1.x remains the production-supported line while v2 stabilizes.
- The SDK targets Node.js/Bun/Deno and provides server/client packages, Streamable HTTP, stdio, auth helpers and middleware.

**Decision**
- Do not migrate the existing MCP boundary to v2 yet.
- Add a compatibility test lane later that runs the current production path against the latest v1.x and a non-blocking v2 canary.

**Reason**
- This preserves the current stable contract while preparing for the protocol revision without making a speculative breaking change.

### 2. Evaluate `@cyanheads/mcp-ts-core` as a reference architecture, not a dependency

**Verified**
- Repository: https://github.com/cyanheads/mcp-ts-core
- Apache-2.0 license.
- TypeScript-first MCP framework with documented telemetry, MCP definition linting, package-consumer tests and multi-runtime coverage.

**Decision**
- Do not add it as a dependency now.
- Reuse its ideas for an internal `mcp-contract-check` CI job: schema validation, tool metadata checks, secrets/TODO scan, and telemetry field conformance.

**Reason**
- BIORICHEBRAIN already has a custom audit/capability layer; importing a second framework would duplicate lifecycle and policy logic.

### 3. Treat FastMCP as a rejected near-term option

**Verified**
- Repository: https://github.com/punkpeye/fastmcp
- Its own README states it targets legacy handshake-based MCP revisions and does not support the current 2026-07-28 stateless specification.

**Decision**
- Reject for new core services until the protocol compatibility statement changes.

**Reason**
- The project is useful for legacy integrations, but it would pull the architecture toward a protocol mode the current boundary is designed to avoid.

### 4. Monitor SandBase Harness for patterns, not code reuse

**Verified**
- Repository: https://github.com/sandbaseai/sandbase-harness
- Local-first/self-hosted runtime with sandboxed sessions, memory, credentials, audit/replay and an MCP bridge.
- Public repository shows active maintenance and a permissive-looking software ecosystem, but license and dependency details must be checked from the repository before any reuse.

**Decision**
- No dependency or code import now.
- Use it as a design reference for session replay, credential isolation and operator console concepts.
- Re-check license, threat model and dependency graph before any future adoption.

**Reason**
- Its feature overlap is high, but adopting a second runtime would conflict with OpenAI Agents SDK as the primary orchestrator.

## Rejected / deferred candidates

| Candidate | Status | Reason |
|---|---|---|
| MCP SDK v2 beta | Deferred | Production support is still on v1.x; use canary validation only. |
| FastMCP | Rejected for core | Legacy protocol focus; current spec mismatch. |
| FrontMCP | Deferred | Node 24+ and framework/DI assumptions add a second application runtime. |
| MCP Fusion | Unverified / do not adopt | Claims broad MCP 2.0 compliance, but requires a deeper repository/license/security review before trust. |
| Agent-MCP | Deferred | Multi-agent framework would overlap with existing bounded delegation and governance controls; no evidence yet that it improves the current runtime. |
| Additional memory framework | Rejected for now | Existing persistent JSONL audit/provenance work is more aligned with traceability than adding a second memory store. |

## Concrete implementation proposal

The safest improvement is a CI-only contract gate, not a new runtime dependency:

1. Validate that every exposed MCP tool has:
   - stable tool name
   - input/output schema
   - capability label
   - approval requirement
   - audit event name
2. Fail CI when a tool definition lacks provenance metadata.
3. Add a non-blocking canary job for the latest MCP SDK v2 beta.
4. Keep production runtime pinned to the existing supported MCP SDK line.

## Security and dependency notes

- Do not execute third-party agent runtimes inside the production process without a separate threat-model review.
- Prefer Apache-2.0/MIT/BSD for reusable libraries; verify transitive licenses before adoption.
- Keep network, filesystem and credentials behind explicit capabilities; do not widen the current headless worker boundary.
- Treat “sandboxed” labels as hypotheses until isolation, credential handling, egress control and replay evidence are inspected.

## Evidence links

- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- MCP servers releases: https://github.com/modelcontextprotocol/servers/releases
- mcp-ts-core: https://github.com/cyanheads/mcp-ts-core
- FastMCP: https://github.com/punkpeye/fastmcp
- SandBase Harness: https://github.com/sandbaseai/sandbase-harness
- FrontMCP: https://github.com/agentfront/frontmcp
- MCP Fusion: https://github.com/vinkius-labs/mcpfusion

## Implementation status

- Report prepared on separate branch.
- No production dependency changes.
- No merge performed.
- CI must pass before any merge decision.
