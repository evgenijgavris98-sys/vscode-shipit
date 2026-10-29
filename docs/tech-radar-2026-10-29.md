# BIORICHEBRAIN Open Source Radar — 2026-10-29

## Executive decision

No production dependency or runtime change is justified today. The useful outcome is a documented migration/test target: verify the current MCP boundary against the official TypeScript SDK 2.4.0 before any adoption, while keeping OpenAI Agents SDK as the only primary runtime.

## What was checked

### 1. OpenAI Agents SDK for TypeScript

- Official repository: https://github.com/openai/openai-agents-js
- Latest observed release: `@openai/agents` 0.21.0 (20 Oct 2026).
- Relevant evidence: fixes to persisted run-state/usage accounting and realtime dependency refreshes.
- Decision: keep as the primary runtime. No upgrade PR opened because the repository does not yet demonstrate a concrete compatibility need in BIORICHEBRAIN code.

### 2. Official MCP TypeScript SDK

- Official repository: https://github.com/modelcontextprotocol/typescript-sdk
- Latest observed release: 2.4.0 (23 Oct 2026), with v1.32.2 maintained in parallel.
- Relevant changes:
  - Skills over MCP (experimental attach API).
  - OAuth refresh scope opt-in.
  - stricter schema/header validation.
  - fixes for structuredContent shape and per-request transport revision binding.
- Decision: **migration candidate only**. The stricter validation and transport fixes are relevant to our MCP boundary, but an untested upgrade could break capability/approval/audit propagation or tool-schema compatibility. Keep current production line until a dedicated compatibility matrix is green.

### 3. Observability / evaluation candidates

#### OpenLIT

- Repository: https://github.com/openlit/openlit
- License: Apache-2.0.
- Positioning: self-hosted OpenTelemetry-native traces, evals, guardrails and cost tracking; claims support for OpenAI Agents SDK and MCP.
- Decision: reject as a new mandatory dependency for now. It introduces an additional service/control plane (Docker/ClickHouse/dashboard) when the repository currently has lightweight JSONL audit/provenance and CI checks. Revisit only when trace volume or evaluation complexity exceeds the current local model.

#### OpenLLMetry

- Repository: https://github.com/traceloop/openllmetry
- License: Apache-2.0.
- Positioning: OpenTelemetry instrumentation for GenAI applications, including OpenAI Agents and MCP.
- Decision: keep as a reference for future OTEL export, but do not add yet. The main benefit is observability plumbing, not a direct correction to current runtime correctness or security controls.

#### TraceBloom

- Repository: https://github.com/hugo-vicente11/TraceBloom
- License: Apache-2.0.
- Positioning: self-hosted tracing + evaluations with OTLP and OpenAI Agents SDK integration.
- Decision: reject for now. It is a second operational platform with Rust/TypeScript/Next.js/ClickHouse/Docker; that is disproportionate to current needs and creates new data-governance and deployment obligations.

## Security and license notes

- Preferred candidates above are permissively licensed (Apache-2.0) and provide public repositories/docs.
- No new package was installed.
- No network-executed third-party code was added to the repository.
- MCP 2.4.0's stricter schema and header validation are positive security signals, but they increase the need for regression tests before migration.

## Architecture comparison

BIORICHEBRAIN remains coherent with:

- OpenAI Agents SDK as the primary runtime.
- MCP as the tool boundary.
- Explicit capability, approval and audit controls.
- Persistent memory with provenance.
- Bounded delegation.
- Checkpoint/resume.
- Sandboxing and evaluation.

## Concrete next step

Create a separate draft compatibility PR for MCP SDK 2.4.0 that covers:

1. stdio and Streamable HTTP transports;
2. auth and Host-header validation;
3. tool input/output schema compatibility;
4. propagation of capability, approval, provenance and audit metadata;
5. checkpoint/resume and recovery;
6. lockfile and advisory checks.

Do not merge until CI is green and the migration is manually reviewed.

## What was actually implemented

- Added this documentation-only radar entry.
- No production code, dependencies, permissions, secrets or workflows changed.
- No merge performed.
