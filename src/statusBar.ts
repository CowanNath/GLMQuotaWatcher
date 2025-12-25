/**
 * GLM Quota Watcher - Status Bar Service
 */

import * as vscode from 'vscode';
import { GlmQuotaSnapshot, GlmQuotaLimit } from './types';
import { LocalizationService } from './i18n/localizationService';

export class StatusBarService {
  private statusBarItem: vscode.StatusBarItem;
  private warningThreshold: number;
  private criticalThreshold: number;
  private displayStyle: 'percentage' | 'progressBar' | 'dots';
  private localizationService: LocalizationService;

  private isQuickRefreshing: boolean = false;
  private refreshStartTime: number = 0;
  private readonly minRefreshDuration: number = 1000;

  constructor(
    displayStyle: 'percentage' | 'progressBar' | 'dots' = 'percentage',
    warningThreshold: number = 50,
    criticalThreshold: number = 30
  ) {
    this.localizationService = LocalizationService.getInstance();
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'glmQuotaWatcher.refreshQuota';
    this.displayStyle = displayStyle;
    this.warningThreshold = warningThreshold;
    this.criticalThreshold = criticalThreshold;
  }

  updateDisplay(snapshot: GlmQuotaSnapshot): void {
    // Check if we need to wait for the minimum animation duration
    if (this.isQuickRefreshing && this.refreshStartTime > 0) {
      const elapsed = Date.now() - this.refreshStartTime;
      if (elapsed < this.minRefreshDuration) {
        const remaining = this.minRefreshDuration - elapsed;
        setTimeout(() => {
          this.updateDisplay(snapshot);
        }, remaining);
        return;
      }
    }

    // Clear refresh state
    this.isQuickRefreshing = false;
    this.refreshStartTime = 0;
    this.statusBarItem.command = 'glmQuotaWatcher.refreshQuota';

    // Format summary based on quota limits
    const summary = this.formatGlmSummary(snapshot);
    this.statusBarItem.text = summary;
    this.statusBarItem.tooltip = this.formatTooltip(snapshot);
    this.statusBarItem.show();
  }

  private formatGlmSummary(snapshot: GlmQuotaSnapshot): string {
    const platformIcon = snapshot.platform === 'ZAI' ? '' : '';

    // Find TOKENS_LIMIT for status bar display (GLM Coding Plan)
    const tokensLimit = snapshot.quotaLimits.find(q => q.limitType === 'TOKENS_LIMIT');
    if (tokensLimit) {
      const percentage = tokensLimit.remainingPercentage;
      const indicator = this.getStatusIndicator(percentage);

      if (this.displayStyle === 'percentage') {
        return `${indicator} ${platformIcon}GLM: ${percentage.toFixed(0)}%`;
      } else if (this.displayStyle === 'progressBar') {
        const bar = this.getProgressBar(percentage);
        return `${indicator} ${platformIcon}GLM ${bar}`;
      } else {
        const dots = this.getDotsBar(percentage);
        return `${indicator} ${platformIcon}GLM ${dots}`;
      }
    }

    return `${platformIcon}GLM: Active`;
  }

  private formatTooltip(snapshot: GlmQuotaSnapshot): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.supportHtml = true;

    md.appendMarkdown(`<h2>GLM Coding Plan 使用量</h2>\n\n`);
    md.appendMarkdown(`---\n\n`);

    // Find TOKENS_LIMIT for GLM Coding Plan
    const tokensLimit = snapshot.quotaLimits.find(q => q.limitType === 'TOKENS_LIMIT');
    if (tokensLimit) {
      const usedPercentage = 100 - tokensLimit.remainingPercentage;

      md.appendMarkdown(`<h3>每5小时可使用额度</h3>\n\n`);
      md.appendMarkdown(`已使用量：${tokensLimit.usedValue.toLocaleString()}\n\n`);
      md.appendMarkdown(`总可用量：${tokensLimit.limitValue.toLocaleString()}\n\n`);
      md.appendMarkdown(`使用占比：${usedPercentage.toFixed(0)}%\n\n`);

      // Format reset time
      if (tokensLimit.resetTime) {
        const resetTimeStr = this.formatResetTime(tokensLimit.resetTime);
        md.appendMarkdown(`重置时间：${resetTimeStr}\n\n`);
      }
    }

