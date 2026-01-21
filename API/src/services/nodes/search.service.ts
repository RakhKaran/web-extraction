import { inject } from "@loopback/core";
import { ActionsService } from "./actions.service";
import path from "path";
import fs from "fs";

export class Search {
    constructor(
        @inject('services.Action')
        private actionService: ActionsService,
    ) { }

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

    private async captureScreenshot(page: any, name: string) {
        try {
            const dir = path.resolve("./snapshots/search");
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const basePath = `/opt/airflow/logs/screenshots/${process.env.AIRFLOW_CTX_DAG_ID}/${process.env.AIRFLOW_CTX_TASK_ID}`;
            await fs.promises.mkdir(basePath, { recursive: true });

            await page.screenshot({
                path: `${basePath}/${Date.now()}-before-search.png`,
                fullPage: true,
            });
            console.log(`📸 Screenshot saved: ${basePath}`);
        } catch (e) {
            console.warn("⚠️ Failed to capture screenshot", e);
        }
    }

    // search service...
    async search(data: any, previousOutput: any) {
        try {
            if (!data?.selector) return data;

            console.log('search text', data?.data?.searchText);

            await this.captureScreenshot(previousOutput?.page, "before-search");

            const page = previousOutput?.page;
            const searchInput = this.buildSelector(page, data.selector);
            await page.screenshot({ path: "test.png", fullPage: true });

            // 1️⃣ Wait for parent container if provided
            if (data.parentSelector) {
                await page.waitForSelector(data.parentSelector, { timeout: 15000 });
            }

            if (data.actionFlow && data.actionFlow.length > 0) {
                await this.actionService.handleActions(data.actionFlow, page);
            }

            // 2️⃣ Retry logic for dynamic rendering
            let attempt = 0;
            const maxAttempts = 3;
            while (attempt < maxAttempts) {
                try {
                    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
                    await searchInput.click();
                    await searchInput.fill(''); // clear field
                    await searchInput.type(data?.data?.searchText || '', { delay: 100 });
                    break; // success
                } catch (err) {
                    attempt++;
                    console.log(`⚠️ Attempt ${attempt} failed for input, retrying...`);
                    await page.waitForTimeout(1000);
                    if (attempt === maxAttempts) throw err;
                }
            }

            // 3️⃣ Submit the search
            if (data?.submitType === "click" && data?.submitSelector) {
                const submitBtn = this.buildSelector(page, data.submitSelector);
                await submitBtn.click();
            } else {
                await Promise.all([
                    page.waitForLoadState('networkidle'),
                    searchInput.press("Enter"),
                ]);
            }

            await this.captureScreenshot(page, "after-submit");

            // 4️⃣ Wait for results container if specified
            if (data.resultsSelector) {
                const results = this.buildSelector(page, data.resultsSelector);
                await results.first().waitFor({ state: 'visible', timeout: 15000 });
            }

            return {
                success: true,
                nodetype: 'search',
                timestamp: new Date().toISOString(),
                browser: previousOutput.browser,
                browserContext: previousOutput.browserContext,
                page: previousOutput.page
            };

        } catch (error: any) {
            console.error('❌ Search node failed:', error.message);
            return {
                success: false,
                nodetype: 'search',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}
