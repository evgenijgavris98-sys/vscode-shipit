export type VideoStage =
  | "brief"
  | "script"
  | "storyboard"
  | "generation"
  | "voice"
  | "editing"
  | "subtitles"
  | "localization"
  | "qa"
  | "export";

export interface VideoJob {
  id: string;
  brief: string;
  targetFormats: Array<"9:16" | "16:9" | "1:1">;
  stages: VideoStage[];
  brand: "BIORICHE";
  approvalRequired: boolean;
}

export const VIDEO_PIPELINE: readonly VideoStage[] = [
  "brief","script","storyboard","generation","voice","editing",
  "subtitles","localization","qa","export",
];

export const VIDEO_AGENT_ROLES = [
  "video_director",
  "video_scriptwriter",
  "storyboard_agent",
  "video_generator",
  "voice_avatar_agent",
  "video_editor",
  "subtitle_localization",
  "video_qa",
] as const;

export const VIDEO_TOOL_ALLOWLIST = [
  "video.comfyui.generate",
  "video.comfyui.workflow",
  "video.ffmpeg.render",
  "video.whisper.transcribe",
  "video.tts.synthesize",
  "video.qa.inspect",
] as const;

export function createVideoJob(brief: string): VideoJob {
  return {
    id: `video-${Date.now()}`,
    brief,
    targetFormats: ["9:16", "16:9", "1:1"],
    stages: [...VIDEO_PIPELINE],
    brand: "BIORICHE",
    approvalRequired: true,
  };
}
