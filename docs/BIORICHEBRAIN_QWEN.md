# BIORICHE BRAIN — Qwen Code integration

Qwen Code is an optional local execution provider for BIORICHE BRAIN. It is intentionally separated from the OpenAI provider and uses the user's existing Qwen Code installation/configuration.

## Runtime

Set these environment variables in the VS Code extension host:

- `BIORICHE_BRAIN_ENABLED=true`
- `BIORICHE_BRAIN_PROVIDER=qwen`
- `QWEN_CLI_PATH=qwen` (optional; defaults to `qwen`)
- `QWEN_MODEL=qwen3-coder-plus` (optional)

No Qwen credentials are stored in the repository. Qwen Code resolves authentication from its normal local configuration/environment.

## Safety

The BIORICHE BRAIN adapter invokes Qwen Code in `--approval-mode plan`. It does not use `--yolo` and does not grant automatic approval for external writes.

The adapter also supplies BIORICHE-specific role instructions and prohibits purchases, deployments, legal submissions, medical claims and irreversible external actions.

## Architecture

`TeamOrchestrator -> BrainProvider -> Qwen Code CLI -> configured Qwen model/provider`

Qwen Code itself supports headless execution with `--prompt`, model selection with `--model`, and non-interactive output suitable for automation. See the official Qwen Code documentation for current CLI behavior.

The same BIORICHE BRAIN agent registry can therefore route bounded tasks to Qwen without replacing the primary OpenAI provider.
