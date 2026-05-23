import { Entity, model, property } from '@loopback/repository';

@model()
export class StagingLinkedInUrls extends Entity {
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
  url: string;

  @property({
    type: 'string',
  })
  company?: string;

  @property({
    type: 'string',
  })
  designation?: string;

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
  isActive: boolean;

  constructor(data?: Partial<StagingLinkedInUrls>) {
    super(data);
  }
}

export interface StagingLinkedInUrlsRelations {
  // describe navigational properties here
}

export type StagingLinkedInUrlsWithRelations = StagingLinkedInUrls & StagingLinkedInUrlsRelations;
