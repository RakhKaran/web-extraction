import { Entity, model, property } from '@loopback/repository';

@model({settings: {strict: false}})
export class JobList extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: false,
    default: 'NA',
  })
  title?: string;

  @property({
    type: 'string',
    required: false,
    default: 'NA',
  })
  description?: string;

  @property({
    type: 'string',
    required: false,
    default: 'NA',
  })
  company?: string;

  @property({
    type: 'string',
    required: false
  })
  companyLogo?: string;

  @property({
    type: 'string',
    required: false,
    default: 'NA'
  })
  location?: string;

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
  posted?: Date;

  @property({
    type: 'number',
    required: false,
  })
  openings?: number;

  @property({
    type: 'number',
    required: false
  })
  applicants?: number;

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
    required: false,
    default: '',
  })
  redirectUrl?: string;

  @property({
    type: 'boolean',
    required: false,
    default: true,
  })
  isActive?: boolean

  @property({
    type: 'string',
    required: false,
    default: 'Unknown',
  })
  source?: string;

  @property({
    type: 'string',
    required: false,
  })
  blueprintId?: string;

  @property({
    type: 'string',
    required: false,
  })
  workflowId?: string;

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

  [prop: string]: any;
  constructor(data?: Partial<JobList>) {
    super(data);
  }
}

export interface JobListRelations {
  // describe navigational properties here
}

export type JobListWithRelations = JobList & JobListRelations;
