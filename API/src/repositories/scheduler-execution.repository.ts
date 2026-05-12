import {Constructor, Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {
  Scheduler,
  SchedulerExecution,
  SchedulerExecutionRelations,
} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {SchedulerRepository} from './scheduler.repository';

export class SchedulerExecutionRepository extends TimeStampRepositoryMixin<
  SchedulerExecution,
  typeof SchedulerExecution.prototype.id,
  Constructor<
    DefaultCrudRepository<
      SchedulerExecution,
      typeof SchedulerExecution.prototype.id,
      SchedulerExecutionRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly scheduler: BelongsToAccessor<
    Scheduler,
    typeof SchedulerExecution.prototype.id
  >;

  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
    @repository.getter('SchedulerRepository')
    protected schedulerRepositoryGetter: Getter<SchedulerRepository>,
  ) {
    super(SchedulerExecution, dataSource);
    this.scheduler = this.createBelongsToAccessorFor(
      'scheduler',
      schedulerRepositoryGetter,
    );
    this.registerInclusionResolver('scheduler', this.scheduler.inclusionResolver);
  }
}
