/**
 * GLM Quota Service
 * Handles querying GLM usage statistics from the monitoring API
 */

import * as https from 'https';
import { GlmQuotaSnapshot, GlmQuotaLimit } from './types';

export class GlmQuotaService {
  private pollingInterval?: NodeJS.Timeout;
  private updateCallback?: (snapshot: GlmQuotaSnapshot) => void;
  private errorCallback?: (error: Error) => void;
  private statusCallback?: (status: 'fetching' | 'retrying', retryCount?: number) => void;

  private authToken: string;
  private baseUrl: string;
  private platform: 'ZAI' | 'ZHIPU' | null = null;

  private quotaLimitUrl: string = '';

  // Retry configuration
  private consecutiveErrors: number = 0;
  private readonly MAX_RETRY_COUNT = 3;
  private readonly RETRY_DELAY_MS = 5000;
  private retryCount: number = 0;
  private isRetrying: boolean = false;
  private isPollingTransition: boolean = false;

  constructor(authToken: string, baseUrl: string) {
    this.authToken = authToken;
    this.baseUrl = baseUrl;
    this.detectPlatform();
  }

  /**
   * Detect platform and construct API URLs based on base URL
   */
  private detectPlatform(): void {
    try {
      const parsedBaseUrl = new URL(this.baseUrl);
      const baseDomain = `${parsedBaseUrl.protocol}//${parsedBaseUrl.host}`;

      if (this.baseUrl.includes('api.z.ai')) {
        this.platform = 'ZAI';
      } else if (this.baseUrl.includes('open.bigmodel.cn') || this.baseUrl.includes('dev.bigmodel.cn')) {
        this.platform = 'ZHIPU';
      } else {
        throw new Error(`Unrecognized ANTHROPIC_BASE_URL: ${this.baseUrl}`);
      }

      this.quotaLimitUrl = `${baseDomain}/api/monitor/usage/quota/limit`;

      console.log(`[GlmQuotaService] Platform: ${this.platform}`);
    } catch (error) {
      throw new Error(`Invalid base URL: ${this.baseUrl}`);
    }
  }

  onQuotaUpdate(callback: (snapshot: GlmQuotaSnapshot) => void): void {
    this.updateCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  onStatus(callback: (status: 'fetching' | 'retrying', retryCount?: number) => void): void {
    this.statusCallback = callback;
  }

  async startPolling(intervalMs: number): Promise<void> {
    if (this.isPollingTransition) {
      console.log('[GlmQuotaService] Polling transition in progress, skipping...');
      return;
    }

    this.isPollingTransition = true;
    try {
      console.log(`[GlmQuotaService] Starting polling loop every ${intervalMs}ms`);
      this.stopPolling();
      await this.fetchQuota();
      this.pollingInterval = setInterval(() => {
        this.fetchQuota();
      }, intervalMs);
    } finally {
      this.isPollingTransition = false;
    }
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      console.log('[GlmQuotaService] Stopping polling loop');
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }
  }

  /**
   * Quick refresh without interrupting polling
   */
  async quickRefresh(): Promise<void> {
    console.log('[GlmQuotaService] Triggering immediate quota refresh...');
    await this.doFetchQuota();
  }

  private async fetchQuota(): Promise<void> {
    if (this.isRetrying) {
      console.log('[GlmQuotaService] Currently retrying; skipping this polling run...');
      return;
    }

    await this.doFetchQuota();
  }

  private async doFetchQuota(): Promise<void> {
    console.log('[GlmQuotaService] Starting quota fetch...');

    if (this.statusCallback && this.consecutiveErrors === 0) {
      this.statusCallback('fetching');
    }

    try {
      // Query quota limit endpoint only
      const quotaLimits = await this.queryQuotaLimit();

      // Reset error state on success
      this.consecutiveErrors = 0;
      this.retryCount = 0;

      const snapshot: GlmQuotaSnapshot = {
        timestamp: new Date(),
        platform: this.platform!,
        quotaLimits
      };

      console.log(`[GlmQuotaService] Snapshot ready: ${snapshot.quotaLimits.length} limits`);

      if (this.updateCallback) {
        this.updateCallback(snapshot);
      }
    } catch (error: any) {
      this.consecutiveErrors++;
      console.error(`[GlmQuotaService] Quota fetch failed (attempt ${this.consecutiveErrors}):`, error.message);

      if (this.retryCount < this.MAX_RETRY_COUNT) {
        this.retryCount++;
        this.isRetrying = true;
        console.log(`[GlmQuotaService] Retry ${this.retryCount} scheduled in ${this.RETRY_DELAY_MS / 1000} seconds...`);

        if (this.statusCallback) {
          this.statusCallback('retrying', this.retryCount);
        }

        setTimeout(async () => {
          this.isRetrying = false;
          await this.fetchQuota();
        }, this.RETRY_DELAY_MS);
        return;
      }

      console.error(`[GlmQuotaService] Max retries reached, stopping polling`);
      this.stopPolling();

      if (this.errorCallback) {
        this.errorCallback(error as Error);
      }
    }
  }

  private async queryQuotaLimit(): Promise<GlmQuotaLimit[]> {
    const data = await this.makeRequest(this.quotaLimitUrl);
    return this.parseQuotaLimits(data);
  }

  private makeRequest(apiUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(apiUrl);
      const options: https.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'Authorization': this.authToken,
          'Accept-Language': 'en-US,en',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };

      console.log(`[GlmQuotaService] Request: ${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search}`);

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e}`));
          }
        });
      });

      req.on('error', (error) => reject(error));
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
      req.end();
    });
  }

  private parseQuotaLimits(data: any): GlmQuotaLimit[] {
    if (!data || !data.data) return [];
    // Handle actual API response: { data: { limits: [...] } }
    const limitsContainer = data.data;
    const limits = limitsContainer.limits || limitsContainer;
    if (!Array.isArray(limits)) return [];

    return limits.map((item: any) => {
      // Handle actual API response fields
      const limitValue = item.usage || item.limit_value || item.limitValue || 0;
      const usedValue = item.currentValue || item.used_value || item.usedValue || 0;
      const remainingValue = item.remaining || item.remaining_value || item.remainingValue || (limitValue - usedValue);
      // Use percentage from API if available, otherwise calculate
      const remainingPercentage = item.percentage !== undefined
        ? (100 - item.percentage)  // API returns usage percentage, we need remaining
        : (limitValue > 0 ? (remainingValue / limitValue) * 100 : 0);

      return {
        limitType: item.type || item.limit_type || item.limitType || 'Unknown',
        limitValue,
        usedValue,
        remainingValue,
        remainingPercentage,
        resetTime: item.nextResetTime || item.reset_time || item.resetTime || undefined
      };
    });
  }

  dispose(): void {
    this.stopPolling();
  }
}
