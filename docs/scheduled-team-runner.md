# BIORICHEBRAIN scheduled team runner

## What this adds

- An opt-in scheduled team review hosted by the VS Code extension process.
- Persistent scheduler state in VS Code global storage, with atomic file replacement.
- A single in-process run lock, Markdown reports under `.biorichebrain/scheduled-runs/`, audit events, and bounded exponential retry after failures.
- Commands: **BIORICHEBRAIN: Start Scheduled Team**, **Stop Scheduled Team**, **Run Scheduled Team Now**, and **Scheduler Status**.

## Enable it

1. Open the BIORICHEBRAIN project workspace in VS Code.
2. Configure the selected provider and its credentials in the extension host environment.
3. Set `shipit.bioricheBrain.enabled` to `true`.
4. Set `shipit.bioricheBrain.scheduler.enabled` to `true` to start automatically when the extension activates, or use the Start Scheduled Team command.
5. Optionally set `shipit.bioricheBrain.scheduler.intervalHours` from 1 to 168 (default 24).

The scheduler only runs a bounded review prompt. It does not grant agents new tools or authorize external writes, deployments, purchases, regulatory submissions, or other irreversible actions.

## Important runtime boundary

This is **not a 24/7 daemon**. The timer runs only while the VS Code extension host is alive, the machine is awake, and the workspace is open. It cannot execute when the computer is off, VS Code is closed, or the extension host is unavailable. For genuine 24/7 execution, deploy a separate supervised service on an always-on host and wire the same scheduler/queue into a headless provider runtime; this PR does not claim that deployment exists.

The scheduled team review also does not perform live web research by itself. Its prompt explicitly forbids claiming fresh web/GitHub checks unless those tools were actually used. Reports are operational drafts, not verified external monitoring.

## State and failure handling

- State: VS Code global storage, file `biorichebrain-scheduler.json`.
- Reports: workspace `.biorichebrain/scheduled-runs/`.
- Audit: VS Code global storage `biorichebrain-audit.jsonl`.
- Failed runs are recorded and retried with exponential backoff, capped at six hours.
- Only one run can execute in this extension process at a time.
- State files and reports use restrictive file modes where supported by the OS.

## Verification status

GitHub Actions should compile and lint the branch. Do not treat this feature as production-ready until those checks pass and a real scheduled run has been observed in VS Code. A separate host deployment, watchdog/restart policy, external health check, and budget limit are still required for a 24/7 service.
