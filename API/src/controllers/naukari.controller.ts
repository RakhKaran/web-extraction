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
import {Naukari} from '../models';
import {NaukariRepository} from '../repositories';

export class NaukariController {
  constructor(
    @repository(NaukariRepository)
    public naukariRepository : NaukariRepository,
  ) {}

  @post('/naukaris')
  @response(200, {
    description: 'Naukari model instance',
    content: {'application/json': {schema: getModelSchemaRef(Naukari)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Naukari, {
            title: 'NewNaukari',
            exclude: ['id'],
          }),
        },
      },
    })
    naukari: Omit<Naukari, 'id'>,
  ): Promise<Naukari> {
    return this.naukariRepository.create(naukari);
  }

  @get('/naukaris/count')
  @response(200, {
    description: 'Naukari model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Naukari) where?: Where<Naukari>,
  ): Promise<Count> {
    return this.naukariRepository.count(where);
  }

  @get('/naukaris')
  @response(200, {
    description: 'Array of Naukari model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Naukari, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Naukari) filter?: Filter<Naukari>,
  ): Promise<Naukari[]> {
    return this.naukariRepository.find(filter);
  }

  @patch('/naukaris')
  @response(200, {
    description: 'Naukari PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Naukari, {partial: true}),
        },
      },
    })
    naukari: Naukari,
    @param.where(Naukari) where?: Where<Naukari>,
  ): Promise<Count> {
    return this.naukariRepository.updateAll(naukari, where);
  }

  @get('/naukaris/{id}')
  @response(200, {
    description: 'Naukari model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Naukari, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Naukari, {exclude: 'where'}) filter?: FilterExcludingWhere<Naukari>
  ): Promise<Naukari> {
    return this.naukariRepository.findById(id, filter);
  }

  @patch('/naukaris/{id}')
  @response(204, {
    description: 'Naukari PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Naukari, {partial: true}),
        },
      },
    })
    naukari: Naukari,
  ): Promise<void> {
    await this.naukariRepository.updateById(id, naukari);
  }

  @put('/naukaris/{id}')
  @response(204, {
    description: 'Naukari PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() naukari: Naukari,
  ): Promise<void> {
    await this.naukariRepository.replaceById(id, naukari);
  }

  @del('/naukaris/{id}')
  @response(204, {
    description: 'Naukari DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.naukariRepository.deleteById(id);
  }
}
