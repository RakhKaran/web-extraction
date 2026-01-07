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
import {JobList} from '../models';
import {JobListRepository} from '../repositories';

export class JobListController {
  constructor(
    @repository(JobListRepository)
    public jobListRepository : JobListRepository,
  ) {}

  @post('/job-lists')
  @response(200, {
    description: 'JobList model instance',
    content: {'application/json': {schema: getModelSchemaRef(JobList)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(JobList, {
            title: 'NewJobList',
            exclude: ['id'],
          }),
        },
      },
    })
    jobList: Omit<JobList, 'id'>,
  ): Promise<JobList> {
    return this.jobListRepository.create(jobList);
  }

  @get('/job-lists/count')
  @response(200, {
    description: 'JobList model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(JobList) where?: Where<JobList>,
  ): Promise<Count> {
    return this.jobListRepository.count(where);
  }

  @get('/job-lists')
  @response(200, {
    description: 'Array of JobList model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(JobList, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(JobList) filter?: Filter<JobList>,
  ): Promise<JobList[]> {
    return this.jobListRepository.find({...filter, order: ['createdAt desc']});
  }

  @patch('/job-lists')
  @response(200, {
    description: 'JobList PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(JobList, {partial: true}),
        },
      },
    })
    jobList: JobList,
    @param.where(JobList) where?: Where<JobList>,
  ): Promise<Count> {
    return this.jobListRepository.updateAll(jobList, where);
  }

  @get('/job-lists/{id}')
  @response(200, {
    description: 'JobList model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(JobList, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(JobList, {exclude: 'where'}) filter?: FilterExcludingWhere<JobList>
  ): Promise<JobList> {
    return this.jobListRepository.findById(id, filter);
  }

  @patch('/job-lists/{id}')
  @response(204, {
    description: 'JobList PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(JobList, {partial: true}),
        },
      },
    })
    jobList: JobList,
  ): Promise<void> {
    await this.jobListRepository.updateById(id, jobList);
  }

  @put('/job-lists/{id}')
  @response(204, {
    description: 'JobList PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() jobList: JobList,
  ): Promise<void> {
    await this.jobListRepository.replaceById(id, jobList);
  }

  @del('/job-lists/{id}')
  @response(204, {
    description: 'JobList DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.jobListRepository.deleteById(id);
  }
}
