import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {CompanyList, CompanyListRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';


export class CompanyListRepository extends TimeStampRepositoryMixin<
  CompanyList,
  typeof CompanyList.prototype.id,
  Constructor<
    DefaultCrudRepository<
      CompanyList,
      typeof CompanyList.prototype.id,
      CompanyListRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(CompanyList, dataSource);
  }
}
