import { Agent } from "@openai/agents";
import { z } from "zod";
import type { BrainAgent } from "./types";
import type { BrainConfig } from "./config";
import { createBrainTools } from "./runtimeTools";
import type { ApprovalGate } from "./approvalGate";
import type { AuditSink } from "./auditLog";

const SPECIALIST_INSTRUCTIONS: Partial<Record<BrainAgent, string>> = {
  memory_engine: "You are MEMORY ENGINE. Maintain canonical project memory and provenance. Never invent facts.",
  strategist: "You are STRATEGIST. Produce roadmaps, priorities and decision records from supplied evidence.",
  lab_director: "You are LAB DIRECTOR. Design R&D programs and experiments; separate hypotheses from validated results.",
  sales_bot: "You are SALES BOT. Handle sales operations and marketplace workflows; avoid unsupported product claims.",
  customer_success: "You are CUSTOMER SUCCESS. Classify customer feedback and propose evidence-based responses.",
  data_scientist: "You are DATA SCIENTIST. Analyze data reproducibly and state uncertainty.",
  devops: "You are DEVOPS. Handle builds, CI/CD and integrations; never perform irreversible changes without approval.",
  label_designer: "You are LABEL DESIGNER. Prepare packaging text and compliance handoffs; do not invent regulatory facts.",
  technologist: "You are TECHNOLOGIST. Work on manufacturing processes and technical cards; flag unvalidated parameters.",
  recipe_validator: "You are RECIPE VALIDATOR. Check formulas, calculations and process consistency.",
  legal_guard: "You are LEGAL GUARD. Identify legal issues and research jurisdiction-specific requirements; do not file anything.",
  rd_chemist: "You are R&D CHEMIST. Analyze extraction chemistry and analytical plans; distinguish literature from hypotheses.",
  market_analyst: "You are MARKET ANALYST. Research competitors, channels and market evidence without unsupported forecasts.",
  brand_designer: "You are BRAND DESIGNER. Maintain BIORICHE brand consistency across visual and verbal systems.",
  supply_chain: "You are SUPPLY CHAIN. Analyze suppliers, logistics, traceability and operational risk.",
  content_manager: "You are CONTENT MANAGER. Prepare evidence-grounded editorial and product content.",
  qa_inspector: "You are QA INSPECTOR. Independently review outputs and identify defects or missing evidence.",
  regulatory_watchdog: "You are REGULATORY WATCHDOG. Monitor regulatory requirements and claims compliance.",
  ocr_agent: "You are OCR AGENT. Extract and structure document content while flagging uncertain OCR.",
  procurement_agent: "You are PROCUREMENT AGENT. Compare sourcing options and quotations; do not commit purchases.",
  zozh_specialist: "You are ZOZH SPECIALIST. Prepare evidence-grounded wellness content without medical claims.",
};

const ALL_SPECIALISTS = Object.keys(SPECIALIST_INSTRUCTIONS) as BrainAgent[];

export function createAgentDelegationTools(
  config: BrainConfig,
  workspaceRoot: string | undefined,
  approvalGate: ApprovalGate,
  audit: AuditSink,
  maxDepth = 1,
) {
  if (maxDepth <= 0) return [];

  return ALL_SPECIALISTS.map((agentId) => {
    const specialist = new Agent({
      name: `BIORICHEBRAIN — ${agentId}`,
      instructions: `${SPECIALIST_INSTRUCTIONS[agentId]} Work only within the assigned task. Distinguish sourced facts, supplier claims, hypotheses and validated results. Avoid medical claims. Escalate legal, regulatory, privacy and irreversible actions for human approval.`,
      model: config.models.terra,
      tools: workspaceRoot ? createBrainTools(agentId, workspaceRoot, approvalGate, audit) : [],
      modelSettings: {
        reasoning: { effort: config.reasoningEffort },
        timeoutMs: 120_000,
        text: { verbosity: "medium" },
      },
    });

    return specialist.asTool({
      toolName: `delegate_${agentId}`,
      toolDescription: `Delegate a bounded BIORICHEBRAIN task to ${agentId}. The specialist returns analysis only; external side effects remain approval-gated.`,
      parameters: z.object({
        input: z.string().min(1).max(12_000),
      }),
      inputBuilder: ({ input }) => input,
      runOptions: { maxTurns: 6 },
    });
  });
}
