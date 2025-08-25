import {repository} from '@loopback/repository';
// import {StagingTimesJobs} from '../models';
import {StagingTimesJobsRepository} from '../repositories';
import {injectable} from '@loopback/core';
import {Builder} from 'selenium-webdriver';

@injectable()
export class TimesJobsService {
  constructor(
    @repository(StagingTimesJobsRepository)
    public stagingTimesJobsRepository: StagingTimesJobsRepository,
  ) { }

  async runTimesJobsScrapper() {
    try {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      const driver = await new Builder().forBrowser('chrome').build();

      const jobs = [];

      const searchUrl = `https://m.timesjobs.com/mobile/jobs-search-result.html?txtKeywords=${encodeURIComponent('Web-developer')}%2C&cboWorkExp1=1`;
      console.log(`🔍 Navigating to: ${searchUrl}`);
      await driver.get(searchUrl);

      await delay(3000);


    } catch (error) {
      console.error('Error while running times job scrapper: ', error.message);
    }
  }
}
