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
  HttpErrors,
} from '@loopback/rest';
import { inject } from '@loopback/core';
import { DataFreshnessConfig, DataFreshnessLog } from '../models';
import { DataFreshnessConfigRepository, DataFreshnessLogRepository } from '../repositories';
import { DataFreshnessService } from '../services/data-freshness.service';

export class DataFreshnessController {
  constructor(
    @repository(DataFreshnessConfigRepository)
    public dataFreshnessConfigRepository: DataFreshnessConfigRepository,
    @repository(DataFreshnessLogRepository)
    public dataFreshnessLogRepository: DataFreshnessLogRepository,
    @inject('services.DataFreshnessService')
    public dataFreshnessService: DataFreshnessService,
  ) { }

  @post('/data-freshness')
  @response(200, {
    description: 'DataFreshnessConfig model instance',
    content: { 'application/json': { schema: getModelSchemaRef(DataFreshnessConfig) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DataFreshnessConfig, {
            title: 'NewDataFreshnessConfig',
            exclude: ['id'],
          }),
        },
      },
    })
    dataFreshnessConfig: Omit<DataFreshnessConfig, 'id'>,
  ): Promise<DataFreshnessConfig> {
    // Calculate next run time
    const nextRunAt = this.dataFreshnessService.calculateNextRun(dataFreshnessConfig.schedule);

    const config = await this.dataFreshnessConfigRepository.create({
      ...dataFreshnessConfig,
      nextRunAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return config;
  }

  @get('/data-freshness/count')
  @response(200, {
    description: 'DataFreshnessConfig model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(DataFreshnessConfig) where?: Where<DataFreshnessConfig>,
  ): Promise<Count> {
    return this.dataFreshnessConfigRepository.count(where);
  }

  @get('/data-freshness')
  @response(200, {
    description: 'Array of DataFreshnessConfig model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(DataFreshnessConfig, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(DataFreshnessConfig) filter?: Filter<DataFreshnessConfig>,
  ): Promise<DataFreshnessConfig[]> {
    const finalFilter: Filter<DataFreshnessConfig> = {
      ...filter,
      order: ['createdAt DESC'],
    };

    return this.dataFreshnessConfigRepository.find(finalFilter);
  }

  @get('/data-freshness/{id}')
  @response(200, {
    description: 'DataFreshnessConfig model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(DataFreshnessConfig, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(DataFreshnessConfig, { exclude: 'where' }) filter?: FilterExcludingWhere<DataFreshnessConfig>
  ): Promise<DataFreshnessConfig> {
    return this.dataFreshnessConfigRepository.findById(id, filter);
  }

  @patch('/data-freshness/{id}')
  @response(204, {
    description: 'DataFreshnessConfig PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DataFreshnessConfig, { partial: true }),
        },
      },
    })
    dataFreshnessConfig: Partial<DataFreshnessConfig>,
  ): Promise<void> {
    // Recalculate next run if schedule changed
    if (dataFreshnessConfig.schedule) {
      const nextRunAt = this.dataFreshnessService.calculateNextRun(dataFreshnessConfig.schedule);
      dataFreshnessConfig.nextRunAt = nextRunAt;
    }

    dataFreshnessConfig.updatedAt = new Date();
    await this.dataFreshnessConfigRepository.updateById(id, dataFreshnessConfig);
  }

  @del('/data-freshness/{id}')
  @response(204, {
    description: 'DataFreshnessConfig DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.dataFreshnessConfigRepository.deleteById(id);
  }

  @post('/data-freshness/{id}/run')
  @response(200, {
    description: 'Run freshness check manually',
    content: { 'application/json': { schema: getModelSchemaRef(DataFreshnessLog) } },
  })
  async runFreshnessCheck(
    @param.path.string('id') id: string,
  ): Promise<DataFreshnessLog> {
    const config = await this.dataFreshnessConfigRepository.findById(id);

    if (!config) {
      throw new HttpErrors.NotFound('Data freshness config not found');
    }

    // Execute in background
    (async () => {
      try {
        const log = await this.dataFreshnessService.executeFreshnessCheck(config);

        // Update last run and next run
        const nextRunAt = this.dataFreshnessService.calculateNextRun(config.schedule);
        await this.dataFreshnessConfigRepository.updateById(id, {
          lastRunAt: new Date(),
          nextRunAt,
        });

        console.log('Freshness check completed:', log);
      } catch (error) {
        console.error('Freshness check failed:', error);
      }
    })();

    return {
      configId: id,
      configName: config.name,
      runAt: new Date(),
      status: 'running',
      totalChecked: 0,
      stillActive: 0,
      expired: 0,
      errors: 0,
    } as DataFreshnessLog;
  }

  @post('/data-freshness/{id}/pause')
  @response(204, {
    description: 'Pause freshness check',
  })
  async pause(@param.path.string('id') id: string): Promise<void> {
    await this.dataFreshnessConfigRepository.updateById(id, {
      isActive: false,
      updatedAt: new Date(),
    });
  }

  @post('/data-freshness/{id}/resume')
  @response(204, {
    description: 'Resume freshness check',
  })
  async resume(@param.path.string('id') id: string): Promise<void> {
    const config = await this.dataFreshnessConfigRepository.findById(id);
    const nextRunAt = this.dataFreshnessService.calculateNextRun(config.schedule);

    await this.dataFreshnessConfigRepository.updateById(id, {
      isActive: true,
      nextRunAt,
      updatedAt: new Date(),
    });
  }

  @get('/data-freshness/{id}/logs')
  @response(200, {
    description: 'Get freshness check logs',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(DataFreshnessLog),
        },
      },
    },
  })
  async getLogs(
    @param.path.string('id') id: string,
    @param.query.number('limit') limit = 10,
    @param.query.number('skip') skip = 0,
  ): Promise<DataFreshnessLog[]> {
    return this.dataFreshnessLogRepository.find({
      where: { configId: id },
      order: ['runAt DESC'],
      limit,
      skip,
    });
  }

  @get('/data-freshness/{id}/stats')
  @response(200, {
    description: 'Get freshness check statistics',
  })
  async getStats(
    @param.path.string('id') id: string,
  ): Promise<{
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastRun?: DataFreshnessLog;
    averageDuration: number;
    totalChecked: number;
    totalActive: number;
    totalExpired: number;
  }> {
    const logs = await this.dataFreshnessLogRepository.find({
      where: { configId: id },
      order: ['runAt DESC'],
    });

    const totalRuns = logs.length;
    const successfulRuns = logs.filter(l => l.status === 'success').length;
    const failedRuns = logs.filter(l => l.status === 'failed').length;
    const lastRun = logs[0];

    const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const averageDuration = totalRuns > 0 ? totalDuration / totalRuns : 0;

    const totalChecked = logs.reduce((sum, log) => sum + (log.totalChecked || 0), 0);
    const totalActive = logs.reduce((sum, log) => sum + (log.stillActive || 0), 0);
    const totalExpired = logs.reduce((sum, log) => sum + (log.expired || 0), 0);

    return {
      totalRuns,
      successfulRuns,
      failedRuns,
      lastRun,
      averageDuration,
      totalChecked,
      totalActive,
      totalExpired,
    };
  }
}
