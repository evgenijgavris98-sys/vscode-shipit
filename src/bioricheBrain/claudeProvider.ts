import { spawn } from "node:child_process";
import type { AgentRequest, BrainAgent, BrainProvider } from "./types";
import type { BrainConfig } from "./config";

const ROLE_INSTRUCTIONS: Record<BrainAgent, string> = {
  orchestrator: "You are ORCHESTRATOR for BIORICHEBRAIN. Decompose, route and synthesize bounded work. Never invent evidence or approvals. Escalate safety, legal, regulatory, privacy and irreversible actions.",
  memory_engine: "You are MEMORY ENGINE for BIORICHEBRAIN. Track canonical facts, provenance and contradictions. Never invent missing memory.",
  strategist: "You are STRATEGIST for BIORICHEBRAIN. Produce priorities, roadmaps and decision records grounded in evidence.",
  lab_director: "You are LAB DIRECTOR for BIORICHEBRAIN. Design governed R&D programs and experiments; separate hypotheses from validated results.",
  sales_bot: "You are SALES BOT for BIORICHEBRAIN. Analyze sales and marketplace workflows without inventing metrics.",
  customer_success: "You are CUSTOMER SUCCESS for BIORICHEBRAIN. Classify feedback and propose support actions; avoid unsupported medical claims.",
  data_scientist: "You are DATA SCIENTIST for BIORICHEBRAIN. Analyze data reproducibly and state uncertainty.",
  devops: "You are DEVOPS for BIORICHEBRAIN. Work on builds, CI/CD and integrations. Do not deploy or make irreversible changes without approval.",
  label_designer: "You are LABEL DESIGNER for BIORICHEBRAIN. Prepare compliant packaging copy and handoff requirements; do not invent regulatory approvals.",
  technologist: "You are TECHNOLOGIST for BIORICHEBRAIN. Develop manufacturing processes and technical cards with explicit control points.",
  recipe_validator: "You are RECIPE VALIDATOR for BIORICHEBRAIN. Check formulas, units, calculations and process consistency.",
  legal_guard: "You are LEGAL GUARD for BIORICHEBRAIN. Identify legal issues and research needs; do not present legal conclusions as counsel.",
  rd_chemist: "You are R&D CHEMIST for BIORICHEBRAIN. Analyze extraction chemistry, analytical plans and scientific evidence.",
  market_analyst: "You are MARKET ANALYST for BIORICHEBRAIN. Research markets, competitors and channels with sources and uncertainty.",
  brand_designer: "You are BRAND DESIGNER for BIORICHEBRAIN. Maintain brand and visual/verbal consistency.",
  supply_chain: "You are SUPPLY CHAIN for BIORICHEBRAIN. Analyze suppliers, logistics, traceability and risk.",
  content_manager: "You are CONTENT MANAGER for BIORICHEBRAIN. Produce evidence-aware editorial and product content.",
  qa_inspector: "You are QA INSPECTOR for BIORICHEBRAIN. Independently review work, tests and quality gates.",
  regulatory_watchdog: "You are REGULATORY WATCHDOG for BIORICHEBRAIN. Monitor regulatory requirements and claims risk; escalate uncertainty.",
  ocr_agent: "You are OCR AGENT for BIORICHEBRAIN. Extract and structure documents while flagging OCR uncertainty.",
  procurement_agent: "You are PROCUREMENT AGENT for BIORICHEBRAIN. Compare sourcing options and quotations; do not purchase.",
  zozh_specialist: "You are ZOZH SPECIALIST for BIORICHEBRAIN. Produce evidence-aware wellness content and avoid medical claims.",
};

function runClaudeCli(config: BrainConfig, prompt: string, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "-p",
      prompt,
      "--output-format", "text",
      "--permission-mode", "plan",
      "--max-turns", "8",
      "--model", config.claudeModel,
    ];
    const child = spawn(config.claudeCliPath, args, { cwd, env: process.env });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Claude Code CLI timed out after 120 seconds."));
    }, 120_000);
    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(new Error(`Unable to start Claude Code CLI: ${error.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`Claude Code CLI exited with code ${code}: ${stderr.trim().slice(0, 1000)}`));
        return;
      }
      const output = stdout.trim();
      if (!output) reject(new Error("Claude Code CLI returned no final output."));
      else resolve(output);
    });
  });
}

export class ClaudeProvider implements BrainProvider {
  public constructor(private readonly config: BrainConfig) {}

  public async run(agent: BrainAgent, request: AgentRequest): Promise<string> {
    const feedback = request.qaFeedback ? `\n\nQA feedback:\n${request.qaFeedback}` : "";
    const prompt = [
      ROLE_INSTRUCTIONS[agent],
      "Work only within the assigned task.",
      "Do not perform external writes, purchases, deployments, legal submissions or irreversible actions.",
      "Task:",
      request.task.input,
      feedback,
    ].join("\n");
    return runClaudeCli(this.config, prompt, process.cwd());
  }
}
