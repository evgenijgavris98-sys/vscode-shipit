---
name: plan-and-verify
description: Convert a complex request into bounded implementation steps with explicit acceptance checks.
---

# Plan and verify

1. Define the desired outcome, scope, constraints, and non-goals.
2. Break the work into small steps with an observable completion condition for each.
3. Identify dependencies, failure modes, and any step requiring human approval.
4. Prefer reversible changes and a narrow diff.
5. Verify each step using the project's actual tests, source evidence, or reproducible checks.
6. Do not report a step as complete because a plan or draft exists.
7. Report completed, blocked, unverified, and approval-required items separately.

Safety: never bypass permission checks or expand tool access to make a plan easier.
