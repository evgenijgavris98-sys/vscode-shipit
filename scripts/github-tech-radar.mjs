import fs from "node:fs/promises";

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
if (!repo || !token) throw new Error("GITHUB_REPOSITORY and GITHUB_TOKEN are required");

const headers = {
  accept: "application/vnd.github+json",
  authorization: `Bearer ${token}`,
  "x-github-api-version": "2022-11-28",
  "user-agent": "BIORICHEBRAIN-Tech-Radar"
};

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    // Do not print request headers or credentials to logs.
    throw new Error(`GitHub API request failed: HTTP ${response.status} for ${path.split("?")[0]}`);
  }
  return response.json();
}

const queries = [
  "AI agents MCP TypeScript",
  "MCP server TypeScript",
  "agent orchestration TypeScript",
  "agent memory observability TypeScript",
  "browser automation Playwright agent",
  "LLM evaluation tracing TypeScript",
  "local LLM model routing",
  "open source AI video generation"
];

const now = Date.now();
const candidates = new Map();

for (const query of queries) {
  const encoded = encodeURIComponent(`${query} archived:false fork:false`);
  const result = await github(`/search/repositories?q=${encoded}&sort=stars&order=desc&per_page=10`);
  for (const item of result.items ?? []) {
    if (item.archived || item.fork || !item.full_name || !item.html_url) continue;
    const pushedAt = item.pushed_at ? new Date(item.pushed_at) : null;
    const ageDays = pushedAt && !Number.isNaN(pushedAt.getTime())
      ? Math.max(0, (now - pushedAt.getTime()) / 86400000)
      : 3650;
    const stars = Number(item.stargazers_count) || 0;
    const forks = Number(item.forks_count) || 0;
    const freshness = Math.max(0, 30 - ageDays);
    const score = Math.round(Math.log10(stars + 1) * 25 + Math.log10(forks + 1) * 8 + freshness);
    const row = {
      name: item.full_name,
      url: item.html_url,
      description: String(item.description || "").replace(/[|\r\n]+/g, " ").trim(),
      stars, forks,
      pushed: pushedAt && !Number.isNaN(pushedAt.getTime()) ? pushedAt.toISOString().slice(0, 10) : "unknown",
      license: item.license?.spdx_id || "NO-LICENSE-DATA",
      score,
      matchedQuery: query
    };
    const previous = candidates.get(row.name);
    if (!previous || row.score > previous.score) candidates.set(row.name, row);
  }
}

const rows = [...candidates.values()].sort((a, b) => b.score - a.score).slice(0, 30);
const rationale = item => {
  const text = `${item.name} ${item.description}`.toLowerCase();
  if (/context-mode|context compression|token optimization/.test(text)) return "Context/token cost optimization candidate.";
  if (/orchestrat|workforce|multi-agent/.test(text)) return "Compare bounded delegation and multi-agent coordination.";
  if (/mcp|model context protocol/.test(text)) return "Tool integration candidate; inspect permissions and server trust boundary.";
  if (/playwright|browser/.test(text)) return "Browser automation candidate; test isolation and read/write capability separation.";
  if (/eval|observab|tracing/.test(text)) return "Quality, regression evaluation or auditability candidate.";
  if (/video|diffusion|wan/.test(text)) return "Local/open video-generation candidate; benchmark VRAM, license and throughput.";
  if (/memory|vector|retrieval/.test(text)) return "Persistent-memory/retrieval candidate; test provenance and deletion semantics.";
  return "Potential supporting technology; validate against a concrete BIORICHEBRAIN task.";
};

const lines = [
  "# BIORICHEBRAIN GitHub Tech Radar",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "This is a discovery report, not an approval to install or execute software.",
  "Scores are heuristic rankings from GitHub stars, forks and recent activity; they are not security or quality ratings.",
  "A missing license field means license status is unknown and must not be treated as permission to use.",
  "",
  "## Candidates",
  "",
  "| Score | Repository | Stars | Forks | Last push | License | Why review |",
  "|---:|---|---:|---:|---|---|---|",
  ...rows.map(item => `| ${item.score} | [${item.name}](${item.url}) | ${item.stars} | ${item.forks} | ${item.pushed} | ${item.license} | ${rationale(item)} |`),
  "",
  "## Mandatory review before adoption",
  "",
  "- Confirm the repository is maintained and inspect recent commits/releases.",
  "- Verify license compatibility; NO-LICENSE-DATA is a blocker until resolved.",
  "- Inspect dependency graph, open advisories, secrets handling and install scripts.",
  "- Run in a sandbox with least privilege; do not expose production credentials.",
  "- Require local tests, a rollback plan and explicit human approval before merge/deploy.",
  "",
  "## BIORICHEBRAIN priority areas",
  "",
  "- Multi-agent orchestration and bounded delegation",
  "- MCP tools, allowlists, approvals and audit logs",
  "- Persistent memory, provenance and retrieval",
  "- Evaluation, regression testing and observability",
  "- Local/open model routing and inference cost",
  "- Local-first video generation and editing"
];

await fs.writeFile("github-tech-radar.md", lines.join("\n") + "\n", "utf8");
console.log(JSON.stringify({
  repositoriesScanned: candidates.size,
  report: "github-tech-radar.md",
  top: rows.slice(0, 10).map(({ name, score, stars, license }) => ({ name, score, stars, license }))
}, null, 2));
