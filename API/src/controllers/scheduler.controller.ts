import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Scheduler} from '../models';
import {SchedulerRepository} from '../repositories';

export class SchedulerController {
  constructor(
    @repository(SchedulerRepository)
    public schedulerRepository : SchedulerRepository,
  ) {}

  @post('/schedulers')
  @response(200, {
    description: 'Scheduler model instance',
    content: {'application/json': {schema: getModelSchemaRef(Scheduler)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Scheduler, {
            title: 'NewScheduler',
            exclude: ['id'],
          }),
        },
      },
    })
    scheduler: Omit<Scheduler, 'id'>,
  ): Promise<Scheduler> {
    return this.schedulerRepository.create(scheduler);
  }

  @get('/schedulers/count')
  @response(200, {
    description: 'Scheduler model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Scheduler) where?: Where<Scheduler>,
  ): Promise<Count> {
    return this.schedulerRepository.count(where);
  }

  @get('/schedulers')
  @response(200, {
    description: 'Array of Scheduler model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Scheduler, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Scheduler) filter?: Filter<Scheduler>,
  ): Promise<Scheduler[]> {
    return this.schedulerRepository.find(filter);
  }

  @patch('/schedulers')
  @response(200, {
    description: 'Scheduler PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Scheduler, {partial: true}),
        },
      },
    })
    scheduler: Scheduler,
    @param.where(Scheduler) where?: Where<Scheduler>,
  ): Promise<Count> {
    return this.schedulerRepository.updateAll(scheduler, where);
  }

  @get('/schedulers/{id}')
  @response(200, {
    description: 'Scheduler model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Scheduler, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Scheduler, {exclude: 'where'}) filter?: FilterExcludingWhere<Scheduler>
  ): Promise<Scheduler> {
    return this.schedulerRepository.findById(id, filter);
  }

  @patch('/schedulers/{id}')
  @response(204, {
    description: 'Scheduler PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Scheduler, {partial: true}),
        },
      },
    })
    scheduler: Scheduler,
  ): Promise<void> {
    await this.schedulerRepository.updateById(id, scheduler);
  }

  @put('/schedulers/{id}')
  @response(204, {
    description: 'Scheduler PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() scheduler: Scheduler,
  ): Promise<void> {
    await this.schedulerRepository.replaceById(id, scheduler);
  }

  @del('/schedulers/{id}')
  @response(204, {
    description: 'Scheduler DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.schedulerRepository.deleteById(id);
  }
}
