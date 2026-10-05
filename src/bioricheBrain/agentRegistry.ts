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
  { id: "zozh_specialist", name: "ZOZH SPECIALIST", purpose: "Wellness content with evidence and claims guardrails.", defaultTier: "luna", skills: ["evidence-grading","wellness-content","claims-screening"], humanApproval: ["external publication","purchase commitments","irreversible actions"] },
  { id: "video_director", name: "VIDEO DIRECTOR", purpose: "Video creative direction, shot lists and continuity.", defaultTier: "astra", skills: ["video-direction","shot-list","visual-continuity"], humanApproval: ["external publication"] },
  { id: "video_scriptwriter", name: "VIDEO SCRIPTWRITER", purpose: "Hooks, scripts, CTAs and platform variants.", defaultTier: "sol", skills: ["video-scripting","hooks","cta-writing"], humanApproval: ["external publication"] },
  { id: "storyboard_agent", name: "STORYBOARD AGENT", purpose: "Keyframes, camera, composition and motion plans.", defaultTier: "sol", skills: ["storyboarding","camera-planning","prompt-engineering"], humanApproval: ["external publication"] },
  { id: "video_generator", name: "VIDEO GENERATOR", purpose: "Controlled ComfyUI/Wan/LTX generation workflows.", defaultTier: "sol", skills: ["comfyui","wan2.2","ltx-video","image-to-video"], humanApproval: ["external publication"] },
  { id: "voice_avatar_agent", name: "VOICE & AVATAR", purpose: "Voice, dialogue, avatar and lip-sync production.", defaultTier: "sol", skills: ["tts","voice-direction","lip-sync"], humanApproval: ["external publication"] },
  { id: "video_editor", name: "VIDEO EDITOR", purpose: "Deterministic editing, pacing, B-roll and exports.", defaultTier: "sol", skills: ["ffmpeg","video-editing","format-conversion"], humanApproval: ["external publication"] },
  { id: "subtitle_localization", name: "SUBTITLE & LOCALIZATION", purpose: "Whisper transcription, captions and language variants.", defaultTier: "terra", skills: ["whisper","subtitles","localization"], humanApproval: ["external publication"] },
  { id: "video_qa", name: "VIDEO QA", purpose: "Independent visual, audio, text and brand quality gate.", defaultTier: "sol", skills: ["video-qa","brand-check","artifact-detection"], humanApproval: ["external publication"] },
] as const;

export function getAgentDefinition(agent: BrainAgent): AgentDefinition {
  const definition = AGENT_REGISTRY.find((item) => item.id === agent);
  if (!definition) throw new Error(`Unknown BIORICHEBRAIN agent: ${agent}`);
  return definition;
}
