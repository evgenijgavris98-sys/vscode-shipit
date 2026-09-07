# ShipIt

[![GitHub Copilot](https://img.shields.io/badge/GitHub-Copilot%20SDK-blue?style=flat-square&logo=github)](https://github.com/features/copilot)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.93%2B-blue?style=flat-square&logo=visualstudiocode)](https://code.visualstudio.com)
[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-007ACC-blue?style=flat-square&logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=emanuelebartolesi.shipit)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**ShipIt. Turn PRDs into shipped code.**

Autonomous PRD development in VS Code. ShipIt reads your Product Requirements Document (PRD), breaks down tasks into manageable user stories, and autonomously implements them using GitHub Copilot.

## BIORICHE BRAIN pilot

This repository contains an opt-in BIORICHE BRAIN provider boundary alongside the existing ShipIt workflow. The OpenAI Responses adapter supports configurable GPT-5.6 tiers (`luna`, `terra`, `sol`) and the current GPT-6 Astra tier without storing credentials in source control.

The adapter uses explicit prompt-cache settings and configurable reasoning effort. Fast mode is opt-in and is not applied to Astra because Fast mode is unavailable for Astra with EU data residency. Brain remains disabled unless `BIORICHE_BRAIN_ENABLED=true` is explicitly set.

### OpenAI runtime configuration

Set these environment variables in the runtime environment, never in the repository:

| Variable | Default | Purpose |
|---|---|---|
| `BIORICHE_BRAIN_ENABLED` | `false` | Explicitly enables the Brain pilot |
| `OPENAI_API_KEY` | unset | OpenAI API credential |
| `BIORICHE_BRAIN_MODEL_LUNA` | `gpt-5.6-luna` | Luna model mapping |
| `BIORICHE_BRAIN_MODEL_TERRA` | `gpt-5.6-terra` | Terra model mapping |
| `BIORICHE_BRAIN_MODEL_SOL` | `gpt-5.6-sol` | Sol model mapping |
| `BIORICHE_BRAIN_MODEL_ASTRA` | `gpt-6-astra` | Astra model mapping |
| `BIORICHE_BRAIN_REASONING_EFFORT` | `medium` | `low`, `medium`, `high`, or `xhigh` |
| `BIORICHE_BRAIN_FAST_MODE` | `false` | Opt into OpenAI Fast mode for non-Astra tiers |
| `BIORICHE_BRAIN_MAX_QA_RETRIES` | `1` | QA retry limit, capped at 3 |

The current pilot provider is intentionally separate from the existing Copilot SDK path so disabling Brain preserves normal ShipIt behavior.

## Overview

ShipIt is a VS Code extension that orchestrates the GitHub Copilot SDK to implement your PRD in a structured, autonomous workflow. Instead of manual implementation requests, you describe your project requirements in a PRD, and ShipIt handles the rest:

1. Reads tasks from your PRD
2. Generates focused user stories for each task
3. Implements each user story with Copilot
4. Tracks progress and automatically continues to the next task
5. Maintains a progress log of completed work

The extension provides a sidebar control panel with real-time status, file watching for progress tracking, and automatic error recovery with retry logic.

## Features

- **Autonomous Task Loop** - Continuously works through your PRD until complete
- **User Stories Workflow** - Breaks complex tasks into smaller, implementable pieces
- **Sidebar Control Panel** - Full control and real-time progress from VS Code Activity Bar
- **Smart Progress Tracking** - Watches files and automatically detects task completion
- **Error Recovery** - Built-in retry logic with exponential backoff for failed API calls
- **PRD Generation** - Create structured task lists from descriptions
- **Progress Logging** - Maintains a record of all completed work
- **Inactivity Detection** - Alerts you if Copilot seems stuck

## How It Works

```
┌─────────────────────────────────────────┐
│  1. Read PRD.md                         │
│     ↓                                   │
│  2. Get next unchecked task             │
│     ↓                                   │
│  3. Generate user stories               │
│     ↓                                   │
│  4. Implement each story with Copilot   │
│     ↓                                   │
│  5. Mark story complete [x]             │
│     ↓                                   │
│  6. All stories done? Mark task [x]     │
│     ↓                                   │
│  7. More tasks? Go to step 2            │
│     ↓                                   │
│  8. Done!                               │
└─────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

Before starting, ensure you have:

- **VS Code 1.93+**
- **GitHub Copilot CLI** installed and authenticated
- **Node.js 18+** for development
- **Active GitHub Copilot subscription**

### Generate a PRD

1. Open Command Palette (Cmd/Ctrl + Shift + P)
2. Run **ShipIt: Generate PRD from Description**
3. Describe your project
4. Run **ShipIt: Start Loop**

## Configuration

Access settings via VS Code Settings (Cmd/Ctrl + ,) and search for "ShipIt". Existing ShipIt settings remain unchanged. The BIORICHE BRAIN OpenAI adapter is configured through runtime environment variables listed above and is disabled by default.

### Custom Prompt Templates

Override default prompts using these placeholders:

- `{{task}}` - Current task description
- `{{prd}}` - Full PRD.md contents
- `{{progress}}` - Progress log contents
- `{{requirements}}` - Implementation requirements
- `{{workspace}}` - Workspace root path

## Architecture

```
src/
├── extension.ts
├── orchestrator.ts
├── taskRunner.ts
├── copilotSdk.ts
├── bioricheBrain/
│   ├── config.ts
│   ├── types.ts
│   └── openaiProvider.ts
├── sidebarProvider.ts
├── fileUtils.ts
├── fileWatchers.ts
├── promptBuilder.ts
├── config.ts
├── logger.ts
├── statusBar.ts
├── uiManager.ts
└── timerManager.ts
```

## Verification

The Brain CI workflow runs compile, lint, and test checks for pull requests. For local verification:

```bash
npm ci
npm run compile
npm run lint
npm test
```

## Requirements

- **VS Code 1.93+**
- **GitHub Copilot CLI** for the existing Copilot integration
- **Node.js 18+**
- **Active GitHub Copilot subscription**
- An **OpenAI API key** only if the optional BIORICHE BRAIN OpenAI provider is explicitly enabled

## License

MIT - See [LICENSE](LICENSE) for details
