import { MCPServerStreamableHttp, createMCPToolStaticFilter } from "@openai/agents";

export interface BioricheMcpConfig {
  url: string;
  name: string;
  allowedTools: string[];
}

export function loadBioricheMcpConfig(): BioricheMcpConfig | undefined {
  const url = process.env.BIORICHEBRAIN_MCP_URL?.trim();
  if (!url) return undefined;

  const allowedTools = (process.env.BIORICHEBRAIN_MCP_TOOLS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (allowedTools.length === 0) return undefined;

  return {
    url,
    name: process.env.BIORICHEBRAIN_MCP_NAME?.trim() || "biorichebrain-mcp",
    allowedTools,
  };
}

/**
 * MCP is opt-in and allowlisted. The server cannot expose arbitrary tools to agents.
 * Write/irreversible MCP actions must be implemented behind BIORICHEBRAIN's approval layer
 * before they are added to the allowlist.
 */
export function createBioricheMcpServer(): MCPServerStreamableHttp | undefined {
  const config = loadBioricheMcpConfig();
  if (!config) return undefined;

  return new MCPServerStreamableHttp({
    url: config.url,
    name: config.name,
    cacheToolsList: true,
    toolFilter: createMCPToolStaticFilter({ allowed: config.allowedTools }),
    timeout: 30_000,
  });
}
