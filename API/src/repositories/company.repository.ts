import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {Company, CompanyRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';


export class CompanyRepository extends TimeStampRepositoryMixin<
  Company,
  typeof Company.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Company,
      typeof Company.prototype.id,
      CompanyRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(Company, dataSource);
  }
}
