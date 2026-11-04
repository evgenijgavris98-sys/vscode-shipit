$ErrorActionPreference = "Stop"
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Here

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker CLI not found. Install and start Docker Desktop, then rerun this script."
}
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  throw "Docker Engine is not running. Start Docker Desktop and rerun."
}

if (-not (Test-Path ".env")) {
  $secretBytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($secretBytes)
  $secret = [Convert]::ToHexString($secretBytes).ToLowerInvariant()
  Set-Content -Path ".env" -Value "WEBUI_SECRET_KEY=$secret" -Encoding ascii
  Write-Host "Created local .env with a random secret. Keep it private; do not commit it."
}

Write-Host "Starting BIORICHEBRAIN Local Vision containers..."
docker compose --env-file ".env" -f "docker-compose.yml" up -d
if ($LASTEXITCODE -ne 0) { throw "Docker Compose failed to start." }

Write-Host "Downloading the compact Qwen vision model (about 3.2 GB)..."
docker exec biorichebrain-ollama ollama pull qwen2.5vl:3b
if ($LASTEXITCODE -ne 0) { throw "Model download failed. Check internet access and rerun this script." }

Write-Host "Waiting for Open WebUI..."
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 3
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { $ready = $true; break }
  } catch { Start-Sleep -Seconds 2 }
}
if (-not $ready) {
  Write-Warning "Containers started, but health endpoint did not respond yet. Check: docker compose logs"
} else {
  Write-Host "Open WebUI is available at http://localhost:3000"
  Start-Process "http://localhost:3000"
}
