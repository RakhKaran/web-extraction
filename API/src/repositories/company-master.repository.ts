import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {CompanyMaster, CompanyMasterRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class CompanyMasterRepository extends TimeStampRepositoryMixin<
  CompanyMaster,
  typeof CompanyMaster.prototype.id,
  Constructor<
    DefaultCrudRepository<
      CompanyMaster,
      typeof CompanyMaster.prototype.id,
      CompanyMasterRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(CompanyMaster, dataSource);
  }
}
