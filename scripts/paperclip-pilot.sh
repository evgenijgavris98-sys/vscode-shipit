#!/usr/bin/env bash
set -euo pipefail

# Safe, user-initiated local Paperclip pilot bootstrap.
# No production credentials or external integrations are configured here.

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 24.11+ is required. Install it from https://nodejs.org/ and rerun." >&2
  exit 1
fi

node -e '
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 24 || (major === 24 && minor < 11)) {
  console.error("Paperclip quickstart requires Node.js 24.11+. Current: " + process.versions.node);
  process.exit(1);
}
'

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is missing. Install a current Node.js/npm distribution and rerun." >&2
  exit 1
fi

version="${PAPERCLIP_VERSION:-latest}"
echo "Starting isolated Paperclip onboarding (paperclipai@${version})."
echo "Upstream quickstart defaults to trusted local loopback mode."
echo "No BIORICHEBRAIN production credentials or integrations will be configured by this helper."
exec npx --yes "paperclipai@${version}" onboard --yes
