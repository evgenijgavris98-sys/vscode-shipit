import * as assert from "node:assert/strict";
import { getBioricheMcpPreset, getBioricheWorkspaceToolsForAgent } from "../bioricheBrain/mcpRegistry";

test("Google Workspace preset is pinned and read-only", () => {
  const preset = getBioricheMcpPreset("google-workspace");
  assert.ok(preset);
  assert.equal(preset.transport, "stdio");
  assert.match(preset.fullCommand ?? "", /workspace-mcp==2\.3\.0/);
  assert.match(preset.fullCommand ?? "", /--read-only/);
  assert.deepEqual(preset.allowedTools, [
    "search_gmail_messages",
    "get_gmail_message_content",
    "get_gmail_messages_content_batch",
    "search_drive_files",
    "get_drive_file_content",
    "list_calendars",
    "get_events",
    "get_doc_content",
    "read_sheet_values",
  ]);
  assert.equal(preset.allowedTools.some((name) => /send|create|modify|manage|delete|share|update/i.test(name)), false);
});

test("unknown MCP presets are not resolvable", () => {
  assert.equal(getBioricheMcpPreset("unknown-service"), undefined);
});

test("Workspace tools require explicit agent opt-in and stay role-scoped", () => {
  const previous = process.env.BIORICHEBRAIN_GOOGLE_WORKSPACE_AGENTS;
  try {
    delete process.env.BIORICHEBRAIN_GOOGLE_WORKSPACE_AGENTS;
    assert.deepEqual(getBioricheWorkspaceToolsForAgent("sales_bot"), []);

    process.env.BIORICHEBRAIN_GOOGLE_WORKSPACE_AGENTS = "sales_bot,data_scientist";
    const salesTools = getBioricheWorkspaceToolsForAgent("sales_bot");
    const analystTools = getBioricheWorkspaceToolsForAgent("data_scientist");

    assert.ok(salesTools.includes("search_gmail_messages"));
    assert.ok(salesTools.includes("get_events"));
    assert.equal(salesTools.includes("read_sheet_values"), false);
    assert.ok(analystTools.includes("read_sheet_values"));
    assert.ok(analystTools.includes("get_doc_content"));
    assert.equal(analystTools.some((name) => name.includes("gmail")), false);
    assert.deepEqual(getBioricheWorkspaceToolsForAgent("rd_chemist"), []);
  } finally {
    if (previous === undefined) delete process.env.BIORICHEBRAIN_GOOGLE_WORKSPACE_AGENTS;
    else process.env.BIORICHEBRAIN_GOOGLE_WORKSPACE_AGENTS = previous;
  }
});
