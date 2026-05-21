import {Entity, model, property} from '@loopback/repository';

@model()
export class CompanyList extends Entity {
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
  companyName: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  designationCategories: string[];

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  designations: string[];

  @property({
    type: 'boolean',
    required: true,
    default: true,
  })
  isActive: boolean;

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


  constructor(data?: Partial<CompanyList>) {
    super(data);
  }
}

export interface CompanyListRelations {
  // describe navigational properties here
}

export type CompanyListWithRelations = CompanyList & CompanyListRelations;
