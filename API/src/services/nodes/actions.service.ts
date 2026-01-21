export class ActionsService {
    constructor() { }
    // handleActions (generic, on-demand scroll, retry-safe)
    async handleActions(actions: any[], page: any, usedScroll = false) {
        for (const action of actions) {
            const {
                selector,
                action: actionType,
                timeout = 20000,
                retries = 3,
                waitAfter = 500,
            } = action;

            const scrollStep = 600;
            const maxScrolls = 10;

            console.log('scroll', usedScroll);
            console.log(`⚙️ Performing action: ${actionType} on ${selector}`);

            let attempt = 0;
            let success = false;

            while (attempt < retries && !success) {
                try {
                    attempt++;

                    const locator = page.locator(selector);

                    console.log('locator', locator);

                    // ---------- STEP 1: Try WITHOUT scroll ----------
                    if (await locator.count() > 0) {
                        await locator.first().scrollIntoViewIfNeeded();
                        await locator.first().waitFor({ state: "visible", timeout });
                        await this.performAction(locator.first(), actionType, timeout);

                        success = true;
                        break;
                    }

                    // ---------- STEP 2: Scroll ONLY if enabled ----------
                    if (usedScroll) {
                        console.log(`🔽 Element not found, scrolling...`);

                        for (let i = 0; i < maxScrolls; i++) {
                            await page.mouse.wheel(0, scrollStep);
                            await page.waitForTimeout(2000);

                            if (await locator.count() > 0) {
                                await locator.first().scrollIntoViewIfNeeded();
                                await locator.first().waitFor({ state: "visible", timeout });
                                await this.performAction(locator.first(), actionType, timeout);

                                success = true;
                                break;
                            }
                        }

                        if (!success) {
                            console.log(`Element not found after scrolling`);
                        }
                    } else {
                        console.log(`Element not found (scroll disabled)`);
                    }

                    if (waitAfter) {
                        await page.waitForTimeout(waitAfter);
                    }

                    console.log(`✅ Action succeeded: ${actionType} on ${selector}`);

                } catch (error: any) {
                    console.error(
                        `❌ Action failed (attempt ${attempt}/${retries}): ${error.message}`
                    );

                    if (attempt >= retries) {
                        return false;
                    }

                    await page.waitForTimeout(1000);
                }
            }
        }
    }

    // Helper: keep actions clean & extensible
    private async performAction(
        locator: any,
        actionType: string,
        timeout: number
    ) {
        switch (actionType) {
            case "click":
                await locator.click({ timeout });
                break;

            case "hover":
                await locator.hover({ timeout });
                break;

            case "focus":
                await locator.focus();
                break;

            default:
                throw new Error(`Unknown action type: ${actionType}`);
        }
    }
}