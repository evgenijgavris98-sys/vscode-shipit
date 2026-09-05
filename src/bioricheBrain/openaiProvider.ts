import type { AgentRequest, BrainAgent, BrainProvider } from "./types";
import type { BrainConfig } from "./config";

const ROLE_INSTRUCTIONS: Record<BrainAgent, string> = {
  orchestrator: "Coordinate the BIORICHE BRAIN workflow. Delegate work, preserve constraints, and return an actionable result.",
  rd_chemist: "Act as BIORICHE BRAIN R&D Chemist. Produce scientifically cautious, evidence-aware drafts. Do not invent experimental results or medical claims.",
  qa_inspector: "Act as BIORICHE BRAIN QA Inspector. Check factual support, safety, unsupported claims, contradictions, and task compliance. Start with PASS or FAIL and give concise reasons.",
};

interface ResponsesApiResult {
  output_text?: string;
}

export class OpenAIResponsesProvider implements BrainProvider {
  public constructor(private readonly config: BrainConfig) {}

  public async run(agent: BrainAgent, request: AgentRequest): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error("BIORICHE BRAIN requires OPENAI_API_KEY at runtime; no key is stored in the repository.");
    }

    const model = this.config.models[request.tier];
    const feedback = request.qaFeedback
      ? `\n\nQA feedback from the previous attempt:\n${request.qaFeedback}`
      : "";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions: ROLE_INSTRUCTIONS[agent],
        input: `${request.task.input}${feedback}`,
        prompt_cache_key: `bioriche-brain:${agent}:v1`,
        parallel_tool_calls: true,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OpenAI Responses API request failed (${response.status}): ${detail.slice(0, 500)}`);
    }

    const data = (await response.json()) as ResponsesApiResult;
    if (!data.output_text) {
      throw new Error("OpenAI Responses API returned no output_text.");
    }
    return data.output_text;
  }
}
