import {post, requestBody} from '@loopback/rest';
import {Builder, By, until} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

export class ScrapperController {
  constructor() { }

  @post('/scrap-nse')
  async scrapeNSE(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              companyName: {type: 'string'},
            },
            required: ['companyName'],
          },
        },
      },
    })
    data: {companyName: string},
  ): Promise<unknown> {
    const {companyName} = data;

    let driver;
    try {
      const options = new chrome.Options();
      options.addArguments('--start-maximized');

      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

      // Open NSE India
      await driver.get('https://www.nseindia.com/');

      // Wait until search input is available
      const searchBox = await driver.wait(
        until.elementLocated(By.css('input[type="text"]')),
        15000,
      );

      // Type the company name
      await searchBox.sendKeys(companyName);

      const marketStatistics = await driver.findElement(By.css('div.title_text.animate__animated.animate__fadeInDown')).getText();
      const date = await driver.findElement(By.css('p.ms_date')).getText();

      const parentElement = await driver.findElement(By.css('div.ms_indicater'));
      const childElements = await parentElement.findElements(By.css('div.row div.col-xxl-3.col-xl-3.col-lg-3.col-md-3.col-sm-6.col-6'));

      let data = {};
      if (childElements && childElements.length > 0) {
        for (const childElement of childElements) {
          let indicatorDiv = await childElement.findElement(By.css('.ms_indicater_box.blue_box'));
          let keyEl = await indicatorDiv.findElement(By.css('p'));
          let valueEl = await indicatorDiv.findElement(By.css('h3'));

          const keyText = await keyEl.getText();
          const valueText = await valueEl.getText();

          

        }
      }

      // // Wait for autocomplete suggestions to appear
      // const firstOption = await driver.wait(
      //   until.elementLocated(By.css('div.rbt-menu.dropdown-menu.show li a')), // NSE uses this in dropdown
      //   10000,
      // );

      // // Click the first option
      // await firstOption.click();

      // // Optional: wait for navigation to company details page
      // await driver.wait(until.urlContains('/get-quotes/equity'), 15000);

      return {message: `Opened NSE page for ${companyName}`, marketStatistics, date};
    } catch (err) {
      console.error('Scraping error:', err);
      throw err;
    } finally {
      // Keep browser open for debugging
      // await driver.quit();
    }
  }
}
