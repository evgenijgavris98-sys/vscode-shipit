# BIORICHEBRAIN × CLI-Anything Hub

Status: integration plan committed to this branch; local installation and runtime verification must still be performed on the target workstation/runner.

## Purpose

Use CLI-Anything Hub as a discoverable tool registry for BIORICHEBRAIN agents. It is not itself an agent orchestrator and installing the Hub does not install every upstream desktop application.

- Hub / registry: https://clianything.cc/
- Upstream repository: https://github.com/HKUDS/CLI-Anything
- Hub documentation: https://github.com/HKUDS/CLI-Anything/blob/main/docs/hub/index.md
- License stated by upstream: Apache-2.0

## Install on the BIORICHEBRAIN development machine

Use an isolated Python environment where possible:

```bash
python -m venv .venv
# Linux/macOS
source .venv/bin/activate
# Windows PowerShell instead:
# .\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
python -m pip install cli-anything-hub
cli-hub --help
cli-hub list
```

Search before installing a particular harness:

```bash
cli-hub search blender
cli-hub search gimp
cli-hub search video
cli-hub info <name>
```

Install only the selected CLI after reviewing its metadata and requirements:

```bash
cli-hub install <name>
cli-hub info <name>
cli-hub launch <name> --help
```

Some harnesses require the corresponding upstream application (for example Blender, GIMP, or LibreOffice). Verify those dependencies independently.

## Optional agent skill

For an agent that supports the Skills ecosystem, upstream documents this installation command:

```bash
npx skills add HKUDS/CLI-Anything --skill cli-hub-meta-skill -g -y
```

This is an optional global skill installation. Confirm the target agent, inspect the requested files/permissions, and restart the agent if required. Do not assume this command configures every BIORICHEBRAIN agent automatically.

## Proposed BIORICHEBRAIN routing

| Department / agent role | Search terms to evaluate | Initial policy |
|---|---|---|
| Creative / design | gimp, inkscape, blender | Install only after a test export succeeds |
| Video / media | video, subtitles, audio, obs | Check GPU, codecs, and upstream application needs |
| Office / documents | libreoffice, pdf, ocr | Use copies of source documents; validate output |
| Engineering / automation | git, code, API, testing | Run in a project sandbox and retain logs |
| R&D / laboratory documentation | csv, spreadsheet, pdf | Treat results as records, not as scientific validation |

The exact available names must be discovered with `cli-hub search` and `cli-hub info`; do not assume every search term corresponds to an installable package.

## Safety and execution contract

1. Registry metadata and downloaded code are untrusted until reviewed.
2. Do not pass API keys, passwords, personal data, or proprietary formulas into third-party CLIs.
3. Do not execute arbitrary commands returned by a model or tool. Use an explicit allowlist of CLI names and argument patterns.
4. Start with read-only/list/help operations. Require human approval for file deletion, external uploads, purchases, publishing, sending messages, or production changes.
5. Run each harness with least privilege, in a dedicated workspace, with timeouts and captured stdout/stderr/exit status.
6. Use a clean test fixture and inspect generated artifacts before accepting them.
7. Keep Hub installation separate from the core orchestrator: a missing/unavailable CLI must fail closed and must not block unrelated agents.

## Acceptance checklist

- [ ] Install Hub in the intended runner or workstation environment.
- [ ] Record Python and Hub versions; save `cli-hub list` output as an inventory artifact.
- [ ] Search and inspect candidate CLIs for the actual target tasks.
- [ ] Install one low-risk candidate and verify its `--help` / launch behavior.
- [ ] Test on disposable input files and verify output plus exit code.
- [ ] Add explicit allowlisted commands to the BIORICHEBRAIN agent router only after the smoke test.
- [ ] Add timeouts, logs, permissions, and human approval gates for side effects.
- [ ] Document rollback: `cli-hub uninstall <name>` and remove the optional skill if installed.

## Important status note

This document records the proposed integration and repeatable setup steps. A GitHub commit does not install software on the user's computer or prove that a local agent runtime can execute it. Mark the checklist complete only after running the commands in the actual BIORICHEBRAIN environment.
