# BIORICHE BRAIN — OpenAI routing

## Model tiers

| Tier | Default model ID | Use |
|---|---|---|
| Luna | `gpt-5.6-luna` | high-volume, cost-sensitive work |
| Terra | `gpt-5.6-terra` | balanced everyday work |
| Sol | `gpt-5.6-sol` | complex reasoning, R&D, QA |
| Astra | `gpt-6-astra` | frontier multi-step work; opt-in only |

Model IDs are configurable through environment variables. OpenAI's current API guidance recommends Astra for the hardest end-to-end work, Terra for capability/cost balance, and Luna for cost-sensitive high-volume workloads.

## Environment

```text
BIORICHE_BRAIN_ENABLED=true
BIORICHE_BRAIN_PROVIDER=openai
OPENAI_API_KEY=<runtime secret; never commit>
BIORICHE_BRAIN_ASTRA_ENABLED=false
BIORICHE_BRAIN_MODEL_LUNA=gpt-5.6-luna
BIORICHE_BRAIN_MODEL_TERRA=gpt-5.6-terra
BIORICHE_BRAIN_MODEL_SOL=gpt-5.6-sol
BIORICHE_BRAIN_MODEL_ASTRA=gpt-6-astra
BIORICHE_BRAIN_MAX_QA_RETRIES=1
BIORICHE_BRAIN_MAX_PROVIDER_RETRIES=2
BIORICHE_BRAIN_MAX_CONCURRENCY=2
BIORICHE_BRAIN_PARALLEL_TOOL_CALLS=true
```

Astra remains disabled unless both Brain and the Astra feature flag are enabled. No key is stored in repository files.

## Routing

- Routine: Terra → Luna.
- Scientific: Sol → Terra → Luna.
- High-impact: Sol → Terra → Luna and mandatory QA.
- Explicit frontier: Astra → Sol → Terra → Luna when Astra is enabled.

The router never silently upgrades routine work to Astra.

## Responses API and caching

The OpenAI provider uses `/v1/responses`. Stable role instructions are separated from task input, and the cache key is deterministic by agent and prompt schema version. This keeps reusable context cacheable without placing secrets in the key.

## QA and tools

Scientific and high-impact work goes through the QA Inspector before acceptance. Tool access is deny-by-default and allowlisted by agent. Tool call counts and concurrency are bounded.

## Codex readiness

For GPT-5.6 in Codex, OpenAI documents minimum versions of ChatGPT Desktop `26.707.30751` or Codex CLI `0.144.0`. GPT-6 Astra requires Codex CLI `0.153.0+` during rollout. Keep Codex versions current rather than hard-coding them into Brain runtime logic.

## Official monitoring

Monitor OpenAI release notes and model guidance for model IDs, availability, pricing, reasoning controls, and tool changes. The repository's `modelMonitor.ts` normalizes supplied catalog metadata; scheduling of official web checks belongs to the host automation layer.
