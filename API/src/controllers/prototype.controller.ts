// About the controller...
// Demonstration of a generic blueprint for scraping.

import { HttpErrors, post, requestBody } from "@loopback/rest";
import path from "path";
import { chromium } from "playwright";
import fs from 'fs';
import { Context, inject } from "@loopback/core";
import { DefaultCrudRepository, repository } from "@loopback/repository";
import { TestExtractionLogsRepository } from "../repositories";
import { TestExtractionLogs } from "../models";

export class PrototypeController {
  constructor(
    @inject.context() private ctx: Context,
    @repository(TestExtractionLogsRepository)
    public testExtractionLogsRepository: TestExtractionLogsRepository,
  ) { }

  naukriBluePrint = {
    workflowName: "Web-extraction",
    workflowDescription: "Scraping job details from Naukri",
    nodes: [
      {
        id: 1,
        nodeName: "Initialize",
        type: "start",
        data: {
          url: "https://www.naukri.com",
          headers: { "User-Agent": "Mozilla/5.0" },
          session: {
            enabled: true,
            storageStatePath: "../API/src/sessions/naukri.json",
            load: true,
            save: true
          }
        },
      },
      {
        id: 2,
        nodeName: "Search",
        type: "search",
        data: { searchText: "node developer" },
        selector: {
          name: "Enter skills / designations / companies",
          selectorType: "placeholder",
        },
        actionFlow: [
          {
            selector: '.container.dashboard',
            type: 'html',
            action: 'click',
            data: null
          },
          {
            selector: '.nI-gNb-sb__main',
            type: 'html',
            action: 'click',
            data: null
          }
        ],
      },
      {
        id: 3,
        nodeName: "Locate",
        type: "locate",
        mode: "list",
        selector: {
          name: ".srp-jobtuple-wrapper .title",
          selectorType: "css",
        },
        fields: [],
        link: { selector: ".title", attribute: "href" },
      },
      {
        id: 4,
        nodeName: "Locate",
        type: "locate",
        mode: "detail",
        fields: {
          title: "h1.styles_jd-header-title__rZwM1",
          company: ".styles_jd-header-comp-name__MvqAI a",
          location: ".styles_jhc__location__W_pVs a",
          experience: ".styles_jhc__exp__k_giM span",
          salary: ".styles_jhc__salary__jdfEC span",
          description: ".styles_job-desc-container__txpYf",
          posted: "span:has(label:has-text('Posted:')) span",
          openings: "span:has(label:has-text('Openings:')) span",
          applicants: "span:has(label:has-text('Applicants:')) span",
          aboutCompany: {
            selector: ".styles_detail__U2rw4.styles_dang-inner-html___BCwh",
            type: "html",
          },
          keySkills: {
            selector: ".styles_key-skill__GIPn_ a, .styles_key-skill__GIPn_ span",
            type: "list",
            item: {
              name: {
                type: "text"
              },
              link: {
                type: "attr",
                attr: "href",
                optional: true  // because <span> won’t have href
              }
            }
          },
        },
        waitToLoadSelectors: [
          "h1.styles_jd-header-title__rZwM1",
          "div.styles_key-skill__GIPn_ a",
          ".styles_key-skill__GIPn_ span"
        ],
      },
      {
        id: 4,
        nodeName: "Deliver",
        type: "deliver",
        mode: "database",
        modelName: "StagingNaukri",
        respositoryName: "StagingNaukriRepository",
        fields: [
          { modelField: 'title', type: 'string', mappedField: 'title' },
          { modelField: 'description', type: 'string', mappedField: 'description' },
          { modelField: 'company', type: 'string', mappedField: 'company' },
          { modelField: 'companyLogo', type: 'string', mappedField: '' },
          { modelField: 'location', type: 'string', mappedField: 'location' },
          { modelField: 'experience', type: 'string', mappedField: 'experience' },
          { modelField: 'salary', type: 'string', mappedField: 'salary' },
          { modelField: 'posted', type: 'string', mappedField: 'posted' },
          { modelField: 'openings', type: 'string', mappedField: 'openings' },
          { modelField: 'applicants', type: 'string', mappedField: 'applicants' },
          { modelField: 'aboutCompany', type: 'string', mappedField: 'aboutCompany' },
          { modelField: 'keySkills', type: 'array', mappedField: 'keySkills' },
          { modelField: 'redirectUrl', type: 'string', mappedField: 'link' },
        ],
        additionalFields: [
          { modelField: 'scrappedAt', type: 'date', value: '' },
          { modelField: 'isDeleted', type: 'boolean', value: 'false' },
          { modelField: 'isSync', type: 'boolean', value: false },
        ]
      },
      {
        id: 5,
        nodeName: "Transformation",
        type: "transformation",
        stagingMode: "database",
        stagingModelName: "StagingNaukri",
        stagingRespositoryName: "StagingNaukriRepository",
        deliverMode: "database",
        deliverModelName: "ProductionNaukri",
        deliverRespositoryName: "ProductionNaukriRepository",
        duplicatesAllowed: false,
        fields: [
          { modelField: 'title', type: 'string', mappedField: 'title', isNullAccepted: false },
          { modelField: 'description', type: 'string', mappedField: 'description', isNullAccepted: false },
          { modelField: 'company', type: 'string', mappedField: 'company', isNullAccepted: false },
          { modelField: 'companyLogo', type: 'string', mappedField: 'companyLogo', isNullAccepted: true },
          { modelField: 'location', type: 'string', mappedField: 'location', isNullAccepted: false },
          { modelField: 'experience', type: 'string', mappedField: 'experience', isNullAccepted: false },
          { modelField: 'salary', type: 'string', mappedField: 'salary', isNullAccepted: false },
          {
            modelField: 'posted',
            type: 'date',
            mappedField: 'posted',
            isNullAccepted: false,
            rules: [
              { "Just now": "today" },
              { "yesterday": "yesterday" },
              { "{number} day ago": "days" },
              { "{number} days ago": "days" },
              { "{number}+ days ago": "days" },
              { "{number} week ago": "weeks" },
              { "{number} weeks ago": "weeks" },
              { "{number}+ weeks ago": "weeks" },
              { "{number} month ago": "months" },
              { "{number} months ago": "months" },
              { "{number} year ago": "years" },
              { "{number} years ago": "years" },
              { "posted on {date}": "date" },
              { "{date}": "date" }
            ]
          },
          { modelField: 'openings', type: 'number', mappedField: 'openings', isNullAccepted: false },
          { modelField: 'applicants', type: 'number', mappedField: 'applicants', isNullAccepted: false },
          { modelField: 'aboutCompany', type: 'string', mappedField: 'aboutCompany', isNullAccepted: false },
          { modelField: 'keySkills', type: 'array', mappedField: 'keySkills', isNullAccepted: false },
          { modelField: 'redirectUrl', type: 'string', mappedField: 'redirectUrl', isNullAccepted: false },
          { modelField: 'isDeleted', type: 'boolean', mappedField: 'deletedAt', isNullAccepted: true },
        ],
        additionalFields: [
          { modelField: 'isActive', type: 'boolean', value: true },
        ],
        dataAcceptanceRule: [
          { field: 'isSync', type: 'boolean', value: false },
          { field: 'isDeleted', type: 'boolean', value: false }
        ],
      }
    ],
  };

