# BIORICHEBRAIN — Our Free Model local gateway

This integration adds `our_free_model` as an optional OpenAI-compatible provider. It connects to the independently run Our Free Model service; it does **not** install or launch that service automatically.

## Why this route

The upstream project exposes a local OpenAI-compatible API:
- `GET /v1/models`
- `POST /v1/chat/completions`
- `POST /v1/responses`

BIORICHEBRAIN uses the Chat Completions endpoint for agent runs. The adapter discovers the available model list on each run, uses `OUR_FREE_MODEL_MODEL` when explicitly set, or selects the first currently listed model. This avoids hard-coding a model name that may disappear or be region-limited.

## Local service setup

Use the official repository and its current installation instructions:
https://github.com/Ebony-Vinyl/dsh-our-free-model

The independent service currently runs from the full source checkout; its standalone directory is not yet a separately installable npm package. Follow `packages/standalone/README.md` and use a supported Node.js runtime (Node 22.19+).

Default local API base URL: `http://127.0.0.1:18900/v1`.

At first launch, the service generates a local API key. Keep it private. Do not commit it to Git or put it in a shared .env file.

## BIORICHEBRAIN environment

Set these in the VS Code extension-host environment:

```dotenv
BIORICHE_BRAIN_ENABLED=true
BIORICHE_BRAIN_PROVIDER=our_free_model
OUR_FREE_MODEL_BASE_URL=http://127.0.0.1:18900/v1
OUR_FREE_MODEL_API_KEY=<local-key-generated-by-the-service>
# Optional: exact ID copied from GET /v1/models
OUR_FREE_MODEL_MODEL=<available-model-id>
```

Restart VS Code after changing environment variables. If `OUR_FREE_MODEL_MODEL` is omitted, the adapter chooses the first model returned by the local catalogue.

## Router behaviour

The smart router keeps its existing task-specific provider order. The explicitly configured provider is appended as the fallback. Set `BIORICHE_BRAIN_PROVIDER=our_free_model` to make this gateway the fallback when higher-priority providers are not configured or fail. To use it directly for a single agent, choose the provider as the active BIORICHEBRAIN provider.

## Security and limits

- The adapter accepts HTTPS URLs, or HTTP loopback only (`127.0.0.1`, `localhost`, `::1`).
- The API key is read from the process environment; never store it in source control.
- The local key protects access to the local gateway, not the upstream model provider.
- Free upstream allowances can be throttled, changed or withdrawn. This is not guaranteed unlimited compute.
- Prompts are sent to the selected upstream provider. Do not submit credentials, personal data, unpublished formulas, supplier contracts or other confidential BIORICHEBRAIN material through a free upstream.
- The adapter is optional and disabled by default. Existing OpenAI, DeepSeek, Kimi, Qwen and Claude providers remain unchanged.

## Verification checklist

1. Start the independent service and confirm `GET http://127.0.0.1:18900/health`.
2. Authenticate `GET /v1/models` with the generated Bearer key.
3. Copy one exact model ID from the response if you want deterministic selection.
4. Configure the environment above and restart VS Code.
5. Run a low-risk test task with non-confidential sample text.
6. Check the output and upstream usage dashboard before enabling more agents.
