import {Entity, model, property} from '@loopback/repository';

@model()
export class StagingTimesJobs extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'date',
    defaultFn: 'now',
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

  constructor(data?: Partial<StagingTimesJobs>) {
    super(data);
  }
}

export interface StagingTimesJobsRelations {
  // describe navigational properties here
}

export type StagingTimesJobsWithRelations = StagingTimesJobs & StagingTimesJobsRelations;
