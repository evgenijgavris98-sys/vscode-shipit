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


## Kimi Code MCP bridge

When `KIMI_MCP_URL` is configured, BIORICHEBRAIN uses the installed `kimi` CLI instead of the direct API path. Kimi Code is launched in non-interactive print mode with an inline MCP configuration and an explicit tool allowlist. The same MCP endpoint can therefore be used by BIORICHEBRAIN and Kimi Code. Kimi Code supports HTTP MCP servers and `enabledTools` allowlists. citeturn0search0turn1search1

Example:

```text
BIORICHE_BRAIN_PROVIDER=kimi
KIMI_MCP_URL=http://127.0.0.1:3000/mcp
KIMI_MCP_TOOLS=project_read,memory_read
KIMI_CLI_PATH=kimi
```

The bridge rejects tool names containing common mutating verbs (`write`, `edit`, `delete`, `execute`, `deploy`, `submit`, `purchase`, `commit`, `push`, `merge`, etc.). Keep the Kimi MCP allowlist read-only. This is intentional because Kimi's non-interactive print mode can automatically approve tool calls; high-risk capabilities must stay outside this bridge and behind BIORICHEBRAIN's approval gate. The Kimi documentation also recommends keeping manual approval for high-risk MCP tools. citeturn1search1turn0search0
