import {repository} from '@loopback/repository';
import {get, param} from '@loopback/rest';
import {SchedulerExecution, SchedulerExecutionLog} from '../models';
import {
  SchedulerExecutionLogRepository,
  SchedulerExecutionRepository,
} from '../repositories';

export class SchedulerExecutionController {
  constructor(
    @repository(SchedulerExecutionRepository)
    public schedulerExecutionRepository: SchedulerExecutionRepository,
    @repository(SchedulerExecutionLogRepository)
    public schedulerExecutionLogRepository: SchedulerExecutionLogRepository,
  ) {}

  @get('/schedulers/{schedulerId}/executions')
  async getExecutionsByScheduler(
    @param.path.string('schedulerId') schedulerId: string,
    @param.query.number('limit') limit = 25,
    @param.query.number('skip') skip = 0,
  ): Promise<SchedulerExecution[]> {
    return this.schedulerExecutionRepository.find({
      where: {schedulerId},
      order: ['startedAt DESC'],
      limit,
      skip,
    });
  }

  @get('/scheduler-executions/{executionId}')
  async getExecutionById(
    @param.path.string('executionId') executionId: string,
  ): Promise<SchedulerExecution> {
    return this.schedulerExecutionRepository.findById(executionId);
  }

  @get('/scheduler-executions/{executionId}/logs')
  async getExecutionLogs(
    @param.path.string('executionId') executionId: string,
    @param.query.number('limit') limit = 200,
    @param.query.number('skip') skip = 0,
  ): Promise<SchedulerExecutionLog[]> {
    return this.schedulerExecutionLogRepository.find({
      where: {executionId},
      order: ['createdAt ASC'],
      limit,
      skip,
    });
  }
}
