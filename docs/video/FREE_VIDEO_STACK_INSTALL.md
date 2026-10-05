# BIORICHE BRAIN — Free Video Stack

## Components

- **Wan2GP / Wan2.2** — local video generation.
- **ComfyUI** — workflow and automation fallback.
- **Rendiv** — Apache-2.0 code-first video editor for AI agents.
- **FFmpeg** — encoding/muxing.
- **Local TTS/transcription** — optional voice and subtitles.

## Bootstrap

Linux/macOS:
```bash
chmod +x scripts/video/install-free-video-stack.sh
./scripts/video/install-free-video-stack.sh
```

Windows PowerShell:
```powershell
Set-ExecutionPolicy -Scope Process Bypass
./scripts/video/install-free-video-stack.ps1
```

The scripts clone the repositories but intentionally do not download multi-gigabyte model weights. This avoids filling the disk and keeps weights outside Git.

## Current verified choices

Wan2GP states that it is free to use locally and supports Wan 2.1/2.2. ComfyUI documentation provides a native Wan2.2 TI2V 5B workflow and notes that the 5B workflow can fit around 8 GB VRAM with native offloading. Rendiv is open source under Apache-2.0.

## Limitation

The GitHub integration can modify BIORICHE BRAIN and prepare installers, but it cannot remotely install software onto a physical phone/PC/GPU. The bootstrap must be executed on the target machine.

## BIORICHE BRAIN pipeline

ORCHESTRATOR → VIDEO AGENT → Wan2GP/Wan2.2 → Rendiv + FFmpeg → local voice/subtitles → QA → 9:16 export.

НЕЙРОСЕНАП preset: `docs/video/neurosenap-9x16-job.json`.
