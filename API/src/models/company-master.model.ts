import { Entity, model, property } from '@loopback/repository';

@model({ settings: { strict: false } })
export class CompanyMaster extends Entity {
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
  companyName: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'boolean',
    required: true,
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
  [prop: string]: any;

  constructor(data?: Partial<CompanyMaster>) {
    super(data);
  }
}

export interface CompanyMasterRelations {
  // describe navigational properties here
}

export type CompanyMasterWithRelations = CompanyMaster & CompanyMasterRelations;
