import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { tool } from "@openai/agents";
import { z } from "zod";
import type { BrainAgent } from "./types";
import { authorizeToolInvocation } from "./toolRegistry";
import type { ApprovalGate } from "./approvalGate";
import type { AuditSink } from "./auditLog";
import { ProjectMemoryStore, type MemoryStatus } from "./memoryStore";

const summarizeInput = (value: unknown): string => JSON.stringify(value).slice(0, 1000);

export function createBrainTools(
  agent: BrainAgent,
  workspaceRoot: string,
  approvalGate: ApprovalGate,
  audit: AuditSink,
) {
  const memory = new ProjectMemoryStore(workspaceRoot);

  const projectRead = tool({
    name: "project_read",
    description: "Read a UTF-8 text file inside the current BIORICHEBRAIN workspace. Use only for project-local evidence.",
    parameters: z.object({ path: z.string().min(1).max(500) }),
    execute: async ({ path }) => {
      const definition = authorizeToolInvocation({ toolId: "project.read", agent, input: { path } });
      const target = join(workspaceRoot, path);
      const safePath = relative(workspaceRoot, target);
      if (safePath.startsWith("..") || safePath.includes("..\\") || safePath.includes("../")) {
        throw new Error("project.read refused a path outside the workspace.");
      }
      try {
        const content = await readFile(target, "utf8");
        await audit.record({ timestamp: new Date().toISOString(), agent, toolId: definition.id, outcome: "allowed", inputSummary: summarizeInput({ path }) });
        return content.slice(0, 30000);
      } catch (error) {
        await audit.record({ timestamp: new Date().toISOString(), agent, toolId: definition.id, outcome: "failed", inputSummary: summarizeInput({ path }), detail: String(error) });
        throw error;
      }
    },
  });

  const memoryRead = tool({
    name: "memory_read",
    description: "Read canonical BIORICHEBRAIN project memory with provenance/status. Treat hypotheses as hypotheses and never upgrade unsupported claims.",
    parameters: z.object({ query: z.string().optional(), limit: z.number().int().min(1).max(50).optional() }),
    execute: async ({ query, limit }) => {
      const definition = authorizeToolInvocation({ toolId: "memory.read", agent, input: { query, limit } });
      const records = await memory.list(query, limit);
      await audit.record({ timestamp: new Date().toISOString(), agent, toolId: definition.id, outcome: "allowed", inputSummary: summarizeInput({ query, limit }) });
      return JSON.stringify(records);
    },
  });

  const memoryWrite = tool({
    name: "memory_write",
    description: "Persist a canonical project-memory record. This is a write and always requires explicit human approval.",
    parameters: z.object({
      status: z.enum(["fact", "source_claim", "hypothesis", "validated_result", "decision", "superseded"]),
      topic: z.string().min(1).max(300),
      content: z.string().min(1).max(10000),
      source: z.string().max(1000).optional(),
      supersedes: z.string().max(200).optional(),
    }),
    execute: async (input) => {
      const definition = authorizeToolInvocation({ toolId: "memory.write", agent, input });
      await audit.record({ timestamp: new Date().toISOString(), agent, toolId: definition.id, outcome: "approval_required", inputSummary: summarizeInput(input) });
      const approved = await approvalGate.requestApproval({
        agent,
        tool: definition,
        reason: "BIORICHEBRAIN wants to persist a project-memory record.",
        inputSummary: summarizeInput(input),
      });
      if (!approved) {
        await audit.record({ timestamp: new Date().toISOString(), agent, toolId: definition.id, outcome: "denied", inputSummary: summarizeInput(input) });
        throw new Error("Human approval was not granted for memory.write.");
      }
      const record = await memory.write(input as { status: MemoryStatus; topic: string; content: string; source?: string; supersedes?: string });
      await audit.record({ timestamp: new Date().toISOString(), agent, toolId: definition.id, outcome: "approved", inputSummary: summarizeInput(input) });
      return JSON.stringify(record);
    },
  });

  return [projectRead, memoryRead, memoryWrite];
}
