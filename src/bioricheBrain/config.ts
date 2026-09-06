import type { ModelTier } from "./types";

const DEFAULT_MODELS: Record<ModelTier, string> = {
  luna: "gpt-5.6-luna",
  terra: "gpt-5.6-terra",
  sol: "gpt-5.6-sol",
  astra: "gpt-6-astra",
};

export interface BrainConfig {
  enabled: boolean;
  provider: "copilot" | "openai";
  apiKey?: string;
  models: Record<ModelTier, string>;
  astraEnabled: boolean;
  maxQaRetries: number;
  maxProviderRetries: number;
  maxConcurrency: number;
  parallelToolCalls: boolean;
}

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function boundedInt(name: string, fallback: number, max: number): number {
  const parsed = Number(env(name) ?? String(fallback));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(0, Math.floor(parsed)));
}

export function loadBrainConfig(): BrainConfig {
  return {
    enabled: env("BIORICHE_BRAIN_ENABLED") === "true",
    provider: env("BIORICHE_BRAIN_PROVIDER") === "openai" ? "openai" : "copilot",
    apiKey: env("OPENAI_API_KEY"),
    models: {
      luna: env("BIORICHE_BRAIN_MODEL_LUNA") ?? DEFAULT_MODELS.luna,
      terra: env("BIORICHE_BRAIN_MODEL_TERRA") ?? DEFAULT_MODELS.terra,
      sol: env("BIORICHE_BRAIN_MODEL_SOL") ?? DEFAULT_MODELS.sol,
      astra: env("BIORICHE_BRAIN_MODEL_ASTRA") ?? DEFAULT_MODELS.astra,
    },
    astraEnabled: env("BIORICHE_BRAIN_ASTRA_ENABLED") === "true",
    maxQaRetries: boundedInt("BIORICHE_BRAIN_MAX_QA_RETRIES", 1, 5),
    maxProviderRetries: boundedInt("BIORICHE_BRAIN_MAX_PROVIDER_RETRIES", 2, 5),
    maxConcurrency: Math.max(1, boundedInt("BIORICHE_BRAIN_MAX_CONCURRENCY", 2, 8)),
    parallelToolCalls: env("BIORICHE_BRAIN_PARALLEL_TOOL_CALLS") !== "false",
  };
}
