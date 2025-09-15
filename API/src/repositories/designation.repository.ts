import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {Designation, DesignationRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class DesignationRepository extends TimeStampRepositoryMixin<
  Designation,
  typeof Designation.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Designation,
      typeof Designation.prototype.id,
      DesignationRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(Designation, dataSource);
  }
}
