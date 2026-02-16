import {Constructor, inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {StagingMonster, StagingMonsterRelations} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';

export class StagingMonsterRepository extends TimeStampRepositoryMixin<
  StagingMonster,
  typeof StagingMonster.prototype.id,
  Constructor<
    DefaultCrudRepository<
      StagingMonster,
      typeof StagingMonster.prototype.id,
      StagingMonsterRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
  ) {
    super(StagingMonster, dataSource);
  }
}
