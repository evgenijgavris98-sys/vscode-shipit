export type VideoStage = "brief" | "script" | "storyboard" | "generation" | "voice" | "editing" | "subtitles" | "localization" | "qa" | "export";

export const VIDEO_PIPELINE: readonly VideoStage[] = [
  "brief", "script", "storyboard", "generation", "voice",
  "editing", "subtitles", "localization", "qa", "export",
] as const;

export const VIDEO_AGENT_ROLES = [
  "video_director", "video_scriptwriter", "storyboard_agent", "video_generator",
  "voice_avatar_agent", "video_editor", "subtitle_localization", "video_qa",
] as const;

/** Validate that a requested pipeline follows the canonical stage order without duplicates. */
export function validateVideoPipeline(stages: readonly VideoStage[]): string[] {
  const errors: string[] = [];
  const positions = stages.map((stage) => VIDEO_PIPELINE.indexOf(stage));
  if (new Set(stages).size !== stages.length) errors.push("Pipeline stages must not repeat.");
  if (positions.some((position) => position < 0)) errors.push("Pipeline contains an unknown stage.");
  if (positions.some((position, index) => index > 0 && position < positions[index - 1])) {
    errors.push("Pipeline stages must follow the canonical order.");
  }
  return errors;
}
