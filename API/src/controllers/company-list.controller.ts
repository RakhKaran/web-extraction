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
import {CompanyList} from '../models';
import {CompanyListRepository} from '../repositories';

export class CompanyListController {
  constructor(
    @repository(CompanyListRepository)
    public companyListRepository : CompanyListRepository,
  ) {}

  @post('/company-lists')
  @response(200, {
    description: 'CompanyList model instance',
    content: {'application/json': {schema: getModelSchemaRef(CompanyList)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompanyList, {
            title: 'NewCompanyList',
            exclude: ['id'],
          }),
        },
      },
    })
    companyList: Omit<CompanyList, 'id'>,
  ): Promise<CompanyList> {
    return this.companyListRepository.create(companyList);
  }

  @get('/company-lists/count')
  @response(200, {
    description: 'CompanyList model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(CompanyList) where?: Where<CompanyList>,
  ): Promise<Count> {
    return this.companyListRepository.count(where);
  }

  @get('/company-lists')
  @response(200, {
    description: 'Array of CompanyList model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(CompanyList, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(CompanyList) filter?: Filter<CompanyList>,
  ): Promise<CompanyList[]> {
    return this.companyListRepository.find(filter);
  }

  @patch('/company-lists')
  @response(200, {
    description: 'CompanyList PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompanyList, {partial: true}),
        },
      },
    })
    companyList: CompanyList,
    @param.where(CompanyList) where?: Where<CompanyList>,
  ): Promise<Count> {
    return this.companyListRepository.updateAll(companyList, where);
  }

  @get('/company-lists/{id}')
  @response(200, {
    description: 'CompanyList model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(CompanyList, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(CompanyList, {exclude: 'where'}) filter?: FilterExcludingWhere<CompanyList>
  ): Promise<CompanyList> {
    return this.companyListRepository.findById(id, filter);
  }

  @patch('/company-lists/{id}')
  @response(204, {
    description: 'CompanyList PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompanyList, {partial: true}),
        },
      },
    })
    companyList: CompanyList,
  ): Promise<void> {
    await this.companyListRepository.updateById(id, companyList);
  }

  @put('/company-lists/{id}')
  @response(204, {
    description: 'CompanyList PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() companyList: CompanyList,
  ): Promise<void> {
    await this.companyListRepository.replaceById(id, companyList);
  }

  @del('/company-lists/{id}')
  @response(204, {
    description: 'CompanyList DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.companyListRepository.deleteById(id);
  }
}
