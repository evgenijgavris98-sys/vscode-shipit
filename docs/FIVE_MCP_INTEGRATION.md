# BIORICHEBRAIN — five MCP integrations

This repository now includes a portable Copilot MCP configuration at the repository root: `.mcp.json`.

## Included servers

| Server | Transport / endpoint | Authentication | Purpose |
|---|---|---|---|
| Playwright | local stdio, `npx @playwright/mcp@latest` | none by default | isolated browser automation and repeatable QA |
| Firecrawl | hosted `https://mcp.firecrawl.dev/v2/mcp` | keyless free tier; limited tools | web search, scrape and parse |
| Glif | hosted `https://glif.app/api/mcp` | Glif OAuth sign-in | image, video, audio and creative workflows |
| Perplexity | hosted `https://api.perplexity.ai/mcp` | personal API key via `PERPLEXITY_API_KEY` | search, research and reasoning |
| Chrome MCP | local `http://127.0.0.1:12306/mcp` | local Chrome extension/bridge | operate the user's existing Chrome profile |

## Important security and cost notes

- Do not copy API keys from public GitHub commits, gists, paste sites, or other people's repositories. Publicly exposed credentials are not legitimate shared keys; they may be stolen, revoked, or billed to someone else.
- No secrets are committed in this repository. Set `PERPLEXITY_API_KEY` in the environment of the machine/process that launches the Copilot/VS Code MCP client. Never put it in `.mcp.json`, source code, PR comments, or chat.
- Firecrawl's hosted keyless endpoint currently exposes a limited free surface (search, scrape, parse) with usage limits. More tools require an authenticated account/API key.
- Glif uses OAuth and media generation can consume account credits. Sign in only when you intend to use it.
- Playwright and Chrome MCP are separate browser paths. Use Playwright for isolated test sessions; use Chrome MCP only when you intentionally want access to the logged-in Chrome profile. Do not run destructive actions or submit purchases without human confirmation.
- MCP trust and tool-call approval remain separate from authentication. Review each server's tools and grant only the permissions required.

## Finish setup on the workstation

### 1. VS Code / Copilot

1. Open this repository in VS Code with GitHub Copilot Chat installed and signed in.
2. Open the repository root and allow VS Code/Copilot to discover `.mcp.json`.
3. Review and trust the five server entries. VS Code may prompt separately for Glif OAuth.
4. For Perplexity, set `PERPLEXITY_API_KEY` in the environment used to launch VS Code/Copilot, then fully restart that host. Obtain a personal key from the official Perplexity API portal: https://www.perplexity.ai/settings/api
5. Start the MCP servers from the MCP server management view and verify the available tools.

### 2. Playwright

Node.js 20+ is required. The `npx` entry downloads/runs the official MCP package on first launch. On first browser use, Playwright may download its browser runtime. This is a workstation action; a GitHub commit cannot install it on your computer.

### 3. Firecrawl

The keyless endpoint is configured immediately for its limited free tools. For higher limits and crawl/map/agent features, create your own account/key at https://www.firecrawl.dev/app/api-keys and store it in a local secret manager/environment variable; do not commit it.

### 4. Glif

On first connection, complete the OAuth sign-in in the browser. Review the account and credit policy at https://glif.app/pricing before generating media.

### 5. Chrome MCP (existing Chrome profile)

This integration requires a local Chrome extension and bridge; the GitHub repository cannot install the extension into your browser remotely.

1. Download the latest extension release from https://github.com/hangwin/mcp-chrome/releases.
2. In Chrome, open `chrome://extensions`, enable Developer mode, and load the downloaded extension folder (follow the upstream release instructions).
3. Install Node.js 20+ if needed, then run `npm install -g mcp-chrome-bridge`.
4. Open the extension and click Connect. Confirm that the bridge listens on `127.0.0.1:12306`.
5. Restart/reload the MCP client. If the bridge reports a different local endpoint, update the `chrome.url` value in `.mcp.json` to the endpoint shown by the extension.

Upstream project: https://github.com/hangwin/mcp-chrome

## Recommended BIORICHEBRAIN routing

- Research / regulatory watch / ingredient evidence: Perplexity + Firecrawl.
- Website and marketplace inspection: Playwright.
- Existing authenticated browser workflows: Chrome MCP, only with explicit user approval for consequential actions.
- Creative assets and video experiments: Glif, subject to account credits.
- QA: Playwright first; Chrome MCP only for real-session checks.

## Status boundary

The repository configuration is prepared, but remote OAuth consent, local package installation, Chrome extension loading, and a personal Perplexity API credential must be completed on the user's workstation/account. Those steps cannot be truthfully marked connected from a GitHub repository edit alone.
