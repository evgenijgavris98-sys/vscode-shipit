import { AgentRegistry } from './agentRegistry';
import { AgentDefinition, BrainTask, ExecutionResult, TaskState } from './brainTypes';

/**
 * Domain-neutral execution engine for DELINA/BIORICHE Brain.
 * It selects an agent, records lifecycle transitions and enforces review gates.
 * Actual model/tool execution remains behind the Executor interface so the
 * engine can later use Copilot, OpenAI, local models, or other providers.
 */
export interface Executor {
    execute(task: BrainTask, agent: AgentDefinition): Promise<ExecutionResult>;
}

export class BrainExecutionEngine {
    constructor(
        private readonly registry: AgentRegistry,
        private readonly executor: Executor
    ) {}

    assign(task: BrainTask): BrainTask {
        if (task.state !== TaskState.PLANNED && task.state !== TaskState.BLOCKED) {
            throw new Error(`Task ${task.id} cannot be assigned from state ${task.state}`);
        }

        const agent = this.selectAgent(task);
        return { ...task, state: TaskState.ASSIGNED, assignedAgent: agent.id };
    }

    async run(task: BrainTask): Promise<BrainTask> {
        if (task.state !== TaskState.ASSIGNED || !task.assignedAgent) {
            throw new Error(`Task ${task.id} must be ASSIGNED before execution`);
        }

        const agent = this.registry.get(task.assignedAgent);
        if (!agent) {
            throw new Error(`Agent not found: ${task.assignedAgent}`);
        }

        const started = { ...task, state: TaskState.IN_PROGRESS, attempts: task.attempts + 1 };
        const result = await this.executor.execute(started, agent);

        if (!result.success) {
            return {
                ...started,
                state: result.retryable ? TaskState.RETRY : TaskState.BLOCKED,
                lastError: result.error
            };
        }

        return {
            ...started,
            state: agent.requiresReview ? TaskState.REVIEW : TaskState.COMPLETE,
            result: result.output,
            lastError: undefined
        };
    }

    approve(task: BrainTask): BrainTask {
        if (task.state !== TaskState.REVIEW) {
            throw new Error(`Task ${task.id} is not waiting for review`);
        }
        return { ...task, state: TaskState.COMPLETE };
    }

    reject(task: BrainTask, reason: string): BrainTask {
        if (task.state !== TaskState.REVIEW) {
            throw new Error(`Task ${task.id} is not waiting for review`);
        }
        return { ...task, state: TaskState.RETRY, lastError: reason };
    }

    private selectAgent(task: BrainTask): AgentDefinition {
        if (task.agentId) {
            const explicit = this.registry.get(task.agentId);
            if (!explicit) throw new Error(`Agent not found: ${task.agentId}`);
            return explicit;
        }

        for (const capability of task.requiredCapabilities) {
            const match = this.registry.findByCapability(capability)[0];
            if (match) return match;
        }

        const director = this.registry.get('LAB_DIRECTOR');
        if (!director) throw new Error('No suitable agent and LAB_DIRECTOR is not registered');
        return director;
    }
}
