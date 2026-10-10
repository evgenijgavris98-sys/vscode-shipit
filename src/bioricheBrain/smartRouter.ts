import type { BrainConfig } from "./config";
import type { AgentRequest, BrainAgent, BrainProvider } from "./types";

export type ProviderFactory = (id: BrainProviderId) => BrainProvider;
export type BrainProviderId = BrainConfig["provider"];

const CODING_AGENTS = new Set<BrainAgent>(["devops", "qa_inspector", "ocr_agent"]);
const SCIENCE_AGENTS = new Set<BrainAgent>(["rd_chemist", "lab_director", "technologist", "recipe_validator"]);
const RESEARCH_AGENTS = new Set<BrainAgent>(["market_analyst", "legal_guard", "regulatory_watchdog"]);

export class SmartRouterProvider implements BrainProvider {
  private readonly providers = new Map<BrainProviderId, BrainProvider>();

  public constructor(private readonly config: BrainConfig, private readonly factory: ProviderFactory) {}

  private provider(id: BrainProviderId): BrainProvider {
    const existing = this.providers.get(id);
    if (existing) return existing;
    const created = this.factory(id);
    this.providers.set(id, created);
    return created;
  }

  private rank(agent: BrainAgent, request: AgentRequest): BrainProviderId[] {
    const ordered: BrainProviderId[] = [];
    const add = (id: BrainProviderId) => { if (!ordered.includes(id)) ordered.push(id);   video_director: "You are VIDEO DIRECTOR for BIORICHEBRAIN. Plan shot lists and visual direction from approved briefs. Do not invent product facts or claims; publication requires approval.",
  video_scriptwriter: "You are VIDEO SCRIPTWRITER for BIORICHEBRAIN. Write evidence-safe scripts and channel variants. Do not invent efficacy claims; publication requires approval.",
  storyboard_agent: "You are STORYBOARD AGENT for BIORICHEBRAIN. Specify composition, camera and continuity; preserve approved product references.",
  video_generator: "You are VIDEO GENERATOR for BIORICHEBRAIN. Prepare bounded generation prompts and jobs; never publish or spend without approval.",
  voice_avatar_agent: "You are VOICE & AVATAR AGENT for BIORICHEBRAIN. Coordinate approved TTS/voice steps; voice cloning requires consent and approval.",
  video_editor: "You are VIDEO EDITOR for BIORICHEBRAIN. Plan deterministic edits and exports; preserve approved labels and claims.",
  subtitle_localization: "You are SUBTITLE & LOCALIZATION for BIORICHEBRAIN. Verify subtitles and translations; do not change product claims.",
  video_qa: "You are VIDEO QA for BIORICHEBRAIN. Independently verify frames, audio, subtitles, brand and claims; block unapproved publication.",
};

    if (CODING_AGENTS.has(agent)) {
      add("claude"); add("qwen"); add("deepseek");
    } else if (SCIENCE_AGENTS.has(agent)) {
      add("deepseek"); add("openai"); add("claude");
    } else if (RESEARCH_AGENTS.has(agent)) {
      add("openai"); add("deepseek"); add("claude");
    } else if (request.tier === "astra" || request.tier === "luna") {
      add("openai"); add("claude"); add("deepseek");
    } else {
      add("openai"); add("claude"); add("deepseek"); add("qwen"); add("kimi");
    }

    // The explicit provider remains a fallback rather than overriding task-specific routing.
    add(this.config.provider);
    return ordered;
  }

  public async run(agent: BrainAgent, request: AgentRequest): Promise<string> {
    const candidates = this.rank(agent, request);
    const errors: string[] = [];

    for (const id of candidates) {
      if (id === "openai" && !this.config.apiKey) {
        errors.push("openai: missing OPENAI_API_KEY");
        continue;
      }
      if (id === "deepseek" && !this.config.deepseekApiKey) {
        errors.push("deepseek: missing DEEPSEEK_API_KEY");
        continue;
      }
      if (id === "kimi" && !this.config.kimiApiKey && !this.config.kimiMcpUrl) {
        errors.push("kimi: missing Kimi credentials");
        continue;
      }

      try {
        return await this.provider(id).run(agent, request);
      } catch (error) {
        errors.push(`${id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    throw new Error(`BIORICHEBRAIN router exhausted all providers. ${errors.join(" | ")}`);
  }
}
