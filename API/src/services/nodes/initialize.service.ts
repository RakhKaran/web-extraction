// initialize-node-with-proxy.js
import { chromium } from "playwright";
import path from "path";
import fs from "fs";

export class Initialize {
    constructor() { }

    // simple UA list — expand this for production
    static USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    ];

    async intializeNode(data: any = {}, previousOutput = {}) {
        const MAX_RETRIES = 3; // per attempt
        // Pull proxies from incoming data, or use a placeholder
        const PROXIES = (data?.data?.proxies && Array.isArray(data.data.proxies) && data.data.proxies.length)
            ? data.data.proxies
            : [
                { server: "http://171.247.184.97:8080" },
                { server: "http://157.250.203.202:8080" },
            ];

        let proxyIndex = 0;
        const badProxies = new Set();

        const getNextProxy = () => {
            const total = PROXIES.length;
            if (total === 0) return null;
            let attempts = 0;
            while (attempts < total) {
                const idx = proxyIndex % total;
                proxyIndex += 1;
                attempts += 1;
                if (!badProxies.has(idx)) {
                    return { proxy: PROXIES[idx], index: idx };
                }
            }
            return null; // all bad
        };

        const sleep = (ms: any) => new Promise((r) => setTimeout(r, ms));

        // small helper to detect blocking content
        const looksBlocked = async (page: any, resp: any) => {
            try {
                if (!resp) return true;
                const status = resp.status();
                if (status >= 400) return true;
                const body = await page.content();
                const lower = body.toLowerCase();
                if (lower.includes("access denied") || lower.includes("cloudflare") || lower.includes("captcha")) return true;
                return false;
            } catch (e) {
                return true;
            }
        };

        // choose a random UA
        const pickUserAgent = () => {
            return Initialize.USER_AGENTS[Math.floor(Math.random() * Initialize.USER_AGENTS.length)];
        };

        // Attempt to create context + open page under a proxy, with retries
        const tryWithProxy: any = async (url: string, attempt = 0) => {
            const pObj = getNextProxy();
            if (!pObj) throw new Error("No proxies available (all marked bad)");
            const { proxy, index } = pObj;

            // Launch browser; for speed you can launch once and reuse, but for isolation this is ok
            const browser = await chromium.launch({
                headless: false,
                args: [
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-infobars"
                ]
            });

            let browserContext: any;
            let page;
            try {
                const ua = pickUserAgent();
                // Build proxy config in Playwright format
                const proxyConfig: any = {
                    server: proxy.server,
                };
                if (proxy.username) proxyConfig.username = proxy.username;
                if (proxy.password) proxyConfig.password = proxy.password;

                browserContext = await browser.newContext({
                    proxy: proxyConfig,
                    viewport: { width: 1920, height: 1080 },
                    userAgent: ua
                });

                // Stealth / navigator patches
                await browserContext.addInitScript(() => {
                    `
          Object.defineProperty(navigator, "webdriver", { get: () => false });
          Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
          Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
          // minimal window.chrome stub
          window.chrome = window.chrome || { runtime: {} };`
                });

                page = await browserContext.newPage();

                // Optional headers to look more real
                await page.setExtraHTTPHeaders({
                    "Accept-Language": "en-IN,en;q=0.9"
                });

                // random wait before navigation
                await sleep(300 + Math.floor(Math.random() * 800));

                const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });

                // detect block
                if (await looksBlocked(page, resp)) {
                    // mark proxy bad and throw so caller retries
                    badProxies.add(index);
                    throw new Error(`Proxy ${proxy.server} appears blocked (status ${resp ? resp.status() : "no-response"})`);
                }

                // If a session is requested, handle storage state; reuse existing logic
                const session = data?.data?.session;
                if (session?.enabled) {
                    const storageStatePath = path.resolve(session.storageStatePath || `./storage-state.json`);
                    if (session.load && fs.existsSync(storageStatePath)) {
                        // close current context and recreate from storage and proxy (optional)
                        await browserContext.close();
                        browserContext = await browser.newContext({
                            proxy: proxyConfig,
                            storageState: storageStatePath,
                            viewport: { width: 1920, height: 1080 },
                            userAgent: ua
                        });
                        await browserContext.addInitScript(() => {
                            `
              Object.defineProperty(navigator, "webdriver", { get: () => false });
              Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
              Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
              window.chrome = window.chrome || { runtime: {} };`
                        });
                        page = await browserContext.newPage();
                        await page.goto(url, { waitUntil: "domcontentloaded" });
                        await page.screenshot({
                            path: `./snapshots/page-${Date.now()}.png`,
                            fullPage: true // capture the entire scrollable page
                        });
                        console.log("✅ Page snapshot saved");
                    } else if (session.save) {
                        console.log("⚠️ No saved session; you can perform manual login to save session for this proxy.");
                        // keep the current context to allow manual login if desired
                    }
                }

                // success -> return browser handles (caller responsible to close later)
                return {
                    success: true,
                    nodetype: "start",
                    timestamp: new Date().toISOString(),
                    browser,
                    browserContext,
                    page,
                    usedProxy: proxy.server
                };
            } catch (err) {
                // cleanup and decide to retry
                try {
                    if (page && !page.isClosed()) await page.close().catch(() => { });
                    if (browserContext && !browserContext.isClosed()) await browserContext.close().catch(() => { });
                    await browser.close().catch(() => { });
                } catch (e) { }

                // mark proxy bad (if not already)
                if (typeof index !== "undefined") badProxies.add(index);

                if (attempt + 1 < MAX_RETRIES) {
                    // small backoff then retry with next proxy
                    await sleep(1000 + Math.random() * 2000);
                    return tryWithProxy(url, attempt + 1);
                }

                throw new Error(`All retries failed. Last error: ${err.message || err}`);
            }
        };

        // Main flow: try to initialize using url supplied in data
        try {
            const targetUrl = data?.data?.url;
            if (!targetUrl) throw new Error("No URL provided in data.data.url");

            const result = await tryWithProxy(targetUrl);
            // result contains browser, browserContext, page (open)
            return {
                success: true,
                nodetype: "start",
                timestamp: new Date().toISOString(),
                browser: result.browser,
                browserContext: result.browserContext,
                page: result.page,
                usedProxy: result.usedProxy
            };
        } catch (error) {
            console.log("error in initialize node", error);
            return { success: false, error: error.message || String(error) };
        }
    }
}
