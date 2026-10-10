# BIORICHEBRAIN — Claude + DeepSeek

This integration adds two execution backends without storing credentials in the repository.

## Claude Code

Uses the locally installed Claude Code CLI.

Environment:
- `BIORICHE_BRAIN_ENABLED=true`
- `BIORICHE_BRAIN_PROVIDER=claude`
- `CLAUDE_CLI_PATH=claude`
- `CLAUDE_MODEL=sonnet`

The provider runs Claude Code in print mode with plan permissions and a bounded turn/time budget. It does not use `--dangerously-skip-permissions` or `--yolo`.

## DeepSeek

Uses the official DeepSeek API through Chat Completions.

Environment:
- `BIORICHE_BRAIN_ENABLED=true`
- `BIORICHE_BRAIN_PROVIDER=deepseek`
- `DEEPSEEK_API_KEY=<local secret>`
- `DEEPSEEK_BASE_URL=https://api.deepseek.com`
- `DEEPSEEK_MODEL=deepseek-v4-pro`

No API key is committed to Git. The adapter uses the documented `deepseek-v4-pro` model and thinking/reasoning controls.

## Safety

All providers receive BIORICHEBRAIN role guardrails:
- no invented evidence, approvals or experimental results
- no unsupported medical claims
- no purchases, deployments, legal submissions or irreversible external writes
- safety, legal, regulatory, privacy and high-impact actions require human approval

## Provider matrix

| Provider | Transport | Default model | Credentials |
|---|---|---|---|
| OpenAI | Responses/Agents SDK | configured GPT tier | `OPENAI_API_KEY` |
| Kimi | API or local CLI/MCP | `kimi-k2.5` | local env |
| Qwen | local Qwen Code CLI | `qwen3-coder-plus` | local Qwen setup |
| Claude | local Claude Code CLI | `sonnet` | local Claude setup |
| DeepSeek | Chat Completions API | `deepseek-v4-pro` | `DEEPSEEK_API_KEY` |

The repository does not attempt to install software on the user's phone or computer. Local CLI/API authentication remains on the user's device.

## Automatic routing

Team execution uses the Smart Router. It ranks providers by task type, skips unavailable API credentials, and falls back when a provider fails.
