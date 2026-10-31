# MCP dependency policy

This repository does not intentionally activate MCP in the headless runtime. The policy still checks the resolved lockfile tree because MCP packages may arrive transitively through SDKs.

Minimum accepted versions:

- `@modelcontextprotocol/sdk >= 1.32.0`
- `@modelcontextprotocol/client >= 2.3.0`

These floors cover the currently verified advisories for request validation resource exhaustion and cross-origin redirect credential/header/body forwarding. The check is intentionally dependency-free and does not change runtime wiring.
