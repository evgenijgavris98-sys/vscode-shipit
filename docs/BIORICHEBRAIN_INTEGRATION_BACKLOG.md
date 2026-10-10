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
| [Agent Skills standard](https://github.com/agentskills/agentskills) | **INTEGRATED — PR #29** | Five project-authored skills are bundled behind an allowlist loader; skill text is instruction-only and cannot grant tools or override approval gates. | Keep skills curated; review every new skill, preserve path containment and size limits, and add evaluation fixtures. |
| [Anthropic skills](https://github.com/anthropics/skills) | **CURATE SELECTIVELY** | Candidate skill source; never bulk-install all skills. | Review each skill's license, scripts, network behavior, provenance and fit before packaging. |
| [Claude Code](https://github.com/anthropics/claude-code) | **INTEGRATED — PR #28** | Optional local CLI provider with bounded invocation; local installation/authentication is not verified by GitHub. | Verify CLI version, login, timeout and permission behavior on the target device. |
| [DeepSeek API / Harness](https://github.com/deepseek-ai) | **API INTEGRATED — PR #28; Harness deferred** | The API adapter uses `deepseek-v4-pro` by default; local Harness installation is a separate project and is not implied. | Test credentials, current API model list, cost controls, timeout and fallback in the user environment. |
| [Qwen Code](https://github.com/QwenLM/qwen-code) | **INTEGRATED — PR #28** | Optional local CLI provider; not required for core runtime or CI. | Verify installed CLI version, login, cancellation and local credential isolation. |
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

## Integration status after current-main rebases

- **PR #13 — Claude/DeepSeek/Qwen:** closed as stale; provider adapters and task-aware routing were rebuilt on current `main` and merged in **PR #28** after compile, lint, test and video-stack CI passed.
- **PR #14 — video department:** closed as stale; eight typed video specialist roles, a canonical pipeline validator and least-privilege tests were rebuilt and merged in **PR #27** after all CI passed.
- **PR #16 — deny-by-default security:** closed as superseded; **PR #26** merged the per-operation Copilot approval gate. Only explicit “Approve once” approves a single request; dismissal and unexpected responses reject.
- **PR #19 — skill runtime:** closed as stale; the curated skill loader and five project-authored skills were rebuilt and merged in **PR #29** after CI passed.
- **PR #1 — early OpenAI model-router architecture:** closed as stale/non-mergeable after the runtime evolved; model-monitoring and QA ideas are deferred for selective porting, not merged wholesale.
- **PR #12 — Qwen-only provider:** closed as superseded by PR #28, which integrated Qwen alongside Claude and DeepSeek.
- **PR #22 — controlled knowledge structure:** merged.
- **PR #23 — integration backlog and 100-role workforce blueprint:** merged.
- **PR #24 — Tech Radar main-branch validation trigger:** merged; the Radar workflow has since run successfully on `main` and published an artifact.
- **PR #25 — first video rebase attempt:** closed and superseded by PR #27 after CI caught a registry-count test assertion.
- **PR #26 — fail-closed Copilot approval:** merged.
- **PR #27 — governed video department:** merged.
- **PR #28 — Claude/DeepSeek/Qwen provider adapters and SmartRouter:** merged.
- **PR #29 — reviewed skill runtime:** merged.
- **PR #31 — npm audit report + Node 22 CI:** merged.
- **PR #32 — dependency remediation:** merged; patched Copilot SDK, VS Code test CLI and transitive test dependencies. The post-fix `npm audit --json` artifact reports **0 vulnerabilities** (0 low, 0 moderate, 0 high, 0 critical).
- **Dependency security:** the initial audit reported 15 vulnerabilities. PR #32 added tested overrides and updated `package-lock.json`; the post-fix audit reports **zero** advisories. Preserve the lockfile and rerun the audit after dependency changes. Avoid `npm audit fix --force` without a compatibility review.

The integrations add code and tests, but **do not prove that Claude/Qwen CLIs are installed or authenticated, that API keys exist, or that local GPU video models are installed**. Those are environment-specific smoke tests.

## Radar operating rules

The scanner is discovery only. It must never install or execute third-party code. The PR-triggered run and the first main-branch push run both succeeded, and the main-branch run published the `biorichebrain-github-tech-radar` artifact. A completed scheduled (daily) run has not yet been confirmed. A candidate can move to ADOPT only after:
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
