---
name: code-review
description: Independently review code changes for correctness, maintainability, security, and regression risk.
---

# Code review

1. Read the full changed code and relevant callers, types, tests, and configuration.
2. Look for correctness defects, unsafe defaults, error-path gaps, race conditions, and resource leaks.
3. Check authorization at the point of use; do not trust model-provided role or capability claims.
4. Check input validation, path containment, secret handling, logging redaction, and dependency provenance.
5. Verify tests cover normal, malformed, denied, and failure cases.
6. Prioritize findings by severity and cite exact files/lines when available.
7. If no issues are found, state what was and was not tested.

Safety: review is read-only unless a separate implementation task explicitly authorizes changes.
