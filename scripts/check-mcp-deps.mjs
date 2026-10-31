#!/usr/bin/env node
import fs from "node:fs";

const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
const packages = lock.packages ?? {};
const violations = [];

function versionOf(name) {
  const entry = packages[`node_modules/${name}`];
  return entry?.version ?? null;
}

function isAtLeast(version, major, minor, patch = 0) {
  const [a, b, c] = String(version).split(".").map(Number);
  return a > major || (a === major && (b > minor || (b === minor && c >= patch)));
}

const sdk = versionOf("@modelcontextprotocol/sdk");
if (sdk && !isAtLeast(sdk, 1, 32, 0)) {
  violations.push(`@modelcontextprotocol/sdk ${sdk} is below the minimum safe version 1.32.0`);
}

const client = versionOf("@modelcontextprotocol/client");
if (client && !isAtLeast(client, 2, 3, 0)) {
  violations.push(`@modelcontextprotocol/client ${client} is below the minimum safe version 2.3.0`);
}

if (violations.length > 0) {
  console.error("MCP dependency policy failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("MCP dependency policy passed.");
for (const name of ["@modelcontextprotocol/sdk", "@modelcontextprotocol/client"]) {
  const version = versionOf(name);
  if (version) console.log(`- ${name}: ${version}`);
}
