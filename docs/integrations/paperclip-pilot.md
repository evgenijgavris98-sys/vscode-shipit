# Paperclip pilot for BIORICHEBRAIN

**Purpose:** test Paperclip as an isolated operations/control plane for one non-critical BIORICHEBRAIN agent. It does not replace the BIORICHEBRAIN runtime, memory store, GitHub workflows, or domain guardrails.

## Current upstream requirements (checked 2026-10-30)

- Upstream: https://github.com/paperclipai/paperclip
- Docs: https://docs.paperclip.ing
- Quickstart: Node.js **24.11+** and `npx paperclipai@latest onboard --yes`.
- The upstream quickstart defaults to trusted local loopback mode. Do not switch to LAN/tailnet/public binding for this pilot.
- Docker alternative: upstream documents `docker compose -f docker/docker-compose.quickstart.yml up --build`; review the current compose file and bind address before running it.

## Install on the target computer

From a terminal on the computer that should host the pilot:

```bash
git clone https://github.com/evgenijgavris98-sys/vscode-shipit.git
cd vscode-shipit
bash scripts/paperclip-pilot.sh
```

The helper checks Node.js and launches the upstream onboarding command. It does not create an agent, connect accounts, add API keys, or import production data.

To pin a Paperclip npm version after checking the upstream release, set `PAPERCLIP_VERSION`:

```bash
PAPERCLIP_VERSION=<verified-version> bash scripts/paperclip-pilot.sh
```

Default version is `latest`, which is convenient for a first test but not reproducible. Record the exact version used in the pilot log.

## Pilot configuration — do these manually in the local UI

1. Create a separate organization named `BIORICHEBRAIN — TEST`.
2. Add exactly one non-critical test agent (no production role, no production credentials).
3. Start with no external connections. Do not connect the production GitHub account, marketplace, email, regulatory accounts, browser profile, or payment systems.
4. Set the smallest available agent/project/company budget and require human approval for external actions, installs, writes, and messages.
5. Test one task lifecycle: create → assign → run → pause/cancel → inspect run history.
6. Test heartbeat with a harmless read-only task. Confirm what wakes the agent and what permissions it inherits.
7. Test backup/export and restore in the test organization before adding any real project data.
8. Record the Paperclip version, runtime/harness, model, budget, permissions, and test outcomes in the pilot log below.

## Acceptance gate before any production connection

- [ ] Local-only access verified; no public/LAN listener.
- [ ] Test organization is separate from production.
- [ ] One test agent only; no broad tool permissions.
- [ ] Approval gates tested and enforced.
- [ ] Budget limit and stop behavior tested.
- [ ] Secrets are scoped to the intended agent and absent from task logs.
- [ ] Backup/export and restore tested.
- [ ] Human owner explicitly approves each production connection.

**Stop condition:** if any item above is unverified, keep the pilot isolated. Do not paste credentials into chat, GitHub issues, task descriptions, or this repository.

## Pilot log

Keep observations here or in a private local file. Never commit secrets, personal tokens, session cookies, or production data.

- Installed version:
- Host OS:
- Local bind verified:
- Test agent / harness:
- Budget cap:
- Task lifecycle result:
- Heartbeat result:
- Approval-gate result:
- Backup/restore result:
- Decision: continue / revise / reject

## Architecture decision

Paperclip is a candidate **operations layer**, not the BIORICHEBRAIN brain itself:

- BIORICHEBRAIN owns product strategy, FermExtract R&D knowledge, regulatory rules, memory policy, and domain-specific decisions.
- Paperclip may own agent roster, task dispatch, schedules/heartbeats, approvals, budgets, and run audit.
- Existing agents remain independent workers until a documented adapter and least-privilege test passes.
- ego-lite remains the browser skill candidate; do not add overlapping browser runtimes without a benchmark.

## Upstream references

- https://github.com/paperclipai/paperclip
- https://docs.paperclip.ing/reference/deploy/docker/
