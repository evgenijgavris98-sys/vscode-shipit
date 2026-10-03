import type { BrainAgent, BrainProvider, ModelTier } from "./types";
import { AGENT_REGISTRY, getAgentDefinition } from "./agentRegistry";

export interface DelegatedTask {
  agent: BrainAgent;
  task: string;
  tier?: ModelTier;
}

export interface DelegationPlan {
  tasks: DelegatedTask[];
}

export interface TeamResult {
  plan: DelegationPlan;
  results: Array<{ agent: BrainAgent; output?: string; error?: string }>;
  synthesis: string;
}

const MAX_TASKS = 8;
const MAX_PARALLEL = 4;

function extractJson(text: string): string {
  const fenced = text.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/i);
  return fenced?.[1] ?? text.trim();
}

function validatePlan(value: unknown): DelegationPlan {
  if (!value || typeof value !== "object" || !Array.isArray((value as { tasks?: unknown }).tasks)) {
    throw new Error("ORCHESTRATOR returned an invalid delegation plan.");
  }
  const raw = (value as { tasks: unknown[] }).tasks.slice(0, MAX_TASKS);
  const tasks: DelegatedTask[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as Record<string, unknown>;
    const agent = candidate.agent;
    const task = candidate.task;
    if (typeof agent !== "string" || typeof task !== "string" || !task.trim()) continue;
    if (agent === "orchestrator" || !AGENT_REGISTRY.some((definition) => definition.id === agent)) continue;
    const definition = getAgentDefinition(agent as BrainAgent);
    const tier = candidate.tier;
    const safeTier: ModelTier | undefined =
      tier === "luna" || tier === "terra" || tier === "sol" ? tier : undefined;
    tasks.push({ agent: agent as BrainAgent, task: task.trim().slice(0, 12000), tier: safeTier ?? definition.defaultTier });
  }
  if (tasks.length === 0) throw new Error("ORCHESTRATOR produced no valid delegated tasks.");
  return { tasks };
}

async function runBatches<T>(items: T[], worker: (item: T, index: number) => Promise<void>): Promise<void> {
  for (let i = 0; i < items.length; i += MAX_PARALLEL) {
    await Promise.all(items.slice(i, i + MAX_PARALLEL).map((item, offset) => worker(item, i + offset)));
  }
}

export class TeamOrchestrator {
  public constructor(private readonly provider: BrainProvider) {}

  public async run(input: string): Promise<TeamResult> {
    const planPrompt = [
      "Create a bounded delegation plan for BIORICHEBRAIN.",
      "Return JSON only with shape: {\"tasks\":[{\"agent\":\"...\",\"task\":\"...\",\"tier\":\"luna|terra|sol\"}]}",
      "Use 1-8 tasks. Use only these agent IDs:",
      AGENT_REGISTRY.map((agent) => agent.id).join(", "),
      "Do not choose orchestrator as a specialist. Do not request external writes, purchases, deployments, legal submissions, or irreversible actions.",
      "User task:",
      input.slice(0, 12000),
    ].join("\n");

    const planRaw = await this.provider.run("orchestrator", {
      tier: "sol",
      task: { input: planPrompt },
    });
    const plan = validatePlan(JSON.parse(extractJson(planRaw)));
    const results: TeamResult["results"] = plan.tasks.map(({ agent }) => ({ agent }));

    await runBatches(plan.tasks, async (task, index) => {
      try {
        const output = await this.provider.run(task.agent, {
          tier: task.tier ?? getAgentDefinition(task.agent).defaultTier,
          task: { input: task.task },
        });
        results[index].output = output;
      } catch (error) {
        results[index].error = error instanceof Error ? error.message : String(error);
      }
    });

    const evidence = results.map((result, index) =>
      JSON.stringify({ task: index + 1, agent: result.agent, output: result.output, error: result.error })
    ).join("\n");

    const synthesis = await this.provider.run("orchestrator", {
      tier: "sol",
      task: {
        input: [
          "Synthesize the delegated BIORICHEBRAIN results into one actionable answer.",
          "Do not invent missing evidence. Mark unresolved items explicitly.",
          "Separate facts, hypotheses, recommendations, and human-approval gates.",
          "Delegated results:",
          evidence.slice(0, 50000),
        ].join("\n"),
      },
    });
    return { plan, results, synthesis };
  }
}
