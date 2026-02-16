import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {StagingTimesjob, StagingTimesjobRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class StagingTimesjobRepository extends TimeStampRepositoryMixin<
  StagingTimesjob,
  typeof StagingTimesjob.prototype.id,
  Constructor<
    DefaultCrudRepository<
      StagingTimesjob,
      typeof StagingTimesjob.prototype.id,
      StagingTimesjobRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(StagingTimesjob, dataSource);
  }
}
