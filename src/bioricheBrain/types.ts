export type ModelTier = "luna" | "terra" | "sol" | "astra";
export type BrainAgent = "orchestrator" | "memory_engine" | "strategist" | "lab_director" | "sales_bot" | "customer_success" | "data_scientist" | "devops" | "label_designer" | "technologist" | "recipe_validator" | "legal_guard" | "rd_chemist" | "market_analyst" | "brand_designer" | "supply_chain" | "content_manager" | "qa_inspector" | "regulatory_watchdog" | "ocr_agent" | "procurement_agent" | "zozh_specialist" | "video_agent" | "video_director" | "video_scriptwriter" | "storyboard_agent" | "video_generator" | "voice_avatar_agent" | "video_editor" | "subtitle_localization" | "video_qa";

export interface AgentTask {
  input: string;
}

export interface AgentRequest {
  tier: ModelTier;
  task: AgentTask;
  qaFeedback?: string;
}

export interface BrainProvider {
  run(agent: BrainAgent, request: AgentRequest): Promise<string>;
}
