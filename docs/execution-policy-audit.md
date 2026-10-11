# BIORICHEBRAIN execution audit

## Scope

The extension writes BIORICHEBRAIN tool-policy events to VS Code's extension-global storage in
`biorichebrain-audit.jsonl`. The log is intentionally outside the checked-out workspace to
reduce accidental commits of operational metadata.

Each line is a JSON object with a generated event ID, timestamp, agent, tool ID, outcome,
optional run/capability/provenance labels, a bounded input summary, and a SHA-256 digest of
the original input summary. Common API-key/token/password patterns are redacted from text
fields before they are written. No new runtime dependency is required.

## Operational guarantees and limitations

- The sink serializes writes within one extension process and creates the parent directory.
- Audit write errors are returned to the caller; callers must not silently interpret a failed
  write as a successful policy decision.
- The digest correlates the original input summary without requiring that full input to be
  stored. It is not a signature and does not prove who supplied the input.
- JSONL append-only behavior is a convention, not tamper-proof storage. A user or process
  with filesystem access can alter or delete the file.
- This log is not a substitute for capability checks, explicit approval gates, OS sandboxing,
  or GitHub CI. A log entry records an event; it does not authorize it.
- Avoid recording full prompts, credentials, product/customer personal data, or raw secrets.
  Redaction is defense in depth, not a guarantee that every secret format is recognized.
- Retention, rotation, export, and cross-process locking remain follow-up work.

## Verification

The pull request CI must pass TypeScript compilation and ESLint before merge. No new packages
are introduced. The change does not enable agents, expand tool permissions, merge a PR, or
perform external side effects.
