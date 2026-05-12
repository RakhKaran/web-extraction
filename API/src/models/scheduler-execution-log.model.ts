import {belongsTo, Entity, model, property} from '@loopback/repository';
import {SchedulerExecution} from './scheduler-execution.model';

@model()
export class SchedulerExecutionLog extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @belongsTo(() => SchedulerExecution)
  executionId: string;

  @property({
    type: 'string',
    required: true,
  })
  schedulerId: string;

  @property({
    type: 'string',
  })
  nodeType?: string;

  @property({
    type: 'string',
  })
  step?: string;

  @property({
    type: 'string',
    required: true,
  })
  message: string;

  @property({
    type: 'number',
    required: true,
    default: 0,
  })
  logType: number; // 0 => info, 1 => error, 2 => success, 3 => warning

  @property({
    type: 'object',
  })
  payload?: object;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<SchedulerExecutionLog>) {
    super(data);
  }
}

export interface SchedulerExecutionLogRelations {}

export type SchedulerExecutionLogWithRelations = SchedulerExecutionLog &
  SchedulerExecutionLogRelations;
