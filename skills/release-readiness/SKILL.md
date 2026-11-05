---
name: release-readiness
description: Verify that a change is reviewable, tested, reversible, and ready for controlled release.
---

# Release readiness

1. Summarize the change, affected components, and user-visible behavior.
2. Confirm compile, lint, unit, integration, security, and dependency checks relevant to the change.
3. Inspect the final diff for secrets, generated noise, license notices, and unrelated edits.
4. Confirm configuration defaults are safe and migration/rollback steps are documented.
5. List checks that were not run and explain why.
6. Require human approval for merge, deployment, publication, spending, or irreversible operations.
7. Do not label a release ready while required checks are failing or unknown.
