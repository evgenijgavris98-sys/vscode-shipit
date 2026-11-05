# BIORICHEBRAIN — Everything Claude Code adoption

Date: 2026-10-30
Upstream: https://github.com/affaan-m/everything-claude-code
Upstream README license declaration: MIT

## Implemented in this PR

- Added six project-authored, ECC-inspired instruction skills: research-first, plan-and-verify, code-review, security-review, documentation-lookup, and release-readiness.
- Mapped these skills only to existing BIORICHEBRAIN specialist IDs in the existing `skillLoader`.
- Added mapping regression tests.
- Kept the existing loader's fixed ID allowlist, path containment, realpath check, 20 KiB size ceiling, Markdown-only format, and instruction-only execution model.
- Reused the existing orchestrator, agent registry, provider routing, and memory store; no duplicate runtime was introduced.

## Explicitly not imported

No upstream code, shell scripts, hooks, MCP server declarations, dependencies, or provider credentials were copied or activated. The six skill files are newly authored project guidance informed by ECC concepts, not copied upstream source.

## Security boundary

Skill Markdown is untrusted guidance. It cannot grant tools, capabilities, shell access, network access, or approval. Existing tool authorization and human approval gates remain authoritative. The new mapping is opt-in by agent assignment through the existing loader; the orchestrator remains unmapped.

## Validation status

- [x] Source and existing skill-loader behavior inspected.
- [x] New skill IDs are mapped to existing specialist roles only.
- [x] Regression assertions added for the new mappings.
- [ ] GitHub Actions CI green on this branch.
- [ ] Target workstation install/smoke test (not available through GitHub connector).

This is a repository-side implementation proposal. It does not install Claude Code or ECC on the user's workstation, and it does not activate any upstream executable component.
