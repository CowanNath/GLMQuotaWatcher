/**
 * English translations for GLM Quota Watcher
 */

import { TranslationMap } from './types';

export const en: TranslationMap = {
    // Status Bar
    'status.fetching': '$(sync~spin) Fetching...',
    'status.retrying': '$(sync~spin) Retrying ({current}/{max})...',
    'status.error': '$(error) Error',
    'status.refreshing': '$(sync~spin) Refreshing...',

    // Tooltip
    'tooltip.title': 'GLM Usage',
    'tooltip.platform': 'Platform',
    'tooltip.timeWindow': 'Time Window',
    'tooltip.quotaLimits': 'Quota Limits',
    'tooltip.modelUsage': 'Model Usage',
    'tooltip.toolUsage': 'Tool Usage',
    'tooltip.tokens': 'Tokens',
    'tooltip.requests': 'Requests',
    'tooltip.clickToRetry': 'Click to retry',

    // Notifications
    'notify.missingCredentials': 'GLM Quota Watcher: Missing ANTHROPIC_AUTH_TOKEN or ANTHROPIC_BASE_URL environment variables',
    'notify.serviceNotInitialized': 'GLM service is not initialized',
    'notify.configUpdated': 'Configuration updated',
    'notify.openSettings': 'Open Settings',

    // Commands
    'command.refreshQuota': 'Refresh GLM Quota'
};
