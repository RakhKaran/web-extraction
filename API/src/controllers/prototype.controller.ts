// About the controller...
// Demonstration of a generic blueprint for scraping.

import { HttpErrors, post } from "@loopback/rest";
import path from "path";
import { chromium } from "playwright";
import fs from 'fs';
import { Context, inject } from "@loopback/core";
import { DefaultCrudRepository } from "@loopback/repository";

export class PrototypeController {
  constructor(
    @inject.context() private ctx: Context,
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
      },
      {
        id: 3,
        nodeName: "JobList",
        type: "locate",
        mode: "list",
        selector: {
          name: ".srp-jobtuple-wrapper .title",
          selectorType: "css",
        },
        fields: {
          link: { selector: ".title", attribute: "href" },
        },
      },
      {
        id: 4,
        nodeName: "JobDetail",
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
        ]
      },
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
          title: "h1.heading_Heading__aomVx heading_Level1__w42c9",
          company: "h4.heading_Heading__aomVx heading_Subhead__jiUbT",
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
          }
        },
        waitToLoadSelectors: [
          "h1.heading_Heading__aomVx heading_Level1__w42c9",
          "h4.heading_Heading__aomVx heading_Subhead__jiUbT",
        ]
      },
    ],
  };

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

  // initialize
  private async handleInitializeNode(node: any) {
    const browser = await chromium.launch({
      headless: false,
      args: ["--disable-blink-features=AutomationControlled", "--start-maximized"]
    });

    let browserContext: import("playwright").BrowserContext;
    let page;

    const session = node?.data?.session;

    if (session?.enabled) {
      const storageStatePath = path.resolve(session.storageStatePath);

      if (session.load && fs.existsSync(storageStatePath)) {
        console.log(`🔑 Using saved session from ${storageStatePath}`);
        browserContext = await browser.newContext({ storageState: storageStatePath });
      } else {
        console.log("⚠️ No saved session, starting fresh.");
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
        console.log("👉 After login, press ENTER in terminal to continue...");

        await new Promise<void>((resolve) => {
          process.stdin.once("data", () => resolve());
        });

        await browserContext.storageState({ path: storageStatePath });
        console.log(`✅ Session saved to ${storageStatePath}`);
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

    const searchInput = this.buildSelector(page, node.selector);
    await searchInput.fill(node?.data?.searchText);
    await searchInput.press("Enter");
    await page.waitForTimeout(4000);
  }

  // listing node
  private async handleJobListNode(page: any, node: any): Promise<string[]> {
    const jobLinks: string[] = [];
    const selectorName = node?.selector?.name;
    if (!selectorName) return jobLinks;

    const jobCards = await page.$$(selectorName);
    for (let card of jobCards) {
      const href = await card.getAttribute("href");
      if (href) jobLinks.push(href);
    }
    return jobLinks;
  }

  // detail data node
  private async handleJobDetailNode(browser: any, jobLinks: string[], node: any) {
    let extractedData: any[] = [];

    for (const [i, link] of jobLinks.entries()) {
      try {
        console.log(`(${i + 1}/${jobLinks.length}) Navigating to: ${link}`);
        const jobPage = await browser.newPage();
        await jobPage.goto(link, { waitUntil: "domcontentloaded" });

        // wait for essential content
        await Promise.all(
          (node?.waitToLoadSelectors ?? []).map((selector: any) =>
            jobPage.waitForSelector(selector, { timeout: 10000 })
          )
        );

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
            record[fieldName] = null;
          }
        }

        extractedData.push(record);
        await jobPage.close();

      } catch (err) {
        console.error(`❌ Failed to scrape ${link}`, err);
      }
    }

    return extractedData;
  }

  // deliver node
  private async handleDeliverNode(data: any[], node: any) {
    if (!data || data.length === 0) {
      console.log('⚠️ No data to deliver');
      return [];
    }

    if (!node.respositoryName) {
      throw new Error(`Deliver node missing "repository" config`);
    }

    // explicitly type cast
    const repo = await this.ctx.get<DefaultCrudRepository<any, any>>(
      `repositories.${node.respositoryName}`,
    );

    const deliveredRecords: any[] = [];
    console.log('data', data);

    for (const record of data) {
      try {
        const payload: any = {};

        // Map fields
        for (const field of node.fields ?? []) {
          const { modelField, mappedField, type } = field;
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

        console.log('payload data', payload);

        // Save using repository
        const created = await repo.create(payload);
        deliveredRecords.push(created);
      } catch (err) {
        console.error(`❌ Failed to deliver record`, err);
      }
    }

    return deliveredRecords;
  }

  // initialize the flow
  @post("/initialize")
  async initializeWorkflow(): Promise<{ success: boolean; message: string; data?: any[] }> {
    let browser: any;
    let page: any;
    let jobLinks: string[] = [];
    let extractedData: any[] = [];

    try {
      // Sort nodes by id to respect blueprint order
      const nodes = this.naukriBluePrint.nodes.sort((a, b) => a.id - b.id);

      for (const node of nodes) {
        switch (node.type) {
          case "start":
            const init = await this.handleInitializeNode(node);
            browser = init.browser;
            page = init.page;
            break;

          case "search":
            if (page) {
              await this.handleSearchNode(page, node);
            }
            break;

          case "locate":
            if (node.mode === "list" && page) {
              jobLinks = await this.handleJobListNode(page, node);
              console.log('jobLinks', jobLinks);
            }
            if (node.mode === "detail" && browser) {
              extractedData = await this.handleJobDetailNode(browser, jobLinks, node);
            }
            break;

          case "deliver":
            if (extractedData.length > 0) {
              await this.handleDeliverNode(extractedData, node);
            }
            break;

          default:
            console.warn(`⚠️ Unknown node type: ${node.type}`);
        }
      }

      // await browser?.close();
      return { success: true, message: "Workflow executed successfully", data: extractedData };

    } catch (error) {
      if (browser) await browser.close();
      throw error;
    }
  }
}
