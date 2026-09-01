import { AgentDefinition, AgentId } from './brainTypes';

/**
 * Registry for domain agents. The execution engine depends on this abstraction,
 * so adding or replacing agents does not require changing orchestration logic.
 */
export class AgentRegistry {
    private readonly agents = new Map<AgentId, AgentDefinition>();

    register(agent: AgentDefinition): void {
        if (!agent.id.trim()) {
            throw new Error('Agent id cannot be empty');
        }
        if (this.agents.has(agent.id)) {
            throw new Error(`Agent already registered: ${agent.id}`);
        }
        this.agents.set(agent.id, agent);
    }

    get(agentId: AgentId): AgentDefinition | undefined {
        return this.agents.get(agentId);
    }

    list(): AgentDefinition[] {
        return [...this.agents.values()];
    }

    findByCapability(capability: string): AgentDefinition[] {
        const normalized = capability.trim().toLowerCase();
        return this.list().filter(agent =>
            agent.capabilities.some(item => item.toLowerCase() === normalized)
        );
    }
}

/** Initial specialist catalog for DELINA/BIORICHE Brain. */
export function createDelinaAgentRegistry(): AgentRegistry {
    const registry = new AgentRegistry();

    registry.register({
        id: 'LAB_DIRECTOR',
        name: 'Lab Director',
        description: 'Prioritization, orchestration and final task coordination.',
        capabilities: ['orchestration', 'prioritization'],
        requiresReview: true
    });
    registry.register({
        id: 'RND_CHEMIST',
        name: 'R&D Chemist',
        description: 'Formulation and technical product analysis.',
        capabilities: ['formulation', 'technical-analysis'],
        requiresReview: true
    });
    registry.register({
        id: 'MARKET_ANALYST',
        name: 'Market Analyst',
        description: 'Market, competitor and pricing research.',
        capabilities: ['market-research', 'competitor-analysis', 'pricing'],
        requiresReview: false
    });
    registry.register({
        id: 'LEGAL_GUARD',
        name: 'Legal Guard',
        description: 'Legal-risk and claims review.',
        capabilities: ['legal-review', 'claims-review'],
        requiresReview: false
    });
    registry.register({
        id: 'REGULATORY_WATCHDOG',
        name: 'Regulatory Watchdog',
        description: 'Regulatory and compliance review.',
        capabilities: ['regulatory-review', 'compliance'],
        requiresReview: false
    });
    registry.register({
        id: 'QA_INSPECTOR',
        name: 'QA Inspector',
        description: 'Verification, tests and quality gates.',
        capabilities: ['qa', 'verification', 'testing'],
        requiresReview: false
    });
    registry.register({
        id: 'SUPPLY_CHAIN',
        name: 'Supply Chain',
        description: 'Supplier and operational analysis.',
        capabilities: ['sourcing', 'supply-chain'],
        requiresReview: false
    });
    registry.register({
        id: 'CONTENT_MANAGER',
        name: 'Content Manager',
        description: 'Approved product and marketing content production.',
        capabilities: ['content', 'copywriting'],
        requiresReview: true
    });

    return registry;
}
