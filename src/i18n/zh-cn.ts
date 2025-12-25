/**
 * Chinese (Simplified) translations for GLM Quota Watcher
 */

import { TranslationMap } from './types';

export const zh_cn: TranslationMap = {
    // 状态栏
    'status.fetching': '$(sync~spin) 获取中...',
    'status.retrying': '$(sync~spin) 重试中 ({current}/{max})...',
    'status.error': '$(error) 错误',
    'status.refreshing': '$(sync~spin) 刷新中...',

    // 提示框
    'tooltip.title': 'GLM 使用量',
    'tooltip.platform': '平台',
    'tooltip.timeWindow': '时间窗口',
    'tooltip.quotaLimits': '配额限制',
    'tooltip.modelUsage': '模型使用量',
    'tooltip.toolUsage': '工具使用量',
    'tooltip.tokens': '令牌数',
    'tooltip.requests': '请求数',
    'tooltip.clickToRetry': '点击重试',

    // 通知
    'notify.missingCredentials': 'GLM Quota Watcher: 缺少 ANTHROPIC_AUTH_TOKEN 或 ANTHROPIC_BASE_URL 环境变量',
    'notify.serviceNotInitialized': 'GLM 服务未初始化',
    'notify.configUpdated': '配置已更新',
    'notify.openSettings': '打开设置',

    // 命令
    'command.refreshQuota': '刷新 GLM 配额'
};
