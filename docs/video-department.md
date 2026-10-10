# BIORICHEBRAIN Video Department

## Purpose
Turn an approved creative brief into reviewable video assets for vertical, landscape and square channels. These specialist roles use the existing BIORICHEBRAIN runtime; they do not introduce a second orchestration framework.

## Canonical pipeline
BRIEF → SCRIPT → STORYBOARD → GENERATION → VOICE → EDITING → SUBTITLES → LOCALIZATION → QA → EXPORT

The stage contract is in `src/bioricheBrain/videoDepartment.ts`. The existing local job manifest and toolchain remain in `src/bioricheBrain/videoAgent.ts`; do not create a competing job schema.

## Roles
- **VIDEO DIRECTOR** (`video_director`) — Turn approved briefs into coherent shot lists and visual direction.
- **VIDEO SCRIPTWRITER** (`video_scriptwriter`) — Write evidence-safe scripts, hooks, calls to action and channel variants.
- **STORYBOARD AGENT** (`storyboard_agent`) — Specify scene composition, camera, keyframes and continuity.
- **VIDEO GENERATOR** (`video_generator`) — Prepare bounded generation jobs for approved local video backends.
- **VOICE & AVATAR AGENT** (`voice_avatar_agent`) — Coordinate approved local TTS, voice and lip-sync steps.
- **VIDEO EDITOR** (`video_editor`) — Plan deterministic edits, subtitles, sound and multi-format exports.
- **SUBTITLE & LOCALIZATION** (`subtitle_localization`) — Create and QA subtitle timing, translations and platform variants.
- **VIDEO QA** (`video_qa`) — Independently verify video frames, audio, subtitles, format and product-claim compliance.

## Safety
- Video roles do not receive shell, deployment, procurement or GitHub-write capabilities by default.
- GPU/model downloads are excluded from CI; local hardware compatibility must be checked on the target device.
- Paid endpoints, public uploads and external publication require explicit approval.
- Approved packshots and label artwork are authoritative. Do not invent dosage, certifications, label text or efficacy claims.
- VIDEO QA is independent from the generation role and routes product claims through regulatory review.

## Acceptance checks
1. Provider role maps cover every registered `BrainAgent`.
2. Pipeline stages are ordered and not duplicated.
3. Video roles cannot invoke `shell.execute` without explicit authorization.
4. CI compiles, lints and tests without GPU/model downloads.
5. Exports are checked for dimensions, duration, audio/subtitles, product depiction and approval state.
