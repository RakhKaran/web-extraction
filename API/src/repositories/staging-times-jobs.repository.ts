import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {StagingTimesJobs, StagingTimesJobsRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class StagingTimesJobsRepository extends TimeStampRepositoryMixin<
  StagingTimesJobs,
  typeof StagingTimesJobs.prototype.id,
  Constructor<
    DefaultCrudRepository<
      StagingTimesJobs,
      typeof StagingTimesJobs.prototype.id,
      StagingTimesJobsRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(StagingTimesJobs, dataSource);
  }
}
