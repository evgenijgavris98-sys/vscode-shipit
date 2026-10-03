import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export type MemoryStatus = "fact" | "source_claim" | "hypothesis" | "validated_result" | "decision" | "superseded";

export interface MemoryRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: MemoryStatus;
  topic: string;
  content: string;
  source?: string;
  supersedes?: string;
}

interface MemoryDocument {
  version: 1;
  records: MemoryRecord[];
}

export class ProjectMemoryStore {
  private readonly filePath: string;

  public constructor(private readonly workspaceRoot: string) {
    this.filePath = join(workspaceRoot, ".biorichebrain", "memory.json");
  }

  public async list(query?: string, limit = 20): Promise<MemoryRecord[]> {
    const document = await this.load();
    const normalized = query?.trim().toLowerCase();
    const records = normalized
      ? document.records.filter((item) =>
          [item.topic, item.content, item.source, item.status].filter(Boolean).join(" ").toLowerCase().includes(normalized)
        )
      : document.records;
    return records.slice(-Math.max(1, Math.min(100, limit)));
  }

  public async write(input: Omit<MemoryRecord, "id" | "createdAt" | "updatedAt">): Promise<MemoryRecord> {
    const document = await this.load();
    const now = new Date().toISOString();
    const record: MemoryRecord = {
      ...input,
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
    };
    document.records.push(record);
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(document, null, 2) + "\n", "utf8");
    return record;
  }

  private async load(): Promise<MemoryDocument> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8")) as MemoryDocument;
    } catch {
      return { version: 1, records: [] };
    }
  }
}