  glassdoorBluePrint = {
    workflowName: "Web-extraction",
    workflowDescription: "Scraping job details from Naukri",
    nodes: [
      {
        id: 1,
        nodeName: "Initialize",
        type: "start",
        data: {
          url: "https://www.glassdoor.co.in/Job/index.htm",
          headers: { "User-Agent": "Mozilla/5.0" },
          session: {
            enabled: true,
            storageStatePath: "../API/src/sessions/glassdoor.json",
            load: true,
            save: true
          }
        },
      },
      {
        id: 2,
        nodeName: "Search",
        type: "search",
        data: { searchText: "backend developer" },
        selector: {
          name: "Find your perfect job",
          selectorType: "placeholder",
        },
      },
      {
        id: 3,
        nodeName: "Search",
        type: "search",
        data: { searchText: "Nashik" },
        selector: {
          name: 'City, state, zipcode or "remote"',
          selectorType: "placeholder",
        },
      },
      {
        id: 4,
        nodeName: "JobList",
        type: "locate",
        mode: "list", // just collect links
        selector: {
          name: ".JobCard_jobCardContainer__arQlW .JobCard_jobTitle__GLyJ1",
          selectorType: "css",
        },
        fields: {
          link: { selector: ".JobCard_jobTitle__GLyJ1", attribute: "href" },
        },
      },
      {
        id: 5,
        nodeName: "JobDetail",
        type: "locate",
        mode: "detail",
        fields: {
          title: "h1.heading_Heading__aomVx.heading_Level1__w42c9",
          company: "h4.heading_Heading__aomVx.heading_Subhead__jiUbT",
          location: "div[data-test='location']",
          // experience: "div.JobDetails_jobDescription__uW_fK p:has-text(':')",
          salary: "div.JobDetails_jobDescription__uW_fK p:has-text('Pay:')",
          description: "div.JobDetails_jobDescription__uW_fK.JobDetails_showHidden__C_FOA",
          posted: "span:has(label:has-text('Posted:')) span",
          openings: "span:has(label:has-text('Openings:')) span",
          applicants: "span:has(label:has-text('Applicants:')) span",
          aboutCompany: {
            selector: ".styles_detail__U2rw4.styles_dang-inner-html___BCwh",
            type: "html",
          },
          keySkills: {
            selector: "ul.QualificationModal_modalBody__SNggC li",
            type: "list",
            item: {
              name: {
                selector: ".PendingQualification_label__vCsCk",
                type: "text"
              },
            }
          }
        },
        waitToLoadSelectors: [
          "h1.heading_Heading__aomVx.heading_Level1__w42c9",
          "h4.heading_Heading__aomVx.heading_Subhead__jiUbT",
        ]
      },
    ],
  };

