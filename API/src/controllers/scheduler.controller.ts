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
import {Scheduler} from '../models';
import {
  DagsRepository,
  SchedulerExecutionRepository,
  SchedulerRepository,
} from '../repositories';

export class SchedulerController {
  constructor(
    @repository(SchedulerRepository)
    public schedulerRepository : SchedulerRepository,
    @repository(DagsRepository)
    public dagsRepository: DagsRepository,
    @repository(SchedulerExecutionRepository)
    public schedulerExecutionRepository: SchedulerExecutionRepository,
  ) {}

  @post('/schedulers')
  @response(200, {
    description: 'Scheduler model instance',
    content: {'application/json': {schema: getModelSchemaRef(Scheduler)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Scheduler, {
            title: 'NewScheduler',
            exclude: ['id'],
          }),
        },
      },
    })
    scheduler: Omit<Scheduler, 'id'>,
  ): Promise<Scheduler> {
    return this.schedulerRepository.create(scheduler);
  }

  @get('/schedulers/count')
  @response(200, {
    description: 'Scheduler model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Scheduler) where?: Where<Scheduler>,
  ): Promise<Count> {
    return this.schedulerRepository.count(where);
  }

  @get('/schedulers')
  @response(200, {
    description: 'Array of Scheduler model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Scheduler, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Scheduler) filter?: Filter<Scheduler>,
  ): Promise<Array<Scheduler & {nextRunAt?: string | null; createdDesignations?: string[]; createdSearchValues?: string[]}>> {
    const schedulers = await this.schedulerRepository.find(filter);

    const schedulerIds = schedulers.map((s: any) => s.id).filter(Boolean);
    if (schedulerIds.length === 0) return schedulers as any;

    const dags = await this.dagsRepository.find({
      where: {
        and: [{schedulerId: {inq: schedulerIds}}, {isDeleted: false}],
      },
      fields: {schedulerId: true, searchArray: true},
    });

    const executions = await this.schedulerExecutionRepository.find({
      where: {schedulerId: {inq: schedulerIds}},
      order: ['startedAt DESC'],
      fields: {schedulerId: true, startedAt: true},
    });

    const latestExecutionByScheduler = new Map<string, Date>();
    for (const ex of executions as any[]) {
      if (!latestExecutionByScheduler.has(ex.schedulerId) && ex.startedAt) {
        latestExecutionByScheduler.set(ex.schedulerId, new Date(ex.startedAt));
      }
    }

    const createdByScheduler = new Map<
      string,
      {designations: Set<string>; searchValues: Set<string>}
    >();

    for (const dag of dags as any[]) {
      const sid = dag.schedulerId;
      if (!sid) continue;
      const entry =
        createdByScheduler.get(sid) ?? {designations: new Set(), searchValues: new Set()};

      const searchValue =
        Array.isArray(dag.searchArray) && dag.searchArray.length
          ? String(dag.searchArray?.[0]?.value ?? '').trim()
          : '';

      if (searchValue) {
        entry.searchValues.add(searchValue);

        const maybeDesignation = searchValue.includes(' at ')
          ? searchValue.split(' at ')[0].trim()
          : searchValue;
        if (maybeDesignation) entry.designations.add(maybeDesignation);
      }

      createdByScheduler.set(sid, entry);
    }

    const computeNextRunAtIso = (scheduler: any, lastStartedAt?: Date) => {
      try {
        if (!scheduler || scheduler.isDeleted || !scheduler.isActive) return null;

        const now = new Date();

        // One-time: combine date + time
        if (scheduler.schedulerType === 0) {
          if (!scheduler.date) return null;
          const base = new Date(scheduler.date);
          const timeStr = String(scheduler.time || '').trim();
          if (timeStr) {
            const [hh, mm] = timeStr.split(':').map((p: string) => Number(p));
            if (!Number.isNaN(hh)) base.setHours(hh, Number.isNaN(mm) ? 0 : mm, 0, 0);
          }
          return base.toISOString();
        }

        // Recurring
        const intervalType = Number(scheduler.intervalType);
        const interval = Number(scheduler.interval || 0);
        const anchor = lastStartedAt instanceof Date && !Number.isNaN(lastStartedAt.getTime())
          ? lastStartedAt
          : now;

        if (intervalType === 1 && interval > 0) {
          const next = new Date(anchor.getTime() + interval * 60 * 60 * 1000);
          return next.toISOString();
        }

        // Default daily at 01:00 (matches DAG default cron)
        const next = new Date(now);
        next.setHours(1, 0, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        return next.toISOString();
      } catch {
        return null;
      }
    };

    return schedulers.map((s: any) => {
      const created = createdByScheduler.get(s.id);
      const lastStartedAt = latestExecutionByScheduler.get(s.id);
      return {
        ...s,
        nextRunAt: computeNextRunAtIso(s, lastStartedAt),
        createdDesignations: created ? Array.from(created.designations) : [],
        createdSearchValues: created ? Array.from(created.searchValues) : [],
      };
    });
  }

  @patch('/schedulers')
  @response(200, {
    description: 'Scheduler PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Scheduler, {partial: true}),
        },
      },
    })
    scheduler: Scheduler,
    @param.where(Scheduler) where?: Where<Scheduler>,
  ): Promise<Count> {
    return this.schedulerRepository.updateAll(scheduler, where);
  }

  @get('/schedulers/{id}')
  @response(200, {
    description: 'Scheduler model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Scheduler, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Scheduler, {exclude: 'where'}) filter?: FilterExcludingWhere<Scheduler>
  ): Promise<Scheduler> {
    return this.schedulerRepository.findById(id, filter);
  }

  @patch('/schedulers/{id}')
  @response(204, {
    description: 'Scheduler PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Scheduler, {partial: true}),
        },
      },
    })
    scheduler: Scheduler,
  ): Promise<void> {
    await this.schedulerRepository.updateById(id, scheduler);
  }

  @put('/schedulers/{id}')
  @response(204, {
    description: 'Scheduler PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() scheduler: Scheduler,
  ): Promise<void> {
    await this.schedulerRepository.replaceById(id, scheduler);
  }

  @del('/schedulers/{id}')
  @response(204, {
    description: 'Scheduler DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.schedulerRepository.deleteById(id);
  }
}
