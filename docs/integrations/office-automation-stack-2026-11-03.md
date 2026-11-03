# Office automation stack review — 2026-11-03

**Status:** source-reviewed; integration plan committed on a draft branch. No third-party service was installed, no credentials were created, and no user mailbox or calendar was accessed.
**Scope:** candidates surfaced from the video: email, calendar, spreadsheets, file operations and task automation.

## Executive decision

Keep BIORICHEBRAIN's existing TypeScript runtime, MCP registry, approval gate, audit log and deny-by-default tool policy. Do not install six overlapping products into the core runtime. Use one primary integration path and keep desktop utilities separate.

### Recommended adoption order

1. **Google Workspace MCP — first connector pilot.** Best direct fit for Gmail, Calendar, Drive, Docs and Sheets through one MCP server. Upstream documents MIT licensing, OAuth 2.1, local stdio and Streamable HTTP transports, read-only mode, tool tiers and fine-grained permissions. Start with local stdio, `--tool-tier core`, and `--read-only`; enable only read/search/list tools initially. Do not enable send, delete, share, edit, event-create or file-write tools until each operation is routed through BIORICHEBRAIN approval and audit.
2. **Metis Suite — optional human-facing workspace, not a runtime dependency.** Self-hostable mail/calendar/drive client that connects to existing Google, Microsoft, Zoho and standard-protocol accounts; includes workflows, AI assistant and MCP. AGPL-3.0-or-later. It overlaps the Google Workspace connector, so choose it only if the project wants a single self-hosted user interface. Review AGPL obligations and trademark terms before redistribution or offering it as a hosted service.
3. **GigaMail — optional local mail specialist, not a second default mail connector.** Local MCP server and desktop console for multi-account email, calendar-aware drafting, local indexing and out-of-band approval for send/delete. AGPL-3.0. Consider only if local-first mail archive and its approval model solve a concrete need not covered by Workspace MCP or Metis.
4. **VisiGrid — analyst desktop/CLI utility.** Local spreadsheet application and CLI; handles CSV/XLSX/ODS and supports headless reproducible calculations and MCP-based sheet operations. AGPLv3 with plugin exception. Use as a human-operated analyst tool first; do not grant workbook-write MCP access to agents until a fixture-based data-integrity evaluation passes.
5. **AI Automations (Aimersion) — reference/demo only.** The repository advertises browser-run Outlook/Calendar automations and a Google AI Studio API key. Treat it as a collection of examples, not a production dependency: review each page's OAuth scopes, browser-side data handling, API-key exposure and licensing before reusing code.
6. **Cloudflare Agentic Inbox — separate mail-hosting experiment only.** It is an email client/agent built on Cloudflare Workers, Email Routing, Durable Objects and R2. It requires a domain onboarded to Cloudflare Email Service plus routing/binding configuration. It is not a drop-in connector for an existing Gmail inbox; defer unless BIORICHEBRAIN needs a dedicated domain mailbox service.

## Compatibility with current BIORICHEBRAIN

The current `src/bioricheBrain/mcpRegistry.ts` already has an allowlisted MCP preset mechanism for Exa, Firecrawl and Playwright, plus a custom Streamable HTTP MCP endpoint. The custom endpoint requires an explicit comma-separated tool allowlist. This is a useful security boundary, but it is not yet a complete Google Workspace stdio integration.

The current registry does **not** provide:
- a dedicated Google Workspace MCP stdio preset and its OAuth environment validation;
- a tested service-specific read-only tool allowlist;
- per-agent capability profiles for mail, calendar, drive and sheets;
- write-operation approval adapters for all Workspace tool names;
- connector integration tests against a disposable Google test account.

Therefore this change intentionally adds a reviewed adoption plan only. It does not pretend the connector is already installed or authenticated.

## Safe pilot implementation plan

### Pilot A — read-only Google Workspace MCP

- Pin a reviewed upstream release/commit; do not use an unpinned `uvx` latest build in production.
- Run the server locally over stdio first. Keep OAuth client ID/secret and refresh tokens outside Git, in the host secret store.
- Select only required services (initially Gmail, Calendar, Drive and Sheets) and the upstream read-only mode.
- Add a BIORICHEBRAIN preset only after confirming exact tool names and schemas from the pinned upstream release.
- Apply a per-agent capability map: ORCHESTRATOR may delegate; sales and analyst roles may read approved business records; R&D roles must not read personal mail; no agent gets send/delete/share/write by default.
- Treat email, documents, calendar descriptions and spreadsheet cells as untrusted content. They may contain prompt injection; never allow their contents to change tool permissions or approval policy.
- Log tool name, agent, purpose, target identifier, approval decision and outcome. Redact message bodies, OAuth tokens and personal data from traces.
- Test using synthetic accounts/data; test denial for every write tool; test prompt-injection fixtures; verify no secret appears in logs.
- Only then request explicit operator approval to connect a real account.

### Pilot B — spreadsheet validation

- Evaluate VisiGrid CLI on synthetic BIORICHEBRAIN sales and production workbooks.
- Compare formulas, totals, imported/exported values and round trips against known-good XLSX/CSV fixtures.
- Keep the initial workflow read-only; export results to a new file and never overwrite source workbooks.
- Review AGPL/plugin-exception implications before bundling or redistributing binaries.

### Pilot C — optional mail interface

- Compare Metis and GigaMail on the same synthetic mailbox.
- Select one; do not run two competing agents against the same mailbox.
- Verify OAuth/token storage, 2FA, prompt-injection handling, audit trail, backup/restore and human approval before sending/deleting.
- Review AGPL-3.0 obligations and third-party service terms before deployment.

## License and operational notes

| Candidate | Upstream license / model | BIORICHEBRAIN decision |
|---|---|---|
| Google Workspace MCP | MIT; bring your own Google OAuth project and credentials | Pilot read-only connector |
| Metis Suite | AGPL-3.0-or-later; self-host or optional hosted service | Optional UI; legal review before distribution |
| GigaMail | AGPL-3.0; local application/MCP | Optional mail specialist; legal review |
| VisiGrid | AGPLv3 with plugin exception; commercial licensing is separately offered | Analyst utility; validate file fidelity |
| Aimersion AI Automations | Repository's exact license and each demo's data flow must be verified before reuse | Reference only |
| Cloudflare Agentic Inbox | Check repository license and Cloudflare account/plan requirements before deployment | Defer; separate domain-mail project |

## Acceptance criteria before runtime code is merged

- [ ] Upstream commit/release pinned and license recorded.
- [ ] OAuth scopes documented and minimized.
- [ ] Secrets never committed; secret scanning passes.
- [ ] Only read-only tools are exposed in the first pilot.
- [ ] Tool allowlist is validated against pinned server schemas.
- [ ] Every write tool is denied without a human approval token.
- [ ] Prompt-injection tests cover email, document, event and spreadsheet content.
- [ ] Audit events are emitted with sensitive content redacted.
- [ ] Integration tests use synthetic accounts and can run without production credentials.
- [ ] CI passes; no external service is required for the normal test suite.

## Upstream sources

- Google Workspace MCP: https://github.com/taylorwilsdon/google_workspace_mcp
- Metis Suite: https://github.com/trymetis/metis
- GigaMail: https://github.com/adecubed/gigamail
- VisiGrid: https://github.com/VisiGrid/VisiGrid
- Aimersion AI Automations: https://github.com/aimersion/ai-automations
- Cloudflare Agentic Inbox: https://github.com/cloudflare/agentic-inbox
- Cloudflare Email Agent prerequisites: https://developers.cloudflare.com/agents/examples/email-agent/
