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
import { JobList } from '../models';
import { JobListRepository, WorkflowBlueprintRepository, WorkflowRepository } from '../repositories';

export class JobListController {
  constructor(
    @repository(JobListRepository)
    public jobListRepository: JobListRepository,
    @repository(WorkflowBlueprintRepository)
    public workflowBlueprintRepository: WorkflowBlueprintRepository,
    @repository(WorkflowRepository)
    public workflowRepository: WorkflowRepository,
  ) { }

  @post('/job-lists')
  @response(200, {
    description: 'JobList model instance',
    content: { 'application/json': { schema: getModelSchemaRef(JobList) } },
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
    content: { 'application/json': { schema: CountSchema } },
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
          items: getModelSchemaRef(JobList, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(JobList) filter?: Filter<JobList>,
  ): Promise<{
    jobs: Array<JobList & {expiredStatus: string; effectiveDate: Date | undefined; blueprintName: string; sourceName: string}>,
    totalCount: number
  }> {
    const jobs = await this.jobListRepository.find(
      {
        ...filter,
        order: filter?.order ? filter?.order : ['updatedAt desc', 'createdAt desc']
      }
    );

    const blueprintIds = Array.from(
      new Set(
        jobs
          .map((job: any) => job.blueprintId || job.workflowBlueprintId)
          .filter(Boolean)
      )
    );

    const workflowIds = Array.from(
      new Set(jobs.map((job: any) => job.workflowId).filter(Boolean))
    );

    const blueprints = blueprintIds.length
      ? await this.workflowBlueprintRepository.find({
          where: {id: {inq: blueprintIds}},
        })
      : [];
    const workflows = workflowIds.length
      ? await this.workflowRepository.find({
          where: {id: {inq: workflowIds}},
        })
      : [];

    const blueprintToWorkflowId = new Map(
      blueprints.map((bp: any) => [bp.id, bp.workflowId])
    );
    const workflowNameMap = new Map(
      workflows.map((wf: any) => [wf.id, wf.name])
    );

    if (blueprints.length) {
      const extraWorkflowIds = Array.from(
        new Set(
          blueprints
            .map((bp: any) => bp.workflowId)
            .filter((id: string) => id && !workflowNameMap.has(id))
        )
      );
      if (extraWorkflowIds.length) {
        const extraWorkflows = await this.workflowRepository.find({
          where: {id: {inq: extraWorkflowIds}},
        });
        extraWorkflows.forEach((wf: any) => workflowNameMap.set(wf.id, wf.name));
      }
    }

    const enrichedJobs = jobs.map((job: any) => {
      const blueprintId = job.blueprintId || job.workflowBlueprintId;
      const workflowId = job.workflowId || (blueprintId ? blueprintToWorkflowId.get(blueprintId) : undefined);
      return {
        ...job,
        expiredStatus: job.isActive ? 'Active' : 'Expired',
        effectiveDate: job.updatedAt || job.createdAt,
        sourceName: job.source || 'Unknown',
        blueprintName: workflowId ? workflowNameMap.get(workflowId) || 'Unknown' : 'Unknown',
      };
    });

    const jobsCount = await this.jobListRepository.count(filter?.where || { isDeleted: false });

    return {
      jobs: enrichedJobs,
      totalCount: jobsCount.count || 0
    }
  }

  @patch('/job-lists')
  @response(200, {
    description: 'JobList PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(JobList, { partial: true }),
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
        schema: getModelSchemaRef(JobList, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(JobList, { exclude: 'where' }) filter?: FilterExcludingWhere<JobList>
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
          schema: getModelSchemaRef(JobList, { partial: true }),
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
