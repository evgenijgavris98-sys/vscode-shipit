# BIORICHEBRAIN Kimi integration

BIORICHEBRAIN can route agent runs through either the OpenAI Agents SDK provider or the Kimi API.

## Configuration

OpenAI remains the default:

```text
BIORICHE_BRAIN_PROVIDER=openai
OPENAI_API_KEY=...
```

Kimi uses the OpenAI-compatible Chat Completions endpoint:

```text
BIORICHE_BRAIN_PROVIDER=kimi
KIMI_API_KEY=...
KIMI_BASE_URL=https://api.kimi.com/coding/v1
KIMI_MODEL=kimi-k2.5
```

For a Moonshot Platform deployment, set `KIMI_BASE_URL` and `KIMI_MODEL` to the endpoint/model exposed by that account.

## Architecture

Kimi is a provider, not a second orchestration runtime:

```text
BIORICHEBRAIN ORCHESTRATOR
        |
        +-- OpenAI Agents SDK
        |
        +-- Kimi Provider
        |
        +-- shared MCP / capability / approval / audit architecture
```

The first Kimi integration is deliberately bounded: it provides model execution and does not grant shell, GitHub, memory-write, deployment, procurement, or legal-submit capabilities. Those remain behind BIORICHEBRAIN's existing capability and approval layers.

Kimi Code supports MCP and permission rules. A future adapter can connect the same allowlisted MCP boundary directly to Kimi sessions after tests verify that external write/irreversible tools remain approval-gated.
