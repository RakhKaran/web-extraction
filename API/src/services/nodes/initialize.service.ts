import { chromium } from "playwright";
import path from "path";
import fs from 'fs';

export class Initialize {
    constructor() { }

    async intializeNode(data: any, previousOutput: {}) {
        try {
            const browser = await chromium.launch({
                headless: true,
                args: [
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-infobars"
                ]
            });

            let browserContext: import("playwright").BrowserContext;
            let page;

            const session = data?.data?.session;

            if (session?.enabled) {
                const storageStatePath = path.resolve(session.storageStatePath);

                if (session.load && fs.existsSync(storageStatePath)) {
                    console.log(`🔑 Using saved session from ${storageStatePath}`);
                    browserContext = await browser.newContext({ storageState: storageStatePath, viewport: { width: 1920, height: 1080 } });
                } else {
                    console.log("⚠️ No saved session, starting fresh.");
                    browserContext = await browser.newContext({
                        viewport: { width: 1920, height: 1080 },
                        userAgent:
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
                    });
                }

                // Stealth script
                await browserContext.addInitScript(`
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
`);

                page = await browserContext.newPage();
                await page.goto(data.data?.url, { waitUntil: "domcontentloaded" });

                if (session.save && !fs.existsSync(storageStatePath)) {
                    console.log("💡 Please log in manually in the opened browser.");
                    console.log("👉 After login, press ENTER in terminal to continue...");

                    await new Promise<void>((resolve) => {
                        process.stdin.once("data", () => resolve());
                    });

                    await browserContext.storageState({ path: storageStatePath });
                    console.log(`✅ Session saved to ${storageStatePath}`);
                }

            } else {
                browserContext = await browser.newContext({
                    viewport: { width: 1920, height: 1080 },
                    userAgent:
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
                });

await browserContext.addInitScript(`
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
`);

                page = await browserContext.newPage();
                await page.goto(data.data?.url, { waitUntil: "domcontentloaded" });
            }

            return {
                success: true,
                nodetype: 'start',
                timestamp: new Date().toISOString(),
                browser,
                browserContext,
                page
            };

        } catch (error) {
            console.log('error in initialize node', error);
        }
    }
}
