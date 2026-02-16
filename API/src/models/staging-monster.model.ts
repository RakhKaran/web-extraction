import { Entity, model, property } from '@loopback/repository';

@model()
export class StagingMonster extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true
  })
  title: string;

  @property({
    type: 'string',
    required: true
  })
  companyName: string;

  @property({
    type: 'string',
    required: true
  })
  description: string;

  @property({
    type: 'string',
  })
  salary?: string;

  @property({
    type: 'string',
    required: true
  })
  location: string;

  @property({
    type: 'string',
    required: true
  })
  experience: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true
  })
  keySkills: string[];

  @property({
    type: 'string',
    required: true
  })
  redirectUrl: string;

  @property({
    type: 'string',
  })
  companyLogo?: string;

  @property({
    type: 'string',
  })
  posted?: string;

  @property({
    type: 'string',
  })
  openings?: string;

  @property({
    type: 'string',
  })
  aboutCompany?: string;

  @property({
    type: 'string',
  })
  jobType?: string;

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

  constructor(data?: Partial<StagingMonster>) {
    super(data);
  }
}

export interface StagingMonsterRelations {
  // describe navigational properties here
}

export type StagingMonsterWithRelations = StagingMonster & StagingMonsterRelations;
