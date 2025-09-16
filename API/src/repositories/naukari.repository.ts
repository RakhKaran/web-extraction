import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {Naukari, NaukariRelations} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';

export class NaukariRepository extends TimeStampRepositoryMixin<
  Naukari,
  typeof Naukari.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Naukari,
      typeof Naukari.prototype.id,
      NaukariRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(Naukari, dataSource);
  }
}
