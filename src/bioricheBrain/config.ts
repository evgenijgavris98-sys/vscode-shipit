import type { ModelTier } from "./types";

const DEFAULT_MODELS: Record<ModelTier, string> = {
  luna: "gpt-5.6-luna",
  terra: "gpt-5.6-terra",
  sol: "gpt-5.6-sol",
  astra: "gpt-6-astra",
};

export type ReasoningEffort = "low" | "medium" | "high" | "xhigh" | "max";
export type BrainProviderId = "openai" | "kimi" | "qwen" | "claude" | "deepseek";

export interface BrainConfig {
  enabled: boolean;
  provider: BrainProviderId;
  apiKey?: string;
  kimiApiKey?: string;
  kimiBaseUrl: string;
  kimiModel: string;
  kimiCliPath: string;
  kimiMcpUrl?: string;
  kimiMcpTools: string[];
  qwenCliPath: string;
  qwenModel: string;
  claudeCliPath: string;
  claudeModel: string;
  deepseekApiKey?: string;
  deepseekBaseUrl: string;
  deepseekModel: string;
  models: Record<ModelTier, string>;
  reasoningEffort: ReasoningEffort;
  fastMode: boolean;
  astraEnabled: boolean;
  maxQaRetries: number;
}

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function reasoningEffort(): ReasoningEffort {
  const value = env("BIORICHE_BRAIN_REASONING_EFFORT");
  return value === "low" || value === "high" || value === "xhigh" || value === "max" ? value : "medium";
}

function booleanEnv(name: string, fallback: boolean): boolean {
  const value = env(name)?.toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function qaRetries(): number {
  const raw = env("BIORICHE_BRAIN_MAX_QA_RETRIES");
  if (!raw) return 1;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(3, Math.max(0, Math.floor(parsed)));
}

export function loadBrainConfig(enabledOverride?: boolean): BrainConfig {
  const provider = env("BIORICHE_BRAIN_PROVIDER");
  return {
    enabled: enabledOverride ?? booleanEnv("BIORICHE_BRAIN_ENABLED", false),
    apiKey: env("OPENAI_API_KEY"),
    provider: provider === "kimi" ? "kimi" : provider === "qwen" ? "qwen" : provider === "claude" ? "claude" : provider === "deepseek" ? "deepseek" : "openai",
    kimiApiKey: env("KIMI_API_KEY"),
    kimiBaseUrl: env("KIMI_BASE_URL") ?? "https://api.kimi.com/coding/v1",
    kimiModel: env("KIMI_MODEL") ?? "kimi-k2.5",
    kimiCliPath: env("KIMI_CLI_PATH") ?? "kimi",
    kimiMcpUrl: env("KIMI_MCP_URL"),
    kimiMcpTools: (env("KIMI_MCP_TOOLS") ?? "").split(",").map((v) => v.trim()).filter(Boolean),
    qwenCliPath: env("QWEN_CLI_PATH") ?? "qwen",
    qwenModel: env("QWEN_MODEL") ?? "qwen3-coder-plus",
    claudeCliPath: env("CLAUDE_CLI_PATH") ?? "claude",
    claudeModel: env("CLAUDE_MODEL") ?? "sonnet",
    deepseekApiKey: env("DEEPSEEK_API_KEY"),
    deepseekBaseUrl: env("DEEPSEEK_BASE_URL") ?? "https://api.deepseek.com",
    deepseekModel: env("DEEPSEEK_MODEL") ?? "deepseek-v4-pro",
    models: {
      luna: env("BIORICHE_BRAIN_MODEL_LUNA") ?? DEFAULT_MODELS.luna,
      terra: env("BIORICHE_BRAIN_MODEL_TERRA") ?? DEFAULT_MODELS.terra,
      sol: env("BIORICHE_BRAIN_MODEL_SOL") ?? DEFAULT_MODELS.sol,
      astra: env("BIORICHE_BRAIN_MODEL_ASTRA") ?? DEFAULT_MODELS.astra,
    },
    reasoningEffort: reasoningEffort(),
    fastMode: booleanEnv("BIORICHE_BRAIN_FAST_MODE", false),
    astraEnabled: booleanEnv("BIORICHE_BRAIN_ASTRA_ENABLED", false),
    maxQaRetries: qaRetries(),
  };
}
