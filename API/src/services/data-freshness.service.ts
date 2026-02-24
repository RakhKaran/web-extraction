import { Context, inject } from "@loopback/core";
import { DefaultCrudRepository, repository } from "@loopback/repository";
import { chromium, Browser, BrowserContext } from "playwright";
import path from "path";
import fs from "fs";
import axios from "axios";
import { DataFreshnessConfig, DataFreshnessLog } from "../models";
import { DataFreshnessLogRepository } from "../repositories";

export class DataFreshnessService {
  constructor(
    @inject.context() private ctx: Context,
    @repository(DataFreshnessLogRepository)
    public dataFreshnessLogRepository: DataFreshnessLogRepository,
  ) { }

  /**
   * Execute a data freshness check
   */
  async executeFreshnessCheck(config: DataFreshnessConfig): Promise<DataFreshnessLog> {
    const startTime = Date.now();

    // Create log entry
    const log = await this.dataFreshnessLogRepository.create({
      configId: config.id!,
      configName: config.name,
      runAt: new Date(),
      status: 'running',
      totalChecked: 0,
      stillActive: 0,
      expired: 0,
      errors: 0,
      details: [],
    });

    let browser: Browser | null = null;
    let browserContext: BrowserContext | null = null;

    try {
      // Get the repository
      const repo = await this.ctx.get<DefaultCrudRepository<any, any>>(
        `repositories.${config.sourceRepository}`,
      );

      // Build filters
      const where: any = { ...config.filters };

      // Fetch records to check
      const batchSize = config.batchProcessing?.batchSize || 50;
      const maxJobs = config.batchProcessing?.maxJobsPerRun;

      const records = await repo.find({
        where,
        limit: maxJobs,
      });

      console.log(`Found ${records.length} records to check`);

      if (records.length === 0) {
        await this.dataFreshnessLogRepository.updateById(log.id, {
          status: 'success',
          duration: Date.now() - startTime,
        });
        return log;
      }

      // Initialize browser if needed
      if (config.freshnessCheck.type !== 'simple') {
        browser = await chromium.launch({
          headless: true,
          args: ["--disable-blink-features=AutomationControlled"]
        });

        // Load session if configured
        if (config.freshnessCheck.session?.enabled) {
          const sessionPath = path.resolve(`../API/src/sessions/${config.freshnessCheck.session.storageStatePath}`);
          if (fs.existsSync(sessionPath)) {
            browserContext = await browser.newContext({ storageState: sessionPath });
          } else {
            browserContext = await browser.newContext();
          }
        } else {
          browserContext = await browser.newContext();
        }
      }

      // Process records in batches
      let totalChecked = 0;
      let stillActive = 0;
      let expired = 0;
      let errors = 0;
      const details: any[] = [];

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);

        for (const record of batch) {
          try {
            const url = record[config.urlField];
            if (!url) {
              errors++;
              details.push({
                recordId: record.id,
                url: 'N/A',
                status: 'error',
                message: 'URL field is empty',
              });
              continue;
            }

            const isActive = await this.checkUrlFreshness(
              url,
              config.freshnessCheck,
              browserContext,
            );

            totalChecked++;

            if (isActive) {
              stillActive++;
              await this.updateRecord(record, repo, config.updateStrategy.onFound);
              details.push({
                recordId: record.id,
                url,
                status: 'active',
              });
            } else {
              expired++;
              await this.updateRecord(record, repo, config.updateStrategy.onNotFound);
              details.push({
                recordId: record.id,
                url,
                status: 'expired',
              });
            }

            // Delay between checks
            if (config.batchProcessing?.delayBetweenJobs) {
              await this.delay(config.batchProcessing.delayBetweenJobs);
            }
          } catch (error: any) {
            errors++;
            console.error(`Error checking record ${record.id}:`, error.message);
            details.push({
              recordId: record.id,
              url: record[config.urlField] || 'N/A',
              status: 'error',
              message: error.message,
            });
          }
        }
      }

      // Update log
      await this.dataFreshnessLogRepository.updateById(log.id, {
        status: errors > 0 && stillActive === 0 && expired === 0 ? 'failed' : errors > 0 ? 'partial' : 'success',
        totalChecked,
        stillActive,
        expired,
        errors,
        duration: Date.now() - startTime,
        details,
      });

