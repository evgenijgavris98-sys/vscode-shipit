# BIORICHEBRAIN Open-Source Radar — 2026-10-14

## Scope and decision rule

This radar prioritizes active maintenance, permissive licensing, technical evidence, Node/TypeScript compatibility, and fit with the current BIORICHEBRAIN architecture:
- OpenAI Agents SDK as the primary runtime
- MCP as the tool boundary
- explicit capability, approval, audit and redaction controls
- persistent memory with provenance
- bounded delegation and checkpoint/resume
- sandboxing and evaluation

No runtime dependency is recommended solely because it is popular.

## Verified candidates

### 1. OpenAI Agents JS — keep as primary runtime

Verified facts:
- The repository published @openai/agents 0.20.0 on 2026-10-08.
- Release notes include fixes for MCP discovery pagination, local file safety, approval-resume maxTurns accounting, and checkpoint validation.
- Earlier 0.19.x notes include bounded streaming callback buffering and stricter checkpoint restart behavior.

Decision:
- Keep as the primary runtime.
- Concrete improvement: add regression tests around approval resume, checkpoint rejection/restart, bounded stream buffering, and MCP discovery page limits.
- No new dependency required.

### 2. Official MCP TypeScript SDK — maintain a dual-track posture

Verified facts:
- The official repository lists the 2.3.1 release and packages such as @modelcontextprotocol/server, client, core, and codemod.
- The repository license is mixed: Apache-2.0 for new contributions, with existing code under MIT.
- Earlier repository guidance recommended v1.x while v2 was pre-release; the current release page now shows a 2.3.1 line. Verify exact package versions before changing production code.

Decision:
- Do not replace the current MCP boundary blindly.
- Concrete improvement: add a CI-only compatibility canary that instantiates a minimal server/client pair and verifies tool-list, capability labels, approval metadata, audit propagation, and clean shutdown.
- Keep production runtime on the current pinned path until the canary passes and rollback is documented.
- No dependency change in this PR.

### 3. Sandboxing — use explicit runtime profiles as a design reference

Verified facts:
- GitHub Agentic Workflows documents explicit runtime profiles including docker, gVisor, docker-sbx and cloud-hypervisor, with different isolation guarantees.
- Privileged profiles change the security intent and require explicit configuration.

Decision:
- Do not import the workflow runtime.
- Concrete improvement: document a BIORICHEBRAIN sandbox profile matrix and require an explicit profile/capability label before any future shell or code-execution tool is enabled.
- Current headless service remains tool-free.

### 4. Observability/evaluation — prefer existing traces plus deterministic tests

Verified facts:
- OpenAI Agents JS release notes reference trace export handling and sandbox/tool lifecycle changes.
- The existing BIORICHEBRAIN branch already has JSONL audit, run IDs, capability/provenance fields, durable task state and CI smoke tests.

Decision:
- Add no external observability framework yet.
- Concrete improvement: define a dependency-free evaluation contract around existing audit records: runId, parentRunId, capability, approval, tool, sourceRefs, checkpoint, digest, redactionVersion.
- Add fixture-based tests for allowed, approval_required, denied, failed and resumed outcomes.

## Rejected or deferred options

- FastMCP as a replacement MCP framework: rejected for core use because it adds a second framework/runtime layer and current documentation indicates legacy-protocol focus relative to the project's current MCP direction.
- Additional agent orchestration frameworks: deferred because they duplicate existing bounded delegation and approval controls.
- New memory frameworks: deferred because the current requirement is provenance and policy correctness, not a broader retrieval layer.
- Cloud sandbox SDKs: deferred until a concrete execution workload, threat model, and provider cost boundary exist.
- Large integration MCP bundles: deferred because they expand capability surface without a demonstrated BIORICHEBRAIN use case.

## License and dependency implications

- Prefer MIT, Apache-2.0, BSD-2-Clause, or BSD-3-Clause for new direct dependencies.
- Review mixed-license repositories package-by-package before vendoring or redistributing.
- Before adding a dependency, run license inventory, npm audit/advisory review, and lockfile diff review.
- The recommendations in this document add no runtime dependency.

## Implementation status

- This document is a separate radar artifact only.
- No production runtime behavior changes are included.
- No external account, deployment, merge, or irreversible action was performed.
- A draft PR is opened from a separate branch; merge remains blocked until CI and review pass.