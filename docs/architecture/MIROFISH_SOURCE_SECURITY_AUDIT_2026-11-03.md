# MiroFish source security audit — 2026-11-03

## Scope and pin

Reviewed upstream `666ghj/MiroFish` at commit `7657031ac01184afe2cb220f5ee3545573b5e843` (2026-10-01), including:

- `backend/app/services/simulation_ipc.py`
- `backend/app/services/simulation_runner.py`
- `backend/scripts/run_reddit_simulation.py`
- `backend/scripts/run_twitter_simulation.py`

This is a source review only. No code was executed and no exploit reproduction was attempted.

## IPC finding: the public claim is not confirmed by the inspected path

In `SimulationIPCClient.send_command`, the application creates a UUID command ID and writes a JSON command file under the simulation's IPC directory. The command type is an enum with three values: `interview`, `batch_interview`, and `close_env`.

The script-side `process_commands` dispatcher uses explicit branches for those three values. The inspected dispatcher does not call a shell, `eval`, or `exec`; it routes interview requests to fixed handler methods and returns an error for unknown command types.

Therefore, the claim that this specific IPC path directly performs OS command execution is **not substantiated by the inspected source at this commit**. This is not proof that the whole application is free of command injection or other vulnerabilities. The full API-to-IPC trust boundary, all subprocess launch sites, path handling, and dependencies still require a broader audit and runtime testing.

## Public reports and issue status

- Tenable published a report alleging CVE-2026-7058 in `SimulationIPCClient.send_command`. We have not reproduced the issue. The inspected source path above does not show an obvious shell-command sink.
- Upstream issue #697 repeats broad claims about RCE and credential theft. GitHub shows the issue was closed by the repository owner with label `invalid` and state reason `not_planned`. This is repository moderation, not an independent security assessment.
- Treat both the advisory and the maintainer's issue disposition as evidence to investigate, not as conclusive proof either way.

## Remaining blockers before any deployment

1. Verify authentication and authorization on every API route, not merely the Flask app factory.
2. Confirm CORS is restricted to the intended trusted frontend origin.
3. Bind backend services to loopback or a private container network; never expose unauthenticated development endpoints publicly.
4. Review every `subprocess` call and its argument construction, including whether any untrusted user data can reach a command or executable path.
5. Validate every user-controlled identifier used in filesystem paths; enforce canonical paths beneath a dedicated data directory.
6. Run dependency and container image scans; pin immutable image digests and package versions.
7. Run the service as a non-root user with read-only root filesystem where practical, restricted mounts, no Docker socket, resource limits, and outbound network allow-listing.
8. Keep LLM and Zep credentials outside source control; use scoped secrets and rotate them after any suspected exposure.
9. Test with synthetic BIORICHEBRAIN research scenarios only; do not upload customer, supplier, formula, regulatory, or founder-confidential data during initial evaluation.

## Integration decision

**Status: HOLD — do not deploy upstream MiroFish to a production or internet-reachable environment yet.**

The existing BIORICHEBRAIN integration remains a loopback-only health-check client and VS Code command. It does not start MiroFish, send prompts, upload data, or create simulations. A safe next step is to build a disposable, isolated evaluation environment after the API/auth/path/subprocess review and image scan are complete.

## Sources

- Upstream IPC source: https://github.com/666ghj/MiroFish/blob/7657031ac01184afe2cb220f5ee3545573b5e843/backend/app/services/simulation_ipc.py
- Upstream runner source: https://github.com/666ghj/MiroFish/blob/7657031ac01184afe2cb220f5ee3545573b5e843/backend/app/services/simulation_runner.py
- Reddit simulation dispatcher: https://github.com/666ghj/MiroFish/blob/7657031ac01184afe2cb220f5ee3545573b5e843/backend/scripts/run_reddit_simulation.py
- Twitter simulation dispatcher: https://github.com/666ghj/MiroFish/blob/7657031ac01184afe2cb220f5ee3545573b5e843/backend/scripts/run_twitter_simulation.py
- Upstream issue #697 (closed as invalid): https://github.com/666ghj/MiroFish/issues/697
