import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Dags,
  Scheduler,
} from '../models';
import {DagsRepository} from '../repositories';

export class DagsSchedulerController {
  constructor(
    @repository(DagsRepository)
    public dagsRepository: DagsRepository,
  ) { }

  @get('/dags/{id}/scheduler', {
    responses: {
      '200': {
        description: 'Scheduler belonging to Dags',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Scheduler),
          },
        },
      },
    },
  })
  async getScheduler(
    @param.path.string('id') id: typeof Dags.prototype.id,
  ): Promise<Scheduler> {
    return this.dagsRepository.scheduler(id);
  }
}
