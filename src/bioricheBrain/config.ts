import type { ModelTier } from "./types";

const DEFAULT_MODELS: Record<ModelTier, string> = {
  luna: "gpt-5.6-luna",
  terra: "gpt-5.6-terra",
  sol: "gpt-5.6-sol",
  astra: "gpt-6-astra",
};

export interface BrainConfig {
  enabled: boolean;
  apiKey?: string;
  models: Record<ModelTier, string>;
  maxQaRetries: number;
}

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function loadBrainConfig(): BrainConfig {
  return {
    enabled: env("BIORICHE_BRAIN_ENABLED") === "true",
    apiKey: env("OPENAI_API_KEY"),
    models: {
      luna: env("BIORICHE_BRAIN_MODEL_LUNA") ?? DEFAULT_MODELS.luna,
      terra: env("BIORICHE_BRAIN_MODEL_TERRA") ?? DEFAULT_MODELS.terra,
      sol: env("BIORICHE_BRAIN_MODEL_SOL") ?? DEFAULT_MODELS.sol,
      astra: env("BIORICHE_BRAIN_MODEL_ASTRA") ?? DEFAULT_MODELS.astra,
    },
    maxQaRetries: Math.max(0, Number(env("BIORICHE_BRAIN_MAX_QA_RETRIES") ?? "1")),
  };
}