  // apply conditions
  private applyConditions(value: any, type: string, conditions: any[]): boolean {
    if (!conditions || conditions.length === 0) return true; // no validation, pass

    for (const cond of conditions) {
      const { condition, value: condValue } = cond;

      switch (condition) {
        // STRING TYPE
        case 'notValid':
          if (value === condValue || value === undefined || value === null) return false;
          break;
        case 'minLength':
          if (typeof value === 'string' && value.length < Number(condValue)) return false;
          break;
        case 'maxLength':
          if (typeof value === 'string' && value.length > Number(condValue)) return false;
          break;
        case 'email':
          if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
          break;
        case 'phone':
          if (typeof value === 'string' && !/^[0-9]{10,15}$/.test(value)) return false;
          break;

        // NUMBER TYPE
        case 'min':
          if (Number(value) < Number(condValue)) return false;
          break;
        case 'max':
          if (Number(value) > Number(condValue)) return false;
          break;
        case 'positive':
          if (Number(value) <= 0) return false;
          break;
        case 'negative':
          if (Number(value) >= 0) return false;
          break;
        case 'integer':
          if (!Number.isInteger(Number(value))) return false;
          break;

        // BOOLEAN TYPE
        case 'isTrue':
          if (value !== true) return false;
          break;
        case 'isFalse':
          if (value !== false) return false;
          break;

        // ARRAY TYPE
        case 'min':
          if (Array.isArray(value) && value.length < Number(condValue)) return false;
          break;
        case 'max':
          if (Array.isArray(value) && value.length > Number(condValue)) return false;
          break;
        case 'includes':
          if (Array.isArray(value) && !value.includes(condValue)) return false;
          break;
        case 'unique':
          if (Array.isArray(value) && new Set(value).size !== value.length) return false;
          break;

        // DATE TYPE
        case 'before':
          if (new Date(value) >= new Date(condValue)) return false;
          break;
        case 'after':
          if (new Date(value) <= new Date(condValue)) return false;
          break;
        case 'min':
          if (new Date(value) < new Date(condValue)) return false;
          break;
        case 'max':
          if (new Date(value) > new Date(condValue)) return false;
          break;

        default:
          console.warn(`Unknown condition: ${condition}`);
      }
    }

    return true;
  }

  private buildSelector(page: any, selector: { name: string; selectorType: string }) {
    switch (selector.selectorType) {
      case "id":
        return page.locator(`#${selector.name}`);
      case "class":
        return page.locator(`.${selector.name}`);
      case "css":
        return page.locator(selector.name);
      case "xpath":
        return page.locator(`xpath=${selector.name}`);
      case "placeholder":
        return page.getByPlaceholder(selector.name);
      case "role":
        return page.getByRole("textbox", { name: selector.name });
      default:
        return page.locator(selector.name);
    }
  }

  // Extract value (text or attribute)
  // Universal extractor
  private async extractField(el: any, fieldConfig: any) {
    if (!el || !fieldConfig) return null;

    // Case 1: simple text
    if (fieldConfig.type === "text") {
      return (await el.innerText())?.trim();
    }

    // Case 2: attribute
    if (fieldConfig.type === "attr") {
      return (await el.getAttribute(fieldConfig.attr))?.trim();
    }

    // Case 3: object (nested fields)
    if (fieldConfig.type === "object" && fieldConfig.fields) {
      const result: Record<string, any> = {};
      for (const [key, subConfigRaw] of Object.entries(fieldConfig.fields)) {
        const subConfig = subConfigRaw as { selector?: string; type?: string; attr?: string; fields?: any };
        let subEl = el;
        if (subConfig.selector) {
          subEl = await el.$(subConfig.selector);
        }
        result[key] = subEl ? await this.extractField(subEl, subConfig) : null;
      }
      return result;
    }

    // Case 4: list
    if (fieldConfig.type === "list" && fieldConfig.item) {
      let listEls: any[] = [];

      if (fieldConfig.item.selector) {
        // container + child selector style
        listEls = await el.$$(fieldConfig.item.selector);
      } else {
        // direct selector style (el itself IS the item)
        console.log('selector', fieldConfig.selector);
      }

      const items: any[] = [];
      for (const listEl of listEls) {
        items.push(await this.extractField(listEl, fieldConfig.item));
      }

      return items;
    }

    if (fieldConfig.type === "html") {
      return (await el.innerHTML())?.trim();
    }

    // Default fallback: inner text
    return (await el.innerText())?.trim();
  }

