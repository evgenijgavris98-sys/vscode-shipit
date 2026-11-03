# Local Free Chat Stack for BIORICHEBRAIN

Updated: 2026-11-03

## Goal

Provide a ChatGPT-style interface for local open-weight models without per-request API charges. This does **not** unlock GPT-6 or provide unlimited access to hosted proprietary models. Local inference is bounded by the machine's RAM/VRAM, storage, throughput, thermals and electricity.

## Recommended baseline

- **Ollama** — local model runtime and HTTP API: http://localhost:11434
- **Open WebUI** — self-hosted browser UI, normally http://localhost:3000
- **LibreChat (optional later)** — richer multi-provider interface with agents and MCP; do not add it until the base local stack is working.

Upstream:
- Ollama: https://github.com/ollama/ollama
- Ollama install: https://ollama.com/download
- Open WebUI: https://github.com/open-webui/open-webui
- Open WebUI quick start: https://docs.openwebui.com/getting-started/quick-start/
- LibreChat: https://github.com/danny-avila/LibreChat
- LibreChat MCP docs: https://www.librechat.ai/docs/features/mcp

## Hardware-first model selection

Do not download a large model before checking available RAM/VRAM and free disk space. Approximate starting points only; quantization, context length and concurrent users change actual requirements.

| Available memory | Start with |
|---|---|
| 8 GB system RAM, CPU-only | 1B–3B quantized model |
| 16 GB RAM | 3B–8B quantized model |
| 32 GB RAM | 8B–14B quantized model |
| 64 GB+ RAM or capable GPU | 14B–32B class, subject to VRAM and quantization |

Use the Ollama model library to select a current model and verify its license before commercial use: https://ollama.com/library. Model weights have separate licenses; an open-source runtime does not make every model commercially unrestricted.

## Ubuntu / Linux installation

1. Install Ollama from its official installer:
   `curl -fsSL https://ollama.com/install.sh | sh`
2. Verify:
   `ollama --version`
   `ollama list`
3. Pull a small model only after checking hardware, for example:
   `ollama pull qwen3:4b`
4. Test:
   `ollama run qwen3:4b`
5. Start Open WebUI with persistent data and a fixed secret:
   ```bash
   export WEBUI_SECRET_KEY="$(openssl rand -hex 32)"
   docker run -d --name open-webui \
     -p 127.0.0.1:3000:8080 \
     --add-host=host.docker.internal:host-gateway \
     -v open-webui:/app/backend/data \
     -e WEBUI_SECRET_KEY="$WEBUI_SECRET_KEY" \
     --restart unless-stopped \
     ghcr.io/open-webui/open-webui:main
   ```
6. Open http://localhost:3000 and create the first admin account. The volume preserves chats and settings.

If Docker cannot reach Ollama, configure the Ollama connection in Open WebUI to `http://host.docker.internal:11434` and follow the official connection troubleshooting guide.

## Windows

- Install Ollama using the official Windows installer: https://ollama.com/download/windows
- Install Docker Desktop only if using the Docker deployment of Open WebUI.
- Run the same Ollama model commands in PowerShell.
- Open WebUI at http://localhost:3000.

## Android

The phone can use Open WebUI in a browser if the service runs on a PC/server reachable over the same trusted network or VPN. Running larger local models directly on a phone is device-dependent and not the recommended first deployment. Do not expose ports 3000 or 11434 directly to the public internet.

## Security baseline

- Bind the UI to localhost for the first setup; do not publish it publicly.
- Keep Open WebUI authentication enabled; do not use `WEBUI_AUTH=False` for a multi-user or internet-accessible instance.
- Keep the persistent data volume and back it up.
- Never commit API keys, OAuth tokens, passwords or `WEBUI_SECRET_KEY` to Git.
- Do not expose Ollama's unauthenticated local API to the public internet.
- For remote access, use a private VPN/tunnel with authentication rather than router port forwarding.
- Review each model's license and upstream maintenance/security posture before business use.

## BIORICHEBRAIN integration path

Phase 1: local chat with Ollama + Open WebUI; no BIORICHEBRAIN runtime permissions are granted.

Phase 2: add a separate LibreChat evaluation for MCP/agent workflows. Keep tools disabled by default and apply per-agent allowlists, read-only defaults and explicit approval for writes.

Phase 3: connect BIORICHEBRAIN runtime through its existing provider abstraction using an OpenAI-compatible local endpoint only after contract tests, timeout handling, streaming tests and secret handling are in place.

## Acceptance checklist

- [ ] Confirm host OS, RAM, GPU/VRAM and free disk space.
- [ ] Install Ollama and verify local inference.
- [ ] Select a model whose license permits the intended use.
- [ ] Install Open WebUI with persistent storage and authentication.
- [ ] Verify browser access at localhost:3000.
- [ ] Verify data survives container restart.
- [ ] Keep services private; no public unauthenticated endpoints.
- [ ] Only then evaluate LibreChat and BIORICHEBRAIN agent integration.

## Important limitation

This stack provides free local inference, not unlimited cloud compute and not free access to proprietary GPT-6. Cloud models may have usage limits or charges. Local inference costs no per-token API fee but consumes local compute and electricity.
