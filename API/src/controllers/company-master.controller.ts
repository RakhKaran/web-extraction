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
import { CompanyMaster } from '../models';
import { CompanyMasterRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { PermissionKeys } from '../authorization/permission-keys';

export class CompanyMasterController {
  constructor(
    @repository(CompanyMasterRepository)
    public companyMasterRepository: CompanyMasterRepository,
  ) { }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.ADMIN],
    },
  })
  @post('/company-masters')
  @response(200, {
    description: 'CompanyMaster model instance',
    content: { 'application/json': { schema: getModelSchemaRef(CompanyMaster) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompanyMaster, {
            title: 'NewCompanyMaster',
            exclude: ['id'],
          }),
        },
      },
    })
    companyMaster: Omit<CompanyMaster, 'id'>,
  ): Promise<CompanyMaster> {
    return this.companyMasterRepository.create(companyMaster);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.ADMIN],
    },
  })
  @get('/company-masters/count')
  @response(200, {
    description: 'CompanyMaster model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(CompanyMaster) where?: Where<CompanyMaster>,
  ): Promise<Count> {
    return this.companyMasterRepository.count(where);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.ADMIN],
    },
  })
  @get('/company-masters')
  @response(200, {
    description: 'Array of CompanyMaster model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(CompanyMaster, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(CompanyMaster) filter?: Filter<CompanyMaster>,
  ): Promise<CompanyMaster[]> {
    return this.companyMasterRepository.find(filter);
  }

  // @authenticate({
  //   strategy: 'jwt',
  //   options: {
  //     required: [PermissionKeys.ADMIN],
  //   },
  // })
  // @patch('/company-masters')
  // @response(200, {
  //   description: 'CompanyMaster PATCH success count',
  //   content: { 'application/json': { schema: CountSchema } },
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(CompanyMaster, { partial: true }),
  //       },
  //     },
  //   })
  //   companyMaster: CompanyMaster,
  //   @param.where(CompanyMaster) where?: Where<CompanyMaster>,
  // ): Promise<Count> {
  //   return this.companyMasterRepository.updateAll(companyMaster, where);
  // }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.ADMIN],
    },
  })
  @get('/company-masters/{id}')
  @response(200, {
    description: 'CompanyMaster model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(CompanyMaster, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(CompanyMaster, { exclude: 'where' }) filter?: FilterExcludingWhere<CompanyMaster>
  ): Promise<CompanyMaster> {
    return this.companyMasterRepository.findById(id, filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {
      required: [PermissionKeys.ADMIN],
    },
  })
  @patch('/company-masters/{id}')
  @response(204, {
    description: 'CompanyMaster PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompanyMaster, { partial: true }),
        },
      },
    })
    companyMaster: CompanyMaster,
  ): Promise<void> {
    await this.companyMasterRepository.updateById(id, companyMaster);
  }

  // @authenticate({
  //   strategy: 'jwt',
  //   options: {
  //     required: [PermissionKeys.ADMIN],
  //   },
  // })
  // @put('/company-masters/{id}')
  // @response(204, {
  //   description: 'CompanyMaster PUT success',
  // })
  // async replaceById(
  //   @param.path.string('id') id: string,
  //   @requestBody() companyMaster: CompanyMaster,
  // ): Promise<void> {
  //   await this.companyMasterRepository.replaceById(id, companyMaster);
  // }

  // @authenticate({
  //   strategy: 'jwt',
  //   options: {
  //     required: [PermissionKeys.ADMIN],
  //   },
  // })
  // @del('/company-masters/{id}')
  // @response(204, {
  //   description: 'CompanyMaster DELETE success',
  // })
  // async deleteById(@param.path.string('id') id: string): Promise<void> {
  //   await this.companyMasterRepository.deleteById(id);
  // }
}