  // handleActions
  private async handleActions(actions: any[], page: any) {
    try {
      for (const action of actions) {
        const { selector } = action;
        console.log(`Performing action for selector ${selector} - `, action.action);

        switch (action.action) {
          case 'click':
            await page.waitForSelector(selector, { timeout: 15000 });
            const element = await page.$(selector);
            if (element) {
              console.log('element found');
              await element.click();
              console.log('element cliked');
            } else {
              console.log('element not found');
            }
            break;

          default:
            console.warn(`Unknown action: ${selector.action}`);
        }
      }
    } catch (error) {
      console.error('Error while performing action', error);
    }
  }

  // initialize
  private async handleInitializeNode(node: any, extractionId: string) {
    const browser = await chromium.launch({
      headless: false,
      args: ["--disable-blink-features=AutomationControlled", "--start-maximized"]
    });

    let browserContext: import("playwright").BrowserContext;
    let page;

    const session = node?.data?.session;

    if (session?.enabled) {
      const storageStatePath = path.resolve(`../API/src/sessions/${session.storageStatePath}.json`);

      if (session.load && fs.existsSync(storageStatePath)) {
        console.log(`🔑 Using saved session from ${storageStatePath}`);
        await this.testExtractionLogsRepository.create({
          extractionId: extractionId,
          logsDescription: `🔑 Using saved session from ${storageStatePath}`,
          logType: 0, // Info
          isActive: true,
        });
        browserContext = await browser.newContext({ storageState: storageStatePath });
      } else {
        console.log("⚠️ No saved session, starting fresh.");
        await this.testExtractionLogsRepository.create({
          extractionId: extractionId,
          logsDescription: "⚠️ No saved session, starting fresh.",
          logType: 0, // Info
          isActive: true,
        });
        browserContext = await browser.newContext({
          viewport: null,
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
        });
      }

      page = await browserContext.newPage();
      await page.goto(node.data?.url, { waitUntil: "domcontentloaded" });

      // 👉 If no session yet, wait for user to log in
      if (session.save && (!fs.existsSync(storageStatePath))) {
        console.log("💡 Please log in manually in the opened browser.");
        await this.testExtractionLogsRepository.create({
          extractionId: extractionId,
          logsDescription: "💡 Please log in manually in the opened browser.",
          logType: 0, // Info
          isActive: true,
        });
        console.log("👉 After login, press ENTER in terminal to continue...");
        await this.testExtractionLogsRepository.create({
          extractionId: extractionId,
          logsDescription: "👉 After login, press ENTER in terminal to continue...",
          logType: 0, // Info
          isActive: true,
        });

        await new Promise<void>((resolve) => {
          process.stdin.once("data", () => resolve());
        });

        await browserContext.storageState({ path: storageStatePath });
        console.log(`✅ Session saved to ${storageStatePath}`);
        await this.testExtractionLogsRepository.create({
          extractionId: extractionId,
          logsDescription: `✅ Session saved to ${storageStatePath}`,
          logType: 0, // Info
          isActive: true,
        });
      }
    } else {
      browserContext = await browser.newContext();
      page = await browserContext.newPage();
      await page.goto(node.data?.url, { waitUntil: "domcontentloaded" });
    }

    return { browser, browserContext, page };
  }

  // search
  private async handleSearchNode(page: any, node: any) {
    if (!node?.selector) return;

    if (node.actionFlow && node.actionFlow.length > 0) {
      await this.handleActions(node.actionFlow, page);
    }

    const searchInput = this.buildSelector(page, node.selector);
    await searchInput.fill(node?.data?.searchText);
    await searchInput.press("Enter");
    await page.waitForTimeout(4000);
  }

