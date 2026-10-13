# BIORICHEBRAIN Open-Source Radar — 2026-10-13

## Verified findings
- `@openai/agents` remains the best-fit primary runtime. Recent releases added scripted testing utilities, stronger MCP/tool guardrails, durable pending input, replay safety, and sandbox hardening.
- The official MCP TypeScript SDK has a v2 line with split packages and current-spec support, but migration risk remains non-zero while the ecosystem is transitioning. Keep production MCP stable and evaluate v2 only in a canary.
- Existing Node/TypeScript architecture already has `@openai/agents`, `zod`, and the GitHub Copilot SDK. No extra agent framework is justified now.

## Concrete recommendations
1. Add deterministic SDK-level tests for approval, resume, retry, and redaction using the OpenAI Agents SDK testing utilities.
2. Enforce a provenance contract for durable task/audit events: `runId`, `parentRunId`, `capability`, `approval`, `tool`, `sourceRefs`, `checkpoint`, `digest`, `redactionVersion`.
3. Keep MCP v2 as a compatibility canary until protocol, dependency, security, and rollback checks pass.
4. Keep shell execution separately capability-gated and approval-gated; file protection does not confine host shell commands.

## Rejected / deferred
- FastMCP: deferred for core because its repository docs target legacy handshake-based revisions rather than the current stateless MCP specification.
- New agent orchestrators: deferred; they duplicate bounded delegation and increase attack surface.
- New memory frameworks: deferred until provenance, deterministic replay, exportability, and migration evidence exist.
- New observability vendors: deferred until retention, redaction, self-hosting, and license review are complete.

## Implementation status
- Documentation-only.
- No runtime dependency added.
- No production behavior changed.
- No cloud account, server, MCP server, or external integration provisioned.
- Merge intentionally not performed; CI must pass first.

## Official sources
- https://github.com/openai/openai-agents-js/releases
- https://github.com/openai/openai-agents-js
- https://github.com/modelcontextprotocol/typescript-sdk/releases
- https://github.com/modelcontextprotocol/modelcontextprotocol
- https://github.com/punkpeye/fastmcp

## Follow-up hypothesis
The next code change should be a small dependency-free provenance validator plus scripted tests, derived from the existing audit event types on the headless branch.
