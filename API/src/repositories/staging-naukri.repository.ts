import { Constructor, inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { WebScrapperDataSource } from '../datasources';
import { StagingNaukri, StagingNaukriRelations } from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class StagingNaukriRepository extends TimeStampRepositoryMixin<
  StagingNaukri,
  typeof StagingNaukri.prototype.id,
  Constructor<
    DefaultCrudRepository<
      StagingNaukri,
      typeof StagingNaukri.prototype.id,
      StagingNaukriRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(StagingNaukri, dataSource);
  }
}
