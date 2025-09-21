import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {Dags, DagsRelations, Scheduler} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {SchedulerRepository} from './scheduler.repository';

export class DagsRepository extends TimeStampRepositoryMixin<
  Dags,
  typeof Dags.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Dags,
      typeof Dags.prototype.id,
      DagsRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly scheduler: BelongsToAccessor<Scheduler, typeof Dags.prototype.id>;

  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource, @repository.getter('SchedulerRepository') protected schedulerRepositoryGetter: Getter<SchedulerRepository>,
  ) {
    super(Dags, dataSource);
    this.scheduler = this.createBelongsToAccessorFor('scheduler', schedulerRepositoryGetter,);
    this.registerInclusionResolver('scheduler', this.scheduler.inclusionResolver);
  }
}
