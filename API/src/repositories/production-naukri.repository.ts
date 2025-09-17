import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {ProductionNaukri, ProductionNaukriRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class ProductionNaukriRepository extends TimeStampRepositoryMixin<
  ProductionNaukri,
  typeof ProductionNaukri.prototype.id,
  Constructor<
    DefaultCrudRepository<
      ProductionNaukri,
      typeof ProductionNaukri.prototype.id,
      ProductionNaukriRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(ProductionNaukri, dataSource);
  }
}
