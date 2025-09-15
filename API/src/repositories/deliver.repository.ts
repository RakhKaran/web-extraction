import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {Deliver, DeliverRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class DeliverRepository extends TimeStampRepositoryMixin<
  Deliver,
  typeof Deliver.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Deliver,
      typeof Deliver.prototype.id,
      DeliverRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(Deliver, dataSource);
  }
}
