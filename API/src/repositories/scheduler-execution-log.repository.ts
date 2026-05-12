import {Constructor, Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {
  SchedulerExecution,
  SchedulerExecutionLog,
  SchedulerExecutionLogRelations,
} from '../models';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {SchedulerExecutionRepository} from './scheduler-execution.repository';

export class SchedulerExecutionLogRepository extends TimeStampRepositoryMixin<
  SchedulerExecutionLog,
  typeof SchedulerExecutionLog.prototype.id,
  Constructor<
    DefaultCrudRepository<
      SchedulerExecutionLog,
      typeof SchedulerExecutionLog.prototype.id,
      SchedulerExecutionLogRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly execution: BelongsToAccessor<
    SchedulerExecution,
    typeof SchedulerExecutionLog.prototype.id
  >;

  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource,
    @repository.getter('SchedulerExecutionRepository')
    protected schedulerExecutionRepositoryGetter: Getter<SchedulerExecutionRepository>,
  ) {
    super(SchedulerExecutionLog, dataSource);
    this.execution = this.createBelongsToAccessorFor(
      'execution',
      schedulerExecutionRepositoryGetter,
    );
    this.registerInclusionResolver('execution', this.execution.inclusionResolver);
  }
}
