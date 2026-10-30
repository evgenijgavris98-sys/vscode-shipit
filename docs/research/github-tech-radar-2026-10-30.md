# BIORICHEBRAIN GitHub Tech Radar — 2026-10-30

## Executive decision

This review is a source-grounded shortlist, not a blanket installation approval. Third-party code is not copied, executed, or granted secrets automatically.

**Recommended next control-plane pilot: Paperclip**
**Keep as current browser integration: ego-lite / ego-browser**
**Watch: Orkas, Cua, Browser Use, OpenMuse**
**Reject for BIORICHEBRAIN commercial operations unless licensing changes: OpenBot**

## Candidate review

| Project | License / stage | Useful capability | BIORICHEBRAIN decision |
|---|---|---|---|
| [Paperclip](https://github.com/paperclipai/paperclip) | MIT; Node.js server + React UI | Agent org chart, task ownership, heartbeats, goals, budgets, approval gates, run history, connectors and skills | **PILOT CANDIDATE.** Best match for company-level governance across independently hosted agents. Run a separate local test instance first; do not replace the existing runtime until adapters, permissions, backups and migration are verified. |
| [ego-lite](https://github.com/citrolabs/ego-lite) | MIT; desktop browser for macOS/Windows | Local Chromium browser and ego-browser agent skill | **ALREADY STAGED.** Skill was merged to main in PR #48. Desktop app installation/onboarding remains a user-device step. |
| [Orkas](https://github.com/Orkas-AI/Orkas) | MIT; desktop app for macOS/Windows | Local-first Commander plus 16 specialist agents, persistent project memory/files, task queue, auto-advance and schedules | **WATCH.** Strong product/workflow reference and possible desktop companion. Not a Linux desktop deployment path; avoid duplicating Paperclip's control-plane role. |
| [Cua](https://github.com/trycua/cua) | Mixed licensing by component; Spaces app source-available under FSL-1.1-MIT | Cua Driver, computer-use interfaces, desktop/VM spaces, evaluation benchmarks | **WATCH.** Potential isolated computer-use backend. Check the license of each selected component and platform/runtime support before adoption. |
| [Browser Use](https://github.com/browser-use/browser-use) | MIT open-source library; cloud services are separate | Python/TypeScript browser agent, CLI and local browser control | **WATCH / OPTIONAL.** Useful fallback or benchmark, but overlaps with ego-lite. Do not add two browser runtimes until a comparative test shows a measurable advantage. |
| [OpenMuse](https://github.com/CopilotKit/OpenMuse) | MIT; explicitly alpha/self-hosting template | Persistent browser + optional Linux workspace, task plans, approvals, files and mobile/web UI | **WATCH.** Promising personal-agent UX reference; requires separate configuration and CopilotKit Intelligence project key for full persistence. Alpha means not production foundation. |
| [OpenBot](https://github.com/nightly-labs/openbot) | PolyForm Noncommercial 1.0.0 | Persistent multi-agent workspaces, queues, browser, file transfer, agent messaging | **REJECT FOR COMMERCIAL USE.** BIORICHEBRAIN is a commercial project; the repository's noncommercial license is incompatible with adopting it for business operations without a separate commercial grant. |

## Recommended architecture

Keep the existing BIORICHEBRAIN runtime and add a control plane only after a bounded Paperclip proof of concept:

1. **BIORICHEBRAIN remains the product brain:** strategy, R&D knowledge, regulatory guardrails, memory policy and domain-specific workflows.
2. **Paperclip is an optional operations layer:** org chart, task dispatch, heartbeats, approvals, budget visibility and run audit.
3. **Existing agents remain independent workers:** connect only through documented adapters/API boundaries; no mass migration.
4. **ego-lite remains the browser skill/runtime candidate:** browser tasks run in isolated Spaces; browser session import is user-controlled.
5. **Cua is a later computer-use option:** only if browser automation is insufficient and isolated desktop access is justified.
6. **GitHub Tech Radar remains discovery-only:** new repositories are never auto-installed or executed.

## Paperclip pilot acceptance criteria

- Run in an isolated local environment with a dedicated test organization and no production credentials.
- Connect one non-critical test agent first; verify heartbeat, task assignment, cancellation, pause/resume and run history.
- Configure least-privilege permissions and explicit approval gates for external actions.
- Verify per-agent and project budget limits; confirm hard-stop behavior in a test.
- Confirm secrets are scoped to the intended agent and never written to task logs.
- Test backup/restore and data export before any production use.
- Require human approval before connecting BIORICHEBRAIN production GitHub, marketplace, email or regulatory accounts.

## Installation status and limits

- **GitHub integration:** this repository contains the radar expansion and this review document on a dedicated branch. It is not yet merged.
- **Local application install:** GitHub repository access does not provide a shell on the user's computer. No desktop app, server, package or service has been installed on the user's device by this review.
- **No secrets touched:** no API keys, browser profiles, cookies or production credentials were requested or transferred.
- **Next local step for Paperclip:** follow the upstream Quickstart at https://docs.paperclip.ing and use an isolated test deployment. Check the current Node/pnpm requirements in the upstream repository before installing; do not run an unreviewed remote shell script as root.

## Sources checked

- https://github.com/paperclipai/paperclip
- https://github.com/citrolabs/ego-lite
- https://github.com/Orkas-AI/Orkas
- https://github.com/trycua/cua
- https://github.com/browser-use/browser-use
- https://github.com/CopilotKit/OpenMuse
- https://github.com/nightly-labs/openbot
- https://agentshortlist.dev/best/browser-automation
- https://github.locker/topics/agent-orchestration

Review date: 2026-10-30.