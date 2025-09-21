import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Scheduler,
  Workflow,
} from '../models';
import {SchedulerRepository} from '../repositories';

export class SchedulerWorkflowController {
  constructor(
    @repository(SchedulerRepository)
    public schedulerRepository: SchedulerRepository,
  ) { }

  @get('/schedulers/{id}/workflow', {
    responses: {
      '200': {
        description: 'Workflow belonging to Scheduler',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Workflow),
          },
        },
      },
    },
  })
  async getWorkflow(
    @param.path.string('id') id: typeof Scheduler.prototype.id,
  ): Promise<Workflow> {
    return this.schedulerRepository.workflow(id);
  }
}
