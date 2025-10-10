import { Entity, model, property } from '@loopback/repository';

@model()
export class StagingLinkedin extends Entity {
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
  fullName: string;

  @property({
    type: 'string',
  })
  profileUrl?: string;

  @property({
    type: 'string',
  })
  profileAbout?: string;

  @property({
    type: 'string',
  })
  location?: string;

  @property({
    type: 'string',
    required: true
  })
  redirectUrl: string;

  @property({
    type: 'date',
  })
  scrappedAt?: Date;

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

  @property({
    type: 'boolean',
    default: false,
  })
  isSync: boolean;
  constructor(data?: Partial<StagingLinkedin>) {
    super(data);
  }
}

export interface StagingLinkedinRelations {
  // describe navigational properties here
}

export type StagingLinkedinWithRelations = StagingLinkedin & StagingLinkedinRelations;
