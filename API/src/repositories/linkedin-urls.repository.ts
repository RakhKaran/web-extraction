import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {LinkedInUrls, LinkedInUrlsRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class LinkedInUrlsRepository extends TimeStampRepositoryMixin<
  LinkedInUrls,
  typeof LinkedInUrls.prototype.id,
  Constructor<
    DefaultCrudRepository<
      LinkedInUrls,
      typeof LinkedInUrls.prototype.id,
      LinkedInUrlsRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(LinkedInUrls, dataSource);
  }
}
