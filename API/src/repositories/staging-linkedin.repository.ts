import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {StagingLinkedin, StagingLinkedinRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class StagingLinkedinRepository extends TimeStampRepositoryMixin<
  StagingLinkedin,
  typeof StagingLinkedin.prototype.id,
  Constructor<
    DefaultCrudRepository<
      StagingLinkedin,
      typeof StagingLinkedin.prototype.id,
      StagingLinkedinRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(StagingLinkedin, dataSource);
  }
}
