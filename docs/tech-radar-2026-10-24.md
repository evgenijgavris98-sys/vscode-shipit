# BIORICHEBRAIN Open Source Radar — 2026-10-24

## Decision summary

- Keep OpenAI Agents SDK as the only primary runtime.
- Keep MCP as the tool boundary; do not migrate production to MCP v2 yet.
- Prepare a narrow dependency-update PR for `@openai/agents` only after lockfile regeneration and CI/runtime regressions.
- Do not add a second agent framework, sandbox control plane, or memory/observability dependency without a demonstrated architectural gap.

## Fresh upstream evidence

### OpenAI Agents JS

The official upstream release page currently lists `@openai/agents@0.21.0` as the latest visible release. It is an immutable release with a GitHub-verified commit. Relevant changes include preservation of bounded nested numeric token usage across streamed runs and saved state, plus dependency updates in the core/OpenAI/realtime packages.

Relevance to BIORICHEBRAIN: saved-run provenance and checkpoint/resume become more trustworthy. Adoption remains conditional on repository-local regression coverage.

Source: https://github.com/openai/openai-agents-js/releases

### MCP TypeScript SDK

The official TypeScript SDK v2 remains a beta/transition line. Upstream documentation continues to state that v1.x is the supported production line during the transition. The SDK remains practical for Node/TypeScript, but a blind production migration would create compatibility and security risk.

Required local compatibility/policy coverage before migration:

- protocol negotiation and capability filtering;
- transport/auth and server identity/audience;
- read-only versus approval-required tool classes;
- provenance and audit correlation IDs;
- scope-expansion detection;
- Node 22 / ESM behavior;
- checkpoint/resume after transport or tool failures.

Source: https://github.com/modelcontextprotocol/typescript-sdk

## Current repository baseline

`main` currently declares:

- `@openai/agents: ^0.18.0`;
- `@github/copilot-sdk: ^0.1.32`;
- `zod: ^4.3.5`;
- Node 22 / TypeScript / ESLint / VS Code test scripts.

Existing draft PR #38 is documentation-only and remains draft/open. It should not be merged as a substitute for the dependency-update PR.

## Rejected

- Second agent runtime: duplicates orchestration and governance.
- New execution/sandbox control plane: adds a trust boundary without evidence of a missing capability.
- Automatic MCP v2 migration: insufficient local compatibility evidence.
- Dependency additions selected only by popularity, stars, or discovery-list presence.
- Merge of documentation or runtime PRs before required CI and environment-specific smoke checks pass.

## Implemented in this cycle

- Added this documentation-only radar entry on branch `biorichebrain/radar-2026-10-24`.
- No production dependencies or runtime code changed.
- No merge performed.

## Next safe action

Open a separate dependency-update PR for `@openai/agents` with:

1. regenerated `package-lock.json`;
2. compile, lint, and existing VS Code tests;
3. approval-resume / max-turns regression;
4. checkpoint/resume regression;
5. MCP discovery/provenance regression;
6. sandbox file-policy regression.

Keep the PR draft until CI is green and runtime smoke tests pass.
