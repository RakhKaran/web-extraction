import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'web_scrapper',
  connector: 'mongodb',
  url: 'mongodb+srv://karanrakh19:Dxafj3dUABszmb83@todolist.ui3hm4s.mongodb.net/webScrapper?retryWrites=true&w=majority&appName=todolist',
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

@lifeCycleObserver('datasource')
export class WebScrapperDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'web_scrapper';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.web_scrapper', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

