import fs from "node:fs/promises";

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
if (!repo || !token) throw new Error("GITHUB_REPOSITORY/GITHUB_TOKEN required");

const headers = {
  accept: "application/vnd.github+json",
  authorization: `Bearer ${token}`,
  "x-github-api-version": "2022-11-28",
  "user-agent": "BIORICHEBRAIN-GitHub-Tech-Radar"
};

async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  if (!res.ok) throw new Error(`GitHub API request failed: HTTP ${res.status} for ${path.split("?")[0]}`);
  return res.json();
}

const queries = [
  "AI agents MCP TypeScript",
  "MCP server TypeScript",
  "agent orchestration TypeScript",
  "AI coding agent TypeScript",
  "agent memory MCP TypeScript",
  "browser agent Playwright TypeScript",
  "LLM eval observability TypeScript",
  "AI video generation TypeScript"
];

const now = Date.now();
const map = new Map();

for (const query of queries) {
  const data = await gh(`/search/repositories?q=${encodeURIComponent(`${query} archived:false fork:false`)}&sort=stars&order=desc&per_page=10`);
  for (const r of data.items ?? []) {
    if (r.archived || r.fork) continue;
    const pushedAt = r.pushed_at ? new Date(r.pushed_at) : null;
    const pushedMs = pushedAt && !Number.isNaN(pushedAt.getTime()) ? pushedAt.getTime() : null;
    const days = pushedMs === null ? 3650 : Math.max(0, (now - pushedMs) / 86400000);
    const freshness = Math.max(0, 30 - days);
    const score = Math.round(Math.log10(r.stargazers_count + 1) * 25 + Math.log10(r.forks_count + 1) * 8 + freshness);
    const row = {
      name: r.full_name,
      url: r.html_url,
      description: (r.description || "").replace(/\s+/g, " ").trim(),
      stars: r.stargazers_count,
      forks: r.forks_count,
      pushed: pushedMs === null ? "unknown" : pushedAt.toISOString(),
      license: r.license?.spdx_id || "NO-LICENSE-DATA",
      score
    };
    const old = map.get(r.full_name);
    if (!old || row.score > old.score) map.set(r.full_name, row);
  }
}

const rows = [...map.values()].sort((a,b) => b.score - a.score).slice(0, 30);
const why = r => r.name.includes("context-mode")
  ? "Context/tool-output optimization; directly relevant to agent context cost."
  : r.name.includes("paperclip")
  ? "Agent workforce/orchestration pattern; benchmark against our company-agent model."
  : r.name.includes("symphony")
  ? "Long-running task-to-agent orchestration; benchmark bounded delegation and recovery."
  : /mcp/i.test(r.name + " " + r.description)
  ? "MCP/tool-boundary candidate."
  : /agent/i.test(r.description)
  ? "Agent runtime/workflow candidate."
  : "Potential supporting technology; requires manual validation.";

const lines = [
  "# BIORICHEBRAIN GitHub Tech Radar",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "Discovery only: this radar never installs or executes third-party repositories automatically.",
  "Every candidate requires license, maintenance, security, architecture-fit and CI review.",
  "",
  "## Top candidates",
  "",
  "| Score | Repository | Stars | Forks | Last push | License | Why watch |",
  "|---:|---|---:|---:|---|---|---|",
  ...rows.map(r => `| ${r.score} | [${r.name}](${r.url}) | ${r.stars.toLocaleString()} | ${r.forks.toLocaleString()} | ${r.pushed === "unknown" ? "unknown" : r.pushed.slice(0,10)} | ${r.license} | ${why(r)} |`),
  "",
  "## Decision policy",
  "",
  "- **ADOPT:** proven improvement, compatible license, active maintenance, security/CI review passed.",
  "- **WATCH:** promising but insufficient evidence or integration value.",
  "- **REJECT:** security, license, maintenance, architecture or reproducibility concerns.",
  "",
  "## Priority areas",
  "",
  "- Agent orchestration and bounded delegation",
  "- MCP servers, lifecycle and security",
  "- Context optimization and persistent memory",
  "- Sandbox, computer-use and browser agents",
  "- Evals, observability and auditability",
  "- Local/open model routing and cost reduction",
  "- Video generation pipelines"
];

await fs.writeFile("github-tech-radar.md", lines.join(String.fromCharCode(10)) + String.fromCharCode(10));console.log(JSON.stringify({count: rows.length, top: rows.slice(0,10).map(r => ({name:r.name, score:r.score, stars:r.stars, license:r.license}))}, null, 2));
