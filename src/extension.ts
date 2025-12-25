/**
 * GLM Quota Watcher - main extension file
 */

import * as vscode from 'vscode';
import { GlmQuotaService } from './glmQuotaService';
import { StatusBarService } from './statusBar';
import { ConfigService } from './configService';
import { Config } from './types';
import { LocalizationService } from './i18n/localizationService';

let glmQuotaService: GlmQuotaService | undefined;
let statusBarService: StatusBarService | undefined;
let configService: ConfigService | undefined;
let configChangeTimer: NodeJS.Timeout | undefined;

/**
 * Called when the extension is activated
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('=== GLM Quota Watcher Extension Activated ===');

  // Initialize config service
  configService = new ConfigService();
  const config = configService.getConfig();

  // Initialize localization
  const localizationService = LocalizationService.getInstance();
  localizationService.setLanguage(config.language);

  // Initialize status bar
  statusBarService = new StatusBarService(
    config.displayStyle,
    config.warningThreshold,
    config.criticalThreshold
  );

  // Get credentials from environment variables
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
  const baseUrl = process.env.ANTHROPIC_BASE_URL;

  if (!authToken || !baseUrl) {
    console.error('[Extension] Missing credentials');
    console.error('[Extension] Please set ANTHROPIC_AUTH_TOKEN and ANTHROPIC_BASE_URL environment variables');

    statusBarService.showError(
      localizationService.t('notify.missingCredentials')
    );
    statusBarService.show();

    // Show warning message to user
    vscode.window.showWarningMessage(
      localizationService.t('notify.missingCredentials'),
      localizationService.t('notify.openSettings')
    ).then(action => {
      if (action === localizationService.t('notify.openSettings')) {
        vscode.commands.executeCommand('workbench.action.openSettings', 'glmQuotaWatcher');
      }
    });

    return;
  }

  try {
    // Initialize GLM quota service
    console.log('[Extension] Initializing GLM quota service...');
    statusBarService.showFetching();

    glmQuotaService = new GlmQuotaService(authToken, baseUrl);

    // Register quota update callback
    glmQuotaService.onQuotaUpdate((snapshot) => {
      console.log('[Extension] GLM quota updated');
      statusBarService?.updateDisplay(snapshot);
    });

    // Register error callback
    glmQuotaService.onError((error: Error) => {
      console.error('[Extension] GLM quota fetch failed:', error.message);
      statusBarService?.showError(`Connection failed: ${error.message}`);
    });

    // Register status callback
    glmQuotaService.onStatus((status: 'fetching' | 'retrying', retryCount?: number) => {
      if (status === 'fetching') {
        statusBarService?.showFetching();
      } else if (status === 'retrying' && retryCount !== undefined) {
        statusBarService?.showRetrying(retryCount, 3);
      }
    });

    // Start polling if enabled
    if (config.enabled) {
      console.log('[Extension] Starting quota polling...');
      setTimeout(() => {
        glmQuotaService?.startPolling(config.pollingInterval);
      }, 3000); // Initial delay of 3 seconds

      statusBarService.show();
    }
  } catch (error: any) {
    console.error('[Extension] Failed to initialize GLM service:', error);
    statusBarService.showError(`Initialization failed: ${error.message}`);
    statusBarService.show();
  }

  // Register refresh command
  const refreshQuotaCommand = vscode.commands.registerCommand(
    'glmQuotaWatcher.refreshQuota',
    async () => {
      console.log('[Extension] refreshQuota command invoked');

      if (!glmQuotaService) {
        vscode.window.showErrorMessage(localizationService.t('notify.serviceNotInitialized'));
        return;
      }

      statusBarService?.showQuickRefreshing();
      await glmQuotaService.quickRefresh();
    }
  );

  // Listen to config changes
  const configChangeDisposable = configService.onConfigChange((newConfig) => {
    handleConfigChange(newConfig as Config);
  });

  // Add to context subscriptions
  context.subscriptions.push(
    refreshQuotaCommand,
    configChangeDisposable,
    { dispose: () => glmQuotaService?.dispose() },
    { dispose: () => statusBarService?.dispose() }
  );

  console.log('[Extension] GLM Quota Watcher initialized');
}

/**
 * Handle config changes with debounce to prevent race conditions
 */
function handleConfigChange(config: Config): void {
  if (configChangeTimer) {
    clearTimeout(configChangeTimer);
  }

  configChangeTimer = setTimeout(() => {
    console.log('[Extension] Config updated (debounced)', config);

    statusBarService?.setDisplayStyle(config.displayStyle);
    statusBarService?.setWarningThreshold(config.warningThreshold);
    statusBarService?.setCriticalThreshold(config.criticalThreshold);

    // Update language
    const localizationService = LocalizationService.getInstance();
    if (localizationService.getLanguage() !== config.language) {
      localizationService.setLanguage(config.language);
      glmQuotaService?.quickRefresh();
    }

    if (config.enabled) {
      glmQuotaService?.startPolling(config.pollingInterval);
      statusBarService?.show();
    } else {
      glmQuotaService?.stopPolling();
      statusBarService?.hide();
    }

    vscode.window.showInformationMessage(localizationService.t('notify.configUpdated'));
  }, 300);
}

/**
 * Called when the extension is deactivated
 */
export function deactivate() {
  console.log('[Extension] GLM Quota Watcher deactivated');
  glmQuotaService?.dispose();
  statusBarService?.dispose();
}
