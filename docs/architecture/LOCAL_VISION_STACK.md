# BIORICHEBRAIN Local Vision — setup and operating guide

## Purpose

A private, self-hosted image/chat workspace for BIORICHEBRAIN R&D: raw-material photos, packaging and label drafts, production observations, and internal reference images. This is a separate interface from chatgpt.com; it does not remove OpenAI ChatGPT plan quotas or grant unlimited GPT-6 access.

## Included

- Open WebUI browser interface at http://localhost:3000.
- Ollama local model runtime.
- Persistent Docker volumes for Ollama models and Open WebUI chats/uploads.
- UI bound to 127.0.0.1 only. Ollama's API port is not published to the host/network.

## Requirements

- Windows 10/11, macOS, or Linux supported by Docker Desktop / Docker Engine.
- Docker Desktop (Windows/macOS) or Docker Engine + Compose plugin (Linux).
- Internet for first image/model download.
- Disk space for containers, model weights, and uploaded photos. The starter vision model is about 3.2 GB; additional working memory and disk are required.
- CPU-only operation is possible but may be slow. GPU acceleration depends on hardware and drivers. No GPU is assumed until the target PC is inspected.

## Windows quick install

1. Install and start Docker Desktop. Ensure Docker Compose v2 is available.
2. Open PowerShell in this directory.
3. Run:

   ```powershell
   Set-ExecutionPolicy -Scope Process Bypass
   .\install-windows.ps1
   ```

The script creates a private random `.env` if absent, starts containers, downloads `qwen2.5vl:3b`, checks the local web endpoint, and opens the browser. It uses .NET Framework-compatible cryptographic APIs and does not change the machine-wide execution policy.

## Manual install (all platforms)

1. Copy `.env.example` to `.env`.
2. Replace the placeholder with a strong random secret. Do not share it or commit `.env`.
3. From this directory run:

   ```sh
   docker compose --env-file .env -f docker-compose.yml up -d
   docker exec -it biorichebrain-ollama ollama pull qwen2.5vl:3b
   ```

4. Open http://localhost:3000 and create the first administrator account.

## Model choice

The starter model is `qwen2.5vl:3b` (about 3.2 GB download, image input). It is a small baseline to get the service running, not a claim of best accuracy. Larger 7B/32B variants require substantially more resources. Confirm available RAM/VRAM before choosing a larger model.

## BIORICHEBRAIN image workflow

1. Separate image sets for raw materials, FermExtract process samples, finished products, packaging/labels, and equipment/QC.
2. Preserve untouched source photos and record date, batch ID, sample ID, lighting, scale, and operator where relevant.
3. Ask the model for visible observations; require it to separate observations from assumptions and state uncertainty.
4. Treat ingredient identification, contamination, microbial safety, assay values, dosage, and regulatory conclusions as triage only. Confirm through qualified lab methods and responsible specialists.
5. Do not upload customer personal data, passwords, API keys, confidential supplier documents, or commercially sensitive formulas to cloud providers unless approved.

## Security and limits

- Local image storage is limited by disk, Docker volumes, and hardware—not literally infinite.
- Local inference avoids per-image OpenAI API charges but uses local compute and electricity; quality can be below hosted frontier models.
- OpenAI API use is optional, separately billed, and subject to API rate limits. A ChatGPT subscription does not include API usage.
- Keep port 3000 local. Do not expose Ollama (11434) or this service to the public internet without a separately reviewed secure deployment.
- Back up both Docker volumes. Never run `docker compose down -v` unless you intend to delete chats, uploads, and model data.

## Operations

Run from this directory:

```sh
docker compose --env-file .env -f docker-compose.yml ps
docker compose --env-file .env -f docker-compose.yml logs -f
docker compose --env-file .env -f docker-compose.yml pull
docker compose --env-file .env -f docker-compose.yml up -d
docker compose --env-file .env -f docker-compose.yml stop
```

## Current implementation status

This PR adds deployment configuration, a Windows installer script, and a GitHub Actions Compose syntax check. It does not execute Docker on the user's PC, inspect local hardware, or validate runtime behavior on that PC. Those steps require access to the target computer.

## Upstream projects

- Open WebUI: https://github.com/open-webui/open-webui
- Ollama: https://github.com/ollama/ollama
- Open WebUI quick start: https://docs.openwebui.com/getting-started/quick-start/
- Ollama vision model: https://ollama.com/library/qwen2.5vl:3b
