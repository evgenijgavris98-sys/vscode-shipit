import * as vscode from 'vscode';
import { AGENT_REGISTRY } from './bioricheBrain/agentRegistry';
import { loadBrainConfig } from './bioricheBrain/config';
import { OpenAIResponsesProvider } from './bioricheBrain/openaiProvider';
import { KimiProvider } from './bioricheBrain/kimiProvider';
import { QwenProvider } from './bioricheBrain/qwenProvider';
import type { BrainProvider } from './bioricheBrain/types';
import { TeamOrchestrator } from './bioricheBrain/teamOrchestrator';
import type { BrainAgent, ModelTier } from './bioricheBrain/types';
import { VscodeApprovalGate } from './bioricheBrain/vscodeApprovalGate';
import { MemoryAuditSink } from './bioricheBrain/auditLog';
import { ShipItStatusBar } from './statusBar';
import { LoopOrchestrator } from './orchestrator';
import { ShipItSidebarProvider } from './sidebarProvider';
import { log, disposeLogger, showLogs } from './logger';
import { runDevopsSandbox } from './bioricheBrain/sandboxRunner';
import { getTaskStatsAsync, getNextTaskAsync, createManualPrdAsync, readProjectDescriptionAsync, createOrOpenProjectDescriptionAsync } from './fileUtils';

/**
 * Main ShipIt extension class
 */
class ShipItExtension {
    private readonly approvalGate = new VscodeApprovalGate();
    private readonly audit = new MemoryAuditSink();
    private statusBar: ShipItStatusBar;
    private orchestrator: LoopOrchestrator;
    private sidebarProvider: ShipItSidebarProvider;

