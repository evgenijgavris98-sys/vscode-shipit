# BIORICHEBRAIN Open Source Radar — 2026-10-23

## Decision summary

- **Do not add a new agent runtime or execution control plane.**
- **Do not migrate MCP v2 in production yet.** Keep the current MCP boundary and prepare a dependency-free compatibility/policy suite first.
- **Candidate for a separate dependency PR:** evaluate `@openai/agents` upgrade from the current `^0.18.0` range to the verified upstream `0.21.0` release. Do not merge that update without lockfile regeneration and CI/runtime smoke coverage.
- **No production code or dependencies were changed in this radar PR.**

## Evidence reviewed

### OpenAI Agents JS

Official upstream release `@openai/agents@0.21.0` was published on 2026-10-20 as an immutable GitHub-verified release. Relevant changes include:

- preservation of bounded nested numeric token usage across streamed runs and saved state;
- removal of the Runloop sandbox provider API;
- recognition of GPT-6 Astra, Sol, Luna, and GPT-6.1 Sol in sandbox compaction thresholds;
- refreshed realtime/WebSocket dependencies.

Why it matters for BIORICHEBRAIN: provenance-aware usage accounting and checkpoint/resume state are core requirements. The upgrade is worth testing, but only as a narrow dependency PR because the repository currently declares `@openai/agents: ^0.18.0`.

Source: https://github.com/openai/openai-agents-js/releases

### MCP TypeScript SDK

The official TypeScript SDK v2 remains a beta/transition line while v1.x remains the supported production line. The correct next step is not a blind migration; it is a local compatibility/policy suite covering:

- protocol negotiation and capability filtering;
- transport/auth behavior;
- approval metadata and read-only vs approval-required tool classes;
- server identity/audience and scope-expansion detection;
- provenance and audit correlation IDs;
- Node 22 / ESM behavior;
- checkpoint/resume after transport or tool failures.

Source: https://github.com/modelcontextprotocol/typescript-sdk

### Current repository baseline

`main` currently contains:

- `@openai/agents: ^0.18.0`;
- `@github/copilot-sdk`;
- `zod`;
- Node 22 / TypeScript / ESLint / VS Code test scripts.

Draft PR status was rechecked:

- **PR #36** remains draft/open, and all four observed workflows on head `559a3fe1bc2ddde76ca2adae8bc129d9dd0183cb` completed successfully: CI, BIORICHEBRAIN video stack, BIORICHEBRAIN headless runtime checks, and Brain CI. The PR still documents unverified real-host/provider-backed execution and deployment recovery.
- **PR #37** remains draft/open, and CI, Brain CI, and BIORICHEBRAIN video stack completed successfully on head `d198b8dedc4096ab0d5aad84a34234f41b9a4dce`. A real CLI-Hub install/disposable-file smoke test is still explicitly unverified.

## Rejected

- second agent framework/runtime: duplicates orchestration and governance;
- new sandbox/execution control plane: adds a trust boundary without a demonstrated gap;
- automatic MCP v2 migration: insufficient local compatibility evidence;
- dependency additions chosen only by popularity/stars;
- merge of PR #36 or #37 based only on green CI, because their remaining real-environment checks are outside CI.

## Implemented in this cycle

- Created branch `biorichebrain/radar-2026-10-23` from `main`.
- Added this radar document only.
- No dependency changes, no runtime code changes, no merge, and no irreversible external actions.

## Next safe action

Open a separate dependency-update PR for `@openai/agents` with:

1. regenerated `package-lock.json`;
2. compile, lint, and existing VS Code tests;
3. approval-resume / max-turns regression;
4. checkpoint/resume regression;
5. MCP discovery/provenance regression;
6. sandbox file-policy regression.

Keep the PR draft until CI is green and the runtime smoke tests pass.