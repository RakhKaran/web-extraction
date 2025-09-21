import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Workflow } from './workflow.model';

@model()
export class Scheduler extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  schedularName: string

  @property({
    type: 'number',
    required: true
  })
  schedulerType: number;   // 0 => 

  @property({
    type: 'number',
  })
  intervalType: number;     // 0 => no interval, 1 => hours, 2 => days, 3 => weeks, 4 => months

  @property({
    type: 'number',
  })
  interval?: number;

  @property({
    type: 'date',
  })
  date?: Date;

  @property({
    type: 'string',
  })
  time?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isScheduled: boolean;

  @property({
    type: 'boolean',
    default: false,
  })
  isActive: boolean;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'date',
  })
  deletedAt?: Date;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted: boolean;

  @belongsTo(() => Workflow)
  workflowId: string;

  constructor(data?: Partial<Scheduler>) {
    super(data);
  }
}

export interface SchedulerRelations {
  // describe navigational properties here
}

export type SchedulerWithRelations = Scheduler & SchedulerRelations;
