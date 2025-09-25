import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {TestExtractionLogs, TestExtractionLogsRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class TestExtractionLogsRepository extends TimeStampRepositoryMixin<
  TestExtractionLogs,
  typeof TestExtractionLogs.prototype.id,
  Constructor<
    DefaultCrudRepository<
      TestExtractionLogs,
      typeof TestExtractionLogs.prototype.id,
      TestExtractionLogsRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(TestExtractionLogs, dataSource);
  }
}
