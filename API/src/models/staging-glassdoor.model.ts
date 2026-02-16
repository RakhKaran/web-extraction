import { Entity, model, property } from '@loopback/repository';

@model()
export class StagingGlassdoor extends Entity {
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
  })
  companyAbout?: string;

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
  })
  openings?: string;

  @property({
    type: 'string',
    required: true
  })
  location: string;

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
  experience?: string;

  @property({
    type: 'string',
  })
  posted?: string;

  @property({
    type: 'string',
  })
  companyRating?: string;

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

  constructor(data?: Partial<StagingGlassdoor>) {
    super(data);
  }
}

export interface StagingGlassdoorRelations {
  // describe navigational properties here
}

export type StagingGlassdoorWithRelations = StagingGlassdoor & StagingGlassdoorRelations;
