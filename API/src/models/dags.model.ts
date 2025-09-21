import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Scheduler } from './scheduler.model';

@model()
export class Dags extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  dagName: string;

  @property({
    type: 'string',
    required: true,
  })
  dagFileName: string;

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

  @belongsTo(() => Scheduler)
  schedulerId: string;

  constructor(data?: Partial<Dags>) {
    super(data);
  }
}

export interface DagsRelations {
  // describe navigational properties here
}

export type DagsWithRelations = Dags & DagsRelations;
