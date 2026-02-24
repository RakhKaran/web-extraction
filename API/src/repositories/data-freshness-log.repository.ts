import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {DataFreshnessLog, DataFreshnessLogRelations} from '../models';

export class DataFreshnessLogRepository extends DefaultCrudRepository<
  DataFreshnessLog,
  typeof DataFreshnessLog.prototype.id,
  DataFreshnessLogRelations
> {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(DataFreshnessLog, dataSource);
  }
}
