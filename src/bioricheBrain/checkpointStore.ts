import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";

export interface RunCheckpoint {
  version: 1;
  id: string;
  createdAt: string;
  updatedAt: string;
  agent: string;
  task: string;
  provider: "openai";
  state: string;
}

export class CheckpointStore {
  private readonly root: string;
  public constructor(workspaceRoot: string) {
    this.root = join(workspaceRoot, ".biorichebrain", "checkpoints");
  }

  private path(id: string): string {
    if (!/^[a-zA-Z0-9._-]+$/.test(id)) throw new Error("Invalid checkpoint id.");
    return join(this.root, id + ".json");
  }

  public async save(checkpoint: RunCheckpoint): Promise<void> {
    const path = this.path(checkpoint.id);
    await fs.mkdir(dirname(path), { recursive: true });
    const tmp = path + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(checkpoint, null, 2), "utf8");
    await fs.rename(tmp, path);
  }

  public async load(id: string): Promise<RunCheckpoint> {
    const raw = await fs.readFile(this.path(id), "utf8");
    const parsed = JSON.parse(raw) as RunCheckpoint;
    if (parsed.version !== 1 || !parsed.state || !parsed.agent) throw new Error("Invalid BIORICHEBRAIN checkpoint.");
    return parsed;
  }

  public async list(): Promise<RunCheckpoint[]> {
    try {
      const names = await fs.readdir(this.root);
      const items: RunCheckpoint[] = [];
      for (const name of names.filter((n) => n.endsWith(".json"))) {
        try { items.push(await this.load(name.slice(0, -5))); } catch { /* ignore corrupt entries */ }
      }
      return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  public async remove(id: string): Promise<void> {
    try { await fs.unlink(this.path(id)); } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}
