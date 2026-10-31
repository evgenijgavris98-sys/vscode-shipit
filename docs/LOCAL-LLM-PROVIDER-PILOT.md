# BIORICHEBRAIN — Local LLM Provider Pilot

Status: proposal / documentation-only pilot. No model, executable, dependency, credential, or workstation setting is installed or changed by this document.

Date: 2026-10-31

## Decision

Evaluate a local-first provider path before paying for an aggregator such as SYNTX.AI.

- Runtime candidate: Ollama, bound to loopback only (`127.0.0.1:11434`).
- Coding model candidate: Qwen3-Coder 30B when the target computer has enough memory; its Ollama package is approximately 19 GB. Do not assume it fits a 6 GB VRAM machine.
- Smaller-hardware fallback: evaluate a small Qwen3 instruct/coder variant against a fixed BIORICHEBRAIN test set; do not label it Claude or claim equivalent quality.
- Keep the existing OpenAI provider as the production default. Local models are opt-in, per-agent, and non-production until validated.
- Claude Free is a separate hosted chat product; Claude Code is not included in the Free plan. Never reuse Claude web-session credentials or scrape the Claude UI.

## Why Ollama

Ollama exposes a local API and documents Anthropic Messages API compatibility. This can let compatible clients (including Claude Code) talk to a local model endpoint. It does not provide Anthropic's Claude model: the selected Ollama model generates the answers.

References:
- https://ollama.com/download
- https://ollama.com/library/qwen3-coder
- https://github.com/ollama/ollama/blob/main/docs/api/anthropic-compatibility.mdx
- https://claude.com/pricing
- https://openai.github.io/openai-agents-js/

## Hardware gate — must be measured on the target machine

Before selecting a model, record:
- OS and version
- CPU model and available RAM
- GPU model, VRAM, and driver/runtime
- free disk space
- whether the machine is shared or contains production data

Do not pull a 19 GB model until the user confirms sufficient free disk and memory. The 480B Qwen3-Coder variant is not a consumer-PC default; Ollama lists a minimum of roughly 250 GB memory/unified memory for local execution.

## Safe installation procedure (user workstation)

1. Download Ollama only from https://ollama.com/download.
2. Install it locally using the official installer for the actual OS.
3. Keep the server bound to loopback; do not expose port 11434 to LAN or the public internet.
4. Verify `ollama --version` and `curl http://127.0.0.1:11434/api/tags`.
5. Only after the hardware gate, pull the selected model (e.g. `ollama pull qwen3-coder:30b`).
6. Run a harmless test prompt; inspect tool-call behavior before enabling any agent tools.
7. Keep model execution read-only initially. No shell, filesystem write, browser, GitHub write, secrets, or production-data tools.

## Provider integration plan

Phase A — isolated local endpoint:
- Test Ollama's native `/api/chat` and OpenAI-compatible `/v1/chat/completions` endpoints.
- Test Anthropic-compatible `/v1/messages` only for clients that require that protocol.
- Use dummy repository snippets and synthetic data only.
- Record latency, tokens/sec, memory, context handling, JSON reliability, and tool-call correctness.

Phase B — BIORICHEBRAIN adapter:
- Add an explicit provider enum such as `openai` / `ollama-local`; do not silently redirect OpenAI traffic.
- Require explicit opt-in and a loopback base URL allowlist for local mode.
- Keep credentials out of GitHub, chat, logs, config files, and committed environment files.
- Enforce tool deny-by-default, path containment, approvals, output limits, timeouts, and a kill switch.
- Keep the OpenAI provider and existing production model routing unchanged.
- Do not add a new SDK dependency until the existing Agents SDK provider interface and exact JS version are verified with tests.

Phase C — acceptance:
- Unit tests for provider selection and refusal of non-loopback endpoints in local mode.
- Contract tests for tool calls, malformed JSON, timeouts, cancellation, and oversized output.
- Red-team tests for prompt injection in repository files and tool output.
- Benchmark on a disposable test repository.
- Require human review before any production merge or external action.

## Claude Code compatibility (optional experiment)

Ollama documents these environment variables for clients expecting Anthropic's API:

```bash
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_BASE_URL=http://127.0.0.1:11434
```

The token value is a local placeholder in Ollama's documented compatibility mode, not an Anthropic API key. Verify the selected model and client compatibility before use. Never point these variables at an untrusted remote endpoint.

## Rollback

- Stop the Ollama process/service.
- Remove the local model with `ollama rm <model>` if desired.
- Remove only the local provider opt-in from the user's local environment.
- No production credentials or runtime routes should need rollback because this pilot does not change them.

## Current blockers

- Target computer OS, RAM, GPU/VRAM, and free disk are not known.
- No workstation installation or model download has been performed from GitHub.
- No provider runtime code is merged by this proposal.