  // listing node
  private async handleJobListNode(page: any, node: any): Promise<string[]> {
    const jobLinks: string[] = [];

    // Run pre-defined actions first (if any)
    if (node.actionFlow && node.actionFlow.length > 0) {
      await this.handleActions(node.actionFlow, page);
    }

    const selectorName = node?.selector?.name;
    if (!selectorName) return jobLinks;

    // Extract pagination configuration (optional)
    const pagination = node?.paginationFields;
    const nextPageSelector = pagination?.nextPageSelectorName;
    const totalPages = pagination?.numberOfPages || 1;

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      console.log(`🔹 Scraping page ${pageIndex + 1}`);

      try {
        // Wait for job cards to load
        await page.waitForSelector(selectorName, { timeout: 15000 });

        const jobCards = await page.$$(selectorName);
        console.log(`Found ${jobCards.length} job cards`);

        // Extract up to 5 job links (optional)
        for (let card of jobCards.slice(0, 5)) {
          const href = await card.getAttribute("href");
          if (href) jobLinks.push(href);
        }

        // Stop if pagination not configured or last page
        if (!pagination || !nextPageSelector || pageIndex === totalPages - 1) {
          console.log("✅ No more pagination or last page reached.");
          break;
        }

        // Try finding next button
        const nextBtn = await page.$(nextPageSelector);
        if (!nextBtn) {
          console.log("🚫 Next button not found, ending pagination.");
          break;
        }

        // Check if next button is disabled
        const isDisabled = await nextBtn.isDisabled?.() || await page.evaluate(
          (btn: any) => btn.disabled || btn.getAttribute("disabled") !== null,
          nextBtn
        );

        if (isDisabled) {
          console.log("🚫 Next button is disabled. Ending pagination.");
          break;
        }

        console.log("➡️ Clicking next page...");
        await nextBtn.click();

        // Wait for page content to refresh
        await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
        await page.waitForTimeout(2000);

      } catch (err: any) {
        console.error(`⚠️ Error while scraping page ${pageIndex + 1}: ${err.message}`);
        break;
      }
    }

