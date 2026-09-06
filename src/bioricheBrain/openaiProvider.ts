import type { AgentRequest, BrainAgent, BrainProvider } from "./types";
import type { BrainConfig } from "./config";
import { buildStableContext, buildTaskPrompt } from "./promptContext";

interface ResponsesApiResult {
  output_text?: string;
}

export class OpenAIResponsesProvider implements BrainProvider {
  public constructor(private readonly config: BrainConfig) {}

  public async run(agent: BrainAgent, request: AgentRequest): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error("BIORICHE BRAIN requires OPENAI_API_KEY at runtime; no key is stored in the repository.");
    }

    const context = buildStableContext(agent);
    const body: Record<string, unknown> = {
      model: this.config.models[request.tier],
      instructions: context.instructions,
      input: buildTaskPrompt(context, request.task.input, request.qaFeedback),
      prompt_cache_key: context.cacheKey,
      parallel_tool_calls: this.config.parallelToolCalls,
    };

    if (request.reasoningEffort && request.tier !== "luna") {
      body.reasoning = { effort: request.reasoningEffort };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
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
