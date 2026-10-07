import {
  MCPServerStdio,
  MCPServerStreamableHttp,
  createMCPToolStaticFilter,
} from "@openai/agents";

export interface BioricheMcpConfig {
  url: string;
  name: string;
  allowedTools: string[];
  headers?: Record<string, string>;
}

export interface BioricheMcpPreset {
  id: "exa" | "firecrawl" | "playwright";
  name: string;
  transport: "streamable-http" | "stdio";
  url?: string;
  fullCommand?: string;
  allowedTools: string[];
}

const PRESETS: Record<BioricheMcpPreset["id"], BioricheMcpPreset> = {
  exa: {
    id: "exa",
    name: "BIORICHEBRAIN Exa",
    transport: "streamable-http",
    url: "https://mcp.exa.ai/mcp",
    allowedTools: ["web_search_exa", "web_fetch_exa"],
  },
  firecrawl: {
    id: "firecrawl",
    name: "BIORICHEBRAIN Firecrawl",
    transport: "streamable-http",
    url: "https://mcp.firecrawl.dev/v2/mcp",
    allowedTools: ["firecrawl_search", "firecrawl_scrape", "firecrawl_parse"],
  },
  playwright: {
    id: "playwright",
    name: "BIORICHEBRAIN Playwright",
    transport: "stdio",
    fullCommand: "npx -y @playwright/mcp@0.0.83 --headless --caps=core --no-webmcp",
    allowedTools: [
      "browser_navigate",
      "browser_snapshot",
      "browser_take_screenshot",
      "browser_tabs",
    ],
  },
};

function csvEnv(name: string): string[] {
  return (process.env[name] ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Optional built-in MCP connectors. Nothing is enabled unless explicitly listed
 * in BIORICHEBRAIN_MCP_PRESETS, preserving deny-by-default network/process behavior.
 *
 * The preset surface is read-only by default. Mutating browser/input capabilities
 * must be added only behind BIORICHEBRAIN approval/audit controls.
 */
export function createBioricheMcpServers() {
  const presetIds = csvEnv("BIORICHEBRAIN_MCP_PRESETS") as BioricheMcpPreset["id"][];
  const servers = [];

  for (const id of presetIds) {
    const preset = PRESETS[id];
    if (!preset) continue;

    const toolFilter = createMCPToolStaticFilter({ allowed: preset.allowedTools });

    if (preset.transport === "stdio") {
      servers.push(
        new MCPServerStdio({
          name: preset.name,
          fullCommand: preset.fullCommand!,
          cacheToolsList: true,
          toolFilter,
          timeout: 30_000,
        }),
      );
      continue;
    }

    const headers: Record<string, string> = {};
    if (id === "firecrawl" && process.env.FIRECRAWL_API_KEY?.trim()) {
      headers.Authorization = `Bearer ${process.env.FIRECRAWL_API_KEY.trim()}`;
    }
    if (id === "exa" && process.env.EXA_API_KEY?.trim()) {
      headers.Authorization = `Bearer ${process.env.EXA_API_KEY.trim()}`;
    }

    servers.push(
      new MCPServerStreamableHttp({
        url: preset.url!,
        name: preset.name,
        cacheToolsList: true,
        toolFilter,
        timeout: 30_000,
        ...(Object.keys(headers).length > 0 ? { requestInit: { headers } } : {}),
      }),
    );
  }

  const custom = loadBioricheMcpConfig();
  if (custom) {
    servers.push(
      new MCPServerStreamableHttp({
        url: custom.url,
        name: custom.name,
        cacheToolsList: true,
        toolFilter: createMCPToolStaticFilter({ allowed: custom.allowedTools }),
        timeout: 30_000,
        ...(custom.headers ? { requestInit: { headers: custom.headers } } : {}),
      }),
    );
  }

  return servers;
}

export function loadBioricheMcpConfig(): BioricheMcpConfig | undefined {
  const url = process.env.BIORICHEBRAIN_MCP_URL?.trim();
  if (!url) return undefined;

  const allowedTools = csvEnv("BIORICHEBRAIN_MCP_TOOLS");
  if (allowedTools.length === 0) return undefined;

  const headers: Record<string, string> = {};
  if (process.env.BIORICHEBRAIN_MCP_AUTH?.trim()) {
    headers.Authorization = process.env.BIORICHEBRAIN_MCP_AUTH.trim();
  }

  return {
    url,
    name: process.env.BIORICHEBRAIN_MCP_NAME?.trim() || "biorichebrain-mcp",
    allowedTools,
    ...(Object.keys(headers).length > 0 ? { headers } : {}),
  };
}

/** Backward-compatible single-server helper for callers that need one server. */
export function createBioricheMcpServer() {
  return createBioricheMcpServers()[0];
}
