import {Constructor, inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {WebScrapperDataSource} from '../datasources';
import {Scheduler, SchedulerRelations, Workflow} from '../models';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {WorkflowRepository} from './workflow.repository';

export class SchedulerRepository extends TimeStampRepositoryMixin<
  Scheduler,
  typeof Scheduler.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Scheduler,
      typeof Scheduler.prototype.id,
      SchedulerRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly workflow: BelongsToAccessor<Workflow, typeof Scheduler.prototype.id>;

  constructor(
    @inject('datasources.web_scrapper') dataSource: WebScrapperDataSource, @repository.getter('WorkflowRepository') protected workflowRepositoryGetter: Getter<WorkflowRepository>,
  ) {
    super(Scheduler, dataSource);
    this.workflow = this.createBelongsToAccessorFor('workflow', workflowRepositoryGetter,);
    this.registerInclusionResolver('workflow', this.workflow.inclusionResolver);
  }
}