    constructor(private readonly context: vscode.ExtensionContext) {
        log('ShipIt extension activating...');

        this.statusBar = new ShipItStatusBar();
        context.subscriptions.push(this.statusBar);

        this.orchestrator = new LoopOrchestrator(this.statusBar);

        // Create and register sidebar provider
        this.sidebarProvider = new ShipItSidebarProvider(context.extensionUri);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                ShipItSidebarProvider.viewType,
                this.sidebarProvider
            )
        );

        // Connect sidebar to orchestrator
        this.orchestrator.setSidebarView(this.sidebarProvider);

        this.registerCommands();

        context.subscriptions.push({
            dispose: () => this.dispose()
        });

        log('ShipIt extension activated');

        // Check for PRD on startup
        this.checkForPrdOnStartup();
    }

    /**
     * Register all commands
     */
    private registerCommands(): void {
        this.context.subscriptions.push(
            vscode.commands.registerCommand('shipit.showPanel', () => {
                this.showStatus();
            }),

            vscode.commands.registerCommand('shipit.start', () => {
                this.orchestrator.startLoop();
            }),

            vscode.commands.registerCommand('shipit.stop', () => {
                this.orchestrator.stopLoop();
            }),

            vscode.commands.registerCommand('shipit.pause', () => {
                this.orchestrator.pauseLoop();
            }),

            vscode.commands.registerCommand('shipit.resume', () => {
                this.orchestrator.resumeLoop();
            }),

            vscode.commands.registerCommand('shipit.next', () => {
                this.orchestrator.runSingleStep();
            }),

            vscode.commands.registerCommand('shipit.generatePrd', async () => {
                // Check if project description file exists and has content
                const existingDescription = await readProjectDescriptionAsync();
                
                if (existingDescription) {
                    // File exists with content - generate PRD from it
                    vscode.window.showInformationMessage('Starting PRD generation from your project description...');
                    this.orchestrator.generatePrdFromDescription(existingDescription);
                } else {
                    // File doesn't exist or is empty - create/open it for editing
                    const created = await createOrOpenProjectDescriptionAsync();
                    if (created) {
                        vscode.window.showInformationMessage(
                            'Write your project description in the file, save it, and click "Generate PRD" again.',
                            'Got it'
                        );
                    }
                }
            }),

            vscode.commands.registerCommand('shipit.generateUserStories', async (taskDescription?: string) => {
                if (!taskDescription) {
                    vscode.window.showErrorMessage('ShipIt: No task specified');
                    return;
                }
                await this.orchestrator.generateUserStoriesForTask(taskDescription);
            }),

            vscode.commands.registerCommand('shipit.generateAllUserStories', async () => {
                await this.orchestrator.generateAllUserStories();
            }),

            vscode.commands.registerCommand('bioricheBrain.runAgent', async () => {
                const config = loadBrainConfig(vscode.workspace.getConfiguration('shipit.bioricheBrain').get<boolean>('enabled'));
                if (!config.enabled) {
                    const action = await vscode.window.showWarningMessage(
                        'BIORICHEBRAIN is disabled. Set BIORICHE_BRAIN_ENABLED=true and OPENAI_API_KEY in the extension host environment, then restart VS Code.',
                        'Open Documentation'
                    );
                    if (action === 'Open Documentation') {
                        await vscode.env.openExternal(vscode.Uri.parse('https://github.com/evgenijgavris98-sys/vscode-shipit'));
                    }
                    return;
                }
                if (config.provider === 'openai' && !config.apiKey) {
                    vscode.window.showErrorMessage('BIORICHEBRAIN: OPENAI_API_KEY is missing in the extension host environment.');
                    return;
                }
                if (config.provider === 'kimi' && !config.kimiApiKey && !config.kimiMcpUrl) {
                    vscode.window.showErrorMessage('BIORICHEBRAIN: configure KIMI_API_KEY or KIMI_MCP_URL for Kimi execution.');
                    return;
                }
                const agent = await vscode.window.showQuickPick(
                    AGENT_REGISTRY.map((item) => ({ label: item.name, description: item.purpose, id: item.id })),
                    { placeHolder: 'Choose a BIORICHEBRAIN agent' }
                );
                if (!agent) return;
                const task = await vscode.window.showInputBox({ prompt: `Task for ${agent.label}`, placeHolder: 'Describe the task', ignoreFocusOut: true });
                if (!task?.trim()) return;
                const definition = AGENT_REGISTRY.find((item) => item.id === agent.id);
                if (!definition) return;
                const tiers: ModelTier[] = ['luna', 'terra', 'sol'];
                if (config.astraEnabled) tiers.push('astra');
                const tier = await vscode.window.showQuickPick(tiers.map((id) => ({ label: id.toUpperCase(), id })), { placeHolder: 'Choose model tier', title: `Default: ${definition.defaultTier.toUpperCase()}` });
                if (!tier) return;
                const output = vscode.window.createOutputChannel(`BIORICHEBRAIN — ${agent.label}`);
                this.context.subscriptions.push(output);
                output.show(true);
                output.appendLine(`Agent: ${agent.label}`);
                output.appendLine(`Model tier: ${tier.id}`);
                output.appendLine('Running…');
                try {
                    const provider = this.createBrainProvider(config);
                    const result = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `BIORICHEBRAIN: ${agent.label}`, cancellable: false }, () => provider.run(agent.id as BrainAgent, { tier: tier.id, task: { input: task.trim() } }));
                    output.appendLine('');
                    output.appendLine(result);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    output.appendLine(`\nERROR: ${message}`);
                    vscode.window.showErrorMessage(`BIORICHEBRAIN: ${message}`);
                }
            }),

            vscode.commands.registerCommand('bioricheBrain.runTeam', async () => {
                const config = loadBrainConfig(vscode.workspace.getConfiguration('shipit.bioricheBrain').get<boolean>('enabled'));
                if (!config.enabled) {
                    vscode.window.showWarningMessage('BIORICHEBRAIN is disabled. Enable shipit.bioricheBrain.enabled and provide OPENAI_API_KEY.');
                    return;
                }
                if (config.provider === 'openai' && !config.apiKey) {
                    vscode.window.showErrorMessage('BIORICHEBRAIN: OPENAI_API_KEY is missing in the extension host environment.');
                    return;
                }
                if (config.provider === 'kimi' && !config.kimiApiKey && !config.kimiMcpUrl) {
                    vscode.window.showErrorMessage('BIORICHEBRAIN: configure KIMI_API_KEY or KIMI_MCP_URL for Kimi execution.');
                    return;
                }
                if (config.provider === 'qwen' && !config.qwenCliPath) {
                    vscode.window.showErrorMessage('BIORICHEBRAIN: QWEN_CLI_PATH is not configured.');
                    return;
                }
                const task = await vscode.window.showInputBox({ prompt: 'Task for the BIORICHEBRAIN team', placeHolder: 'Describe the end-to-end task', ignoreFocusOut: true });
                if (!task?.trim()) return;
                const output = vscode.window.createOutputChannel('BIORICHEBRAIN — Team');
                this.context.subscriptions.push(output);
                output.show(true);
                try {
                    const provider = this.createBrainProvider(config);
                    const team = new TeamOrchestrator(provider);
                    const result = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'BIORICHEBRAIN: orchestrating team', cancellable: false }, () => team.run(task.trim()));
                    output.appendLine('Delegation plan:');
                    result.plan.tasks.forEach((item, index) => output.appendLine((index + 1) + '. ' + item.agent + ' [' + item.tier + '] — ' + item.task));
                    output.appendLine('\nAgent results:');
                    result.results.forEach((item, index) => {
                        output.appendLine('\n[' + (index + 1) + '] ' + item.agent);
                        output.appendLine(item.error ? 'ERROR: ' + item.error : (item.output ?? 'No output'));
                    });
                    output.appendLine('\nSYNTHESIS:\n');
                    output.appendLine(result.synthesis);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    output.appendLine('ERROR: ' + message);
                    vscode.window.showErrorMessage('BIORICHEBRAIN team: ' + message);
                }
            }),
            vscode.commands.registerCommand('bioricheBrain.runSandbox', async () => {
                const config = loadBrainConfig(vscode.workspace.getConfiguration('shipit.bioricheBrain').get<boolean>('enabled'));
                if (!config.enabled || config.provider !== 'openai' || !config.apiKey) {
                    vscode.window.showErrorMessage('BIORICHEBRAIN sandbox requires the OpenAI provider, BIORICHE_BRAIN_ENABLED=true and OPENAI_API_KEY.');
                    return;
                }
                const task = await vscode.window.showInputBox({ prompt: 'DEVOPS sandbox task', placeHolder: 'Inspect, edit and test only inside the sandbox workspace', ignoreFocusOut: true });
                if (!task?.trim()) return;
                const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                if (!workspaceRoot) { vscode.window.showErrorMessage('Open a BIORICHEBRAIN workspace first.'); return; }
                try {
                    const result = await vscode.window.withProgress(
                        { location: vscode.ProgressLocation.Notification, title: 'BIORICHEBRAIN: DEVOPS sandbox', cancellable: false },
                        () => runDevopsSandbox(config, workspaceRoot, task.trim(), this.approvalGate, this.audit),
                    );
                    const output = vscode.window.createOutputChannel('BIORICHEBRAIN — Sandbox');
                    this.context.subscriptions.push(output);
                    output.show(true);
                    output.appendLine(result.output);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    vscode.window.showErrorMessage('BIORICHEBRAIN sandbox: ' + message);
                }
            }),

            vscode.commands.registerCommand('shipit.viewLogs', () => {
                showLogs();
            }),

            vscode.commands.registerCommand('shipit.createManualPrd', async () => {
                const result = await createManualPrdAsync();
                if (result) {
                    await this.sidebarProvider.refresh();
                }
            })
        );
    }

    private createBrainProvider(config: ReturnType<typeof loadBrainConfig>): BrainProvider {
        if (config.provider === 'kimi') return new KimiProvider(config);
        if (config.provider === 'qwen') return new QwenProvider(config);
        return new OpenAIResponsesProvider(config, {
            workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
            approvalGate: this.approvalGate,
            audit: this.audit,
        });
    }

    /**
     * Show status information
     */
    private async showStatus(): Promise<void> {
        const stats = await getTaskStatsAsync();
        const nextTask = await getNextTaskAsync();

        const actions: string[] = ['Start', 'Stop', 'Generate PRD', 'View Logs'];

        const message = stats.total > 0
            ? `ShipIt: ${stats.completed}/${stats.total} tasks complete. ${nextTask ? `Next: ${nextTask.description}` : 'All done!'}`
            : 'ShipIt: No PRD found. Generate one or create PRD.md manually.';

        const action = await vscode.window.showInformationMessage(message, ...actions);

        switch (action) {
            case 'Start':
                this.orchestrator.startLoop();
                break;
            case 'Stop':
                this.orchestrator.stopLoop();
                break;
            case 'Generate PRD':
                vscode.commands.executeCommand('shipit.generatePrd');
                break;
            case 'View Logs':
                showLogs();
                break;
        }
    }

    /**
     * Check for PRD on startup and notify user
     */
    private async checkForPrdOnStartup(): Promise<void> {
        const stats = await getTaskStatsAsync();

        if (stats.total > 0 && stats.pending > 0) {
            const action = await vscode.window.showInformationMessage(
                `ShipIt found ${stats.pending} pending task(s) in your PRD. Start executing?`,
                'Start ShipIt',
                'Later'
            );

            if (action === 'Start ShipIt') {
                this.orchestrator.startLoop();
            }
        }
    }

    /**
     * Dispose resources
     */
    dispose(): void {
        this.orchestrator.dispose();
        disposeLogger();
    }
}

let extensionInstance: ShipItExtension | null = null;

export function activate(context: vscode.ExtensionContext): void {
    extensionInstance = new ShipItExtension(context);
}

export function deactivate(): void {
    log('ShipIt extension deactivating...');
    extensionInstance?.dispose();
    extensionInstance = null;
}

