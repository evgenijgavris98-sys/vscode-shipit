import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
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

const MEMORY_STATUSES = new Set<MemoryStatus>([
  "fact", "source_claim", "hypothesis", "validated_result", "decision", "superseded",
]);

function isRecord(value: unknown): value is MemoryRecord {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string"
    && typeof item.createdAt === "string"
    && typeof item.updatedAt === "string"
    && typeof item.status === "string"
    && MEMORY_STATUSES.has(item.status as MemoryStatus)
    && typeof item.topic === "string"
    && typeof item.content === "string"
    && (item.source === undefined || typeof item.source === "string")
    && (item.supersedes === undefined || typeof item.supersedes === "string");
}

function parseDocument(raw: string): MemoryDocument {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object") {
    throw new Error("BIORICHEBRAIN memory is invalid: expected an object.");
  }
  const document = value as Record<string, unknown>;
  if (document.version !== 1 || !Array.isArray(document.records) || !document.records.every(isRecord)) {
    throw new Error("BIORICHEBRAIN memory is invalid: unsupported version or malformed records. Original file was preserved.");
  }
  return { version: 1, records: document.records };
}

export class ProjectMemoryStore {
  private readonly filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();

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
    const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.floor(limit))) : 20;
    return records.slice(-safeLimit);
  }

  public async write(input: Omit<MemoryRecord, "id" | "createdAt" | "updatedAt">): Promise<MemoryRecord> {
    const operation = this.writeQueue.then(async () => {
      const document = await this.load();
      const now = new Date().toISOString();
      const record: MemoryRecord = {
        ...input,
        id: `mem_${randomUUID()}`,
        createdAt: now,
        updatedAt: now,
      };
      document.records.push(record);
      await this.persist(document);
      return record;
    });
    this.writeQueue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  private async persist(document: MemoryDocument): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(document, null, 2) + "\n", { encoding: "utf8", flag: "wx" });
    await rename(temporaryPath, this.filePath);
  }

  private async load(): Promise<MemoryDocument> {
    try {
      return parseDocument(await readFile(this.filePath, "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { version: 1, records: [] };
      }
      throw error;
    }
  }
}
