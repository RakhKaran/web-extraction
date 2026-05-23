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
import {StagingLinkedInUrls} from '../models';
import {StagingLinkedInUrlsRepository} from '../repositories';

export class StagingLinkedInUrlsController {
  constructor(
    @repository(StagingLinkedInUrlsRepository)
    public stagingLinkedInUrlsRepository : StagingLinkedInUrlsRepository,
  ) {}

  @post('/staging-linked-in-urls')
  @response(200, {
    description: 'StagingLinkedInUrls model instance',
    content: {'application/json': {schema: getModelSchemaRef(StagingLinkedInUrls)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(StagingLinkedInUrls, {
            title: 'NewStagingLinkedInUrls',
            exclude: ['id'],
          }),
        },
      },
    })
    stagingLinkedInUrls: Omit<StagingLinkedInUrls, 'id'>,
  ): Promise<StagingLinkedInUrls> {
    return this.stagingLinkedInUrlsRepository.create(stagingLinkedInUrls);
  }

  @get('/staging-linked-in-urls/count')
  @response(200, {
    description: 'StagingLinkedInUrls model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(StagingLinkedInUrls) where?: Where<StagingLinkedInUrls>,
  ): Promise<Count> {
    return this.stagingLinkedInUrlsRepository.count(where);
  }

  @get('/staging-linked-in-urls')
  @response(200, {
    description: 'Array of StagingLinkedInUrls model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(StagingLinkedInUrls, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(StagingLinkedInUrls) filter?: Filter<StagingLinkedInUrls>,
  ): Promise<StagingLinkedInUrls[]> {
    return this.stagingLinkedInUrlsRepository.find(filter);
  }

  @patch('/staging-linked-in-urls')
  @response(200, {
    description: 'StagingLinkedInUrls PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(StagingLinkedInUrls, {partial: true}),
        },
      },
    })
    stagingLinkedInUrls: StagingLinkedInUrls,
    @param.where(StagingLinkedInUrls) where?: Where<StagingLinkedInUrls>,
  ): Promise<Count> {
    return this.stagingLinkedInUrlsRepository.updateAll(stagingLinkedInUrls, where);
  }

  @get('/staging-linked-in-urls/{id}')
  @response(200, {
    description: 'StagingLinkedInUrls model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(StagingLinkedInUrls, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(StagingLinkedInUrls, {exclude: 'where'}) filter?: FilterExcludingWhere<StagingLinkedInUrls>
  ): Promise<StagingLinkedInUrls> {
    return this.stagingLinkedInUrlsRepository.findById(id, filter);
  }

  @patch('/staging-linked-in-urls/{id}')
  @response(204, {
    description: 'StagingLinkedInUrls PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(StagingLinkedInUrls, {partial: true}),
        },
      },
    })
    stagingLinkedInUrls: StagingLinkedInUrls,
  ): Promise<void> {
    await this.stagingLinkedInUrlsRepository.updateById(id, stagingLinkedInUrls);
  }

  @put('/staging-linked-in-urls/{id}')
  @response(204, {
    description: 'StagingLinkedInUrls PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() stagingLinkedInUrls: StagingLinkedInUrls,
  ): Promise<void> {
    await this.stagingLinkedInUrlsRepository.replaceById(id, stagingLinkedInUrls);
  }

  @del('/staging-linked-in-urls/{id}')
  @response(204, {
    description: 'StagingLinkedInUrls DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.stagingLinkedInUrlsRepository.deleteById(id);
  }
}
