import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {StagingLinkedInUrls, StagingLinkedInUrlsRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class StagingLinkedInUrlsRepository extends TimeStampRepositoryMixin<
  StagingLinkedInUrls,
  typeof StagingLinkedInUrls.prototype.id,
  Constructor<
    DefaultCrudRepository<
      StagingLinkedInUrls,
      typeof StagingLinkedInUrls.prototype.id,
      StagingLinkedInUrlsRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(StagingLinkedInUrls, dataSource);
  }
}
