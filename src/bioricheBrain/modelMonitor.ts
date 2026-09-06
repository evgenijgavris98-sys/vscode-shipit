import type { ModelTier } from "./types";

export interface ModelCatalogEntry {
  tier: ModelTier;
  id: string;
  available: boolean;
}

export interface ModelPolicySnapshot {
  refreshedAt: string;
  models: Record<ModelTier, ModelCatalogEntry>;
}

export function refreshModelPolicy(entries: ModelCatalogEntry[]): ModelPolicySnapshot {
  const required: ModelTier[] = ["luna", "terra", "sol", "astra"];
  const byTier = new Map(entries.map((entry) => [entry.tier, entry]));
  const models = Object.fromEntries(required.map((tier) => [tier, byTier.get(tier) ?? {
    tier,
    id: "",
    available: false,
  }])) as Record<ModelTier, ModelCatalogEntry>;
  return { refreshedAt: new Date().toISOString(), models };
}
