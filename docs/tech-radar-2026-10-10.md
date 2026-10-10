# BIORICHEBRAIN Open Source Radar — 2026-10-10

## Summary

The current repository already has a daily GitHub tech-radar workflow, a TypeScript/Node 22 CI pipeline, OpenAI Agents SDK and GitHub Copilot SDK dependencies, and explicit BIORICHEBRAIN commands in the VS Code extension. The safest useful improvement today is documentation and decision hygiene, not a new runtime dependency.

## Candidates worth watching

| Candidate | Why relevant | License / evidence | Decision |
|---|---|---|---|
| TraceBloom | OpenTelemetry-based agent tracing and evaluation; supports OpenAI Agents SDK integration; self-hostable | Apache-2.0; active repository with TypeScript/Rust stack | WATCH — validate SDK maturity and data model before adding |
| Bastion | MCP gateway for sandboxed execution with Podman/Firecracker/gVisor backends | Open source; Rust; strong isolation concept | WATCH — security review and operational burden are substantial |
| sandcastle | TypeScript orchestration for sandboxed coding agents; bounded loops and completion signals | Open source; TypeScript; practical checkpoint/timeout patterns | WATCH — compare with existing ShipIt loop before adopting |
| Agent-MCP | MCP-oriented multi-agent coordination and shared memory | Open source; Node/Python compatibility | REJECT for now — overlaps the existing bounded-delegation design and adds a second coordination model |
| AGS MCP | MCP code/browser sandboxing | Open source; infrastructure-oriented | WATCH — useful reference, but not a direct local dependency |

## Architecture comparison

BIORICHEBRAIN should continue to use:

- OpenAI Agents SDK as the primary runtime.
- MCP as the tool boundary.
- Explicit capability, approval, audit, and provenance controls.
- Persistent memory with source/provenance and bounded retention.
- Bounded delegation, checkpoint/resume, sandboxing, and evaluation.

No candidate was strong enough today to justify adding a dependency or changing the runtime boundary. The highest-value near-term work is stronger evidence scoring in the radar itself and a manual adoption checklist.

## Rejected today

- Popularity-only adoption: rejected because stars do not establish security, license compatibility, or operational fit.
- Second agent runtime: rejected because it would fragment the existing OpenAI Agents SDK architecture.
- Automatic installation of third-party repositories: rejected because it violates the repository’s current safety posture and makes supply-chain review implicit.
- Automatic merge: not performed. CI and human review remain required.

## Actual implementation

Implemented in this branch:

- Added this dated radar/adoption record for review and traceability.
- No dependencies added.
- No production runtime code changed.
- No irreversible external actions performed.

## Required before adoption

1. Verify the project’s current license and transitive dependency licenses.
2. Review security posture, sandbox boundaries, credential handling, and network policy.
3. Run a local compatibility spike against Node 22 and the current OpenAI Agents SDK.
4. Add an evaluation fixture and rollback path.
5. Require green CI before merge.
