$ErrorActionPreference = "Stop"
$Root = if ($env:BIORICHE_VIDEO_ROOT) { $env:BIORICHE_VIDEO_ROOT } else { Join-Path $HOME "bioriche-video" }
New-Item -ItemType Directory -Force -Path $Root | Out-Null
Set-Location $Root

function Need($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Warning "$name is not installed. Install it, then rerun this script."
    return $false
  }
  return $true
}

Need "git" | Out-Null
Need "python" | Out-Null
Need "node" | Out-Null

if (-not (Test-Path "$Root/Wan2GP")) {
  git clone https://github.com/DeepBeepMeep/Wan2GP.git "$Root/Wan2GP"
}
if (-not (Test-Path "$Root/rendiv")) {
  git clone https://github.com/thecodacus/rendiv.git "$Root/rendiv"
}
if (-not (Test-Path "$Root/ComfyUI")) {
  git clone https://github.com/comfyanonymous/ComfyUI.git "$Root/ComfyUI"
}

Write-Host ""
Write-Host "BIORICHE BRAIN free video stack installed:"
Write-Host "  Wan2GP: $Root/Wan2GP"
Write-Host "  ComfyUI: $Root/ComfyUI"
Write-Host "  Rendiv:  $Root/rendiv"
Write-Host ""
Write-Host "Next: install GPU/Python dependencies and model weights locally."
Write-Host "Wan2GP is local-first; ComfyUI Wan2.2 5B is the low-VRAM fallback."
