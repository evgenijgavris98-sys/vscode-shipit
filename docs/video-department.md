# BIORICHEBRAIN — VIDEO DEPARTMENT

## Mission
Turn one approved brief into production-ready BIORICHE video assets for Reels, Shorts, TikTok, VK, Ozon/WB and web.

## Pipeline
BRIEF → SCRIPT → STORYBOARD → GENERATION → VOICE → EDITING → SUBTITLES → LOCALIZATION → QA → EXPORT

## Core stack
- ComfyUI as the workflow/runtime layer.
- Wan 2.2 for cinematic text/image-to-video.
- LTX-Video as a fast alternative.
- ComfyUI MCP as the controlled agent bridge.
- FFmpeg for deterministic rendering/transcoding.
- Whisper for speech-to-text and subtitle generation.
- TTS/lip-sync providers through an allowlisted MCP/tool layer.

## Agent roles
1. VIDEO DIRECTOR — creative brief, shot list, visual continuity.
2. VIDEO SCRIPTWRITER — hooks, scripts, CTA and platform variants.
3. STORYBOARD AGENT — keyframes, camera, composition and motion instructions.
4. VIDEO GENERATOR — ComfyUI workflows and model selection.
5. VOICE & AVATAR AGENT — voice, dialogue and lip-sync.
6. VIDEO EDITOR — cuts, pacing, B-roll, music and graphics.
7. SUBTITLE & LOCALIZATION — captions and language variants.
8. VIDEO QA — visual/text/audio/brand checks and final release gate.

## Safety
Generation is read/compute work. Publication, paid promotion, purchases, credential changes and irreversible external actions remain behind BIORICHEBRAIN approval gates.

## Default routing
- Critical creative orchestration: Astra.
- Production reasoning: Sol.
- High-volume/low-risk transformations: Terra/Luna according to existing project routing.
- Video QA must be independent from the generating agent.

## Product consistency
For BIORICHE product videos, the source product image/reference is authoritative. The generator must not invent label text, dosage, regulatory claims or product attributes. Any claims are routed through regulatory/QA review.
