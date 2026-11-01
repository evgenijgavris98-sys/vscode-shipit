# BIORICHEBRAIN Open Source Radar — 2026-10-25

## Decision summary

- Keep OpenAI Agents SDK as the sole primary runtime and preserve MCP as the tool boundary.
- Do not add a second orchestration framework or a new memory/observability stack this cycle.
- Treat new sandbox gateways and MCP security frameworks as discovery-only until repository-local threat modeling, license review, and CI smoke coverage exist.
- Continue the narrow `@openai/agents` update track; do not merge it without green CI and checkpoint/approval regressions.

## Freshly checked candidates

### 1. MCP Fusion (TypeScript)
Official repository: https://github.com/vinkius-labs/mcpfusion

Why it is interesting:
- TypeScript-first secure MCP server framework.
- Emphasizes typed egress filtering, namespace removal, and auditable behavior.

Why it is not adopted:
- It would introduce a second MCP server architecture and a new policy model before BIORICHEBRAIN has a concrete gap.
- The upstream page advertises MCP 2.0 transition claims that still need independent compatibility testing against the repository's current MCP policy gate.
- No dependency or runtime change is justified from the current codebase.

Decision: monitor only.

### 2. Bastion (Rust)
Official repository: https://github.com/Rubentxu/Bastion

Why it is interesting:
- MCP gateway for sandboxed execution with container/microVM backends.
- Explicit resource limits, lifecycle APIs, and metrics.

Why it is not adopted:
- Rust + Podman/Firecracker creates a new operational control plane outside the current Node/TypeScript runtime.
- Adds a new trust boundary and deployment burden without evidence that the existing opt-in headless worker lacks the required isolation for current workloads.
- Requires host-level integration and environment-specific validation that cannot be proven in repository CI alone.

Decision: monitor only; revisit only for a demonstrated untrusted-code execution requirement.

### 3. Archestra / Open Multi-Agent / Mastra class of frameworks

Why they were checked:
- They are active TypeScript/Node-compatible options for orchestration, workflows, gateways, or observability.

Why they were rejected for this cycle:
- They overlap with existing OpenAI Agents SDK + explicit approval/audit/checkpoint design.
- Adding them now would create competing state machines and duplicate tool/capability governance.
- No missing capability was demonstrated that is cheaper or safer to import than to extend locally.

Decision: reject for adoption, keep as comparative references.

### 4. Memory / observability candidates

Checked categories:
- stateful memory systems;
- Langfuse / Phoenix-style tracing and eval stacks;
- filesystem-first durable agent approaches.

Decision:
- No new dependency added. Existing JSONL audit, provenance fields, checkpoint/resume, and CI-owned regression path are more coherent for the current repository size.
- Add a dedicated observability dependency only when a concrete requirement appears (multi-run dashboards, retention policy enforcement, or dataset-backed evals) and when the data boundary is approved.

## Repository comparison

Current main already has:
- `@openai/agents` as the primary agent runtime;
- Zod validation;
- provider adapters kept separate from tool permissioning;
- persistent audit/scheduler/headless runtime work in draft PR #36;
- guarded skill loading in draft PR #29;
- MCP dependency policy gate in draft PR #39;
- daily radar documentation in draft PR #40.

This is already aligned with the target architecture: explicit capability/approval/audit controls, bounded delegation, persistent provenance, checkpoint/resume, and sandboxing boundaries.

## Actual implementation this cycle

- Added this documentation-only radar entry on branch `biorichebrain/radar-2026-10-25`.
- No production dependency or runtime code changed.
- No merge performed.
- Draft PR remains the review boundary; CI must be green before any merge.

## Next safe actions

1. Finish the separate `@openai/agents` dependency-update PR with regenerated lockfile.
2. Run compile, lint, VS Code tests, approval-resume, checkpoint/resume, MCP provenance, and sandbox-policy regressions.
3. Re-evaluate sandbox gateway adoption only after a real untrusted-code workload is defined.
