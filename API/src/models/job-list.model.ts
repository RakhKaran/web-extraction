import { Entity, model, property } from '@loopback/repository';

@model()
export class JobList extends Entity {
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
  description: string;

  @property({
    type: 'string',
    required: true
  })
  company: string;

  @property({
    type: 'string',
    required: false
  })
  companyLogo: string;

  @property({
    type: 'string',
    required: false,
    default: 'NA'
  })
  location: string;

  @property({
    type: 'string',
    required: false,
    default: 'Not Disclosed'
  })
  experience?: string;

  @property({
    type: 'string',
    required: false,
    default: 'Not Disclosed'
  })
  salary?: string;

  @property({
    type: 'date',
    required: false,
    defaultFn: 'now'
  })
  posted: Date;

  @property({
    type: 'number',
    required: false,
  })
  openings: number;

  @property({
    type: 'number',
    required: false
  })
  applicants: number;

  @property({
    type: 'string',
    required: false
  })
  aboutCompany?: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: false
  })
  keySkills?: string[];

  @property({
    type: 'string',
    required: true
  })
  redirectUrl: string;

  @property({
    type: 'boolean',
    required: true
  })
  isActive: boolean

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
    default: false
  })
  isPostedToAltiv: boolean;
  constructor(data?: Partial<JobList>) {
    super(data);
  }
}

export interface JobListRelations {
  // describe navigational properties here
}

export type JobListWithRelations = JobList & JobListRelations;
