# BIORICHEBRAIN Web MCP Stack

The reference image maps to Exa, Firecrawl, Playwright and Stagehand.

## Adopted

- Exa hosted MCP: https://mcp.exa.ai/mcp
  - web_search_exa
  - web_fetch_exa
- Firecrawl hosted MCP: https://mcp.firecrawl.dev/v2/mcp
  - firecrawl_search
  - firecrawl_scrape
  - firecrawl_parse
- Playwright MCP: local stdio via `npx -y @playwright/mcp@latest --headless --caps=core`
  - browser_navigate
  - browser_snapshot
  - browser_take_screenshot
  - browser_tabs

Activation is deny-by-default. Explicitly set `BIORICHEBRAIN_MCP_PRESETS=exa,firecrawl,playwright` to enable the stack.

## Stagehand decision

Stagehand is not added as a dependency. It is a useful MIT-licensed TypeScript browser SDK, but adding it now would create a second browser execution layer beside Playwright MCP and would weaken the single MCP capability boundary. Revisit only if a concrete workload shows that Playwright cannot satisfy the required browser behavior.

## Security

- No API keys are committed.
- Remote MCP tools are allowlisted.
- Browser mutation/input capabilities are not enabled.
- MCP tool names are server-prefixed by the OpenAI Agents SDK configuration.
- Existing BIORICHEBRAIN approval and audit controls remain authoritative for writes and irreversible actions.
