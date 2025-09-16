import {Entity, model, property} from '@loopback/repository';

@model()
export class Naukari extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

   @property({
    type: 'string',
  })
  company?: string;

  @property({
    type: 'string',
  })
  location?: string; 

  @property({
    type: 'string',
  })
  experience?: string; 

  @property({
    type: 'string',
  })
  salary?: string; 

  @property({
    type: 'string',
  })
  jobDescription?: string; 

  @property({
    type: 'array',
    itemType: 'object',
  })
  skills?: object[];

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


  constructor(data?: Partial<Naukari>) {
    super(data);
  }
}

export interface NaukariRelations {
  // describe navigational properties here
}

export type NaukariWithRelations = Naukari & NaukariRelations;
