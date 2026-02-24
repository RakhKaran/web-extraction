import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {DataFreshnessConfig, DataFreshnessConfigRelations} from '../models';

export class DataFreshnessConfigRepository extends DefaultCrudRepository<
  DataFreshnessConfig,
  typeof DataFreshnessConfig.prototype.id,
  DataFreshnessConfigRelations
> {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(DataFreshnessConfig, dataSource);
  }
}
