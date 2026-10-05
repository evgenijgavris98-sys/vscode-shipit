import type { BrainAgent } from "./types";

export type ToolRisk = "read" | "write" | "irreversible";

export interface ToolDefinition {
  id: string;
  description: string;
  risk: ToolRisk;
  requiresApproval: boolean;
  allowedAgents: readonly BrainAgent[];
}

export interface ToolInvocation {
  toolId: string;
  agent: BrainAgent;
  input: unknown;
}

const ALL_AGENTS: readonly BrainAgent[] = [
  "orchestrator","memory_engine","strategist","lab_director","sales_bot","customer_success",
  "data_scientist","devops","label_designer","technologist","recipe_validator","legal_guard",
  "rd_chemist","market_analyst","brand_designer","supply_chain","content_manager","qa_inspector",
  "regulatory_watchdog","ocr_agent","procurement_agent","zozh_specialist","video_director","video_scriptwriter",
  "storyboard_agent","video_generator","voice_avatar_agent","video_editor","subtitle_localization","video_qa",
];

export const TOOL_REGISTRY: readonly ToolDefinition[] = [
  { id: "project.read", description: "Read project-local files and metadata.", risk: "read", requiresApproval: false, allowedAgents: ALL_AGENTS },
  { id: "web.research", description: "Read public web sources for research.", risk: "read", requiresApproval: false, allowedAgents: ALL_AGENTS },
  { id: "memory.read", description: "Read canonical BIORICHEBRAIN memory with provenance.", risk: "read", requiresApproval: false, allowedAgents: ALL_AGENTS },
  { id: "memory.write", description: "Create or update project memory records.", risk: "write", requiresApproval: true, allowedAgents: ["memory_engine","orchestrator"] },
  { id: "github.read", description: "Read repositories, issues, pull requests, files and CI.", risk: "read", requiresApproval: false, allowedAgents: ["orchestrator","devops","qa_inspector","data_scientist","rd_chemist","legal_guard"] },
  { id: "github.write", description: "Create or modify GitHub content or pull requests.", risk: "write", requiresApproval: true, allowedAgents: ["devops","orchestrator"] },
  { id: "shell.execute", description: "Execute commands inside an isolated approved workspace.", risk: "write", requiresApproval: true, allowedAgents: ["devops","data_scientist","ocr_agent"] },
  { id: "deployment.execute", description: "Deploy infrastructure or production artifacts.", risk: "irreversible", requiresApproval: true, allowedAgents: ["devops","orchestrator"] },
  { id: "procurement.commit", description: "Place an order or create a purchase commitment.", risk: "irreversible", requiresApproval: true, allowedAgents: ["procurement_agent","supply_chain","orchestrator"] },
  { id: "legal.submit", description: "Submit a legal or regulatory filing.", risk: "irreversible", requiresApproval: true, allowedAgents: ["legal_guard","regulatory_watchdog","orchestrator"] },
  { id: "video.comfyui.generate", description: "Run allowlisted ComfyUI video generation workflows.", risk: "write", requiresApproval: false, allowedAgents: ["video_generator","storyboard_agent","video_director"] },
  { id: "video.comfyui.workflow", description: "Load and parameterize approved ComfyUI video workflows.", risk: "write", requiresApproval: false, allowedAgents: ["video_generator","storyboard_agent"] },
  { id: "video.ffmpeg.render", description: "Render, transcode and package video outputs with FFmpeg.", risk: "write", requiresApproval: false, allowedAgents: ["video_editor","video_qa"] },
  { id: "video.whisper.transcribe", description: "Transcribe speech and generate subtitle timing.", risk: "read", requiresApproval: false, allowedAgents: ["subtitle_localization","video_editor","video_qa"] },
  { id: "video.tts.synthesize", description: "Generate approved voice tracks through configured TTS providers.", risk: "write", requiresApproval: false, allowedAgents: ["voice_avatar_agent","video_director"] },
  { id: "video.qa.inspect", description: "Inspect generated video for artifacts, text, audio and brand consistency.", risk: "read", requiresApproval: false, allowedAgents: ["video_qa","qa_inspector","brand_designer"] },
];

export function getToolDefinition(toolId: string): ToolDefinition {
  const tool = TOOL_REGISTRY.find((item) => item.id === toolId);
  if (!tool) throw new Error(`Unknown BIORICHEBRAIN tool: ${toolId}`);
  return tool;
}

export function authorizeToolInvocation(invocation: ToolInvocation): ToolDefinition {
  const tool = getToolDefinition(invocation.toolId);
  if (!tool.allowedAgents.includes(invocation.agent)) {
    throw new Error(`Agent ${invocation.agent} is not authorized for tool ${invocation.toolId}.`);
  }
  return tool;
}
