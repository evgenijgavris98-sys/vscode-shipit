# BIORICHEBRAIN Local Vision — setup and operating guide

## Purpose

A private, self-hosted image/chat workspace for BIORICHEBRAIN R&D: raw-material photos, packaging and label drafts, production observations, and internal reference images. This is a separate interface from chatgpt.com; it does not remove OpenAI ChatGPT plan quotas or grant unlimited GPT-6 access.

## What is included

- Open WebUI: browser interface at http://localhost:3000.
- Ollama: local model runtime; model files persist in the `ollama_data` Docker volume.
- Open WebUI database/uploads persist in `open_webui_data`.
- The web interface is bound to localhost only. Ollama's port is not published to the host/network.

## Requirements

- Windows 10/11, macOS, or Linux supported by Docker Desktop / Docker Engine.
- Docker Desktop (Windows/macOS) or Docker Engine + Compose plugin (Linux).
- Disk space for Docker images, model weights, and uploaded photos. Model size depends on selected model.
- CPU-only operation is possible but can be slow. GPU acceleration depends on compatible hardware and drivers. Hardware has not yet been inspected, so no GPU configuration is assumed.

## Install

1. Copy `.env.example` to `.env`.
2. Replace `REPLACE_WITH_RANDOM_SECRET` with a random secret. Do not share it or commit `.env`.
3. In this directory run:

   ```sh
   docker compose up -d
   docker compose ps
   ```

4. Open http://localhost:3000 and create the first administrator account. Keep the service local; do not expose port 3000 to the internet without HTTPS, authentication hardening, firewall rules, and a reviewed deployment design.

## Add a vision model

After the stack is running:

```sh
docker exec -it biorichebrain-ollama ollama pull qwen2.5vl:3b
```

Then select the downloaded vision model in Open WebUI. Model tags and hardware requirements can change; verify the selected model in Ollama's library before pulling. For stronger analysis, use a larger vision model only if the machine has sufficient RAM/VRAM.

## BIORICHEBRAIN image workflow

1. Create separate collections/workspaces for raw materials, FermExtract process samples, finished products, packaging/labels, and equipment/QC.
2. Upload original photos; preserve an untouched source copy and record date, batch ID, sample ID, lighting, scale, and operator where relevant.
3. Ask the vision model for visible observations only. Require it to distinguish observation from inference and to state uncertainty.
4. For ingredient identification, contamination, microbial safety, assay values, dosage, or regulatory conclusions, treat image analysis as triage only. Confirm by qualified lab methods and responsible specialists.
5. Do not upload customer personal data, passwords, API keys, confidential supplier documents, or commercially sensitive formula details to cloud providers unless approved.

## Limits and privacy

- Local image storage is limited by available disk, Docker volumes, and machine capacity—not literally infinite.
- Local model inference avoids per-image OpenAI API charges but uses local compute and electricity; quality may be below a hosted frontier model.
- Connecting an OpenAI API key is optional and separately billed under API terms/rate limits. It is not included with a ChatGPT subscription and does not bypass limits.
- Do not expose Ollama (11434) to the public internet. Compose intentionally does not publish that port.
- Back up both Docker volumes before upgrades. Never run `docker compose down -v` unless you intend to delete stored chats, uploads, and model data.

## Update / stop

```sh
docker compose pull
docker compose up -d
docker compose stop
```

## Current implementation status

This PR adds deployment configuration and documentation to the BIORICHEBRAIN repository. It does not execute Docker on the user's PC, download model weights, inspect the user's hardware, or validate runtime behavior. Those steps require access to the target computer.

## Upstream projects

- Open WebUI: https://github.com/open-webui/open-webui
- Ollama: https://github.com/ollama/ollama
- Official Open WebUI quick start: https://docs.openwebui.com/getting-started/quick-start/
- Ollama model library: https://ollama.com/library
