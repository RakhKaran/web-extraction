import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {StagingIndeed, StagingIndeedRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class StagingIndeedRepository extends TimeStampRepositoryMixin<
  StagingIndeed,
  typeof StagingIndeed.prototype.id,
  Constructor<
    DefaultCrudRepository<
      StagingIndeed,
      typeof StagingIndeed.prototype.id,
      StagingIndeedRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(StagingIndeed, dataSource);
  }
}
