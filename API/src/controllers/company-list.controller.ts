import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {CompanyList} from '../models';
import {
  CompanyListRepository,
  CompanyMasterRepository,
  DesignationRepository,
} from '../repositories';

export class CompanyListController {
  constructor(
    @repository(CompanyListRepository)
    public companyListRepository: CompanyListRepository,
    @repository(CompanyMasterRepository)
    public companyMasterRepository: CompanyMasterRepository,
    @repository(DesignationRepository)
    public designationRepository: DesignationRepository,
  ) {}

  private async validateLinkedInConfiguration(companyList: Partial<CompanyList>) {
    const companyName = companyList.companyName?.trim();
    const designations = Array.isArray(companyList.designations)
      ? companyList.designations.map((item) => String(item).trim()).filter(Boolean)
      : [];

    if (!companyName) {
      throw new HttpErrors.BadRequest('companyName is required');
    }
    if (!designations.length) {
      throw new HttpErrors.BadRequest('At least one designation is required');
    }

    const companyExists = await this.companyMasterRepository.findOne({
      where: {
        and: [{companyName}, {isActive: true}, {isDeleted: false}],
      },
    });

    if (!companyExists) {
      throw new HttpErrors.BadRequest(
        `Company "${companyName}" does not exist in active company masters`,
      );
    }

    for (const designation of designations) {
      const designationExists = await this.designationRepository.findOne({
        where: {
          and: [{designation}, {isActive: true}, {isDeleted: false}],
        },
      });

      if (!designationExists) {
        throw new HttpErrors.BadRequest(
          `Designation "${designation}" does not exist in active designations`,
        );
      }
    }
  }

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
    await this.validateLinkedInConfiguration(companyList);
    const normalized = {
      ...companyList,
      companyName: companyList.companyName.trim(),
      designations: [...new Set(companyList.designations.map((item) => item.trim()))],
    };
    return this.companyListRepository.create(normalized);
  }

  @get('/company-lists/count')
  @response(200, {
    description: 'CompanyList model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(CompanyList) where?: Where<CompanyList>): Promise<Count> {
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
    @param.filter(CompanyList, {exclude: 'where'})
    filter?: FilterExcludingWhere<CompanyList>,
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
    await this.validateLinkedInConfiguration(companyList);
    const normalized = {
      ...companyList,
      companyName: companyList.companyName.trim(),
      designations: [...new Set((companyList.designations || []).map((item) => item.trim()))],
    };
    await this.companyListRepository.updateById(id, normalized);
  }

  @put('/company-lists/{id}')
  @response(204, {
    description: 'CompanyList PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() companyList: CompanyList,
  ): Promise<void> {
    await this.validateLinkedInConfiguration(companyList);
    const normalized = {
      ...companyList,
      companyName: companyList.companyName.trim(),
      designations: [...new Set((companyList.designations || []).map((item) => item.trim()))],
    };
    await this.companyListRepository.replaceById(id, normalized);
  }

  @del('/company-lists/{id}')
  @response(204, {
    description: 'CompanyList DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.companyListRepository.deleteById(id);
  }
}
