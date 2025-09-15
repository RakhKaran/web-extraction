import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {Scheduler, SchedulerRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class SchedulerRepository extends TimeStampRepositoryMixin<
  Scheduler,
  typeof Scheduler.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Scheduler,
      typeof Scheduler.prototype.id,
      SchedulerRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(Scheduler, dataSource);
  }
}
