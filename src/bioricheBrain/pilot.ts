import { selectModelTier } from "./router";
import type { AgentResult, BrainProvider, BrainTask } from "./types";

export interface PilotOptions {
  maxQaRetries?: number;
}

export async function runBrainPilot(
  provider: BrainProvider,
  task: BrainTask,
  options: PilotOptions = {},
): Promise<AgentResult> {
  const maxQaRetries = Math.max(0, options.maxQaRetries ?? 1);
  const tier = selectModelTier(task);

  const draft = await provider.run("rd_chemist", { task, tier });
  let retryCount = 0;

  while (true) {
    const qaTask: BrainTask = {
      ...task,
      input: `Review the following draft and return PASS or FAIL with a concise reason:\n\n${draft}`,
    };
    const qaOutput = await provider.run("qa_inspector", { task: qaTask, tier });
    const passed = /^\s*PASS\b/i.test(qaOutput);

    if (passed || retryCount >= maxQaRetries) {
      return {
        agent: "qa_inspector",
        tier,
        output: draft,
        passed,
        retryCount,
      };
    }

    retryCount += 1;
  }
}
