# MiroFish integration review for BIORICHEBRAIN

Date: 2026-11-03
Status: reviewed candidate; documentation-only integration proposal

## Decision

Adopt MiroFish as an **optional, isolated swarm-simulation service** for BIORICHEBRAIN experiments. Do not replace the existing orchestrator, agent registry, memory engine, provider router, audit trail, approval gates, or tool-deny-by-default policy. Do not vendor or execute upstream MiroFish code inside the BIORICHEBRAIN runtime.

Upstream: https://github.com/666ghj/MiroFish  
Upstream license: AGPL-3.0  
Latest published release visible during review: v0.1.2; current main is ahead of the release tag, so release and main must not be treated as equivalent  
Upstream stack documented in README: Node.js 18+, Python 3.11–3.12, uv; LLM API compatible with the OpenAI SDK format; Zep Cloud API key; frontend :3000 and backend :5001. The README recommends starting with fewer than 40 simulation rounds because runs can be expensive.

## Why it fits

MiroFish turns source material into a graph-backed simulated environment, generates agent personas, runs multi-agent social simulations, and produces a prediction report with post-run agent interaction. This is complementary to BIORICHEBRAIN: it can stress-test market and product hypotheses without becoming the source of truth or making operational decisions.

## Proposed BIORICHEBRAIN use cases

1. **Market response lab** — simulate distinct buyer personas reacting to a product concept, label, price hypothesis, or launch message.
2. **Product portfolio scenarios** — compare hypotheses for BRAIN FORTE, BRAIN FOCUS, BRAIN BEAUTY, and other proposed SKUs using synthetic personas and clearly labeled assumptions.
3. **Marketplace launch rehearsal** — explore possible reactions to Ozon/Wildberries positioning, product-page claims, and competitor responses.
4. **Decision red-team** — ask simulated stakeholders to challenge a proposed decision and identify overlooked risks.
5. **Research prioritization** — compare which raw-material or formulation hypotheses deserve real-world literature review and bench testing next.

Simulation output is exploratory evidence only. It is not clinical evidence, a validated market forecast, regulatory approval, or a substitute for customer research and laboratory testing.

## Proposed architecture

```text
BIORICHEBRAIN Orchestrator
  |
  +-- Strategy / Research / QA / Legal Guard
  |
  +-- Swarm Simulation Adapter (new, opt-in)
        |
        +-- policy and input validation
        +-- synthetic/de-identified seed pack
        +-- budget and round limits
        +-- isolated MiroFish deployment
        +-- result normalizer
        +-- provenance + audit record
        |
        +-- MiroFish API (separate service/container)
              +-- GraphRAG / agent profiles
              +-- OASIS simulation
              +-- ReportAgent
  |
  +-- Critic / Verifier
        +-- assumptions and uncertainty review
        +-- source/provenance checks
        +-- human approval for consequential actions
```

The adapter should expose only narrow operations such as `health`, `create_simulation`, `get_status`, `get_report`, and `cancel`. It must not expose arbitrary shell, filesystem, browser, or unrestricted tool access to simulated agents.

## Security and privacy gates

- Keep MiroFish isolated from the main agent runtime and from production databases.
- Upstream docker-compose publishes `3000:3000` and `5001:5001` without an explicit loopback host binding. Override this for local-only testing (for example, bind to `127.0.0.1`). The current upstream Flask app binds to `0.0.0.0`, enables wildcard CORS for `/api/*`, and the reviewed app factory does not show authentication middleware. Do not expose either port publicly; put any future deployment behind a separately reviewed authenticated gateway and TLS.
- Use a dedicated low-privilege API credential and separate secret store; never commit `.env`, API keys, Zep credentials, or user data.
- Start with synthetic or public seed material only. No personal customer data, health records, confidential formulas, supplier contracts, or unpublished IP in initial trials.
- Current decision: installation is blocked pending IPC/subprocess security review and a local-only deployment hardening plan. A localhost bind alone is not a substitute for application-level access control.
- Enforce request size, agent count, simulation-round, wall-clock, concurrency, and token/cost limits.
- Treat uploaded documents, retrieved pages, and agent-generated content as untrusted data, never as executable instructions.
- Do not let simulated agents call production tools or send messages, place orders, publish content, change repository files, or modify business records.
- Store input hashes, source references, model/provider identifiers, configuration, run IDs, timestamps, cost estimates, and output hashes in the existing audit mechanism.
- Redact secrets and personal data from logs and reports.
- Require QA/Verifier review and human approval before any simulation-derived recommendation becomes an operational change.