      return await this.dataFreshnessLogRepository.findById(log.id);
    } catch (error: any) {
      console.error('Freshness check failed:', error);
      await this.dataFreshnessLogRepository.updateById(log.id, {
        status: 'failed',
        errorMessage: error.message,
        duration: Date.now() - startTime,
      });
      throw error;
    } finally {
      if (browserContext) await browserContext.close();
      if (browser) await browser.close();
    }
  }

  /**
   * Check if a URL is still fresh/active
   */
  private async checkUrlFreshness(
    url: string,
    freshnessCheck: DataFreshnessConfig['freshnessCheck'],
    browserContext: BrowserContext | null,
  ): Promise<boolean> {
    if (freshnessCheck.type === 'simple') {
      // Simple HTTP check using axios with proper headers
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      };

      try {
        const response = await axios.get(url, {
          headers,
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: (status) => status < 500,
        });

        console.log(`URL: ${url} - Status: ${response.status}`);

        // Check for common "job not found" indicators
        if (response.status >= 200 && response.status < 400) {
          const html = response.data.toLowerCase();
          
          // Common patterns that indicate job is expired/removed
          const expiredPatterns = [
            'job not found',
            'job no longer available',
            'this job has expired',
            'position has been filled',
            'job posting has been removed',
            'page not found',
            '404',
            'job is no longer active',
            'this position is no longer available',
          ];

          const hasExpiredPattern = expiredPatterns.some(pattern => html.includes(pattern));
          
          if (hasExpiredPattern) {
            console.log(`URL ${url} returned 200 but contains expired job pattern`);
            return false;
          }

          return true;
        }

        console.log(`URL ${url} returned status ${response.status} - marking as expired`);
        return false;
      } catch (error: any) {
        console.error(`Error checking URL ${url}:`, error.message);
        
        // If it's a network error or timeout, we can't determine freshness
        // Mark as expired to be safe
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          console.log(`URL ${url} timed out - marking as expired`);
        } else if (error.response) {
          console.log(`URL ${url} returned error status ${error.response.status} - marking as expired`);
        }
        
        return false;
      }
    }

    if (!browserContext) {
      throw new Error('Browser context is required for content/full-rescrape checks');
    }

    const page = await browserContext.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      if (freshnessCheck.type === 'content') {
        // Check if required selectors exist
        const requiredSelectors = freshnessCheck.requiredSelectors || [];

        for (const selector of requiredSelectors) {
          const element = await page.$(selector);
          if (!element) {
            return false; // Selector not found = page is not active
          }
        }

        return true; // All selectors found = page is active
      }

      if (freshnessCheck.type === 'full-rescrape') {
        // Re-scrape fields and check if they exist
        const fieldsToRescrape = freshnessCheck.fieldsToRescrape || [];

        for (const field of fieldsToRescrape) {
          const element = await page.$(field.selector);
          if (!element) {
            return false; // Field not found = page is not active
          }
        }

        return true;
      }

      return true;
    } catch (error) {
      console.error(`Error checking URL ${url}:`, error);
      return false;
    } finally {
      await page.close();
    }
  }

  /**
   * Update a record based on the strategy
   */
  private async updateRecord(
    record: any,
    repository: DefaultCrudRepository<any, any>,
    strategy: { action: string; fields?: any },
  ): Promise<void> {
    if (strategy.action === 'do-nothing') {
      return;
    }

    if (strategy.action === 'delete-record') {
      await repository.deleteById(record.id);
      return;
    }

    if (strategy.action === 'update-fields' || strategy.action === 'update-timestamp') {
      const updateData: any = {};

      if (strategy.fields) {
        for (const [key, value] of Object.entries(strategy.fields)) {
          if (value === '{{currentDate}}') {
            updateData[key] = new Date();
          } else if (value === '{{increment}}') {
            updateData[key] = (record[key] || 0) + 1;
          } else {
            updateData[key] = value;
          }
        }
      }

      await repository.updateById(record.id, updateData);
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate next run time based on schedule
   */
  calculateNextRun(schedule: DataFreshnessConfig['schedule']): Date {
    const now = new Date();

    switch (schedule.frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);

      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':');
          tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        return tomorrow;

      case 'every-3-days':
        const next3Days = new Date(now);
        next3Days.setDate(next3Days.getDate() + 3);
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':');
          next3Days.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        return next3Days;

      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':');
          nextWeek.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        return nextWeek;

      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':');
          nextMonth.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        return nextMonth;

      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to 24 hours
    }
  }
}
