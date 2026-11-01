# BIORICHEBRAIN headless service (24/7 deployment base)

This adds a separate Node service intended to run under Docker with `restart: unless-stopped`. It is a deployment base, **not a claim that a server has been provisioned or started**.

## What runs

- HTTP API with bearer-token authentication for task submission and status lookup.
- Durable JSON task records under a persistent volume; queued/running work is recovered after process restart (at-least-once semantics).
- Single active task at a time, bounded queue, idempotency-key support, bounded retries, and JSONL audit.
- OpenAI Agents SDK team orchestration using the project's agent registry.
- Headless workers are intentionally **tool-free**: they cannot read project files, connect MCP servers, edit repositories, publish content, purchase items, or perform external actions. They must not claim to have browsed the web or verified GitHub.

## Deploy on an always-on Linux host

1. Install Docker Engine and the Docker Compose plugin on a server you control.
2. Clone this repository and check out the branch containing this file.
3. Create a local `.env` file (never commit it) with `OPENAI_API_KEY` and a cryptographically random `BIORICHEBRAIN_SERVICE_TOKEN` of at least 32 characters.
4. Build and start:
   ```sh
   docker compose -f docker-compose.biorichebrain.yml up -d --build
   docker compose -f docker-compose.biorichebrain.yml ps
   docker compose -f docker-compose.biorichebrain.yml logs --tail=100
   ```
5. Verify locally:
   ```sh
   curl -fsS http://127.0.0.1:8787/health
   curl -fsS -H "Authorization: Bearer $BIORICHEBRAIN_SERVICE_TOKEN" http://127.0.0.1:8787/metrics
   ```
6. Submit a task:
   ```sh
   curl -sS -X POST http://127.0.0.1:8787/tasks \\
     -H "Authorization: Bearer $BIORICHEBRAIN_SERVICE_TOKEN" \\
     -H "Content-Type: application/json" \\
     -H "Idempotency-Key: first-smoke-test" \\
     -d '{"input":"Produce a concise BIORICHEBRAIN project health review. State clearly that no live web or GitHub checks were performed."}'
   ```
7. Poll `GET /tasks/<id>` using the returned task ID. Confirm a completed result and inspect logs before relying on the service.

The API binds to loopback on the host by default through the Compose port mapping. Do not expose it directly to the public internet; use a private network or authenticated reverse proxy with TLS if remote access is later required.

## API

- `GET /health`: liveness only; no auth.
- `GET /metrics`: authenticated queue depth.
- `POST /tasks`: authenticated JSON body `{"input":"..."}`, 1–12,000 characters. Optional `Idempotency-Key` header.
- `GET /tasks/<uuid>`: authenticated status/result lookup.

## Current limitations

- No server, DNS, firewall, secrets, external uptime monitor, alert channel, or budget alert is provisioned by this code change.
- This is a single-process, single-worker durable queue, not a distributed job system. Queue records are retried at-least-once, so consumers must not assume exactly-once execution.
- Worker agents have no tools or project context access. This is deliberate until capability-scoped tool access and explicit approval integration are added.
- Add provider spend limits in the provider account; this service does not enforce a hard monetary budget.
- Before production use, verify CI, build the image, run an end-to-end smoke test on the target host, and configure an external health check.