    md.appendMarkdown(`---\n\n`);
    md.appendMarkdown(`<h3>MCP每月可使用额度</h3>\n\n`);

    // Find TIME_LIMIT for MCP monthly quota
    const timeLimit = snapshot.quotaLimits.find(q => q.limitType === 'TIME_LIMIT');
    if (timeLimit) {
      md.appendMarkdown(`已使用数：${timeLimit.usedValue}\n\n`);
      md.appendMarkdown(`每月额度：${timeLimit.limitValue}\n\n`);
      md.appendMarkdown(`重置时间：每月1号 00:00 重置\n\n`);
    }

    return md;
  }

  /**
   * Format reset time from timestamp to YYYY-MM-DD HH:mm:ss
   */
  private formatResetTime(resetTime: number | string): string {
    let timestamp: number;
    if (typeof resetTime === 'string') {
      timestamp = parseInt(resetTime, 10);
    } else {
      timestamp = resetTime;
    }

    const resetDate = new Date(timestamp);

    const year = resetDate.getFullYear();
    const month = String(resetDate.getMonth() + 1).padStart(2, '0');
    const day = String(resetDate.getDate()).padStart(2, '0');
    const hours = String(resetDate.getHours()).padStart(2, '0');
    const minutes = String(resetDate.getMinutes()).padStart(2, '0');
    const seconds = String(resetDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 根据剩余百分比返回状态指示符号
   */
  private getStatusIndicator(percentage: number): string {
    if (percentage <= 0) {
      return '⚫'; // Depleted
    } else if (percentage <= this.criticalThreshold) {
      return '🔴'; // Critical
    } else if (percentage <= this.warningThreshold) {
      return '🟡'; // Warning
    }
    return '🟢'; // Normal
  }

  private getProgressBar(percentage: number): string {
    const p = Math.max(0, Math.min(100, percentage));
    const totalBlocks = 8;
    const filledBlocks = Math.round((p / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;

    const filledChar = '█';
    const emptyChar = '░';

    return `${filledChar.repeat(filledBlocks)}${emptyChar.repeat(emptyBlocks)}`;
  }

  private getDotsBar(percentage: number): string {
    const p = Math.max(0, Math.min(100, percentage));
    const totalDots = 5;
    const filledDots = Math.round((p / 100) * totalDots);
    const emptyDots = totalDots - filledDots;

    const filledChar = '●';
    const emptyChar = '○';

    return `${filledChar.repeat(filledDots)}${emptyChar.repeat(emptyDots)}`;
  }

  setDisplayStyle(style: 'percentage' | 'progressBar' | 'dots'): void {
    this.displayStyle = style;
  }

  setWarningThreshold(threshold: number): void {
    this.warningThreshold = threshold;
  }

  setCriticalThreshold(threshold: number): void {
    this.criticalThreshold = threshold;
  }

  showQuickRefreshing(): void {
    if (this.isQuickRefreshing) {
      return;
    }
    this.isQuickRefreshing = true;
    this.refreshStartTime = Date.now();

    const currentText = this.statusBarItem.text;
    if (!currentText.startsWith('$(sync~spin)')) {
      this.statusBarItem.text = this.localizationService.t('status.refreshing');
    }
    this.statusBarItem.tooltip = this.localizationService.t('status.refreshing');
    this.statusBarItem.show();
  }

  showFetching(): void {
    this.statusBarItem.text = this.localizationService.t('status.fetching');
    this.statusBarItem.tooltip = this.localizationService.t('status.fetching');
    this.statusBarItem.show();
  }

  showRetrying(currentRetry: number, maxRetries: number): void {
    this.statusBarItem.text = this.localizationService.t('status.retrying', { current: currentRetry, max: maxRetries });
    this.statusBarItem.tooltip = this.localizationService.t('status.retrying', { current: currentRetry, max: maxRetries });
    this.statusBarItem.show();
  }

  showError(message: string): void {
    this.statusBarItem.text = this.localizationService.t('status.error');
    this.statusBarItem.tooltip = `${message}\n\n${this.localizationService.t('tooltip.clickToRetry')}`;
    this.statusBarItem.command = 'glmQuotaWatcher.refreshQuota';
    this.statusBarItem.show();
  }

  show(): void {
    this.statusBarItem.show();
  }

  hide(): void {
    this.statusBarItem.hide();
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
