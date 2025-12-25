/**
 * GLM Quota Watcher - Configuration Service
 */

import * as vscode from 'vscode';
import { Config } from './types';

export class ConfigService {
  private readonly configKey = 'glmQuotaWatcher';

  /**
   * 获取完整配置
   */
  getConfig(): Config {
    const config = vscode.workspace.getConfiguration(this.configKey);
    return {
      enabled: config.get<boolean>('enabled', true),
      pollingInterval: Math.max(60, config.get<number>('pollingInterval', 300)) * 1000,
      displayStyle: (config.get<string>('displayStyle', 'percentage') as Config['displayStyle']),
      language: (config.get<string>('language', 'auto') as Config['language']),
      warningThreshold: config.get<number>('warningThreshold', 50),
      criticalThreshold: config.get<number>('criticalThreshold', 30)
    };
  }

  /**
   * 获取轮询间隔
   */
  getPollingInterval(): number {
    return this.getConfig().pollingInterval;
  }

  /**
   * 获取预警阈值
   */
  getWarningThreshold(): number {
    return this.getConfig().warningThreshold;
  }

  /**
   * 获取临界阈值
   */
  getCriticalThreshold(): number {
    return this.getConfig().criticalThreshold;
  }

  /**
   * 是否启用
   */
  isEnabled(): boolean {
    return this.getConfig().enabled;
  }

  /**
   * 监听配置变更
   */
  onConfigChange(callback: (config: Config) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(this.configKey)) {
        callback(this.getConfig());
      }
    });
  }
}
