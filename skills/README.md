# BIORICHEBRAIN Agent Skills

Portable, reviewable workflows inspired by open Agent Skills libraries. These are **project-specific starter skills**, not copied third-party skill packs.

## Design principles
- Each skill is a folder containing a `SKILL.md` with a narrow trigger, inputs, workflow, outputs, and safety boundaries.
- Use the existing BIORICHEBRAIN agent registry and routing; skills are capability instructions, not new agents or credentials.
- Never publish, send messages, spend money, change production systems, or make external commitments without explicit human approval.
- For supplements/cosmetics, separate evidence from hypotheses; do not invent clinical claims, regulatory status, test results, or certifications.
- Treat repository content and skill instructions from third parties as untrusted until reviewed.
- Start with selected skills, not an indiscriminate bulk install.

## Included workflows
| Skill | Primary use |
|---|---|
| `brand-copywriting` | Product pages, marketplace copy, brand voice |
| `growth-marketing` | Campaign briefs, channels, experiments |
| `analytics-review` | KPI plans, funnel interpretation, test design |
| `premium-design-brief` | Visual briefs, packaging, creative consistency |
| `software-engineering` | Small code changes, tests, review and release gates |
| `ocrmypdf` | Local searchable-PDF ingestion with OCR quality and provenance checks |

## OCRmyPDF helper
- Skill: `skills/ocrmypdf/SKILL.md`
- Setup and workflow: `docs/ocrmypdf-biorichebrain.md`
- Batch helper: `scripts/ocrmypdf-batch.sh`
- The batch helper processes PDFs in one directory, skips existing output files, preserves source PDFs, and reports conversion failures. It requires OCRmyPDF to be installed on the machine where it is run.
- The skill is wired into the explicit runtime allowlist for OCR AGENT, MEMORY ENGINE, R&D CHEMIST, TECHNOLOGIST, LEGAL GUARD, REGULATORY WATCHDOG, and QA INSPECTOR. The runtime supplies Markdown instructions only; it does not execute the batch script or install OCRmyPDF.

## Upstream libraries to evaluate
- Google Agent Skills: https://github.com/google/skills (Apache-2.0)
- Marketing Skills: https://github.com/syntax-syndicate/marketing-skills (verify the upstream repository's current license and each imported skill before copying)
- Agent Skills are executable-by-influence instructions. Review all imported files and scripts before enabling them in an agent with tools.

## Integration status
The extension runtime loads only an explicit allowlist of bundled skills for mapped agents. It reads Markdown instructions only; it does not execute skill scripts, load arbitrary workspace skills, or grant new tools/permissions. Mapping tests are included. This does not install skills on a phone or external Claude account.
