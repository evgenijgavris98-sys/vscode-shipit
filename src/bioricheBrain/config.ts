import type { ModelTier } from "./types";

const DEFAULT_MODELS: Record<ModelTier, string> = {
  luna: "gpt-5.6-luna",
  terra: "gpt-5.6-terra",
  sol: "gpt-5.6-sol",
  astra: "gpt-6-astra",
};

export type ReasoningEffort = "low" | "medium" | "high" | "xhigh";

export interface BrainConfig {
  enabled: boolean;
  apiKey?: string;
  models: Record<ModelTier, string>;
  reasoningEffort: ReasoningEffort;
  fastMode: boolean;
  maxQaRetries: number;
}

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function reasoningEffort(): ReasoningEffort {
  const value = env("BIORICHE_BRAIN_REASONING_EFFORT");
  return value === "low" || value === "high" || value === "xhigh" ? value : "medium";
}

function booleanEnv(name: string, fallback: boolean): boolean {
  const value = env(name)?.toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export function loadBrainConfig(): BrainConfig {
  return {
    enabled: booleanEnv("BIORICHE_BRAIN_ENABLED", false),
    apiKey: env("OPENAI_API_KEY"),
    models: {
      luna: env("BIORICHE_BRAIN_MODEL_LUNA") ?? DEFAULT_MODELS.luna,
      terra: env("BIORICHE_BRAIN_MODEL_TERRA") ?? DEFAULT_MODELS.terra,
      sol: env("BIORICHE_BRAIN_MODEL_SOL") ?? DEFAULT_MODELS.sol,
      astra: env("BIORICHE_BRAIN_MODEL_ASTRA") ?? DEFAULT_MODELS.astra,
    },
    reasoningEffort: reasoningEffort(),
    fastMode: booleanEnv("BIORICHE_BRAIN_FAST_MODE", false),
    maxQaRetries: Math.min(3, Math.max(0, Number(env("BIORICHE_BRAIN_MAX_QA_RETRIES") ?? "1"))),
  };
}
