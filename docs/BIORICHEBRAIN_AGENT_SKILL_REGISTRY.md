# BIORICHEBRAIN Agent & Skill Registry

Status: initial implementation proposal in a feature branch; not yet merged or installed on a user's device.

## Routing policy
- `gpt-6-luna`: routine, high-volume, low-cost tasks.
- `gpt-6.1-sol`: default production reasoning, coding, analysis, and coordination.
- `gpt-6-astra`: critical escalation only; disabled by default and requires explicit runtime enablement.
- `gpt-5.6-terra`: fallback/benchmark only; verify model availability before production use.
- Never assume free model access. API use is billed according to account and model terms; local open-weight models require separate runtime and hardware.

## Agents
The registry defines 22 roles. A registry entry is a routing/identity definition, not proof that 22 independent workers are concurrently running. Parallel execution, task queues, shared memory, retries, and audit logging must be implemented by the orchestration runtime.

## Skill acquisition policy
Prefer official vendor repositories and documented standards. Candidate upstreams:
- OpenAI Plugins: https://github.com/openai/plugins
- OpenAI Agents Python: https://github.com/openai/openai-agents-python
- Agent Skills standard: https://github.com/agentskills/agentskills
- Anthropic skills: https://github.com/anthropics/skills

The older https://github.com/openai/skills catalog is deprecated; use OpenAI Plugins and current developer docs instead.

Do not bulk-install unreviewed community skills. Before enabling a skill:
1. Record source URL, exact commit/ref, license, maintainer, and last update.
2. Inspect all instructions, scripts, dependencies, network access, and secret handling.
3. Run static checks and tests in a sandbox with synthetic data and no secrets.
4. Assign the skill to named agents and define allowed tools/data.
5. Require human approval for credentials, purchases, external publication, deployment, legal/regulatory submissions, and lab or human-subject work.
6. Pin version/ref and maintain rollback path.

## Token and cost controls
- Route routine tasks to Luna; use Sol for reasoning-heavy work; escalate to Astra only when the task is critical and benefits justify cost.
- Keep agent handoffs structured: objective, context pointers, constraints, expected schema, acceptance criteria.
- Avoid sending full project memory to every worker; retrieve scoped memory and cite source IDs.
- Cache stable instructions/prefixes; do not assume cache discounts without API telemetry.
- Use one independent QA pass for high-impact outputs; cap retries.
- Benchmark quality and cost on representative tasks before changing defaults.

## Scientific and regulatory guardrails
Every claim must be labeled as literature fact, supplier specification, project hypothesis, experimentally validated result, or patent candidate. No medical claims or efficacy assertions without appropriate evidence and regulatory review. "Nano" requires analytical confirmation such as DLS where applicable. FermExtract CORE parameters are hypotheses until raw-material-specific validation.

## Installation boundary
This branch adds source files only. It does not install software into VS Code/Codex, create API credentials, enable paid model access, or launch autonomous jobs. Merge and local installation require the repository owner's review and a local runtime.
