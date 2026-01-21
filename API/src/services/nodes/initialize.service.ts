// initialize-node-with-proxy.ts
import { chromium } from "playwright";
import path from "path";
import fs from "fs";

export class Initialize {
    constructor() { }

    static USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    ];

    async intializeNode(data: any = {}, previousOutput = {}) {
        const MAX_RETRIES = 3;

        const PROXIES =
            Array.isArray(data?.data?.proxies) && data.data.proxies.length
                ? data.data.proxies
                : [];

        let proxyIndex = 0;
        const badProxies = new Set<number>();

        const pickUserAgent = () =>
            Initialize.USER_AGENTS[
            Math.floor(Math.random() * Initialize.USER_AGENTS.length)
            ];

        const sleep = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        const looksBlocked = async (page: any, resp: any) => {
            try {
                if (!resp) return true;
                if (resp.status() >= 400) return true;
                const html = (await page.content()).toLowerCase();
                return (
                    html.includes("access denied") ||
                    html.includes("cloudflare") ||
                    html.includes("captcha")
                );
            } catch {
                return true;
            }
        };

        const getNextProxy = () => {
            if (!PROXIES.length) return null;
            for (let i = 0; i < PROXIES.length; i++) {
                const idx = proxyIndex % PROXIES.length;
                proxyIndex++;
                if (!badProxies.has(idx)) {
                    return { proxy: PROXIES[idx], index: idx };
                }
            }
            return null;
        };

        const launchBrowser = async (proxyConfig?: any) => {
            return chromium.launch({
                headless: false, // 🔥 IMPORTANT: Xvfb handles display
                slowMo: 40,
                args: [
                    "--disable-blink-features=AutomationControlled",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-infobars",
                    "--start-maximized",
                ],
            });
        };

        const tryLaunch = async (url: string, attempt = 0): Promise<any> => {
            let browser: any;
            let context: any;
            let page: any;
            let usedProxy: string | null = null;

            const proxyObj = getNextProxy();

            try {
                browser = await launchBrowser();

                const ua = pickUserAgent();
                const contextOptions: any = {
                    viewport: { width: 1366, height: 768 },
                    userAgent: ua,
                };

                if (proxyObj) {
                    contextOptions.proxy = {
                        server: proxyObj.proxy.server,
                        username: proxyObj.proxy.username,
                        password: proxyObj.proxy.password,
                    };
                    usedProxy = proxyObj.proxy.server;
                }

                context = await browser.newContext(contextOptions);

                await context.addInitScript(`
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  window.chrome = window.chrome || { runtime: {} };
`);

                page = await context.newPage();
                await page.setExtraHTTPHeaders({
                    "Accept-Language": "en-IN,en;q=0.9",
                });

                await sleep(500 + Math.random() * 1000);

                const resp = await page.goto(url, {
                    waitUntil: "domcontentloaded",
                    timeout: 120000,
                });

                if (proxyObj && (await looksBlocked(page, resp))) {
                    badProxies.add(proxyObj.index);
                    throw new Error(`Proxy blocked: ${usedProxy}`);
                }

                return {
                    success: true,
                    nodetype: "start",
                    timestamp: new Date().toISOString(),
                    browser,
                    browserContext: context,
                    page,
                    usedProxy: usedProxy || "LOCAL_IP",
                };
            } catch (err: any) {
                try {
                    if (page && !page.isClosed()) await page.close();
                    if (context) await context.close();
                    if (browser) await browser.close();
                } catch { }

                if (proxyObj) badProxies.add(proxyObj.index);

                if (attempt + 1 < MAX_RETRIES) {
                    await sleep(1500 + Math.random() * 2000);
                    return tryLaunch(url, attempt + 1);
                }

                // 🔥 FINAL FALLBACK: LOCAL IP
                if (PROXIES.length && badProxies.size >= PROXIES.length) {
                    console.log("⚠️ All proxies failed, retrying with LOCAL IP");
                    PROXIES.length = 0;
                    return tryLaunch(url, attempt + 1);
                }

                throw err;
            }
        };

        try {
            const targetUrl = data?.data?.url;
            if (!targetUrl) throw new Error("No URL provided");

            return await tryLaunch(targetUrl);
        } catch (error: any) {
            console.log("❌ error in initialize node", error);
            return { success: false, error: error.message || String(error) };
        }
    }
}
