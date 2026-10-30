# ego-lite browser integration

BIORICHEBRAIN can use [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) as an optional local browser runtime for agent-driven web work.

## What is included

- Official `ego-browser` agent skill staged in `.agents/skills/ego-browser/`.
- Platform-aware installation and verification steps.
- BIORICHEBRAIN-specific safety boundaries for authenticated browsing and side effects.

## Install

1. Merge this integration branch.
2. In the local repository root, run `npx skills add citrolabs/ego-lite` if you prefer the upstream installer to place the skill in the agent's configured skill directories. The checked-in copy is already available to agents that load `.agents/skills`.
3. Install the separate ego lite desktop app from https://lite.ego.app/ on a supported desktop platform (macOS or Windows).
4. Complete onboarding yourself; importing Chrome data is optional.
5. Open a new terminal and verify `ego-browser skill`.

The npx command installs the skill, not the desktop browser. Linux desktop support is not currently available; do not treat the staged skill as proof of a working runtime.

## Agent invocation

Before browser work, run `ego-browser skill` and follow the exact guide returned by the installed version. Use one isolated Space per agent/task. Prefer read-only research, data extraction, QA, and preparing drafts.

## Not enabled automatically

This change does not enable unattended login, credential transfer, purchases, payments, publishing, messaging, account changes, or destructive operations. Require explicit user approval before any consequential external action.

## Upstream

- Repository: https://github.com/citrolabs/ego-lite
- License: MIT
- Official skill version copied here: 2.1.0 (2026-10-08)