    console.log("✅ Final job links:", jobLinks);
    return jobLinks;
  }

  // detail data node
  private async handleJobDetailNode(browser: any, jobLinks: string[], node: any, extractionId: string) {
    let extractedData: any[] = [];

    for (const [i, link] of jobLinks.entries()) {
      try {
        console.log(`(${i + 1}/${jobLinks.length}) Navigating to: ${link}`);
        await this.testExtractionLogsRepository.create({
          extractionId: extractionId,
          logsDescription: `(${i + 1}/${jobLinks.length}) Navigating to: ${link}`,
          logType: 0, // Info
          isActive: true,
        });
        const jobPage = await browser.newPage();
        await jobPage.goto(link, { waitUntil: "domcontentloaded" });

        // wait for essential content
        await Promise.all(
          (node?.waitToLoadSelectors ?? []).map((selector: any) =>
            jobPage.waitForSelector(selector, { timeout: 10000 })
          )
        );

        if (node.actionFlow && node.actionFlow.length > 0) {
          await this.handleActions(node.actionFlow, jobPage);
        }

        let record: any = { link };

        for (const [fieldName, rawConfig] of Object.entries(node?.fields || {})) {
          const fieldConfig = rawConfig as any; // force type-safe cast

          if (!fieldConfig) {
            record[fieldName] = null;
            continue;
          }

          try {
            let el = null;

            if (typeof fieldConfig === "string") {
              el = await jobPage.$(fieldConfig);
              record[fieldName] = el
                ? await this.extractField(el, { type: "text" })
                : null;

            } else if (typeof fieldConfig === "object" && "selector" in fieldConfig && fieldConfig.selector) {
              if (fieldConfig.type === "list") {
                const listEls = await jobPage.$$(fieldConfig.selector);
                record[fieldName] = [];
                for (const listEl of listEls) {
                  record[fieldName].push(await this.extractField(listEl, fieldConfig.item));
                }
              } else {
                el = await jobPage.$(fieldConfig.selector);
                record[fieldName] = el
                  ? await this.extractField(el, fieldConfig)
                  : null;
              }
            } else if (typeof fieldConfig === "object" && !("selector" in fieldConfig)) {
              record[fieldName] = await this.extractField(null, fieldConfig);
            } else {
              record[fieldName] = null;
            }

          } catch (innerErr) {
            console.warn(`⚠️ Failed to extract ${fieldName} from ${link}`, innerErr);
            await this.testExtractionLogsRepository.create({
              extractionId: extractionId,
              logsDescription: `⚠️ Failed to extract ${fieldName} from ${link}, ${innerErr}`,
              logType: 1, // Info
              isActive: true,
            });
            record[fieldName] = null;
          }
        }

        extractedData.push(record);
        console.log('extracted Data', extractedData);
        await jobPage.close();

      } catch (err) {
        console.error(`❌ Failed to scrape ${link}`, err);
        await this.testExtractionLogsRepository.create({
          extractionId: extractionId,
          logsDescription: `❌ Failed to scrape ${link}, ${err}`,
          logType: 1, // Info
          isActive: true,
        });
      }
    }

    return extractedData;
  }

  // deliver node
  private async handleDeliverNode(data: any[], node: any, extractionId: string) {
    if (!data || data.length === 0) {
      console.log('⚠️ No data to deliver');
      await this.testExtractionLogsRepository.create({
        extractionId: extractionId,
        logsDescription: '⚠️ No data to deliver',
        logType: 1, // Info
        isActive: true,
      });
      return [];
    }

    if (!node.respositoryName) {
      await this.testExtractionLogsRepository.create({
        extractionId: extractionId,
        logsDescription: `Deliver node missing "repository" config`,
        logType: 1, // Info
        isActive: true,
      });
      throw new Error(`Deliver node missing "repository" config`);
    }

    // explicitly type cast
    const repo = await this.ctx.get<DefaultCrudRepository<any, any>>(
      `repositories.${node.respositoryName}`,
    );

    const deliveredRecords: any[] = [];
    for (const record of data) {
      try {
        const payload: any = {};

        // Map fields
        for (const field of node.fields ?? []) {
          const { modelField, mappedField, type, conditions = [] } = field;
          let value = record[mappedField];

          if (value === undefined || value === null || value === '') {
            if (type === 'string') value = 'NA';
            else if (type === 'date') value = new Date();
            else if (type === 'boolean') value = false;
            else value = undefined;
          } else {
            if (type === 'date') value = new Date(value);
            if (type === 'boolean')
              value = value === true || value === 'true' || value === 1;
          }

          if (conditions.length > 0) {
            const isValid = this.applyConditions(value, type, conditions);
            if (!isValid) {
              await this.testExtractionLogsRepository.create({
                extractionId,
                logsDescription: `Field "${modelField}" failed condition check for record: ${JSON.stringify(record)}`,
                logType: 1,
                isActive: true,
              });
              continue;
            }
          }

          payload[modelField] = value;
        }

        // Handle additional fields
        for (const addField of node.additionalFields ?? []) {
          let value = addField.value;

          if (value === undefined || value === null || value === '') {
            if (addField.type === 'string') value = 'NA';
            else if (addField.type === 'date') value = new Date();
            else if (addField.type === 'boolean') value = false;
            else value = undefined;
          } else {
            if (addField.type === 'date') value = new Date(value);
            if (addField.type === 'boolean')
              value = value === true || value === 'true' || value === 1;
          }

          payload[addField.modelField] = value;
        }

        // Save using repository
        const created = await repo.create(payload);
        deliveredRecords.push(created);
      } catch (err) {
        console.error(`❌ Failed to deliver record`, err);
        await this.testExtractionLogsRepository.create({
          extractionId: extractionId,
          logsDescription: `❌ Failed to deliver record, ${err}`,
          logType: 1, // Info
          isActive: true,
        });
      }
    }

    return deliveredRecords;
  }

  // transformation node
  private async handleTransformationNode(node: any, extractionId: string) {
    if (!node.stagingMode || !node.stagingModelName || !node.stagingRepositoryName) {
      await this.testExtractionLogsRepository.create({
        extractionId: extractionId,
        logsDescription: "Staging details are not properly configured",
        logType: 1, // Info
        isActive: true,
      });
      throw new Error("Staging details are not properly configured");
    }

    const stagingRepo = await this.ctx.get<DefaultCrudRepository<any, any>>(
      `repositories.${node.stagingRepositoryName}`,
    );

    if (!node.deliverMode || !node.deliverModelName || !node.deliverRepositoryName) {
      await this.testExtractionLogsRepository.create({
        extractionId: extractionId,
        logsDescription: "Deliver details are not properly configured",
        logType: 1, // Info
        isActive: true,
      });
      throw new Error("Deliver details are not properly configured");
    }

    const deliverRepo = await this.ctx.get<DefaultCrudRepository<any, any>>(
      `repositories.${node.deliverRepositoryName}`,
    );

    const deliveredRecords: any[] = [];
    let conditions: any[] = [];

    // --- Build filter based on dataAcceptanceRule
    if (node.dataAcceptanceRule && node.dataAcceptanceRule.length > 0) {
      node.dataAcceptanceRule.forEach((data: any) => {
        if (['string', 'number', 'boolean'].includes(data.type)) {
          conditions.push({ [data.field]: data.value });
        }

        if (data.type === 'date') {
          const dateCondition: any = {};
          if (data.startDate) dateCondition.gte = new Date(data.startDate);
          if (data.endDate) dateCondition.lte = new Date(data.endDate);
          conditions.push({ [data.field]: dateCondition });
        }
      });
    }

    const filter = {
      where: {
        and: conditions.length > 0 ? conditions : [{}],
      },
      fields: {
        ...Object.fromEntries(node.fields.map((f: any) => [f.mappedField, true])),
      },
    };

    // fetch data
    const data = await stagingRepo.find(filter);

    // remove system fields
    const stagingData = data.map(item => {
      const obj = item.toJSON ? item.toJSON() : item; // convert Entity to plain object if needed
      const { createdAt, updatedAt, ...rest } = obj;
      return rest;
    });

    const successRecords: any[] = [];
    const errorRecords: any[] = [];

    for (const record of stagingData) {
      const normalized: any = {};
      let hasError = false;

      for (const field of node.fields) {
        let value = record[field.mappedField];

        // Null check
        if (!field.isNullAccepted && (value === null || value === undefined || value === "")) {
          hasError = true;
          continue;
        }

        switch (field.type) {
          case 'string':
            value = value ? String(value).trim() : null;
            break;

          case 'number':
            if (typeof value === "string") {
              // Extract first number from string
              const match = value.match(/\d+/);
              if (match) {
                value = Number(match[0]); // take first numeric part
              } else {
                hasError = true; // invalid number (e.g. "N/A")
              }
            } else if (typeof value === "number") {
              value = value;
            } else {
              hasError = true;
            }
            break;

          case 'boolean':
            value = Boolean(value);
            break;

          case 'date': {
            const parsedDate = this.parseDate(value, field.rules); // pass rules if you support them
            if (parsedDate && !isNaN(parsedDate.getTime())) {
              value = parsedDate;
            } else {
              hasError = true;   // mark record as errored
              value = null;      // or keep original value if you want to store raw
            }
            break;
          }

          case 'array':
            if (Array.isArray(value)) {
              value = [...new Set(value.map((v: any) => String(v).trim()))];
            } else {
              value = [];
            }
            break;
        }

        normalized[field.modelField] = value;
      }

      // Add additional fields
      for (const extra of node.additionalFields || []) {
        normalized[extra.modelField] =
          // Case 1: Date type
          extra.type === 'date' && !extra.value
            ? new Date() // if no value is provided, default to "now"

            // Case 2: Boolean type
            : extra.type === 'boolean'
              ? (extra.value === true) // convert "true"/"false" string to boolean

              // Case 3: All other types
              : extra.value; // keep as-is (string, number, etc.)
      }

      // Push into success or error bucket
      if (hasError) {
        errorRecords.push({ original: record, normalized });
      } else {
        successRecords.push(normalized);
      }
    }

    // Now you can insert only successRecords
    for (const data of successRecords) {
      const exists = await deliverRepo.findOne({
        where: {
          and: Object.keys(data).map(key => ({ [key]: data[key] })),
        },
      });
      if (!exists) {
        await deliverRepo.create(data);
      }
    }

    console.log('success records:', successRecords.length);
    await this.testExtractionLogsRepository.create({
      extractionId: extractionId,
      logsDescription: `success records: ${successRecords.length}`,
      logType: 2, // Info
      isActive: true,
    });
    console.log('errored records:', errorRecords.length);
    await this.testExtractionLogsRepository.create({
      extractionId: extractionId,
      logsDescription: `errored records: ${errorRecords.length}`,
      logType: 1, // Info
      isActive: true,
    });
    return { successRecords, errorRecords };
  }

  // --- Helper to handle "x days ago" etc.
  private toStartOfDay(date: Date): Date {
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private parseDate(input: any, rules?: any[]): Date | null {
    if (!input) return null;

    if (typeof input === "string") {
      const normalized = input.toLowerCase().trim();

      // Loop through rules
      if (rules && rules.length) {
        for (const rule of rules) {
          const [pattern, type] = Object.entries(rule)[0];

          switch (type) {
            case "today": {
              if (normalized.includes("today")) return this.toStartOfDay(new Date());
              break;
            }

            case "yesterday": {
              if (normalized.includes("yesterday")) {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                return this.toStartOfDay(d);
              }
              break;
            }

            case "days": {
              const match = normalized.match(/(\d+)\+?\s+day/);
              if (match) {
                const days = parseInt(match[1], 10);
                const d = new Date();
                d.setDate(d.getDate() - days);
                return this.toStartOfDay(d);
              }
              break;
            }

            case "weeks": {
              const match = normalized.match(/(\d+)\+?\s+week/);
              if (match) {
                const weeks = parseInt(match[1], 10);
                const d = new Date();
                d.setDate(d.getDate() - weeks * 7);
                return this.toStartOfDay(d);
              }
              break;
            }

            case "months": {
              const match = normalized.match(/(\d+)\+?\s+month/);
              if (match) {
                const months = parseInt(match[1], 10);
                const d = new Date();
                d.setMonth(d.getMonth() - months);
                return this.toStartOfDay(d);
              }
              break;
            }

            case "years": {
              const match = normalized.match(/(\d+)\+?\s+year/);
              if (match) {
                const years = parseInt(match[1], 10);
                const d = new Date();
                d.setFullYear(d.getFullYear() - years);
                return this.toStartOfDay(d);
              }
              break;
            }

            case "date": {
              // handles: "posted on 12 September 2025", "12/09/2025", etc.
              const dateMatch = normalized.match(
                /(\d{1,2}[\/\- ]\d{1,2}[\/\- ]\d{2,4}|\d{1,2}\s+[a-zA-Z]+\s+\d{4})/
              );
              if (dateMatch) {
                const parsed = new Date(dateMatch[0]);
                if (!isNaN(parsed.getTime())) return this.toStartOfDay(parsed);
              }
              break;
            }
          }
        }
      }

      // fallback: try direct Date parse
      const fallback = new Date(normalized);
      if (!isNaN(fallback.getTime())) return this.toStartOfDay(fallback);
    }

    if (input instanceof Date) return this.toStartOfDay(input);

    return null;
  }

  // initialize the flow
  @post("/workflow-test/initialize")
  async initializeWorkflow(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              bluePrint: {
                type: 'object',
                properties: {
                  nodes: {
                    type: 'array',
                    items: { type: 'object' },
                  },
                },
                required: ['nodes'],
              },
              extractionId: { type: 'string' },
            },
            required: ['bluePrint', 'extractionId'],
            additionalProperties: false,
          },
        },
      },
    })
    requestBody: { bluePrint: any; extractionId: string }
  ): Promise<{ success: boolean; message: string; data?: any[] }> {
    let browser: any;
    let page: any;
    let links: string[] = [];
    let extractedData: any[] = [];

    try {
      const { bluePrint, extractionId } = requestBody;

      if (!bluePrint || typeof bluePrint !== 'object' || !Array.isArray(bluePrint.nodes)) {
        throw new HttpErrors.BadRequest('Blueprint is missing or invalid');
      }

      const nodes = bluePrint.nodes.sort((a: any, b: any) => a.id - b.id);

      for (const node of nodes) {
        try {
          switch (node.type) {
            case "start":
              const init = await this.handleInitializeNode(node, extractionId);
              browser = init.browserContext;
              page = init.page;
              break;

            case "search":
              if (page) {
                await this.handleSearchNode(page, node);
              }
              break;

            case "locate":
              if (node.mode === "list" && page) {
                links = await this.handleJobListNode(page, node);
              }
              if (node.mode === "detail" && browser) {
                extractedData = await this.handleJobDetailNode(browser, links, node, extractionId);
              }
              break;

            case "deliver":
              if (extractedData.length > 0) {
                await this.handleDeliverNode(extractedData, node, extractionId);
              }
              break;

            case "transformation":
              await this.handleTransformationNode(node, extractionId);

            default:
              console.warn(`⚠️ Unknown node type: ${node.type}`);
              await this.testExtractionLogsRepository.create({
                extractionId: extractionId,
                logsDescription: `⚠️ Unknown node type: ${node.type}`,
                logType: 1, // Info
                isActive: true,
              });
          }

          // Log successful node execution
          await this.testExtractionLogsRepository.create({
            extractionId: extractionId,
            logsDescription: `Node "${node.type}" executed successfully`,
            logType: 0, // Info
            isActive: true,
          });

        } catch (nodeError) {
          // Log node-level error
          await this.testExtractionLogsRepository.create({
            extractionId: extractionId,
            logsDescription: `Error executing node "${node.type}": ${nodeError.message}`,
            logType: 1, // Error
            isActive: true,
          });

          console.error(`Error in node ${node.type}:`, nodeError);
        }
      }

      await browser?.close();
      await this.testExtractionLogsRepository.create({
        extractionId: extractionId,
        logsDescription: "Workflow executed successfully",
        logType: 2, // Info
        isActive: true,
      });
      return { success: true, message: "Workflow executed successfully" };

    } catch (error) {
      // Log workflow-level error
      if (requestBody?.extractionId) {
        await this.testExtractionLogsRepository.create({
          extractionId: requestBody.extractionId,
          logsDescription: `Workflow execution failed: ${error.message}`,
          logType: 1, // Error
          isActive: true,
        });
      }

      if (browser) await browser.close();
      throw error; // still throw so frontend can handle
    }
  }

  @post('/log-entries/logs-by-extraction')
  async logsByNode(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              extractionId: { type: 'string' },
              limit: { type: 'number', default: 10 },
              skip: { type: 'number', default: 0 },
            },
            required: ['processInstanceId']
          }
        }
      }
    })
    requestBody: {
      extractionId: string;
      limit?: number;
      skip?: number;
    }
  ): Promise<TestExtractionLogs[]> {
    try {
      const { extractionId, limit = 10, skip = 0 } = requestBody;

      const logs = await this.testExtractionLogsRepository.find({
        where: {
          and: [
            { extractionId },
          ]
        },
        limit,
        skip,
        order: ['createdAt DESC'],
      });

      return logs;
    } catch (error) {
      throw error;
    }
  }

}
