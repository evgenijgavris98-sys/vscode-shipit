# BIORICHEBRAIN Video Department

## Purpose

Turn one approved creative brief into reviewable video assets for vertical, landscape and square channels. The department is a set of specialist roles routed through the existing BIORICHEBRAIN runtime, not a separate orchestration framework.

## Canonical pipeline

BRIEF → SCRIPT → STORYBOARD → GENERATION → VOICE → EDITING → SUBTITLES → LOCALIZATION → QA → EXPORT

The pipeline contract is in `src/bioricheBrain/videoDepartment.ts`. The existing local job manifest/toolchain remains in `src/bioricheBrain/videoAgent.ts`; do not create a competing job schema.

## Roles

- VIDEO DIRECTOR — creative direction, shot list and visual continuity.
- VIDEO SCRIPTWRITER — hooks, scripts and platform variants.
- STORYBOARD AGENT — camera, composition and keyframes.
- VIDEO GENERATOR — prompts and bounded jobs for approved local backends.
- VOICE & AVATAR AGENT — approved TTS/voice/lip-sync coordination; voice cloning requires consent.
- VIDEO EDITOR — deterministic edit plan, sound, subtitles and exports.
- SUBTITLE & LOCALIZATION — timing, translation and language variants.
- VIDEO QA — independent check of image, audio, text, dimensions, product depiction and claims.

## Runtime and security

- The eight roles are registered and routed through the current provider abstraction.
- Video roles do not receive shell, deployment, procurement or GitHub write permissions by default.
- Generation is optional; GPU/model downloads must not be required for CI.
- Use local WanGP / ComfyUI / LTX backends only after local hardware and model requirements are validated.
- FFmpeg is suitable for deterministic processing when installed; never assume it exists on the user's device.
- No paid endpoint, public upload, marketplace publication or external write without explicit human approval.
- Product images and approved label artwork are authoritative. Do not invent dosage, label text, certifications or efficacy claims.
- VIDEO QA must be independent of the generation agent. Claims are routed through the regulatory gate.

## Acceptance checks

1. Registry IDs are unique and all provider role maps cover every `BrainAgent`.
2. Pipeline stages are ordered and not duplicated.
3. Video roles cannot invoke `shell.execute` or external-write tools without explicit authorization.
4. CI validates compile, lint and tests without downloading model weights or invoking GPU workloads.
5. Final exports are checked for dimensions, duration, audio/subtitles, packshot fidelity and approval status.
