import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

export type VideoAspect = "9:16" | "16:9" | "1:1";

export interface VideoJob {
  id: string;
  product: string;
  objective: string;
  durationSeconds: number;
  aspect: VideoAspect;
  scenes: Array<{ prompt: string; seconds: number }>;
  voiceover?: string;
  outputDir: string;
}

export interface ToolStatus {
  name: string;
  command: string;
  installed: boolean;
  version?: string;
}

function commandVersion(command: string): ToolStatus {
  const result = spawnSync(command, ["--version"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const output = String(result.stdout ?? "") + String(result.stderr ?? "");
  return { name: command, command, installed: result.status === 0, version: output.trim().split("\n")[0]?.slice(0, 180) };
}

export function checkVideoToolchain(): ToolStatus[] {
  return [commandVersion("ffmpeg"), commandVersion("python"), commandVersion("node"), commandVersion("git")];
}

export function createVideoJob(workspace: string, job: VideoJob): string {
  const root = join(workspace, ".bioriche", "video", job.id);
  mkdirSync(root, { recursive: true });
  const manifest = join(root, "job.json");
  writeFileSync(manifest, JSON.stringify({
    ...job,
    pipeline: {
      generation: "WanGP / Wan 2.2 TI2V-5B",
      orchestration: "BIORICHEBRAIN VIDEO AGENT",
      editing: "Rendiv + FFmpeg",
      subtitles: "Whisper-compatible transcription",
      tts: "local TTS provider",
      policy: "open-source/local-first; paid APIs disabled by default"
    }
  }, null, 2), "utf8");
  return manifest;
}

export function validateVideoJob(job: VideoJob): string[] {
  const errors: string[] = [];
  if (!job.id.trim()) errors.push("id is required");
  if (!job.product.trim()) errors.push("product is required");
  if (job.durationSeconds <= 0 || job.durationSeconds > 180) errors.push("durationSeconds must be 1..180");
  if (job.scenes.length === 0) errors.push("at least one scene is required");
  const total = job.scenes.reduce((sum, scene) => sum + scene.seconds, 0);
  if (total > job.durationSeconds + 0.5) errors.push("scene duration exceeds total duration");
  if (!existsSync(job.outputDir)) errors.push("outputDir does not exist");
  return errors;
}
