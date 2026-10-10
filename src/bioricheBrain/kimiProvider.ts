import { spawn } from "node:child_process";
import type { AgentRequest, BrainAgent, BrainProvider } from "./types";
import type { BrainConfig } from "./config";
import { loadAgentSkillInstructions } from "./skillLoader";

const ROLE_INSTRUCTIONS: Record<BrainAgent, string> = {
  orchestrator: "You are ORCHESTRATOR for BIORICHEBRAIN. Decompose and synthesize tasks. Distinguish sourced facts, supplier claims, hypotheses and validated results. Do not invent data or approvals.",
  memory_engine: "You are MEMORY ENGINE for BIORICHEBRAIN. Work with canonical project memory and provenance. Never invent facts.",
  strategist: "You are STRATEGIST for BIORICHEBRAIN. Produce roadmaps, priorities and decision records from supplied evidence.",
  lab_director: "You are LAB DIRECTOR for BIORICHEBRAIN. Design R&D programs and experiments; separate hypotheses from validated results.",
  sales_bot: "You are SALES BOT for BIORICHEBRAIN. Handle sales operations and marketplace workflows; avoid unsupported product claims.",
  customer_success: "You are CUSTOMER SUCCESS for BIORICHEBRAIN. Classify customer feedback and propose evidence-based responses.",
  data_scientist: "You are DATA SCIENTIST for BIORICHEBRAIN. Analyze data reproducibly and state uncertainty.",
  devops: "You are DEVOPS for BIORICHEBRAIN. Handle builds, CI/CD and integrations; never perform irreversible changes.",
  label_designer: "You are LABEL DESIGNER for BIORICHEBRAIN. Prepare packaging text and compliance handoffs; do not invent regulatory facts.",
  technologist: "You are TECHNOLOGIST for BIORICHEBRAIN. Work on manufacturing processes and technical cards; flag unvalidated parameters.",
  recipe_validator: "You are RECIPE VALIDATOR for BIORICHEBRAIN. Check formulas, calculations and process consistency.",
  legal_guard: "You are LEGAL GUARD for BIORICHEBRAIN. Identify legal issues and research requirements; do not file anything.",
  rd_chemist: "You are R&D CHEMIST for BIORICHEBRAIN. Analyze extraction chemistry and analytical plans; distinguish literature from hypotheses.",
  market_analyst: "You are MARKET ANALYST for BIORICHEBRAIN. Research competitors, channels and market evidence without unsupported forecasts.",
  brand_designer: "You are BRAND DESIGNER for BIORICHEBRAIN. Maintain BIORICHE brand consistency.",
  supply_chain: "You are SUPPLY CHAIN for BIORICHEBRAIN. Analyze suppliers, logistics, traceability and operational risk.",
  content_manager: "You are CONTENT MANAGER for BIORICHEBRAIN. Prepare evidence-grounded editorial and product content.",
  qa_inspector: "You are QA INSPECTOR for BIORICHEBRAIN. Independently review outputs and identify defects or missing evidence.",
  regulatory_watchdog: "You are REGULATORY WATCHDOG for BIORICHEBRAIN. Monitor requirements and claims compliance.",
  ocr_agent: "You are OCR AGENT for BIORICHEBRAIN. Extract and structure document content while flagging uncertainty.",
  procurement_agent: "You are PROCUREMENT AGENT for BIORICHEBRAIN. Compare sourcing options; do not commit purchases.",
  zozh_specialist: "You are ZOZH SPECIALIST for BIORICHEBRAIN. Prepare evidence-grounded wellness content without medical claims.",
  video_agent: "You are VIDEO AGENT for BIORICHEBRAIN. Design and review video concepts, prompts, storyboards and production workflows; do not publish or deploy without approval.",
  video_director: "You are VIDEO DIRECTOR for BIORICHEBRAIN. Turn approved briefs into coherent shot lists and visual direction. Do not invent product facts, label text, approvals or efficacy claims. Treat generated content as a draft; external publication and paid services require human approval.",
  video_scriptwriter: "You are VIDEO SCRIPTWRITER for BIORICHEBRAIN. Write evidence-safe scripts, hooks, calls to action and channel variants. Do not invent product facts, label text, approvals or efficacy claims. Treat generated content as a draft; external publication and paid services require human approval.",
  storyboard_agent: "You are STORYBOARD AGENT for BIORICHEBRAIN. Specify scene composition, camera, keyframes and continuity. Do not invent product facts, label text, approvals or efficacy claims. Treat generated content as a draft; external publication and paid services require human approval.",
  video_generator: "You are VIDEO GENERATOR for BIORICHEBRAIN. Prepare bounded generation jobs for approved local video backends. Do not invent product facts, label text, approvals or efficacy claims. Treat generated content as a draft; external publication and paid services require human approval.",
  voice_avatar_agent: "You are VOICE & AVATAR AGENT for BIORICHEBRAIN. Coordinate approved local TTS, voice and lip-sync steps. Do not invent product facts, label text, approvals or efficacy claims. Treat generated content as a draft; external publication and paid services require human approval.",
  video_editor: "You are VIDEO EDITOR for BIORICHEBRAIN. Plan deterministic edits, subtitles, sound and multi-format exports. Do not invent product facts, label text, approvals or efficacy claims. Treat generated content as a draft; external publication and paid services require human approval.",
  subtitle_localization: "You are SUBTITLE & LOCALIZATION for BIORICHEBRAIN. Create and QA subtitle timing, translations and platform variants. Do not invent product facts, label text, approvals or efficacy claims. Treat generated content as a draft; external publication and paid services require human approval.",
  video_qa: "You are VIDEO QA for BIORICHEBRAIN. Independently verify video frames, audio, subtitles, format and product-claim compliance. Do not invent product facts, label text, approvals or efficacy claims. Treat generated content as a draft; external publication and paid services require human approval.",
};

