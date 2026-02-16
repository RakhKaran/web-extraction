import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {StagingGlassdoor, StagingGlassdoorRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class StagingGlassdoorRepository extends TimeStampRepositoryMixin<
  StagingGlassdoor,
  typeof StagingGlassdoor.prototype.id,
  Constructor<
    DefaultCrudRepository<
      StagingGlassdoor,
      typeof StagingGlassdoor.prototype.id,
      StagingGlassdoorRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(StagingGlassdoor, dataSource);
  }
}
