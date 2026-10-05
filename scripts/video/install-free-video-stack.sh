#!/usr/bin/env bash
set -euo pipefail

ROOT="${BIORICHE_VIDEO_ROOT:-$HOME/bioriche-video}"
mkdir -p "$ROOT" "$ROOT/models" "$ROOT/outputs" "$ROOT/workflows"

echo "BIORICHEBRAIN free video stack"
echo "Root: $ROOT"

command -v git >/dev/null || { echo "Missing git"; exit 1; }
command -v python3 >/dev/null || { echo "Missing python3"; exit 1; }
command -v ffmpeg >/dev/null || { echo "Missing ffmpeg"; exit 1; }
command -v node >/dev/null || { echo "Missing node"; exit 1; }

if [ ! -d "$ROOT/Wan2GP" ]; then
  git clone --depth 1 https://github.com/deepbeepmeep/Wan2GP.git "$ROOT/Wan2GP" || {
    echo "WanGP clone failed; use the current upstream repository URL from the pipeline documentation."
    exit 1
  }
fi

echo "Software layer ready."
echo "Install the Python dependencies required by the selected WanGP release."
echo "Launch WanGP and let its model manager select the appropriate Wan 2.2 checkpoint."
echo "For editing: npx create-rendiv bioriche-video"
echo "Keep model weights outside Git. No paid API is required by this stack."