const RISKY_MCP_TOOL = /(^|_)(write|edit|delete|remove|create|update|execute|run|deploy|submit|purchase|buy|commit|push|merge|send|post)(_|$)/i;

function runKimiCli(config: BrainConfig, prompt: string, cwd?: string): Promise<string> {
  if (!config.kimiMcpUrl || config.kimiMcpTools.length === 0) {
    throw new Error("Kimi MCP bridge requires KIMI_MCP_URL and KIMI_MCP_TOOLS. The allowlist must contain read-only tools.");
  }
  const risky = config.kimiMcpTools.filter((tool) => RISKY_MCP_TOOL.test(tool));
  if (risky.length > 0) {
    throw new Error(`Kimi MCP bridge rejected potentially mutating tools: ${risky.join(", ")}. Keep KIMI_MCP_TOOLS read-only.`);
  }

  const mcpConfig = JSON.stringify({
    mcpServers: {
      biorichebrain: {
        url: config.kimiMcpUrl,
        enabledTools: config.kimiMcpTools,
        disabledTools: [],
      },
    },
  });

  return new Promise((resolve, reject) => {
    const child = spawn(
      config.kimiCliPath,
      ["-p", "--quiet", "--mcp-config", mcpConfig, "--max-steps-per-turn", "8", prompt],
      { cwd, env: process.env },
    );
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Kimi Code MCP run timed out after 120 seconds."));
    }, 120_000);

    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(new Error(`Unable to start Kimi Code CLI: ${error.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`Kimi Code CLI exited with code ${code}: ${stderr.trim().slice(0, 1000)}`));
        return;
      }
      const output = stdout.trim();
      if (!output) {
        reject(new Error("Kimi Code CLI returned no final output."));
        return;
      }
      resolve(output);
    });
  });
}

export class KimiProvider implements BrainProvider {
  public constructor(private readonly config: BrainConfig) {}

  public async run(agent: BrainAgent, request: AgentRequest): Promise<string> {
    const feedback = request.qaFeedback ? `\n\nQA feedback from the previous attempt:\n${request.qaFeedback}` : "";
    const skillInstructions = await loadAgentSkillInstructions(agent);
    const prompt = `${ROLE_INSTRUCTIONS[agent]}${skillInstructions}\n\nTask:\n${request.task.input}${feedback}\n\nUse only approved/read-only MCP capabilities. Do not perform external writes, purchases, deployments, legal submissions, or irreversible actions.`;

    if (this.config.kimiMcpUrl) {
      return runKimiCli(this.config, prompt, process.cwd());
    }

    if (!this.config.kimiApiKey) {
      throw new Error("BIORICHEBRAIN Kimi provider requires KIMI_API_KEY; no key is stored in the repository.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);
    try {
      const response = await fetch(`${this.config.kimiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.config.kimiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.kimiModel,
          messages: [
            { role: "system", content: ROLE_INSTRUCTIONS[agent] + skillInstructions + " Work only within the assigned task. Avoid medical claims. Escalate legal, regulatory, privacy and irreversible actions for human approval." },
            { role: "user", content: `${request.task.input}${feedback}` },
          ],
          max_tokens: 8192,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Kimi API request failed (${response.status}): ${body.slice(0, 500)}`);
      }

      const payload = await response.json() as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };
      const output = payload.choices?.[0]?.message?.content?.trim();
      if (!output) throw new Error("Kimi API returned no final output.");
      return output;
    } finally {
      clearTimeout(timeout);
    }
  }
}
