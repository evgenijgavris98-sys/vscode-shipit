# BIORICHE BRAIN — OpenAI September 2026 integration

## Current model policy

- gpt-5.6-luna: routine, high-volume work.
- gpt-5.6-terra: orchestration and standard analysis.
- gpt-5.6-sol: R&D, regulatory, QA and other high-reasoning work.
- gpt-6-astra: frontier experimental tier for complex computer-use, coding, research and professional workflows.

## Astra safety default

Astra is present in the model registry but is **disabled by default**.

Enable only in an explicitly approved pilot:

BIORICHE_BRAIN_ASTRA_ENABLED=true

The provider rejects Astra requests while the flag is disabled. This prevents an accidental model switch caused by configuration drift.

## Runtime rules

- BIORICHE_BRAIN_ENABLED remains false by default.
- BIORICHE_BRAIN_FAST_MODE is opt-in and is never applied to Astra.
- QA retries are capped at three.
- No API key or token is stored in source control.
- Existing Copilot/ShipIt execution remains separate from the OpenAI Responses provider.

## OpenAI capabilities to pilot next

1. Responses API tool orchestration for bounded R&D/QA workflows.
2. Multi-agent orchestration behind explicit concurrency and QA limits.
3. Stable prompt caching for repeated agent instructions and project context.
4. Astra evaluation on browser/computer-use and software-engineering tasks before any production promotion.

## Verification

The Brain CI workflow runs compile, lint and test checks on relevant pull requests.

OpenAI source checked on 2026-09-14:
- GPT-6 Astra announcement and capabilities.
- GPT-6 Astra safety overview/system-card updates.
- GPT-5.6 Sol + Codex scientific workflow example.
