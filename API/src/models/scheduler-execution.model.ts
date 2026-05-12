import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Scheduler} from './scheduler.model';

@model()
export class SchedulerExecution extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @belongsTo(() => Scheduler)
  schedulerId: string;

  @property({
    type: 'string',
  })
  dagName?: string;

  @property({
    type: 'string',
  })
  searchField?: string;

  @property({
    type: 'string',
  })
  airflowDagId?: string;

  @property({
    type: 'string',
  })
  airflowTaskId?: string;

  @property({
    type: 'string',
  })
  airflowRunId?: string;

  @property({
    type: 'number',
  })
  airflowTryNumber?: number;

  @property({
    type: 'string',
    required: true,
    default: 'running',
  })
  status: 'running' | 'success' | 'failed' | 'partial';

  @property({
    type: 'date',
    required: true,
    defaultFn: 'now',
  })
  startedAt: Date;

  @property({
    type: 'date',
  })
  endedAt?: Date;

  @property({
    type: 'number',
    default: 0,
  })
  durationMs?: number;

  @property({
    type: 'string',
  })
  errorMessage?: string;

  @property({
    type: 'object',
  })
  meta?: object;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<SchedulerExecution>) {
    super(data);
  }
}

export interface SchedulerExecutionRelations {}

export type SchedulerExecutionWithRelations = SchedulerExecution &
  SchedulerExecutionRelations;
