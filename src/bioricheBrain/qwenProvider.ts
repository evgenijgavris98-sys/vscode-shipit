import { spawn } from "node:child_process";
import type { AgentRequest, BrainAgent, BrainProvider } from "./types";
import type { BrainConfig } from "./config";

const ROLE_INSTRUCTIONS: Record<BrainAgent, string> = {
  orchestrator: "You are ORCHESTRATOR for BIORICHEBRAIN. Decompose and synthesize tasks. Distinguish sourced facts, hypotheses and validated results.",
  memory_engine: "You are MEMORY ENGINE for BIORICHEBRAIN. Maintain canonical project memory and provenance. Never invent facts.",
  strategist: "You are STRATEGIST for BIORICHEBRAIN. Produce roadmaps, priorities and decision records from supplied evidence.",
  lab_director: "You are LAB DIRECTOR for BIORICHEBRAIN. Design R&D programs and experiments; separate hypotheses from validated results.",
  sales_bot: "You are SALES BOT for BIORICHEBRAIN. Handle sales operations and avoid unsupported product claims.",
  customer_success: "You are CUSTOMER SUCCESS for BIORICHEBRAIN. Classify customer feedback and propose evidence-based responses.",
  data_scientist: "You are DATA SCIENTIST for BIORICHEBRAIN. Analyze data reproducibly and state uncertainty.",
  devops: "You are DEVOPS for BIORICHEBRAIN. Inspect builds, CI/CD and integrations; never perform irreversible changes.",
  label_designer: "You are LABEL DESIGNER for BIORICHEBRAIN. Prepare packaging text and compliance handoffs; do not invent regulatory facts.",
  technologist: "You are TECHNOLOGIST for BIORICHEBRAIN. Work on manufacturing processes and technical cards; flag unvalidated parameters.",
  recipe_validator: "You are RECIPE VALIDATOR for BIORICHEBRAIN. Check formulas, calculations and process consistency.",
  legal_guard: "You are LEGAL GUARD for BIORICHEBRAIN. Identify legal issues and requirements; do not file anything.",
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
};

function runQwenCli(config: BrainConfig, prompt: string, cwd?: string): Promise<string> {
  const args = [
    "--prompt", prompt,
    "--model", config.qwenModel,
    "--output-format", "text",
    "--approval-mode", "plan",
    "--max-session-turns", "8",
    "--max-wall-time", "120s",
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(config.qwenCliPath, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Qwen Code run timed out after 120 seconds."));
    }, 125_000);

    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(new Error(`Unable to start Qwen Code CLI: ${error.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`Qwen Code CLI exited with code ${code}: ${stderr.trim().slice(0, 1200)}`));
        return;
      }
      const output = stdout.trim();
      if (!output) {
        reject(new Error("Qwen Code CLI returned no final output."));
        return;
      }
      resolve(output);
    });
  });
}

export class QwenProvider implements BrainProvider {
  public constructor(private readonly config: BrainConfig) {}

  public async run(agent: BrainAgent, request: AgentRequest): Promise<string> {
    const feedback = request.qaFeedback ? `\n\nQA feedback from the previous attempt:\n${request.qaFeedback}` : "";
    const prompt = [
      ROLE_INSTRUCTIONS[agent],
      "Work only within the assigned task.",
      "Do not invent data, approvals, experimental outcomes or regulatory facts.",
      "Do not make medical claims.",
      "Do not perform external writes, purchases, deployments, legal submissions or irreversible actions.",
      "Task:",
      request.task.input,
      feedback,
    ].join("\n\n");

    return runQwenCli(this.config, prompt, process.cwd());
  }
}
