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
import {LinkedInUrls} from '../models';
import {LinkedInUrlsRepository} from '../repositories';

export class LinkedInUrlsController {
  constructor(
    @repository(LinkedInUrlsRepository)
    public linkedInUrlsRepository : LinkedInUrlsRepository,
  ) {}

  @post('/linked-in-urls')
  @response(200, {
    description: 'LinkedInUrls model instance',
    content: {'application/json': {schema: getModelSchemaRef(LinkedInUrls)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LinkedInUrls, {
            title: 'NewLinkedInUrls',
            exclude: ['id'],
          }),
        },
      },
    })
    linkedInUrls: Omit<LinkedInUrls, 'id'>,
  ): Promise<LinkedInUrls> {
    return this.linkedInUrlsRepository.create(linkedInUrls);
  }

  @get('/linked-in-urls/count')
  @response(200, {
    description: 'LinkedInUrls model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(LinkedInUrls) where?: Where<LinkedInUrls>,
  ): Promise<Count> {
    return this.linkedInUrlsRepository.count(where);
  }

  @get('/linked-in-urls')
  @response(200, {
    description: 'Array of LinkedInUrls model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(LinkedInUrls, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(LinkedInUrls) filter?: Filter<LinkedInUrls>,
  ): Promise<LinkedInUrls[]> {
    return this.linkedInUrlsRepository.find(filter);
  }

  @patch('/linked-in-urls')
  @response(200, {
    description: 'LinkedInUrls PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LinkedInUrls, {partial: true}),
        },
      },
    })
    linkedInUrls: LinkedInUrls,
    @param.where(LinkedInUrls) where?: Where<LinkedInUrls>,
  ): Promise<Count> {
    return this.linkedInUrlsRepository.updateAll(linkedInUrls, where);
  }

  @get('/linked-in-urls/{id}')
  @response(200, {
    description: 'LinkedInUrls model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(LinkedInUrls, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(LinkedInUrls, {exclude: 'where'}) filter?: FilterExcludingWhere<LinkedInUrls>
  ): Promise<LinkedInUrls> {
    return this.linkedInUrlsRepository.findById(id, filter);
  }

  @patch('/linked-in-urls/{id}')
  @response(204, {
    description: 'LinkedInUrls PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LinkedInUrls, {partial: true}),
        },
      },
    })
    linkedInUrls: LinkedInUrls,
  ): Promise<void> {
    await this.linkedInUrlsRepository.updateById(id, linkedInUrls);
  }

  @put('/linked-in-urls/{id}')
  @response(204, {
    description: 'LinkedInUrls PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() linkedInUrls: LinkedInUrls,
  ): Promise<void> {
    await this.linkedInUrlsRepository.replaceById(id, linkedInUrls);
  }

  @del('/linked-in-urls/{id}')
  @response(204, {
    description: 'LinkedInUrls DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.linkedInUrlsRepository.deleteById(id);
  }
}
