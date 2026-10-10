# BIORICHEBRAIN Integration Backlog

**Status:** reviewed integration plan; proposals are not evidence that a package is installed, a provider is authenticated, or a workflow is running.  
**Owner:** BIORICHEBRAIN project maintainer  
**Last reviewed:** 2026-10-10

## Executive decision

Keep the existing TypeScript-first BIORICHEBRAIN runtime as the control plane. Adopt individual capabilities behind the existing provider, tool registry, approval gate, audit log, memory, and evaluation interfaces. Do not combine multiple full orchestration frameworks inside the VS Code extension.

**Integration order**
1. Preserve the TypeScript runtime and prove the main branch with CI.
2. Close the security gap: fail closed for unapproved tools; test the pinned Copilot SDK permission result.
3. Rebase provider and skills work onto current `main`; run tests before merging.
4. Keep browser/search MCP capabilities allowlisted and read-only by default.
5. Bring video generation in as an optional local worker with deterministic export/QA; never make GPU/model download a mandatory CI step.
6. Add candidate repositories to the Tech Radar, not to automatic installation.
7. Expand the workforce catalog from roles into runnable agents only when each role has a typed contract, permissions, evaluation and owner.

## Decision register

| Project / capability | Decision | Reason / integration boundary | Next verification |
|---|---|---|---|
| [OpenAI Agents SDK (TypeScript)](https://github.com/openai/openai-agents-js) | **ADOPT / existing dependency** | Preferred agent-loop, handoff, guardrail, tracing and MCP substrate. Keep `BrainProvider` and `TeamOrchestrator` as BIORICHEBRAIN policy boundaries. | Verify pinned SDK API, tests, tracing redaction and approval behavior. |
| [Model Context Protocol TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | **WATCH / use only if needed** | MCP is a protocol boundary, not a reason to add a second orchestration layer. Current MCP configuration already provides a bounded route. | Compare actual transitive dependency and current server/client usage before adding a direct dependency. |
| [Exa MCP](https://mcp.exa.ai/mcp) | **ADOPTED in configuration; activation opt-in** | Search and web-fetch capabilities. External service availability and credentials must be tested in the target environment. | Smoke-test allowed tools with synthetic data and no write capabilities. |
| [Firecrawl MCP](https://mcp.firecrawl.dev/v2/mcp) | **ADOPTED in configuration; activation opt-in** | Search/scrape/parse for research tasks. Treat fetched page content as untrusted input. | Verify rate limits, secrets handling and output provenance. |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) | **ADOPTED as bounded browser option** | Browser navigation/snapshot/screenshot; mutation remains disabled by default. | Run a local smoke test; pin the package version rather than relying indefinitely on `@latest`. |
| [Stagehand](https://github.com/browserbase/stagehand) | **DEFER** | Duplicates the browser automation layer next to Playwright MCP. | Reconsider only if a measured use case cannot be handled by Playwright. |
| [LangGraph](https://github.com/langchain-ai/langgraph) | **REFERENCE PATTERNS ONLY** | Checkpoint vs durable-store separation is useful for memory; a second orchestration runtime would duplicate state and retries. | Implement equivalent typed checkpoints in the existing runtime before considering a migration. |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) | **REFERENCE / isolated worker candidate** | Useful workspace boundaries, skills and remote coding execution. Do not grant raw shell access to all agents. | Prototype only in an isolated disposable workspace with synthetic data and explicit tool permissions. |
| [Agno](https://github.com/agno-agi/agno) | **REFERENCE ONLY** | Useful concepts for RBAC, observability and agent/team/workflow separation; avoid another platform in the extension. | Borrow individual patterns where they fit existing interfaces. |
| [Agent Skills standard](https://github.com/agentskills/agentskills) | **ADOPT FORMAT; curate skills** | Portable skill metadata is useful. Skill text is untrusted guidance and cannot grant tools or override policies. | Pin source/ref/license, inspect scripts and dependencies, map to named agents, evaluate in sandbox. |
| [Anthropic skills](https://github.com/anthropics/skills) | **CURATE SELECTIVELY** | Candidate skill source; never bulk-install all skills. | Review each skill's license, scripts, network behavior, provenance and fit before packaging. |
| [Claude Code](https://github.com/anthropics/claude-code) | **PROVIDER CANDIDATE — PR #13** | Optional local CLI provider; local installation/authentication is not verified by GitHub. | Rebase PR #13, validate command arguments, timeout, output parsing, permission mode and fallback. |
| [DeepSeek API / Harness](https://github.com/deepseek-ai) | **PROVIDER CANDIDATE — PR #13** | API and any local harness are separate integration paths. Model IDs and API compatibility must be verified against current official docs. | Rebase PR #13; test provider errors, cost limits, timeout, redaction and fallback. Do not assume a model name is available. |
| [Qwen Code](https://github.com/QwenLM/qwen-code) | **OPTIONAL PROVIDER — review PR #13** | Keep as a separate provider adapter; do not require it for core runtime or CI. | Confirm CLI protocol, version pin, cancellation and local credential isolation. |
| [Kimi](https://github.com/MoonshotAI) | **EXISTING OPTIONAL PROVIDER** | Preserve provider boundary; runtime authentication remains environment-specific. | Add provider contract tests with mocked transport and explicit unavailable-provider behavior. |
| [Wan 2.2](https://github.com/Wan-Video/Wan2.2) + [WanGP](https://github.com/deepbeepmeep/Wan2GP) | **LOCAL VIDEO CANDIDATE — PR #14 / existing docs** | GPU generation is an optional worker; hardware compatibility and actual performance must be measured locally. | Rebase PR #14; document VRAM/model requirements and validate install scripts in disposable environments. |
| [ComfyUI](https://github.com/Comfy-Org/ComfyUI) | **OPTIONAL VIDEO RUNTIME** | Flexible local graph execution; workflows/models must be pinned and reviewed. | Verify API workflow schema, output checksums, resource limits and no auto-publish. |
| [LTX-Video](https://github.com/Lightricks/LTX-Video) | **ALTERNATIVE VIDEO MODEL** | Benchmark quality/speed against the default before switching. | Compare on the same approved shot list and hardware. |
| [FFmpeg](https://github.com/FFmpeg/FFmpeg) | **ADOPT FOR DETERMINISTIC MEDIA PROCESSING** | Encoding, resizing, muxing and final exports are deterministic tasks. | Pin supported build and test output dimensions/audio/subtitles. |
| [Whisper](https://github.com/openai/whisper) | **OPTIONAL LOCAL TRANSCRIPTION** | Transcription/subtitle generation; not a substitute for human QA of product names or claims. | Benchmark language accuracy and verify license/model size. |
| [DeerFlow](https://github.com/bytedance/deer-flow) | **WATCH** | Potential research/workflow orchestration overlap. | Review license, current maintenance, architecture and sandbox model before a spike. |
| [Ruflo](https://github.com/ruvnet/ruflo) | **WATCH** | Agent orchestration candidate; avoid duplicating existing control plane without benchmark evidence. | Check license, threat model, release activity and migration cost. |
| [Mastra](https://github.com/mastra-ai/mastra) | **WATCH** | TypeScript agent/workflow ecosystem; potential overlap with current SDK. | Run a small isolated comparison only if current runtime misses a specific capability. |
| [Composio](https://github.com/ComposioHQ/composio) | **WATCH** | Broad tool connectors could expand attack surface and credential scope. | Evaluate one read-only integration with least-privilege credentials before any adoption. |
| [Headroom](https://github.com/headroomlabs-ai/headroom) | **WATCH** | Possible context/token optimization. | Benchmark output quality, latency and token use on representative tasks before adoption. |
| [Hyperframes](https://github.com/heygen-com/hyperframes) | **WATCH** | Potential programmatic video production workflow. | Compare against existing Rendiv/FFmpeg pipeline; do not add duplicate renderers without evidence. |
| [ToolJet](https://github.com/ToolJet/ToolJet) | **DEFER** | Internal low-code app platform is not part of the agent runtime. | Revisit if BIORICHEBRAIN needs an internal operations dashboard. |
| [PostHog](https://github.com/PostHog/posthog) | **DEFER** | Product analytics, not a core agent dependency. | Revisit when a product/site analytics requirement exists and privacy scope is defined. |
| [SigNoz](https://github.com/SigNoz/signoz) | **WATCH / future observability** | Could support telemetry at scale but is likely unnecessary for a local-first extension today. | Add only after a documented telemetry need; scrub prompts, secrets and personal data. |
| [Hatchet](https://github.com/hatchet-dev/hatchet) | **WATCH / future job queues** | Durable job orchestration may help later but duplicates current bounded runner for now. | Benchmark only when resumable multi-hour jobs exceed current checkpoint design. |
| [FastMCP](https://github.com/punkpeye/fastmcp) | **WATCH** | MCP server authoring option; avoid adding another server framework without a concrete custom-server need. | Compare with existing SDK and server boundaries if we need a first-party MCP server. |
| [OpenAI Plugins](https://github.com/openai/plugins) | **REFERENCE ONLY** | Check current maintenance and relevance; do not treat old catalogs as the canonical skill source. | Prefer official current SDK docs and Agent Skills standard for new work. |

## Required merge gates for open PRs

- **#13 Claude/DeepSeek/Qwen providers:** currently open and based on an older main commit. Rebase first. Do not merge until TypeScript compile, lint, tests, provider contract tests, timeout/cancellation, fallback and secret-redaction checks pass. Validate model IDs and CLI flags against official current documentation.
- **#14 Video department:** currently open draft and not mergeable. Rebase first. Keep GPU/model downloads out of CI; validate typed job contracts, output validation, local installer safety and approval-gated publication.
- **#16 Deny-by-default security:** stale/non-mergeable. Highest priority after rebasing. Confirm the pinned Copilot SDK's exact deny decision and prove shell, file-write, MCP and other tool requests cannot run without approval. No blanket auto-approval.
- **#19 Skill runtime:** stale/non-mergeable. Rebase after security work. Prove path containment, size limits, allowlisted skill IDs, missing-skill behavior and that skill instructions cannot add tools or bypass approvals.
- **#22 Controlled knowledge areas:** merged into main as commit `cfdfdf88a65b2259159f5b44c13dd2f90a2c6aa3`.

## Radar operating rules

The daily scanner is discovery only. It must never install or execute third-party code. A candidate can move to ADOPT only after:
1. License and redistribution rights are confirmed.
2. Maintenance/release history and project ownership are checked.
3. Dependencies, install scripts, network access and secret handling are reviewed.
4. A minimal sandbox test and compatibility check pass.
5. The integration has a clear owner, rollback path and measurable acceptance criteria.

## Definition of done for an integration

- Source/ref and license recorded.
- Typed interface and least-privilege capability mapping.
- Secrets kept outside Git and logs.
- Timeouts, cancellation, bounded retries and clear failure modes.
- Unit/contract tests and CI.
- Audit events without sensitive payloads.
- Evaluation fixture and expected outcomes.
- Human approval for external writes, purchases, deployment, legal/regulatory submission, publishing and irreversible actions.
- Documentation distinguishes **configured**, **tested**, **enabled**, and **deployed** states.