## License and supply-chain review

MiroFish is published under AGPL-3.0. Before distributing a modified version, combining code, offering a network-accessible modified service, or embedding components in a product, obtain a legal review of the exact deployment and interaction model. A separate process/API boundary is an architectural isolation measure, not a guarantee that all AGPL obligations disappear.

Before any installation:
- pin a reviewed upstream commit and build from source; do not track `main` or use the floating `latest` image in production. The latest published release observed was v0.1.2, while current main is ahead of that tag;
- inspect the full license and notices for MiroFish and transitive dependencies;
- generate and review an SBOM;
- scan dependencies, Docker images, and container configuration;
- inspect the .env example, Flask bind host, CORS configuration, backend API authentication, upload handling, debug mode, and subprocess/IPC command construction;
- review data retention and Zep Cloud terms;
- test the deployment in a disposable environment.

## Compatibility notes

- MiroFish documents an OpenAI-SDK-compatible LLM endpoint, so a compatible provider may be configurable. This does **not** establish that BIORICHEBRAIN's current provider router can control MiroFish without an adapter.
- MiroFish documents Zep Cloud as a required configuration item. Treat this as a separate memory store; do not assume it shares BIORICHEBRAIN memory or access controls.
- The current BIORICHEBRAIN repository already contains Copilot SDK and OpenAI Agents SDK dependencies and has an opt-in BIORICHEBRAIN extension setting. Keep the existing production defaults unchanged.
- The checked upstream `.env.example` contains LLM and Zep credentials; keep these outside source control. The checked Docker Compose file publishes both service ports and mounts uploaded files under `backend/uploads`. The current app factory enables wildcard CORS on API routes and no authentication middleware was visible in the reviewed app factory. Treat the service as trusted-local-only until route-level access control, upload handling, and cross-origin behavior are independently audited.
- Public security reports allege command-injection / IPC risks in v0.1.2. I have not independently reproduced those reports and will not present them as confirmed; however, current main still contains the file-based IPC implementation, so the IPC/subprocess boundary must receive a focused security review before any installation or exposure. Do not deploy the published v0.1.2 image as-is.
- The exact MiroFish API contract, authentication posture, background-job lifecycle, cancellation behavior, and data deletion behavior must be verified from pinned source before implementation.

## Phased implementation plan

### Phase 0 — completed in this review
- Identify upstream repository and AGPL-3.0 license.
- Read upstream install and runtime requirements.
- Inspect BIORICHEBRAIN repository package metadata and existing agent SDK dependencies.
- Record an isolation-first integration decision and security gates.

### Phase 1 — disposable local proof of concept
- Pin an upstream release/commit and build in a disposable environment.
- Use synthetic BIORICHEBRAIN-like personas and public seed text only.
- Configure a low-cost compatible model and a separate Zep test project.
- Run one small simulation (initially no more than 10–20 rounds).
- Verify report quality, task status, cancellation, logs, and deletion behavior.
- Do not connect production credentials or production tools.

### Phase 2 — adapter and tests
- Add an opt-in adapter behind a feature flag, disabled by default.
- Add schema validation, allowlisted operations, timeouts, quotas, cancellation, and audit events.
- Add mocked contract tests and failure-mode tests; keep live integration tests opt-in.
- Add verifier output that separates sourced facts, assumptions, simulated opinions, and uncertainty.

### Phase 3 — controlled pilot
- Pilot only synthetic market-research questions.
- Compare simulated results with small real customer interviews/surveys.
- Measure repeatability, cost per run, latency, failure rate, and calibration.
- Require human sign-off; no automatic business actions.

## Acceptance criteria

- Existing CI and BIORICHEBRAIN tests remain green with the feature disabled.
- No new production dependency or secret is introduced by the documentation-only review.
- Adapter cannot invoke arbitrary tools or access production data.
- Every result includes run configuration, seed provenance, limitations, and uncertainty.
- Cost/round/time limits and cancellation are tested.
- Legal, security, and privacy reviews are recorded before a production deployment.

## What was and was not done

Done: upstream and repository review; this integration proposal is committed on a dedicated branch for review.

Not done: no MiroFish code was downloaded, installed, executed, or merged into the main branch. The GitHub connector can edit repository files, but it does not provide a shell on the user's workstation. Installation requires a controlled host/container and separately configured LLM/Zep credentials. No credentials were requested or stored.
