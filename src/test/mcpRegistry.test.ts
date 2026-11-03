import * as assert from "node:assert/strict";
import { getBioricheMcpPreset } from "../bioricheBrain/mcpRegistry";

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
