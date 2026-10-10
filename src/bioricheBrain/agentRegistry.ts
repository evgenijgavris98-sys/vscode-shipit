import type { BrainAgent, ModelTier } from "./types";

export interface AgentDefinition {
  id: BrainAgent;
  name: string;
  purpose: string;
  defaultTier: ModelTier;
  skills: string[];
  humanApproval: string[];
}

export const AGENT_REGISTRY: readonly AgentDefinition[] = [
  { id: "orchestrator", name: "ORCHESTRATOR", purpose: "Task decomposition, routing, delegation, synthesis.", defaultTier: "sol", skills: ["task-orchestration","github-workflow","openai-agents-sdk"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "memory_engine", name: "MEMORY ENGINE", purpose: "Canonical memory, provenance, contradiction tracking.", defaultTier: "luna", skills: ["project-memory","source-provenance","decision-log"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "strategist", name: "STRATEGIST", purpose: "Roadmaps, priorities, decision records.", defaultTier: "sol", skills: ["roadmap-planning","market-research","decision-analysis"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "lab_director", name: "LAB DIRECTOR", purpose: "R&D program design and experiment governance.", defaultTier: "sol", skills: ["experimental-design","lab-notebook","research-review"], humanApproval: ["human-subject studies","lab execution","safety-critical protocol"] },
  { id: "sales_bot", name: "SALES BOT", purpose: "Sales operations and marketplace workflows.", defaultTier: "luna", skills: ["sales-operations","marketplace-content","crm-workflow"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "customer_success", name: "CUSTOMER SUCCESS", purpose: "Customer support, feedback classification.", defaultTier: "luna", skills: ["customer-feedback","support-triage","response-writing"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "data_scientist", name: "DATA SCIENTIST", purpose: "Data analysis, statistics, reproducible notebooks.", defaultTier: "sol", skills: ["data-analysis","statistics","jupyter-notebooks"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "devops", name: "DEVOPS", purpose: "Builds, CI/CD, infrastructure and integrations.", defaultTier: "sol", skills: ["github-workflow","ci-cd","security-review"], humanApproval: ["deployments","credential changes","external writes"] },
  { id: "label_designer", name: "LABEL DESIGNER", purpose: "Packaging text, layout requirements, label compliance handoff.", defaultTier: "luna", skills: ["label-compliance","technical-copy","design-handoff"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "technologist", name: "TECHNOLOGIST", purpose: "Manufacturing process and technical cards.", defaultTier: "sol", skills: ["process-engineering","technical-documentation","batch-records"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "recipe_validator", name: "RECIPE VALIDATOR", purpose: "Formula consistency, calculations, process checks.", defaultTier: "sol", skills: ["formula-audit","unit-conversion","quality-check"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "legal_guard", name: "LEGAL GUARD", purpose: "Legal issue spotting, jurisdiction-specific research.", defaultTier: "sol", skills: ["legal-research","contract-review","claims-screening"], humanApproval: ["legal/regulatory conclusions","external submissions"] },
  { id: "rd_chemist", name: "R&D CHEMIST", purpose: "Extraction chemistry, analytical plan, scientific evidence.", defaultTier: "sol", skills: ["scientific-literature","extraction-chemistry","experimental-design"], humanApproval: ["human-subject studies","lab execution","safety-critical protocol"] },
  { id: "market_analyst", name: "MARKET ANALYST", purpose: "Market sizing, competitor and channel research.", defaultTier: "luna", skills: ["market-research","competitor-analysis","trend-monitoring"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "brand_designer", name: "BRAND DESIGNER", purpose: "Brand system, visual and verbal consistency.", defaultTier: "luna", skills: ["brand-system","visual-briefs","content-style"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "supply_chain", name: "SUPPLY CHAIN", purpose: "Supplier, logistics, traceability, risk.", defaultTier: "luna", skills: ["supplier-research","traceability","logistics-risk"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "content_manager", name: "CONTENT MANAGER", purpose: "Editorial calendar and product content.", defaultTier: "luna", skills: ["editorial-planning","content-writing","content-review"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "qa_inspector", name: "QA INSPECTOR", purpose: "Independent review, tests, quality gates.", defaultTier: "sol", skills: ["code-review","test-planning","evidence-audit"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "regulatory_watchdog", name: "REGULATORY WATCHDOG", purpose: "Regulatory monitoring and claims review.", defaultTier: "luna", skills: ["regulatory-monitoring","label-review","claims-screening"], humanApproval: ["legal/regulatory conclusions","external submissions"] },
  { id: "ocr_agent", name: "OCR AGENT", purpose: "Document extraction, OCR quality and structured capture.", defaultTier: "luna", skills: ["document-ocr","pdf-extraction","data-validation"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "procurement_agent", name: "PROCUREMENT AGENT", purpose: "Sourcing, quotations, procurement comparisons.", defaultTier: "luna", skills: ["supplier-sourcing","quotation-analysis","procurement-risk"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "video_agent", name: "VIDEO AGENT", purpose: "Local-first AI video generation, editing, subtitles, TTS orchestration and multi-format export.", defaultTier: "terra", skills: ["video-generation","wan2.2","comfyui","rendiv","ffmpeg","subtitles","local-tts","video-qa"], humanApproval: ["external publication","paid services","irreversible actions"] },
  { id: "video_director", name: "VIDEO DIRECTOR", purpose: "Turn approved briefs into coherent shot lists and visual direction.", defaultTier: "sol", skills: ["video-brief","shot-planning","visual-continuity"], humanApproval: ["external publication","paid services","irreversible actions"] },
  { id: "video_scriptwriter", name: "VIDEO SCRIPTWRITER", purpose: "Write evidence-safe scripts, hooks, calls to action and channel variants.", defaultTier: "luna", skills: ["video-script","brand-copywriting","claims-screening"], humanApproval: ["external publication","paid services","irreversible actions"] },
  { id: "storyboard_agent", name: "STORYBOARD AGENT", purpose: "Specify scene composition, camera, keyframes and continuity.", defaultTier: "luna", skills: ["storyboarding","camera-planning","visual-continuity"], humanApproval: ["external publication","paid services","irreversible actions"] },
  { id: "video_generator", name: "VIDEO GENERATOR", purpose: "Prepare bounded generation jobs for approved local video backends.", defaultTier: "terra", skills: ["video-generation","comfyui","wan2.2"], humanApproval: ["external publication","paid services","irreversible actions"] },
  { id: "voice_avatar_agent", name: "VOICE & AVATAR AGENT", purpose: "Coordinate approved local TTS, voice and lip-sync steps.", defaultTier: "terra", skills: ["local-tts","voice-qa","lip-sync"], humanApproval: ["voice cloning consent","paid services","external publication"] },
  { id: "video_editor", name: "VIDEO EDITOR", purpose: "Plan deterministic edits, subtitles, sound and multi-format exports.", defaultTier: "terra", skills: ["ffmpeg","video-editing","render-validation"], humanApproval: ["external publication","paid services","irreversible actions"] },
  { id: "subtitle_localization", name: "SUBTITLE & LOCALIZATION", purpose: "Create and QA subtitle timing, translations and platform variants.", defaultTier: "luna", skills: ["subtitles","localization","transcription-qa"], humanApproval: ["external publication","paid services","irreversible actions"] },
  { id: "video_qa", name: "VIDEO QA", purpose: "Independently verify video frames, audio, subtitles, format and product-claim compliance.", defaultTier: "sol", skills: ["video-qa","brand-compliance","claims-screening"], humanApproval: ["external publication","paid services","irreversible actions"] },
  { id: "zozh_specialist", name: "ZOZH SPECIALIST", purpose: "Wellness content with evidence and claims guardrails.", defaultTier: "luna", skills: ["evidence-grading","wellness-content","claims-screening"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
] as const;

export function getAgentDefinition(agent: BrainAgent): AgentDefinition {
  const definition = AGENT_REGISTRY.find((item) => item.id === agent);
  if (!definition) throw new Error(`Unknown BIORICHEBRAIN agent: ${agent}`);
  return definition;
}
