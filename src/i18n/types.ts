export type TranslationKey =
    // Status Bar
    | 'status.fetching'
    | 'status.retrying'
    | 'status.error'
    | 'status.refreshing'

    // Tooltip
    | 'tooltip.title'
    | 'tooltip.platform'
    | 'tooltip.timeWindow'
    | 'tooltip.quotaLimits'
    | 'tooltip.modelUsage'
    | 'tooltip.toolUsage'
    | 'tooltip.tokens'
    | 'tooltip.requests'
    | 'tooltip.clickToRetry'

    // Notifications
    | 'notify.missingCredentials'
    | 'notify.serviceNotInitialized'
    | 'notify.configUpdated'
    | 'notify.openSettings'

    // Commands
    | 'command.refreshQuota';

export interface TranslationMap {
    [key: string]: string;
}
