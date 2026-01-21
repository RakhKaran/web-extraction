import { inject } from "@loopback/core";
import { ActionsService } from "./actions.service";

export class Locate {
    constructor(
        @inject('services.Action')
        private actionService: ActionsService,
    ) { }

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

    // locate node
    async locateNode(data: any, previousOutput: any) {
        try {
            if (data.mode === 'list') {
                const links = await this.handleListNode(previousOutput?.page, data);
                return {
                    success: true,
                    nodetype: 'locate',
                    mode: 'list',
                    timestamp: new Date().toISOString(),
                    browser: previousOutput.browser,
                    browserContext: previousOutput.browserContext,
                    page: previousOutput.page,
                    links: links
                }
            }

            if (data.mode === 'detail') {
                const extractedCards = await this.handleDetailNode(previousOutput?.browser, previousOutput?.links, data);
                return {
                    success: true,
                    nodetype: 'loacte',
                    mode: 'detail',
                    timestamp: new Date().toISOString(),
                    browser: previousOutput.browser,
                    browserContext: previousOutput.browserContext,
                    page: previousOutput.page,
                    extractedCards: extractedCards
                }
            }
        } catch (error) {
            console.log('error in locate code', error);
        }
    }

    // listing node
    private async handleListNode(page: any, node: any): Promise<string[]> {
        const jobLinks: string[] = [];

        // Run actions (search / filters etc.)
        if (node.actionFlow?.length) {
            await this.actionService.handleActions(node.actionFlow, page, true);
        }

        const selectorName = node?.selector?.name;
        if (!selectorName) return jobLinks;

        const pagination = node?.paginationFields;
        const nextPageSelector = pagination?.nextPageSelectorName;
        const totalPages = pagination?.numberOfPages || 1;

        for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
            console.log(`🔹 Scraping page ${pageIndex + 1}`);

            await page.waitForSelector(selectorName, { timeout: 15000 });

            const jobCards = await page.$$(selectorName);
            console.log(`Found ${jobCards.length} job cards`);

            for (let card of jobCards.slice(0, 20)) {
                const href = await card.getAttribute("href");
                if (href) jobLinks.push(href);
            }

            if (!pagination || !nextPageSelector || pageIndex === totalPages - 1) {
                console.log("✅ No more pagination or last page reached.");
                break;
            }

            let nextBtn = page.locator(nextPageSelector);

            // 👇 Scroll if pagination not visible
            if (await nextBtn.count() === 0) {
                console.log("🔽 Pagination not visible, scrolling...");
                for (let i = 0; i < 5; i++) {
                    await page.mouse.wheel(0, 800);
                    await page.waitForTimeout(700);
                    if (await nextBtn.count() > 0) break;
                }
            }

            if (await nextBtn.count() === 0) {
                console.log("🚫 Next button not found after scrolling.");
                break;
            }

            const isDisabled = await nextBtn.first().evaluate((btn: any) =>
                btn.disabled || btn.getAttribute("disabled") !== null
            );

            if (isDisabled) {
                console.log("🚫 Next button disabled.");
                break;
            }

            console.log("➡️ Clicking next page...");
            await nextBtn.first().scrollIntoViewIfNeeded();
            await nextBtn.first().click();

            await page.waitForLoadState("domcontentloaded");
            await page.waitForTimeout(2000);
        }

        console.log("✅ Final job links:", jobLinks);
        return jobLinks;
    }

    // detail data node
    private async handleDetailNode(browser: any, links: string[], node: any) {
        let extractedData: any[] = [];

        for (const [i, link] of links.entries()) {
            try {
                console.log(`(${i + 1}/${links.length}) Navigating to: ${link}`);
                const page = await browser.newPage();
                await page.goto(link, { waitUntil: "domcontentloaded" });

                // wait for essential content
                await Promise.all(
                    (node?.waitToLoadSelectors ?? []).map((selector: any) =>
                        page.waitForSelector(selector, { timeout: 10000 })
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
                            el = await page.$(fieldConfig);
                            record[fieldName] = el
                                ? await this.extractField(el, { type: "text" })
                                : null;

                        } else if (typeof fieldConfig === "object" && "selector" in fieldConfig && fieldConfig.selector) {
                            if (fieldConfig.type === "list") {
                                const listEls = await page.$$(fieldConfig.selector);
                                record[fieldName] = [];
                                for (const listEl of listEls) {
                                    record[fieldName].push(await this.extractField(listEl, fieldConfig.item));
                                }
                            } else {
                                el = await page.$(fieldConfig.selector);
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
                await page.close();

            } catch (err) {
                console.error(`❌ Failed to scrape ${link}`, err);
            }
        }

        return extractedData;
    }
}