# BIORICHEBRAIN — Free Video Production Pipeline

Status: implemented as a local-first architecture in this repository.

## Pipeline

BIORICHEBRAIN Orchestrator -> VIDEO AGENT -> WanGP / Wan 2.2 -> Rendiv + FFmpeg -> local transcription/TTS -> QA -> 9:16 / 16:9 / 1:1 exports.

OpenArt is not part of the default path and remains an optional premium fallback.

## Default generation

Primary model: Wan 2.2 TI2V-5B.

The official Wan 2.2 project documents TI2V-5B as a text-to-video and image-to-video model supporting 720p/24fps and states that its models are Apache 2.0 licensed.

WanGP is the preferred low-VRAM launcher. ComfyUI remains the workflow alternative.

## Editing

Rendiv is the default programmable editor. FFmpeg is the media-processing backend.

Required stages:
1. scene generation
2. scene selection/retry
3. voiceover
4. subtitle timing
5. music/sound bed
6. product packshot
7. claims/compliance QA
8. render
9. format exports
10. final artifact checksum

## VIDEO AGENT

- converts a brief into a shot list
- creates generation prompts
- requests text-to-video or image-to-video jobs
- tracks scene IDs and retries
- hands clips to the editor
- requests local voice/TTS and subtitles
- runs deterministic export/QA
- never publishes externally without the existing approval gate

## НЕЙРОСЕНАП first preset

- vertical 9:16
- 15–30 seconds
- premium realistic BIORICHE visual language
- product/hero focus
- no price/rating/review overlays
- final bottle packshot
- voiceover + subtitles
- one master rendered into multiple formats

All health/product claims must pass the existing BIORICHE regulatory approval gate.

## Free/local policy

Paid generation endpoints are disabled by default. Model weights and credentials are never stored in Git.

See scripts/video/install-free-video-stack.sh for the local setup.
