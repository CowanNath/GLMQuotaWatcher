/**
 * GLM Quota Watcher - type definitions
 */

// GLM 配额限制
export interface GlmQuotaLimit {
  limitType: string;
  limitValue: number;
  usedValue: number;
  remainingValue: number;
  remainingPercentage: number;
  resetTime?: number | string;
}

// GLM 配额快照
export interface GlmQuotaSnapshot {
  timestamp: Date;
  platform: 'ZAI' | 'ZHIPU';
  quotaLimits: GlmQuotaLimit[];
  error?: string;
}

// 配额级别枚举
export enum QuotaLevel {
  Normal = 'normal',
  Warning = 'warning',
  Critical = 'critical',
  Depleted = 'depleted'
}

// 配置接口
export interface Config {
  enabled: boolean;
  pollingInterval: number;
  displayStyle: 'percentage' | 'progressBar' | 'dots';
  language: 'auto' | 'en' | 'zh-cn';
  warningThreshold: number;
  criticalThreshold: number;
}
