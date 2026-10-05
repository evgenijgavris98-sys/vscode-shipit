#!/usr/bin/env bash
set -euo pipefail
ROOT="${BIORICHE_VIDEO_ROOT:-$HOME/bioriche-video}"
mkdir -p "$ROOT" "$ROOT/models" "$ROOT/outputs" "$ROOT/workflows"
cd "$ROOT"

command -v git >/dev/null 2>&1 || { echo "git is required"; exit 1; }

clone_if_missing() {
  local url="$1" dir="$2"
  if [ ! -d "$ROOT/$dir/.git" ]; then git clone "$url" "$ROOT/$dir"; fi
}

clone_if_missing "https://github.com/DeepBeepMeep/Wan2GP.git" "Wan2GP"
clone_if_missing "https://github.com/comfyanonymous/ComfyUI.git" "ComfyUI"
clone_if_missing "https://github.com/thecodacus/rendiv.git" "rendiv"

command -v python3 >/dev/null 2>&1 || echo "WARNING: python3 not found; install Python 3.11+"
command -v node >/dev/null 2>&1 || echo "WARNING: node not found; install Node 18+"
command -v ffmpeg >/dev/null 2>&1 || echo "WARNING: ffmpeg not found; install FFmpeg"

echo "BIORICHE BRAIN free video stack installed in $ROOT"
echo "Primary: Wan2GP/Wan2.2 | Fallback: ComfyUI Wan2.2 5B | Editing: Rendiv"
echo "Model weights are intentionally not auto-downloaded."
