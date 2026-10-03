# BIORICHEBRAIN Agent Runtime Architecture

## Decision

BIORICHEBRAIN remains a TypeScript-first VS Code extension with a provider abstraction. The current bounded `TeamOrchestrator` is the control layer for deterministic delegation; it is not replaced wholesale by another framework.

The architecture adopts proven mechanisms from several high-signal agent runtimes:

- **OpenAI Agents SDK (TypeScript)** — runtime primitives for agents, agents-as-tools, handoffs, guardrails, MCP, sessions, human approval, and tracing. Use this as the preferred execution substrate when BIORICHEBRAIN starts granting agents tools. Keep the existing `BrainProvider` boundary so the extension is not coupled to one runtime.
- **LangGraph** — adopt the conceptual separation of thread-scoped checkpoints and durable cross-thread stores for MEMORY ENGINE. Do not add LangGraph as a second orchestration runtime to the VS Code extension.
- **OpenHands** — adopt composable skills, immutable configuration, explicit conversation state, workspace boundaries, security validation, and optional remote Agent Server execution. Use OpenHands concepts for DEVOPS/coding workspaces rather than giving every BIORICHEBRAIN agent raw shell access.
- **Agno** — use as a reference for a platform layer: API/MCP exposure, memory, guardrails, RBAC, observability, and agent/team/workflow separation. Do not introduce a second agent platform into the extension.

## Current execution layers

1. **ORCHESTRATOR**
   - Creates a bounded plan of 1–8 specialist tasks.
   - Specialist concurrency is capped at 4.
   - ORCHESTRATOR cannot delegate to itself.
   - Delegation plans cannot request purchases, deployments, legal submissions, external writes, or irreversible actions.
2. **Specialists**
   - Run through the existing `BrainProvider`.
   - Each result is isolated; one failure does not abort the batch.
3. **SYNTHESIS**
   - ORCHESTRATOR combines outputs.
   - Must distinguish facts, hypotheses, recommendations, unresolved evidence, and human-approval gates.
4. **TOOLS (next phase)**
   - Tools are capability grants, not inherent agent powers.
   - Add typed tool registry + allowlists before exposing GitHub, filesystem, browser, procurement, or external-write tools.
5. **APPROVAL GATE**
   - Any irreversible/external side effect pauses for explicit human approval.
6. **MEMORY**
   - Short-term run state and long-term project memory are separate stores.
   - Every memory item needs provenance and status: fact, source claim, hypothesis, validated result, decision, or superseded item.

## Why the current PR should stay bounded

The existing team runner is useful as a deterministic orchestration layer. Replacing it immediately with multiple frameworks would create duplicated state machines, unclear ownership of retries, and more dependency surface.

The next major upgrade should therefore be **capabilities + state + approvals**, not a larger number of agents.

## Phase roadmap

### Phase A — current PR
- bounded delegation
- specialist isolation
- synthesis
- CI tests

### Phase B — tool registry
- typed `ToolDefinition`
- agent-to-tool capability matrix
- read-only vs write classification
- approval requirement
- audit event for every tool invocation

### Phase C — OpenAI Agents SDK integration
- use `@openai/agents` for agents that need real tool loops
- preserve BIORICHEBRAIN agent registry and routing policy
- use agent-as-tool for manager-style specialists
- use handoffs only where ownership of the conversation should transfer
- add SDK guardrails and tracing
- keep external side effects behind approval

### Phase D — persistent memory
- checkpoint current run state
- durable project memory
- provenance and contradiction tracking
- resumable runs after interruption

### Phase E — workspace / autonomous DevOps
- isolated workspace per task
- explicit filesystem/shell capability
- security policy before execution
- remote Agent Server only when isolation is required

### Phase F — evaluation
- regression tasks for all 22 agents
- scientific evidence/claim tests
- tool authorization tests
- failure/retry tests
- cost/latency telemetry
- human-approval compliance tests

## Non-goals

- Do not copy LangGraph, CrewAI, Agno, or OpenHands wholesale.
- Do not give all 22 agents unrestricted tools.
- Do not treat model parallelism as delegation.
- Do not persist unsupported claims as project facts.
- Do not allow autonomous purchases, legal filings, deployments, or irreversible changes.

## Reference sources

OpenAI Agents SDK:
https://openai.github.io/openai-agents-js/

OpenAI Agents SDK TypeScript repository:
https://github.com/openai/openai-agents-js

LangGraph persistence:
https://langchain-ai.github.io/langgraphjs/how-tos/persistence-postgres/

OpenHands SDK architecture:
https://github.com/OpenHands/docs/blob/main/sdk/arch/sdk.mdx

OpenHands agent architecture:
https://github.com/OpenHands/docs/blob/main/sdk/arch/agent.mdx

Agno platform:
https://github.com/agno-agi/agno


## Checkpoint, sandbox and evaluation layer

BIORICHEBRAIN now persists interrupted OpenAI Agents SDK runs as local checkpoints under `.biorichebrain/checkpoints/`. The SDK `RunState` is serialized without tracing credentials and can be restored with `RunState.fromString`; the original agent graph must be rebuilt for safe resume.

DEVOPS has an explicit sandbox command using the Agents SDK `SandboxAgent` and `UnixLocalSandboxClient`. The sandbox is approval-gated and uses a filtered host environment. Unix-local execution is intentionally for trusted local development; stronger isolation should use Docker or a hosted sandbox before untrusted workloads.

A small deterministic evaluation harness covers evidence/claims and approval-gate behavior. Future evaluation can be expanded with the SDK's deterministic testing utilities and tracing/evaluation integrations.
