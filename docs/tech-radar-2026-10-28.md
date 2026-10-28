# BIORICHEBRAIN Open Source Radar — 2026-10-28

## Scope
Daily review of newly updated or emerging open-source GitHub projects relevant to BIORICHEBRAIN: agent runtimes, MCP servers/SDKs, coding agents, sandboxes, memory, evaluation, observability, and developer skills.

Architecture invariants:
- OpenAI Agents SDK as the primary runtime.
- MCP as the tool boundary.
- Explicit capability, approval, audit, and provenance controls.
- Persistent memory with provenance.
- Bounded delegation.
- Checkpoint/resume.
- Sandboxing and evaluation gates.

## Findings

### 1. OpenAI Node SDK: recent delegation and automation controls
The official openai/openai-node release stream shows a 2026-10-25 release adding delegation controls, prompt-cache lifetimes, scheduled automations, and an automations agent-tool variant. This is directionally aligned with BIORICHEBRAIN's bounded delegation and scheduled headless runtime.
Decision: adopt as an observation and compatibility target, not a dependency change in this radar PR. The repository currently has multiple open runtime/CI PRs and no evidence that the new APIs are already required by the active code path. A dedicated compatibility PR should first add compile-time and behavior tests around approvals, audit fields, and recovery semantics.
Source: https://github.com/openai/openai-node/releases

### 2. Official MCP TypeScript SDK v2
The official MCP TypeScript SDK v2 line is the strongest TypeScript/Node candidate for future MCP integration. It provides split server/client packages, Streamable HTTP, stdio, auth helpers, middleware, and Standard Schema support.
Security and release posture: the upstream repository describes v2 as the current development/stable transition line and recommends production users remain on v1.x until their migration plan is validated. For BIORICHEBRAIN, this reinforces the existing rule: do not upgrade the MCP boundary without a transport/auth/schema compatibility matrix and a regression suite for capability, approval, provenance, and audit behavior.
Decision: keep as a migration candidate; do not add or upgrade packages in this PR.
Source: https://github.com/modelcontextprotocol/typescript-sdk

### 3. Heddle
Heddle is a TypeScript agent runtime focused on durable conversations, MCP execution, approvals, artifacts, traceable activity, and reconnectable runs. It is relevant as a reference implementation for checkpoint/resume and approval UX.
Decision: reject as a second runtime. It would duplicate the primary OpenAI Agents SDK runtime and introduce another lifecycle/state model. Selective patterns may be revisited later, but not as a mandatory dependency.
Source: https://github.com/roackb2/heddle

### 4. Flue
Flue presents a TypeScript harness for sessions, tools, skills, filesystem access, and secure sandbox execution. It is useful as a reference for a bounded coding-agent harness.
Decision: reject for direct adoption. The sandbox and filesystem model would become a new trust boundary before BIORICHEBRAIN has a finalized deployment threat model. Keep the concept in the radar; do not import the runtime.
Source: https://github.com/withastro/flue

### 5. VoltAgent
VoltAgent provides a broad TypeScript agent framework with memory, RAG, guardrails, MCP, workflows, and observability.
Decision: reject as a framework dependency. It overlaps the selected runtime, delegation, guardrail, memory, and evaluation layers. The breadth is not itself a reason to replace the current architecture.
Source: https://github.com/VoltAgent/voltagent

### 6. tRPC-Agent-Go
tRPC-Agent-Go is an Apache-2.0 Go-native framework with graph workflows, memory, MCP, evaluation, and OpenTelemetry observability.
Decision: reject for this codebase. The project is technically interesting but not a practical TypeScript/Node improvement and would create a second language/runtime control plane.
Source: https://github.com/trpc-group/trpc-agent-go

### 7. BetterCode and similar multi-agent IDE shells
BetterCode is an MIT-licensed desktop shell for running several coding agents side-by-side.
Decision: reject as an architecture dependency. This is a developer-experience shell, not a better core runtime, tool boundary, audit system, or sandbox policy for BIORICHEBRAIN. It may be useful externally for experimentation, but it does not belong in the repository runtime.
Source: https://github.com/kerim0x1/bettercode

## Adopt / reject summary
Adopt now:
- No new runtime dependency.
- Continue treating official MCP TypeScript SDK v2 as the controlled migration target.
- Continue using OpenAI Agents SDK as the only primary runtime.
- Keep the current lockfile-aware security gate and draft-PR workflow.

Reject for now:
- Heddle, Flue, VoltAgent: overlapping runtimes and policy/state models.
- tRPC-Agent-Go: wrong language/runtime boundary.
- BetterCode: useful shell, not a core architecture improvement.

## What was implemented
- Added this decision record under docs/tech-radar-2026-10-28.md.
- No production code changed.
- No dependencies changed.
- No permissions, secrets, or workflows changed.
- No merge performed.

## CI / safety status
This branch is intentionally limited to documentation. Keep the pull request in draft state until repository CI completes and the changes are reviewed. Do not merge any runtime or dependency change based on this radar alone.

## Next concrete experiment
Open a separate draft PR for an MCP SDK v2 compatibility matrix only when the repository has a stable test surface for:
1. stdio and Streamable HTTP transport behavior;
2. auth and Host-header validation;
3. tool schema compatibility;
4. capability/approval/audit event propagation;
5. checkpoint/resume and failure recovery;
6. lockfile and advisory policy checks.