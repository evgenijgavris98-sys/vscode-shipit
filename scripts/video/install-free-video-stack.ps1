$ErrorActionPreference = "Stop"
$Root = if ($env:BIORICHE_VIDEO_ROOT) { $env:BIORICHE_VIDEO_ROOT } else { Join-Path $HOME "bioriche-video" }
New-Item -ItemType Directory -Force -Path $Root | Out-Null
Set-Location $Root

function Clone-IfMissing($url, $dir) {
  if (-not (Test-Path "$Root/$dir/.git")) { git clone $url "$Root/$dir" }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "git is required" }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { Write-Warning "python not found; install Python 3.11+ and rerun" }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Warning "node not found; install Node 18+ and rerun" }

Clone-IfMissing "https://github.com/DeepBeepMeep/Wan2GP.git" "Wan2GP"
Clone-IfMissing "https://github.com/comfyanonymous/ComfyUI.git" "ComfyUI"
Clone-IfMissing "https://github.com/thecodacus/rendiv.git" "rendiv"

New-Item -ItemType Directory -Force -Path "$Root/models","$Root/outputs","$Root/workflows" | Out-Null
Write-Host "BIORICHE BRAIN free video stack installed in $Root"
Write-Host "Primary: Wan2GP/Wan2.2 | Fallback: ComfyUI Wan2.2 5B | Editing: Rendiv"
Write-Host "Model weights are intentionally not auto-downloaded."
