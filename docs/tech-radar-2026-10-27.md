# BIORICHEBRAIN Open Source Radar — 2026-10-27

## Scope
Reviewed official repositories and docs for emerging/open-source agent runtimes, MCP, sandboxing, observability/evals, and coding-agent infrastructure. The architecture baseline remains: OpenAI Agents SDK as primary runtime; MCP as tool boundary; explicit capability/approval/audit controls; persistent memory with provenance; bounded delegation; checkpoint/resume; sandboxing; evaluation.

## Findings

### 1. OpenAI Agents SDK TypeScript — retain as primary runtime
Official docs describe text, sandbox, realtime, handoffs/agents-as-tools, guardrails, and built-in tracing/evaluation. This matches the BIORICHEBRAIN baseline better than adding another orchestration framework.
Decision: **retain; no dependency change in this radar**.

### 2. MCP TypeScript SDK v2 — track as a controlled migration candidate
The official SDK repository identifies v2 as the stable line for the 2026-07-28 MCP spec, with v1 security fixes continuing for at least six months. This is relevant to the existing MCP security gate, but migrating without a compatibility matrix would risk transport/auth/schema regressions.
Decision: **do not migrate in this daily radar**. Keep the existing lockfile policy and prepare a separate migration PR only after repository-specific tests exist.

### 3. TraceBloom — promising, but not adopted
TraceBloom presents an Apache-2.0, self-hostable observability/evaluation layer with OpenTelemetry/OTLP and OpenAI Agents SDK integration claims. It could improve trace replay and regression evaluation, but it introduces a new service stack (Rust/TypeScript/Next.js/ClickHouse/Docker) and a second operational control plane.
Decision: **reject for immediate adoption**; revisit only when existing JSONL audit + CI evaluation cannot answer a concrete production question.

### 4. ShipIt / multi-agent coding IDEs — not a core runtime dependency
Projects in this category add isolated worktrees, parallel agent sessions, CI watching, and PR workflows. Those capabilities overlap with the repository's current branch/PR/CI process and do not improve the runtime boundary itself.
Decision: **reject as architectural dependency**; use only as external workflow inspiration.

## Security and license checks
- Prefer official repositories/docs and permissive licenses.
- No new runtime dependencies added.
- No MCP transport or auth changes made.
- No host-level sandbox or microVM control plane added.
- Existing draft PRs remain unmerged; this radar does not override CI or approval requirements.

## What was implemented
- Documentation-only radar entry for 2026-10-27.
- No production code, dependencies, permissions, or workflows changed.
- Branch: `biorichebrain/radar-2026-10-27`
- Follow-up PR is intentionally draft until CI and review complete.

## Sources
- OpenAI Agents SDK TS docs: https://openai.github.io/openai-agents-js/
- Official MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- TraceBloom: https://github.com/hugo-vicente11/TraceBloom
