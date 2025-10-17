import {Entity, model, property} from '@loopback/repository';

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
    required: true
  })
  companyLogo: string;

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
    type: 'string',
    required: true
  })
  salary: string;

  @property({
    type: 'date',
    required: true
  })
  posted: Date;

  @property({
    type: 'number',
    required: true
  })
  openings: number;

  @property({
    type: 'number',
    required: true
  })
  applicants: number;

  @property({
    type: 'string',
    required: true
  })
  aboutCompany: string;

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


  constructor(data?: Partial<JobList>) {
    super(data);
  }
}

export interface JobListRelations {
  // describe navigational properties here
}

export type JobListWithRelations = JobList & JobListRelations;
