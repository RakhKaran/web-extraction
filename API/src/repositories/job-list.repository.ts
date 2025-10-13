import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {JobList, JobListRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class JobListRepository extends TimeStampRepositoryMixin<
  JobList,
  typeof JobList.prototype.id,
  Constructor<
    DefaultCrudRepository<
      JobList,
      typeof JobList.prototype.id,
      JobListRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(JobList, dataSource);
  }
}
