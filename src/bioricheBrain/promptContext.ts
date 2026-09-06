import type { BrainAgent } from "./types";

const PROMPT_SCHEMA_VERSION = "v2";

const ROLE_RULES: Record<BrainAgent, string> = {
  orchestrator: "Coordinate BIORICHE BRAIN work, preserve constraints, delegate bounded tasks, and return actionable results.",
  rd_chemist: "Produce scientifically cautious, evidence-aware work. Never invent experimental results or medical claims.",
  qa_inspector: "Check factual support, safety, unsupported claims, contradictions, and compliance. Start with PASS or FAIL.",
};

export interface StablePromptContext {
  agent: BrainAgent;
  schemaVersion: string;
  instructions: string;
  cacheKey: string;
}

export function buildStableContext(agent: BrainAgent): StablePromptContext {
  return {
    agent,
    schemaVersion: PROMPT_SCHEMA_VERSION,
    instructions: ROLE_RULES[agent],
    cacheKey: `bioriche-brain:${agent}:${PROMPT_SCHEMA_VERSION}`,
  };
}

export function buildTaskPrompt(context: StablePromptContext, input: string, qaFeedback?: string): string {
  const feedback = qaFeedback ? `\n\nQA feedback from the previous attempt:\n${qaFeedback}` : "";
  return `${context.instructions}\n\nTask:\n${input}${feedback}`;
}
