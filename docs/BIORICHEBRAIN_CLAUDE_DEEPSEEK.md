# BIORICHEBRAIN — Claude + DeepSeek

This integration adds two additional execution backends without storing credentials in the repository.

## Claude Code

Uses the locally installed Claude Code CLI.

Environment:
- `BIORICHE_BRAIN_ENABLED=true`
- `BIORICHE_BRAIN_PROVIDER=claude`
- `CLAUDE_CLI_PATH=claude`
- `CLAUDE_MODEL=claude-sonnet-5-5`

The provider runs Claude Code in print mode with plan permissions and a bounded turn/time budget. It does not use `--dangerously-skip-permissions` or `--yolo`.

Claude Code is an agentic coding tool maintained in the official Anthropic repository.

## DeepSeek

Uses the official DeepSeek API.

Environment:
- `BIORICHE_BRAIN_ENABLED=true`
- `BIORICHE_BRAIN_PROVIDER=deepseek`
- `DEEPSEEK_API_KEY=<local secret>`
- `DEEPSEEK_BASE_URL=https://api.deepseek.com`
- `DEEPSEEK_MODEL=deepseek-v4-pro`

No API key is committed to Git. DeepSeek supports OpenAI-compatible API usage and currently documents `deepseek-flash` and `deepseek-v4-pro` for its Responses API.

## Safety

All providers receive the same BIORICHEBRAIN agent-role guardrails:
- no invented evidence, approvals or experimental results
- no medical claims presented as facts
- no purchases, deployments, legal submissions or irreversible external writes
- safety, legal, regulatory, privacy and high-impact actions require human approval

## Current provider matrix

| Provider | Transport | Default model | Credentials |
|---|---|---|---|
| OpenAI | Responses/Agents SDK | configured GPT tier | `OPENAI_API_KEY` |
| Kimi | API or local CLI/MCP | `kimi-k2.5` | local env |
| Qwen | local Qwen Code CLI | `qwen3-coder-plus` | local Qwen setup |
| Claude | local Claude Code CLI | `claude-sonnet-5-5` | local Claude setup |
| DeepSeek | API | `deepseek-v4-pro` | `DEEPSEEK_API_KEY` |

The repository does not attempt to install software on the user's phone or computer. The connected GitHub side is prepared; local CLI/API authentication remains on the user's device.
