import { spawn } from 'node:child_process';
import * as vscode from 'vscode';

/** Safe, opt-in bridge to CLI-Anything Hub. No shell is used. */
const HUB = 'cli-hub';
const SAFE_NAME = /^[a-z0-9][a-z0-9._-]{0,63}$/i;
const SAFE_QUERY = /^[\p{L}\p{N} ._-]{1,100}$/u;

export interface HubResult { code: number | null; stdout: string; stderr: string; }

export function runHub(args: string[], timeoutMs = 30_000): Promise<HubResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(HUB, args, { shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', settled = false, outputLimitExceeded = false;
    const finish = (fn: () => void) => { if (!settled) { settled = true; clearTimeout(timer); fn(); } };
    const timer = setTimeout(() => { child.kill(); finish(() => reject(new Error('cli-hub timed out'))); }, timeoutMs);
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      const remaining = 1_000_000 - stdout.length;
      if (chunk.length > remaining) { stdout += chunk.slice(0, Math.max(0, remaining)); outputLimitExceeded = true; child.kill(); }
      else stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      const remaining = 200_000 - stderr.length;
      if (chunk.length > remaining) { stderr += chunk.slice(0, Math.max(0, remaining)); outputLimitExceeded = true; child.kill(); }
      else stderr += chunk;
    });
    child.on('error', error => finish(() => reject(new Error('Cannot start cli-hub. Install cli-anything-hub and ensure cli-hub is on PATH. ' + error.message))));
    child.on('close', code => finish(() => outputLimitExceeded
      ? reject(new Error('cli-hub output exceeded the safety limit; process was stopped'))
      : resolve({ code, stdout, stderr })));
  });
}

export async function showHubList(): Promise<void> {
  try {
    const result = await runHub(['list', '--json']);
    const channel = vscode.window.createOutputChannel('BIORICHEBRAIN — CLI-Hub');
    channel.appendLine('$ cli-hub list --json'); channel.appendLine(result.stdout || result.stderr || '(no output)'); channel.show(true);
    if (result.code !== 0) vscode.window.showWarningMessage('CLI-Hub list returned a non-zero exit code. See Output.');
  } catch (e) { vscode.window.showErrorMessage(e instanceof Error ? e.message : String(e)); }
}

export async function searchHub(): Promise<void> {
  const query = await vscode.window.showInputBox({ prompt: 'Search CLI-Hub by tool, category, or capability', placeHolder: 'e.g. video, blender, pdf', ignoreFocusOut: true });
  if (!query) return;
  if (!SAFE_QUERY.test(query.trim())) { vscode.window.showErrorMessage('Search query contains unsupported characters or is too long.'); return; }
  try {
    const result = await runHub(['search', query.trim(), '--json']);
    const channel = vscode.window.createOutputChannel('BIORICHEBRAIN — CLI-Hub Search');
    channel.appendLine('$ cli-hub search ' + JSON.stringify(query.trim()) + ' --json'); channel.appendLine(result.stdout || result.stderr || '(no output)'); channel.show(true);
    if (result.code !== 0) vscode.window.showWarningMessage('CLI-Hub search returned a non-zero exit code. See Output.');
  } catch (e) { vscode.window.showErrorMessage(e instanceof Error ? e.message : String(e)); }
}

export async function installHubTool(): Promise<void> {
  const name = await vscode.window.showInputBox({ prompt: 'Exact CLI-Hub package name (inspect it with cli-hub info first)', placeHolder: 'tool-name', ignoreFocusOut: true, validateInput: value => SAFE_NAME.test(value) ? null : 'Use letters, numbers, dot, underscore, hyphen.' });
  if (!name) return;
  try {
    const info = await runHub(['info', name]);
    const infoChannel = vscode.window.createOutputChannel('BIORICHEBRAIN — CLI-Hub Tool Review');
    infoChannel.appendLine('$ cli-hub info ' + name); infoChannel.appendLine(info.stdout || info.stderr || '(no output)'); infoChannel.show(true);
    if (info.code !== 0) { vscode.window.showErrorMessage('Could not inspect this tool. Installation cancelled.'); return; }
    const confirm = await vscode.window.showWarningMessage('Review source, requirements, and publisher in the Tool Review output before installation. Install ' + name + '?', { modal: true }, 'Install');
    if (confirm !== 'Install') return;
    const result = await runHub(['install', name], 120_000);
    const channel = vscode.window.createOutputChannel('BIORICHEBRAIN — CLI-Hub Install');
    channel.appendLine('$ cli-hub install ' + name); channel.appendLine(result.stdout); channel.appendLine(result.stderr); channel.appendLine('Exit code: ' + result.code); channel.show(true);
    if (result.code === 0) vscode.window.showInformationMessage('CLI-Hub install finished for ' + name + '. Verify the tool before using it in agent workflows.');
    else vscode.window.showErrorMessage('CLI-Hub installation failed. See Output for details.');
  } catch (e) { vscode.window.showErrorMessage(e instanceof Error ? e.message : String(e)); }
}
