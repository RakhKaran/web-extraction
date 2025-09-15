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
import {Designation} from '../models';
import {DesignationRepository} from '../repositories';

export class DesignationController {
  constructor(
    @repository(DesignationRepository)
    public designationRepository : DesignationRepository,
  ) {}

  @post('/designations')
  @response(200, {
    description: 'Designation model instance',
    content: {'application/json': {schema: getModelSchemaRef(Designation)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Designation, {
            title: 'NewDesignation',
            exclude: ['id'],
          }),
        },
      },
    })
    designation: Omit<Designation, 'id'>,
  ): Promise<Designation> {
    return this.designationRepository.create(designation);
  }

  @get('/designations/count')
  @response(200, {
    description: 'Designation model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Designation) where?: Where<Designation>,
  ): Promise<Count> {
    return this.designationRepository.count(where);
  }

  @get('/designations')
  @response(200, {
    description: 'Array of Designation model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Designation, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Designation) filter?: Filter<Designation>,
  ): Promise<Designation[]> {
    return this.designationRepository.find(filter);
  }

  @patch('/designations')
  @response(200, {
    description: 'Designation PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Designation, {partial: true}),
        },
      },
    })
    designation: Designation,
    @param.where(Designation) where?: Where<Designation>,
  ): Promise<Count> {
    return this.designationRepository.updateAll(designation, where);
  }

  @get('/designations/{id}')
  @response(200, {
    description: 'Designation model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Designation, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Designation, {exclude: 'where'}) filter?: FilterExcludingWhere<Designation>
  ): Promise<Designation> {
    return this.designationRepository.findById(id, filter);
  }

  @patch('/designations/{id}')
  @response(204, {
    description: 'Designation PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Designation, {partial: true}),
        },
      },
    })
    designation: Designation,
  ): Promise<void> {
    await this.designationRepository.updateById(id, designation);
  }

  @put('/designations/{id}')
  @response(204, {
    description: 'Designation PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() designation: Designation,
  ): Promise<void> {
    await this.designationRepository.replaceById(id, designation);
  }

  @del('/designations/{id}')
  @response(204, {
    description: 'Designation DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.designationRepository.deleteById(id);
  }
}
